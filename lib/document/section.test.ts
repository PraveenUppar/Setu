import { describe, it, expect } from 'vitest';
import { derivedTerms, renderSection, renderDocument } from './section';
import { issueProcedure, issueProcedureApplicationSize, issueProcedureBidsByCategory, issueProcedureTechnicalRejection, issueProcedureUndertakings } from './sections/issue-procedure';
import { sectionRegistry } from './sections';
import { collectPlaceholders } from './nodes';
import { vardhman } from '../seed/vardhman';
import { money } from '../facts/money';
import type { FactBase } from '../facts/schema';

/** Vardhman with targeted overrides, for exercising conditional branches. */
function variant(overrides: {
  paidUpShares?: number;
  freshIssueShares?: number;
  exchange?: FactBase['offer']['exchange'];
  terminology?: FactBase['offer']['terminology'];
  documentStage?: FactBase['offer']['documentStage'];
  withOFS?: boolean;
}): FactBase {
  return {
    ...vardhman,
    capital: {
      ...vardhman.capital,
      paidUpShares: overrides.paidUpShares ?? vardhman.capital.paidUpShares,
    },
    offer: {
      ...vardhman.offer,
      freshIssueShares: overrides.freshIssueShares ?? vardhman.offer.freshIssueShares,
      exchange: overrides.exchange ?? vardhman.offer.exchange,
      terminology: overrides.terminology ?? vardhman.offer.terminology,
      documentStage: overrides.documentStage ?? vardhman.offer.documentStage,
      sellingShareholders: overrides.withOFS
        ? [
            {
              name: 'Anil Vardhman',
              type: 'PROMOTER_GROUP' as const,
              sharesOffered: 400000,
              preIssueShares: 1200000,
              weightedAverageCostOfAcquisition: money('12'),
            },
          ]
        : [],
    },
  };
}

const plain = (facts: FactBase) =>
  renderSection(issueProcedure, { facts })
    .map((n) => (n.type === 'paragraph' ? n.runs.map((r) => r.text).join('') : n.type === 'heading' ? n.text : ''))
    .join('\n');

describe('derived terms', () => {
  it('picks Regulation 229(2) above Rs 10 crore post-issue capital', () => {
    // Vardhman: 1,20,00,000 + 45,00,000 shares at Rs 10 = Rs 16.5 crore
    const terms = derivedTerms(vardhman);
    expect(terms.postIssueCapital).toBe(money('16.5', 'crores'));
    expect(terms.eligibilityRegulation).toBe('Regulation 229(2)');
  });

  it('picks Regulation 229(1) at or below Rs 10 crore', () => {
    // The bug held-out verification caught: Century Business Media cites
    // 229(1) because its post-issue capital is under Rs 10 crore.
    const small = variant({ paidUpShares: 6000000, freshIssueShares: 2312000 });
    const terms = derivedTerms(small);
    expect(terms.postIssueCapital).toBe(money('8.312', 'crores'));
    expect(terms.eligibilityRegulation).toBe('Regulation 229(1)');
  });

  it('treats exactly Rs 10 crore as 229(1)', () => {
    const boundary = variant({ paidUpShares: 9000000, freshIssueShares: 1000000 });
    expect(derivedTerms(boundary).postIssueCapital).toBe(money('10', 'crores'));
    expect(derivedTerms(boundary).eligibilityRegulation).toBe('Regulation 229(1)');
  });

  it('computes the issue as a percentage of post-issue capital (R-023)', () => {
    const terms = derivedTerms(vardhman);
    expect(terms.issuePercentOfPostIssueCapital).toBe('27.27');
    expect(terms.meetsMinimumIssuePercent).toBe(true);
  });

  it('flags an issue below the 25% floor', () => {
    const tooSmall = variant({ paidUpShares: 12000000, freshIssueShares: 1000000 });
    const terms = derivedTerms(tooSmall);
    expect(terms.meetsMinimumIssuePercent).toBe(false);
  });

  it('counts OFS shares toward the offered total', () => {
    const terms = derivedTerms(variant({ withOFS: true }));
    expect(terms.offeredShares).toBe(4900000);
    // OFS shares are already issued, so post-issue capital is unchanged
    expect(terms.postIssueShares).toBe(16500000);
  });

  it('switches the designated stock exchange', () => {
    expect(derivedTerms(vardhman).designatedStockExchange).toBe('BSE Limited');
    expect(derivedTerms(variant({ exchange: 'NSE_EMERGE' })).designatedStockExchange).toBe(
      'National Stock Exchange of India Limited',
    );
  });
});

