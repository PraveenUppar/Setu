import { describe, expect, it } from 'vitest';
import { money } from '../facts/money';
import type { FactBase } from '../facts/schema';
import { withAnswers } from '../seed/empty';
import { vardhman } from '../seed/vardhman';
import { collectPlaceholders, estimatePages, type DocumentNode } from './nodes';
import { flattenSections, renderSection, renderSections, type SectionSpec } from './section';
import { sectionRegistry } from './sections';
import { approvals } from './sections/approvals';
import { groupCompanies } from './sections/group-companies';
import { capitalisationStatement, indebtedness } from './sections/indebtedness';
import { contingentLiabilities, relatedPartyTransactions, theIssue } from './sections/introduction';
import { litigation } from './sections/litigation';
import { management } from './sections/management';
import { promoterHolding, promoters } from './sections/promoters';

/**
 * Wave 2 — the computed sections built from M3 to M10.
 *
 * Two fixtures throughout: Vardhman, whose arithmetic ties and who should
 * produce NO gaps in these sections beyond the ones every issuer has at
 * draft stage; and a sparse issuer with one fact, who should produce gaps
 * everywhere and crash nowhere. The specific-value checks are the seed's
 * own arithmetic reproduced — a table that looks right and is wrong is the
 * failure this stage exists to prevent (D20).
 */

const cr = (v: string) => money(v, 'crores');
const sparse = withAnswers({ company: { name: 'Sparse Test Limited' } });

const render = (spec: SectionSpec, facts: FactBase = vardhman) => renderSection(spec, { facts });
const textOf = (nodes: DocumentNode[]) =>
  nodes
    .map((n) => {
      if (n.type === 'paragraph') return n.runs.map((r) => r.text).join('');
      if (n.type === 'heading') return n.text;
      if (n.type === 'list') return n.items.map((i) => i.map((r) => r.text).join('')).join('\n');
      if (n.type === 'table') return [n.headers.join(' | '), ...n.rows.map((r) => r.join(' | ')), ...(n.footnotes ?? [])].join('\n');
      return '';
    })
    .join('\n');
const tables = (nodes: DocumentNode[]) => nodes.filter((n): n is Extract<DocumentNode, { type: 'table' }> => n.type === 'table');
const gapsOf = (nodes: DocumentNode[]) => collectPlaceholders(nodes).map((p) => p.factPath);

const computed = [management, promoters, groupCompanies, litigation, approvals, indebtedness, capitalisationStatement, theIssue, contingentLiabilities, relatedPartyTransactions];

