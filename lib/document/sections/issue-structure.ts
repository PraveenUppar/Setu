import { formatIndian } from '../../facts/money';
import type { DocumentNode } from '../nodes';
import { derivedTerms, type RenderContext, type SectionSpec } from '../section';

/**
 * ISSUE STRUCTURE — the first COMPUTED section (Wave 2).
 *
 * Unlike the template sections, this one is arithmetic. The allocation table is
 * derived from the issue size, the market maker reservation and the lot size,
 * using the rounding rule inferred from Om Galaxy's own figures (see
 * `derivedTerms`). A real prospectus states these as "[dot]" at DRHP stage; we
 * can state them, which is materially more useful to the issuer.
 *
 * Extraction notes, 2026-09-10:
 *   Om Galaxy RHP (BSE SME) pp.418-420, Maxwell DRHP (NSE Emerge) pp.317-319.
 *   The prose is boilerplate; the table is computed.
 */

const shares = (n: number) => `${formatIndian(String(n), 0)} Equity Shares`;

function computeIssueStructure({ facts }: RenderContext): DocumentNode[] {
  const t = derivedTerms(facts);
  const faceValue = facts.capital.faceValue;

  const nodes: DocumentNode[] = [
    { type: 'heading', level: 2, text: `${t.issueWord} Structure` },
    {
      type: 'paragraph',
      runs: [
        {
          text:
            `The ${t.issueWord} is being made through the Book Building Process in compliance with ` +
            `${t.eligibilityRegulation} of Chapter IX of the SEBI ICDR Regulations, whereby an issuer ` +
            `may offer shares to the public and propose to list them on the Small and Medium ` +
            `Enterprise Exchange, in this case being ${t.exchangeLongName}.`,
        },
      ],
    },
  ];

  if (t.marketMakerShares === 0) {
    // Every SME issue carves out a market maker portion (R-004), so its absence
    // is a gap, not a valid "nil" — and without it the Net Issue is unknowable.
    nodes.push({
      type: 'paragraph',
      runs: [
        {
          text: '[TO BE PROVIDED: Number of Equity Shares reserved for the Market Maker]',
          placeholder: {
            factPath: 'offer.marketMakerReservationShares',
            ask: 'Number of Equity Shares reserved for the Market Maker',
          },
        },
      ],
    });
    return nodes;
  }

  nodes.push(
    {
      type: 'paragraph',
      runs: [
        {
          text:
            'The number of Equity Shares available to each investor category is fixed by our ' +
            'Company in consultation with the Book Running Lead Manager at the time of pricing, ' +
            'within the limits set out below. ',
        },
        {
          text: '[TO BE PROVIDED: Category-wise allotment figures, to be fixed at pricing]',
          placeholder: {
            factPath: 'offer.categoryAllocation',
            ask: 'Category-wise allotment figures, to be fixed at pricing by the Book Running Lead Manager',
          },
        },
      ],
    },
    {
      type: 'paragraph',
      runs: [
        {
          text:
            `This initial public offer of up to ${shares(facts.offer.freshIssueShares)} of face ` +
            `value of Rs ${faceValue} each comprises a reservation of up to ` +
            `${shares(t.marketMakerShares)} for subscription by the Market Maker (the "Market Maker ` +
            `Reservation Portion"). The ${t.issueWord} less the Market Maker Reservation Portion, ` +
            `being up to ${shares(t.netIssueShares)}, is referred to as the "Net ${t.issueWord}". ` +
            `The ${t.issueWord} and the Net ${t.issueWord} will constitute ` +
            `${t.issuePercentOfPostIssueCapital}% and ${t.netIssuePercentOfPostIssueCapital}% ` +
            `respectively of the post-${t.issueWord.toLowerCase()} paid-up equity share capital of our Company.`,
        },
      ],
    },
    {
      type: 'table',
      caption: `${t.issueWord} Structure`,
      headers: [
        'Particulars',
        'Market Maker Reservation Portion',
        'QIBs',
        'Non-Institutional Investors',
        'Individual Investors',
      ],
      numericColumns: [1, 2, 3, 4],
      rows: [
        [
          'Number of Equity Shares available for allotment or allocation',
          `Up to ${formatIndian(String(t.marketMakerShares), 0)}`,
          // Not computable — see derivedTerms. The banker fixes these at
          // pricing within the R-024 bounds; deriving them would be wrong.
          '[TO BE PROVIDED]',
          '[TO BE PROVIDED]',
          '[TO BE PROVIDED]',
        ],
        [
          `Percentage of ${t.issueWord.toLowerCase()} size available for allotment or allocation`,
          `${t.marketMakerPercentOfIssue}% of the ${t.issueWord.toLowerCase()} size`,
          `Not more than 50% of the Net ${t.issueWord}`,
          `Not less than 15% of the Net ${t.issueWord}`,
          `Not less than 35% of the Net ${t.issueWord}`,
        ],
        [
          'Basis of allotment or allocation if respective category is oversubscribed',
          'Firm allotment',
          'Proportionate',
          'Proportionate',
          'Proportionate, subject to a minimum of one Bid Lot',
        ],
        [
          'Minimum Bid',
          `${formatIndian(String(t.marketMakerShares), 0)} Equity Shares`,
          'Such number of Equity Shares that the Bid Amount exceeds Rs 2,00,000',
          'Such number of Equity Shares that the Bid Amount exceeds Rs 2,00,000',
          `Two lots, being ${formatIndian(String(facts.offer.lotSize * 2), 0)} Equity Shares`,
        ],
        [
          'Bid Lot',
          '-',
          `${formatIndian(String(facts.offer.lotSize), 0)} Equity Shares and in multiples thereafter`,
          `${formatIndian(String(facts.offer.lotSize), 0)} Equity Shares and in multiples thereafter`,
          `${formatIndian(String(facts.offer.lotSize), 0)} Equity Shares and in multiples thereafter`,
        ],
        [
          'Mode of Allotment',
          'Compulsorily in dematerialised form',
          'Compulsorily in dematerialised form',
          'Compulsorily in dematerialised form',
          'Compulsorily in dematerialised form',
        ],
      ],
      footnotes: [
        `Under-subscription in any category, except the QIB Portion, may be met by spill-over from ` +
          `any other category or a combination of categories, at the discretion of our Company in ` +
          `consultation with the Book Running Lead Manager and the Designated Stock Exchange.`,
        `Up to 5% of the Net QIB Portion, excluding the Anchor Investor Portion, is available for ` +
          `proportionate allocation to Mutual Funds only.`,
        `One-third of the Non-Institutional Portion is reserved for Bidders with an application size ` +
          `of more than two lots and up to Rs 10.00 Lakhs, and two-thirds for Bidders with an ` +
          `application size of more than Rs 10.00 Lakhs.`,
      ],
    },
  );

  return nodes;
}

export const issueStructure: SectionSpec = {
  id: 'issueRelated.issueStructure',
  partOf: '32. Issue Structure',
  title: 'Issue Structure',
  producer: 'computed',
  order: 3050,
  group: 'SECTION - ISSUE RELATED INFORMATION',
  appliesIf: (facts) => facts.offer.issueType === 'BOOK_BUILT',
  clause: 'R-024',
  requiredFacts: ['offer.marketMakerReservationShares', 'offer.lotSize', 'offer.freshIssueShares'],
  extractedFrom: [
    'bookbuilt__manufacturing__om-galaxy__bse-sme__2026-09__rhp.pdf pp.418-420',
    'bookbuilt__engineering__maxwell-engineering__nse-emerge__2026-08__drhp.pdf pp.317-319',
  ],
  compute: computeIssueStructure,
};