describe('Issue Procedure section', () => {
  it('renders the correct regulation for each capital band', () => {
    expect(plain(vardhman)).toContain('under Regulation 229(2) of');
    expect(plain(variant({ paidUpShares: 6000000, freshIssueShares: 2312000 }))).toContain(
      'under Regulation 229(1) of',
    );
  });

  it('names the selling shareholders only when there is an OFS', () => {
    expect(plain(vardhman)).not.toContain('and the Selling Shareholders');
    expect(plain(variant({ withOFS: true }))).toContain(
      'our Company and the Selling Shareholders may',
    );
  });

  it('follows the issuer house style for Issue vs Offer', () => {
    expect(plain(vardhman)).toContain('the Issue is being made for at least 25%');
    expect(plain(variant({ terminology: 'OFFER' }))).toContain(
      'the Offer is being made for at least 25%',
    );
  });

  it('does not apply to a fixed-price issue', () => {
    const fixedPrice: FactBase = {
      ...vardhman,
      offer: { ...vardhman.offer, issueType: 'FIXED_PRICE' },
    };
    expect(renderSection(issueProcedure, { facts: fixedPrice })).toHaveLength(0);
  });

  it('states the allocation split from R-024', () => {
    const out = plain(vardhman);
    expect(out).toContain('not more than 50% of the Net Issue');
    expect(out).toContain('up to 60% of the QIB Portion to Anchor Investors');
    expect(out).toContain('33.33%');
    expect(out).toContain('6.67%');
    expect(out).toContain('not less than 15% of the Net Issue');
    // Sentence-initial in our phrasing, so capitalised
    expect(out).toContain('Not less than 35% of the Net Issue');
  });

  it('leaves no unresolved template syntax', () => {
    expect(plain(vardhman)).not.toMatch(/\{\{|\}\}/);
  });
});

describe('Application size and bidding method', () => {
  const render = (facts: FactBase) =>
    renderSection(issueProcedureApplicationSize, { facts })
      .flatMap((n) =>
        n.type === 'paragraph'
          ? [n.runs.map((r) => r.text).join('')]
          : n.type === 'list'
            ? n.items.map((i) => i.map((r) => r.text).join(''))
            : n.type === 'heading'
              ? [n.text]
              : [],
      )
      .join('\n');

  it('substitutes the lot size everywhere it appears', () => {
    const out = render(vardhman);
    expect(out).toContain('being 3,000 Equity Shares per lot');
    expect(out).toContain('in multiples of 3,000 Equity Shares thereafter');
  });

  it('states the Rs 2,00,000 minimum from R-006', () => {
    expect(render(vardhman)).toContain('Bid Amount exceeds Rs 2,00,000');
  });

  it('derives the regional language from the registered office state', () => {
    expect(derivedTerms(vardhman).regionalLanguage).toBe('Marathi');
    expect(render(vardhman)).toContain('Marathi being the regional language of Maharashtra');

    const gujarat: FactBase = {
      ...vardhman,
      company: {
        ...vardhman.company,
        registeredOffice: { ...vardhman.company.registeredOffice, state: 'Gujarat' },
      },
    };
    expect(derivedTerms(gujarat).regionalLanguage).toBe('Gujarati');
    expect(render(gujarat)).toContain('Gujarati being the regional language of Gujarat');
  });

  it('drops the regional-language gloss in Hindi-speaking states', () => {
    // Century Business Media (Patna, Bihar) names its regional paper without
    // the gloss, since "Hindi being the regional language of Bihar" reads
    // oddly right after naming a Hindi national daily.
    const bihar: FactBase = {
      ...vardhman,
      company: {
        ...vardhman.company,
        registeredOffice: { ...vardhman.company.registeredOffice, state: 'Bihar' },
      },
    };
    expect(derivedTerms(bihar).regionalLanguageIsHindi).toBe(true);
    const out = render(bihar);
    expect(out).not.toContain('being the regional language of');
    expect(out).toContain('circulated in Bihar, where our Registered Office is situated');

    // and it is kept where the language differs
    expect(derivedTerms(vardhman).regionalLanguageIsHindi).toBe(false);
    expect(render(vardhman)).toContain('Marathi being the regional language of Maharashtra');
  });

  it('falls back safely for an unmapped state', () => {
    const elsewhere: FactBase = {
      ...vardhman,
      company: {
        ...vardhman.company,
        registeredOffice: { ...vardhman.company.registeredOffice, state: 'Nagaland' },
      },
    };
    expect(derivedTerms(elsewhere).regionalLanguage).toBe('the regional language');
  });

  it('names the newspapers, and raises a gap when one is missing', () => {
    expect(render(vardhman)).toContain('all editions of Business Standard');

    const noPaper: FactBase = {
      ...vardhman,
      offer: { ...vardhman.offer, regionalNewspaper: undefined },
    };
    const gaps = collectPlaceholders(renderSection(issueProcedureApplicationSize, { facts: noPaper }));
    expect(gaps.map((g) => g.factPath)).toContain('offer.regionalNewspaper');
    expect(gaps.find((g) => g.factPath === 'offer.regionalNewspaper')?.ask).toBe(
      'Regional daily for the issue advertisements',
    );
  });

  it('states the three-to-ten working day bid period', () => {
    const out = render(vardhman);
    expect(out).toContain('minimum of three Working Days and shall not exceed ten Working Days');
    expect(out).toContain('additional three Working Days');
  });
});