describe('every Wave 2 section', () => {
  it('renders the demo issuer with only the gaps every issuer has at draft stage', () => {
    const allowed = new Set(['offer.issuePrice', 'offer.categoryAllocation']);
    for (const spec of computed) {
      const unexpected = gapsOf(render(spec)).filter((p) => !allowed.has(p));
      expect(unexpected, spec.id).toEqual([]);
    }
  });

  it('renders a one-fact issuer as gaps, not as a crash or an invention', () => {
    for (const spec of computed) {
      const nodes = render(spec, sparse);
      expect(nodes.length, spec.id).toBeGreaterThan(0);
      expect(gapsOf(nodes).length, spec.id).toBeGreaterThan(0);
      const text = textOf(nodes);
      expect(text, spec.id).not.toContain('undefined');
      expect(text, spec.id).not.toContain('NaN');
      expect(text, spec.id).not.toContain('[object');
      expect(text, spec.id).not.toContain('Vardhman');
    }
  });

  it('never prints undefined, NaN or an object for the demo issuer either', () => {
    for (const spec of computed) {
      const text = textOf(render(spec));
      expect(text, spec.id).not.toMatch(/\bundefined\b|\bNaN\b|\[object/);
    }
  });

  it('pads every table row to its header count', () => {
    for (const spec of computed) {
      for (const t of tables(render(spec))) {
        for (const row of t.rows) expect(row.length, `${spec.id}: ${t.caption ?? t.headers[0]}`).toBe(t.headers.length);
      }
    }
  });
});

describe('Our Management', () => {
  const nodes = render(management);
  const text = textOf(nodes);

  it('states the board composition from the flags, not from a typed sentence', () => {
    expect(text).toContain('we have 5 Directors on our Board, including 2 Executive Directors, 3 Non-Executive Independent Directors');
  });

  it('tabulates every director with computed age and other directorships', () => {
    const board = tables(nodes)[0];
    expect(board.rows).toHaveLength(5);
    expect(board.rows[0][1]).toContain('DIN: 07123456');
    expect(board.rows[0][1]).toMatch(/Age: \d+ years/);
    expect(board.rows[0][2]).toBe('Vardhman Tooling Private Limited');
    expect(board.rows[2][2]).toBe('Kirloskar Ferrous Castings Private Limited');
  });

  it("reads directors' shareholding off the register rather than asking again", () => {
    const holding = tables(nodes).find((t) => t.headers[2] === 'Number of Equity Shares held')!;
    expect(holding.rows.map((r) => [r[1], r[2], r[3]])).toEqual([
      ['Rajesh Vardhman', '46,80,000', '39.00'],
      ['Sunita Vardhman', '31,20,000', '26.00'],
    ]);
  });

  it('resolves each committee member to their nature of directorship from the board', () => {
    const audit = tables(nodes).find((t) => t.headers[1] === 'Designation in the Committee')!;
    expect(audit.rows).toEqual([
      ['Meera Kulkarni', 'Chairperson', 'Non-Executive Independent Director'],
      ['Suresh Iyer', 'Member', 'Non-Executive Independent Director'],
      ['Rajesh Vardhman', 'Member', 'Chairman and Managing Director'],
    ]);
  });

  it('lists KMP in addition to the executive directors, and profiles them', () => {
    // Sunita is a director, so she is not repeated under KMP; Priya is
    expect(text).toContain('Priya Deshmukh, aged');
    expect(text).toContain('is the Company Secretary and Compliance Officer of our Company since March 1, 2025');
    expect(text.split('Sunita Vardhman, aged').length - 1).toBe(1);
  });

  it('quotes the borrowing powers resolution and limit', () => {
    expect(text).toContain('special resolution passed by our shareholders on March 28, 2025');
    expect(text).toContain('shall not exceed Rs 50.00 Crores');
  });

  it('sorts the board changes by date', () => {
    const changes = tables(nodes).find((t) => t.headers[0] === 'Name of Director' && t.headers[1] === 'Date of Event')!;
    expect(changes.rows[0]).toEqual(['Rajesh Vardhman', 'February 18, 2025', 'Redesignated as Chairman and Managing Director']);
    expect(changes.rows).toHaveLength(8);
  });

  it('asks for the board, the committees and the KMP when there are none', () => {
    const paths = gapsOf(render(management, sparse));
    expect(paths).toContain('management.directors');
    expect(paths).toContain('management.committees');
    expect(paths).toContain('management.keyManagerialPersonnel');
    expect(paths).toContain('management.borrowingPowersResolutionDate');
  });
});

describe('Our Promoters and Promoter Group', () => {
  const nodes = render(promoters);
  const text = textOf(nodes);

  it('computes the aggregate promoter holding from the register', () => {
    // 46,80,000 + 31,20,000 of 1,20,00,000
    expect(promoterHolding(vardhman)).toEqual({ shares: 7800000, percent: '65.00' });
    expect(text).toContain('our Promoters hold an aggregate of 78,00,000 Equity Shares, representing 65.00%');
  });

  it('names the promoters and prints each PAN', () => {
    expect(text).toContain('The Promoters of our Company are Rajesh Vardhman and Sunita Vardhman.');
    expect(text).toContain('PAN: AFKPV1234C');
    expect(text).toContain('PAN: AFKPV5678D');
  });

  it('tabulates the promoter group by relationship, per promoter, with entities apart', () => {
    const groupTables = tables(nodes).filter((t) => t.headers[0] === 'Relationship');
    expect(groupTables).toHaveLength(2);
    expect(groupTables[0].rows.map((r) => r[0])).toEqual(['Spouse of the promoter', 'Mother of the promoter', 'Brother of the promoter', 'Son of the promoter']);
    const entities = tables(nodes).find((t) => t.headers[0] === 'Name of entity')!;
    expect(entities.rows[0][0]).toBe('Vardhman Tooling Private Limited');
  });

  it('derives the promoter-director relationship from the board', () => {
    expect(text).toContain('Rajesh Vardhman | Promoter and Chairman and Managing Director');
  });

  it('prints the standing negatives where the details are null', () => {
    expect(text).toContain('no change in the management and control of our Company in the last three years');
    expect(text).toContain('None of the Equity Shares held by our Promoters are pledged');
    expect(text).toContain('None of our Promoters has disassociated');
  });

  it('prints the details where they exist', () => {
    const pledged: FactBase = { ...vardhman, promoters: { ...vardhman.promoters, pledgedSharesDetails: '2,00,000 Equity Shares held by Rajesh Vardhman are pledged with HDFC Bank Limited.' } };
    expect(textOf(render(promoters, pledged))).toContain('pledged with HDFC Bank Limited');
  });
});

describe('Our Group Companies', () => {
  it('states the policy with the resolution date and the base', () => {
    const text = textOf(render(groupCompanies));
    expect(text).toContain('resolution of our Board dated August 14, 2026');
    expect(text).toContain('exceed 10% of the profit after tax of our Company');
    expect(text).toContain('Vardhman Tooling Private Limited');
    expect(text).toContain('None of our Group Companies is listed');
  });

  it('prints the standard negative where there are none', () => {
    const none: FactBase = { ...vardhman, groupCompanies: { ...vardhman.groupCompanies, companies: [] } };
    expect(textOf(render(groupCompanies, none))).toContain('there are no Group Companies of our Company');
  });
});

describe('Outstanding Litigation', () => {
  const nodes = render(litigation);
  const text = textOf(nodes);

  it('computes the threshold and shows all three limbs', () => {
    expect(text).toContain('being Rs 96.40 Lakhs');
    expect(text).toContain('being Rs 38.80 Lakhs');
    expect(text).toContain('being Rs 12.08 Lakhs');
    expect(text).toContain('Accordingly, Rs 12.08 Lakhs, being 5% of the average of the absolute value of the profit or loss after tax');
  });

  it('computes the material creditor threshold from trade payables', () => {
    expect(text).toContain('Our total trade payables as at March 31, 2026 were Rs 680.00 Lakhs');
    expect(text).toContain('exceed Rs 34.00 Lakhs have been considered material');
  });

  it('consolidates the tax matters into the count-and-amount table', () => {
    const tax = tables(nodes)[0];
    expect(tax.rows).toEqual([
      ['Direct Tax', 'Nil', 'Nil'],
      ['Indirect Tax', '1', '34.00'],
      ['Total', '1', '34.00'],
    ]);
  });

  it('lists the other matters under the right party, direction and heading', () => {
    expect(text).toContain('Maharashtra Pollution Control Board, before the Maharashtra Pollution Control Board, Regional Office, Pune. Show cause notice');
    expect(text).toContain('Shree Auto Ancillaries Private Limited, before the Commercial Court, Pune (Com. Suit No. 412 of 2025)');
    // The recovery suit is BY the company, so it sits after "Proceedings initiated by our Company"
    const by = text.indexOf('Proceedings initiated by our Company');
    expect(text.indexOf('Shree Auto Ancillaries')).toBeGreaterThan(by);
  });

  it('prints Nil under every empty heading for the promoters and directors', () => {
    const promoterBlock = text.slice(text.indexOf('Litigation involving our Promoters'), text.indexOf('Litigation involving our Directors'));
    expect(promoterBlock.split('\nNil').length - 1).toBeGreaterThanOrEqual(6);
  });

  it('turns a wilful-defaulter flag into a gap for the particulars, not a sentence', () => {
    const flagged: FactBase = { ...vardhman, promoters: { ...vardhman.promoters, anyWilfulDefaulterOrFraudulentBorrower: true } };
    expect(gapsOf(render(litigation, flagged))).toContain('promoters.anyWilfulDefaulterOrFraudulentBorrower');
  });
});

describe('Government and Other Approvals', () => {
  const nodes = render(approvals);
  const text = textOf(nodes);

  it('quotes the corporate approvals and depository agreements by date', () => {
    expect(text).toContain('meeting held on August 14, 2026, authorised the Issue');
    expect(text).toContain('special resolution dated August 28, 2026');
    expect(text).toContain('tripartite agreement dated June 18, 2026 with National Securities Depository Limited and the Registrar to the Issue, Bigshare Services Private Limited,');
    expect(text).toContain('INE9V8K01015');
  });

  it('states the incorporation history from M1 and the tax registrations from M8', () => {
    expect(text).toContain('Certificate of incorporation dated April 12, 2016');
    expect(text).toContain('from "Vardhman Precision Components Private Limited" to "Vardhman Precision Components Limited"');
    expect(text).toContain('AAECV1234C');
    expect(text).toContain('PNEV04471B');
  });

  it('tables the obtained approvals by category and unit, and the pending ones separately', () => {
    const pending = tables(nodes).find((t) => t.headers[5] === 'Status')!;
    expect(pending.rows.map((r) => [r[1].slice(0, 20), r[5]])).toEqual([
      ['Fire Safety No Objec', 'Expired; renewal applied for'],
      ['Trade mark registrat', 'Application pending'],
    ]);
    expect(text).toContain('Chakan facility');
    const obtainedNames = tables(nodes).flatMap((t) => t.rows.map((r) => r[1]));
    expect(obtainedNames.filter((n) => n.startsWith('Fire Safety'))).toHaveLength(1);
  });

  it('asks for the in-principle approval only once the stage needs it', () => {
    expect(gapsOf(nodes)).not.toContain('offer.inPrincipleApprovalDate');
    const rhp: FactBase = { ...vardhman, offer: { ...vardhman.offer, documentStage: 'RHP', inPrincipleApprovalDate: undefined } };
    expect(gapsOf(render(approvals, rhp))).toContain('offer.inPrincipleApprovalDate');
  });
});

describe('Financial Indebtedness', () => {
  const nodes = render(indebtedness);
  const text = textOf(nodes);

  it('prints the summary by category with the subtotals', () => {
    const summary = tables(nodes)[0];
    const row = (label: string) => summary.rows.find((r) => r[0] === label);
    expect(row('Term Loan')).toEqual(['Term Loan', '600.00', '420.00']);
    expect(row('Loan from Directors')).toEqual(['Loan from Directors', '150.00', '150.00']);
    expect(row('Sub Total (A)')).toEqual(['Sub Total (A)', '1,095.00', '860.00']);
    expect(row('Total (A+B)')).toEqual(['Total (A+B)', '1,170.00', '900.00']);
    expect(text).toContain('as on September 30, 2026');
    expect(text).toContain('As certified by Kalyani & Associates');
  });

  it('flags a fund-based total that does not tie to the balance sheet', () => {
    const broken: FactBase = {
      ...vardhman,
      financials: { ...vardhman.financials, borrowings: vardhman.financials.borrowings.slice(1) },
    };
    const gaps = collectPlaceholders(render(indebtedness, broken));
    expect(gaps.map((g) => g.factPath)).toContain('financials.borrowings');
    expect(gaps[0].ask).toContain('does not tie to total borrowings');
    expect(gaps[0].ask).toContain('Rs 420.00 Lakhs');
  });

  it('separates secured, unsecured and non-fund based detail', () => {
    expect(text).toContain('Secured Borrowings');
    expect(text).toContain('Unsecured Borrowings');
    expect(text).toContain('Non-Fund Based Facilities');
  });
});

describe('Capitalisation Statement', () => {
  it('prints the pre-issue column and leaves the post-issue column to pricing', () => {
    const nodes = render(capitalisationStatement);
    const t = tables(nodes)[0];
    expect(t.rows.find((r) => r[0].startsWith('Total borrowings'))).toEqual(['Total borrowings (A)', '860.00', '[.]']);
    expect(t.rows.find((r) => r[0].startsWith('Total equity'))).toEqual(['Total equity (B)', '1,940.00', '[.]']);
    expect(t.rows.find((r) => r[0].startsWith('Ratio: Total'))![1]).toBe('0.44');
    expect(gapsOf(nodes)).toEqual(['offer.issuePrice']);
  });
});

describe('The Issue', () => {
  const nodes = render(theIssue);
  const text = textOf(nodes);

  it('computes the deterministic rows and leaves the discretionary ones as gaps', () => {
    expect(text).toContain('45,00,000 Equity Shares of face value of Rs 10 each');
    expect(text).toContain('2,25,000 Equity Shares');
    expect(text).toContain('42,75,000 Equity Shares');
    expect(text).toContain('1,65,00,000 Equity Shares of face value of Rs 10 each');
    expect(text).toContain('Not more than 50% of the Net Issue: [.] Equity Shares');
    expect(gapsOf(nodes).sort()).toEqual(['offer.categoryAllocation', 'offer.issuePrice']);
  });

  it('cites the regulation limb the post-issue capital puts the issuer under', () => {
    expect(text).toContain('under Regulation 229(2) read with Rule 19(2)(b) of the SCRR');
  });
});

describe('Summary of Contingent Liabilities', () => {
  it('tabulates the items three years across and totals them', () => {
    const t = tables(render(contingentLiabilities))[0];
    expect(t.headers).toEqual(['Sr. No.', 'Particulars', 'Fiscal 2026 (Rs in Lakhs)', 'Fiscal 2025 (Rs in Lakhs)', 'Fiscal 2024 (Rs in Lakhs)']);
    expect(t.rows[1]).toEqual(['2', 'Disputed demand under the Maharashtra Goods and Services Tax Act, 2017, under appeal', '34.00', '-', '-']);
    expect(t.rows[3]).toEqual(['', 'Total', '90.00', '62.00', '41.00']);
  });

  it('flags a year whose items do not total the figure in the year table', () => {
    const broken: FactBase = {
      ...vardhman,
      financials: { ...vardhman.financials, contingentLiabilityItems: vardhman.financials.contingentLiabilityItems.slice(0, 2) },
    };
    const gaps = collectPlaceholders(render(contingentLiabilities, broken));
    expect(gaps.some((g) => g.ask.includes('Fiscal 2026') && g.ask.includes('Rs 74.00 Lakhs') && g.ask.includes('Rs 90.00 Lakhs'))).toBe(true);
  });
});

describe('Summary of Related Party Transactions', () => {
  it('lists the parties, then the transactions with relationship looked up and totals that tie', () => {
    const nodes = render(relatedPartyTransactions);
    const [parties, tx] = tables(nodes);
    expect(parties.rows).toHaveLength(5);
    expect(tx.rows[2]).toEqual(['Purchase of tooling and fixtures', 'Vardhman Tooling Private Limited', 'Entity controlled by the Promoters', '126.00', '103.00', '57.00']);
    expect(tx.rows[3]).toEqual(['Total', '', '', '210.00', '175.00', '120.00']);
    expect(gapsOf(nodes)).toEqual([]);
  });

  it('flags a party in the transactions that is missing from the list', () => {
    const missing: FactBase = {
      ...vardhman,
      groupCompanies: { ...vardhman.groupCompanies, relatedParties: vardhman.groupCompanies.relatedParties.slice(0, 2) },
    };
    const gaps = collectPlaceholders(render(relatedPartyTransactions, missing));
    expect(gaps.some((g) => g.ask.includes('Vardhman Tooling Private Limited appears in the transactions'))).toBe(true);
  });
});

describe('the whole document after Wave 2', () => {
  it('renders 32 numbered subsections and materially more pages', () => {
    const sections = renderSections(sectionRegistry, { facts: vardhman });
    expect(new Set(sections.map((s) => s.partOf)).size).toBe(32);
    expect(estimatePages(flattenSections(sections))).toBeGreaterThanOrEqual(60);
  });

  it('still carries no seed text into a real issuer', () => {
    const text = textOf(flattenSections(renderSections(sectionRegistry, { facts: sparse })));
    for (const leak of ['Vardhman', 'Chakan', 'Kalyani', 'HDFC', 'AFKPV1234C', 'Meera Kulkarni']) {
      expect(text, leak).not.toContain(leak);
    }
  });
});