describe('Bids by investor category', () => {
  const out = renderSection(issueProcedureBidsByCategory, { facts: vardhman })
    .map((n) =>
      n.type === 'paragraph' ? n.runs.map((r) => r.text).join('') : n.type === 'heading' ? n.text : '',
    )
    .join('\n');

  it('covers all twelve investor categories', () => {
    for (const category of [
      'Hindu Undivided Families',
      'Mutual Funds',
      'Eligible NRIs',
      'Bids by FPIs',
      'AIFs, VCFs and FVCIs',
      'Limited Liability Partnerships',
      'Banking Companies',
      'Bids by SCSBs',
      'Systemically Important Non-Banking Financial Companies',
      'Insurance Companies',
      'Provident Funds and Pension Funds',
      'Power of Attorney',
    ]) {
      expect(out).toContain(category);
    }
  });

  it('reproduces the investment limits the corpus states', () => {
    // These belong to other regulations (SEBI MF/VCF/FPI, FEMA, Banking
    // Regulation Act) and are quoted, not authored by us.
    expect(out).toContain('10% of its net asset value'); // Mutual Funds
    expect(out).toContain('25% of the corpus of the VCF'); // VCF
    expect(out).toContain('33.33% of their investible funds'); // VCF in an IPO
    expect(out).toContain('24% of the paid-up equity share capital'); // FPI aggregate
    expect(out).toContain('5% of the total paid-up equity share capital'); // single NRI
    expect(out).toContain('Rs 2,500 lakhs'); // provident and pension fund corpus
  });

  it('follows house style for Issue vs Offer', () => {
    const asOffer = renderSection(issueProcedureBidsByCategory, {
      facts: variant({ terminology: 'OFFER' }),
    })
      .map((n) => (n.type === 'paragraph' ? n.runs.map((r) => r.text).join('') : ''))
      .join('\n');
    expect(out).toContain('Participation of Eligible NRIs in the Issue');
    expect(asOffer).toContain('Participation of Eligible NRIs in the Offer');
  });

  it('does not apply to a fixed-price issue', () => {
    const fixedPrice: FactBase = {
      ...vardhman,
      offer: { ...vardhman.offer, issueType: 'FIXED_PRICE' },
    };
    expect(renderSection(issueProcedureBidsByCategory, { facts: fixedPrice })).toHaveLength(0);
  });

  it('leaves no unresolved template syntax and raises no gaps', () => {
    expect(out).not.toMatch(/\{\{|\}\}/);
    expect(collectPlaceholders(renderSection(issueProcedureBidsByCategory, { facts: vardhman })))
      .toHaveLength(0);
  });
});

describe('Impersonation, undertakings and utilisation', () => {
  const render = (facts: FactBase) =>
    renderSection(issueProcedureUndertakings, { facts })
      .flatMap((n) =>
        n.type === 'paragraph'
          ? [n.runs.map((r) => r.text).join('')]
          : n.type === 'list'
            ? n.items.map((i) => i.map((r) => r.text).join(''))
            : n.type === 'heading'
              ? [n.text]
              : [],
      )
      .join('\n');

  it('quotes Section 38(1) of the Companies Act verbatim', () => {
    const out = render(vardhman);
    expect(out).toContain('sub-section (1) of Section 38 of the Companies Act, 2013');
    expect(out).toContain('application in a fictitious name');
    expect(out).toContain('shall be liable for action under Section 447');
  });

  it('carries the full set of undertakings', () => {
    const out = render(vardhman);
    expect(out).toContain('complaints received in respect of the Issue');
    expect(out).toContain('three Working Days from the Issue Closing Date');
    expect(out).toContain("Promoters' contribution in full has already been brought in");
    expect(out).toContain('Applications Supported by Blocked Amount');
    expect(out).toContain('wilful defaulter or a fraudulent borrower');
  });

  it('names the current document stage when describing a re-filing', () => {
    expect(render(vardhman)).toContain('a fresh Draft Red Herring Prospectus');
    const atRhp = variant({ documentStage: 'RHP' });
    expect(render(atRhp)).toContain('a fresh Red Herring Prospectus');
  });

  it('certifies utilisation of proceeds', () => {
    const out = render(vardhman);
    expect(out).toContain('sub-section (3) of Section 40 of the Companies Act, 2013');
    expect(out).toContain('shall not have recourse to the Issue proceeds until the approval');
  });

  it('uses the lower-case issue word for the pre-issue advertisement', () => {
    expect(render(vardhman)).toContain('pre-issue advertisement was published');
  });

  it('leaves no unresolved syntax and raises no gaps', () => {
    expect(render(vardhman)).not.toMatch(/\{\{|\}\}|\*\*/);
    expect(collectPlaceholders(renderSection(issueProcedureUndertakings, { facts: vardhman })))
      .toHaveLength(0);
  });
});

describe('Grounds for technical rejection', () => {
  const nodes = renderSection(issueProcedureTechnicalRejection, { facts: vardhman });
  const out = nodes
    .flatMap((n) =>
      n.type === 'paragraph'
        ? [n.runs.map((r) => r.text).join('')]
        : n.type === 'list'
          ? n.items.map((i) => i.map((r) => r.text).join(''))
          : n.type === 'heading'
            ? [n.text]
            : [],
    )
    .join('\n');

  it('takes the union of both sources rather than the shorter list', () => {
    const grounds = (nodes.find((n) => n.type === 'list') as { items: unknown[] }).items;
    // Om Galaxy runs to 25+, Maxwell to 15; each carries items the other omits
    expect(grounds.length).toBeGreaterThan(20);
  });

  it('restricts the cut-off rejection to NIIs and QIBs', () => {
    // Maxwell says "any category", which would reject valid Individual Bids.
    // Om Galaxy and Century both confine it to NIIs and QIBs.
    expect(out).toContain('Bids at Cut-off Price by Non-Institutional Investors and QIBs');
    expect(out).not.toContain('cut-off price by any category');
  });

  it('states the Rs 100 per day unblocking compensation', () => {
    expect(out).toContain('uniform rate of Rs 100 per day');
    expect(out).toContain('exceeding two Working Days');
  });

  it('covers the depository three-parameter match', () => {
    expect(out).toContain('DP ID');
    expect(out).toContain("beneficiary's account number");
  });

  it('emphasises the cut-off ground in bold', () => {
    const list = nodes.find((n) => n.type === 'list') as { items: { text: string; bold?: boolean }[][] };
    const cutOff = list.items.find((runs) => runs.some((r) => r.text.includes('Cut-off Price')));
    expect(cutOff?.some((r) => r.bold)).toBe(true);
  });

  it('leaves no unresolved syntax and raises no gaps', () => {
    expect(out).not.toMatch(/\{\{|\}\}|\*\*/);
    expect(collectPlaceholders(nodes)).toHaveLength(0);
  });
});

describe('document assembly', () => {
  it('renders every registered section without throwing', () => {
    expect(() => renderDocument(sectionRegistry, { facts: vardhman })).not.toThrow();
  });

  it('orders sections by their order field', () => {
    const nodes = renderDocument(sectionRegistry, { facts: vardhman });
    const headings = nodes.filter((n) => n.type === 'heading' && n.level === 2);
    expect((headings[0] as { text: string }).text).toBe('Forward Looking Statements');
    expect((headings[1] as { text: string }).text).toBe('Issue Procedure');
  });

  it('surfaces gaps from across the whole document', () => {
    const gaps = collectPlaceholders(renderDocument(sectionRegistry, { facts: vardhman }));
    expect(gaps.map((g) => g.factPath)).toContain('riskFactors.summaryOfMaterialFactors');
  });
});
