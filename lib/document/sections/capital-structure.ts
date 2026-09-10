import { formatAs } from '../../facts/money';
import {
  buildUp,
  capitalSummary,
  lockIn,
  shares,
  shareholding,
  topShareholders,
} from '../../capital/tables';
import type { DocumentNode } from '../nodes';
import { derivedTerms, type RenderContext, type SectionSpec } from '../section';

/**
 * CAPITAL STRUCTURE — 12 to 18 pages, and the most table-heavy section in the
 * document.
 *
 * Entirely COMPUTED. Every table here is derived from two lists the issuer
 * supplies in M2 — the allotment history and the shareholding register — plus
 * the per-promoter tranches. None of it is typed, because the tables have to
 * agree with each other and with the eligibility rules, and the only way to
 * guarantee that is one source and one computation.
 *
 * What the corpus shows, and what this follows:
 *   Om Galaxy RHP pp.92-109 and Century Business Media pp.65-78 — the share
 *   capital table, the build-up since incorporation, the shareholding pattern
 *   before and after the issue, the promoter contribution and lock-in, and the
 *   top ten shareholders, in that order.
 *
 * The numbered notes that follow the tables in a real document are NOT here
 * yet: several of them state facts the fact base does not carry (no bridge
 * loan, no pledged promoter shares, the ten-per-cent over-subscription
 * retention), and inventing them would be exactly what MM4 forbids.
 */

const NUMERIC = (n: number) => Array.from({ length: n }, (_, i) => i + 1);

export const capitalStructure: SectionSpec = {
  id: 'capital.structure',
  partOf: '10. Capital Structure',
  title: 'Capital Structure',
  producer: 'computed',
  order: 2000,
  group: 'SECTION - CAPITAL STRUCTURE',
  clause: 'R-009 (lock-in); ICDR Schedule VI Part A',
  extractedFrom: [
    'bookbuilt__manufacturing__om-galaxy__bse-sme__2026-09__rhp.pdf pp.92-109',
  ],
  compute: (ctx: RenderContext): DocumentNode[] => {
    const { facts } = ctx;
    const t = derivedTerms(facts);
    const summary = capitalSummary(facts);
    const nodes: DocumentNode[] = [
      { type: 'heading', level: 2, text: 'Capital Structure' },
      {
        type: 'paragraph',
        runs: [
          {
            text:
              `The share capital of our Company as of the date of this ${t.documentName}, before and ` +
              `after the ${t.issueWord}, is set out below.`,
          },
        ],
      },
      {
        type: 'table',
        caption: 'Share capital',
        headers: ['Particulars', 'Number of Equity Shares', 'Aggregate value at face value'],
        numericColumns: [1, 2],
        rows: [
          [
            'Authorised share capital',
            shares(summary.authorisedShares),
            formatAs(summary.authorisedCapital, 'lakhs'),
          ],
          [
            `Issued, subscribed and paid-up share capital before the ${t.issueWord}`,
            shares(summary.preIssueShares),
            formatAs(summary.preIssueCapital, 'lakhs'),
          ],
          [
            `Present ${t.issueWord}`,
            shares(summary.freshIssueShares),
            formatAs(facts.capital.faceValue === '0' ? '0' : String(Number(facts.capital.faceValue) * summary.freshIssueShares), 'lakhs'),
          ],
          [
            `Paid-up share capital after the ${t.issueWord}`,
            shares(summary.postIssueShares),
            formatAs(summary.postIssueCapital, 'lakhs'),
          ],
        ],
      },
    ];

    /* ---------------------------------------------------------------- */
    /* Build-up since incorporation                                      */
    /* ---------------------------------------------------------------- */
    const rows = buildUp(facts.capital.allotments);
    if (rows.length === 0) {
      nodes.push(
        { type: 'heading', level: 3, text: 'Share Capital History of our Company' },
        {
          type: 'paragraph',
          runs: [
            {
              text: '[TO BE PROVIDED: Every allotment of Equity Shares since incorporation]',
              placeholder: {
                factPath: 'capital.allotments',
                ask: 'Every allotment since incorporation, from the PAS-3 filings — the cumulative total must tie to paid-up capital',
              },
            },
          ],
        },
      );
    } else {
      nodes.push(
        { type: 'heading', level: 3, text: 'Share Capital History of our Company' },
        {
          type: 'paragraph',
          runs: [
            {
              text:
                'The history of the equity share capital of our Company since incorporation is set ' +
                'out below. The cumulative column reconciles to the paid-up capital stated above.',
            },
          ],
        },
        {
          type: 'table',
          caption: 'Build-up of equity share capital',
          headers: [
            'Date of allotment',
            'Number of shares',
            'Face value (Rs)',
            'Issue price (Rs)',
            'Nature of consideration',
            'Nature of allotment',
            'Cumulative shares',
          ],
          numericColumns: [1, 2, 3, 6],
          rows: rows.map((r) => [
            r.date,
            shares(r.shares),
            r.faceValue,
            r.issuePrice ?? 'Nil',
            r.consideration.replace(/_/g, ' ').toLowerCase(),
            r.nature.replace(/_/g, ' ').toLowerCase(),
            shares(r.cumulativeShares),
          ]),
        },
      );
    }

    /* ---------------------------------------------------------------- */
    /* Shareholding pattern                                              */
    /* ---------------------------------------------------------------- */
    const holders = shareholding(facts);
    if (holders.length > 0) {
      nodes.push(
        { type: 'heading', level: 3, text: `Shareholding Pattern Before and After the ${t.issueWord}` },
        {
          type: 'table',
          caption: `Shareholding before and after the ${t.issueWord}`,
          headers: [
            'Name of shareholder',
            'Category',
            'Shares held',
            `Pre-${t.issueWordLower} (%)`,
            `Post-${t.issueWordLower} (%)`,
          ],
          numericColumns: [2, 3, 4],
          rows: holders.map((h) => [
            h.name,
            h.category.replace(/_/g, ' ').toLowerCase(),
            shares(h.shares),
            h.preIssuePercent,
            h.postIssuePercent,
          ]),
          footnotes: [
            `Existing shareholders do not lose Equity Shares in the ${t.issueWord}; their percentage holding is diluted by the fresh issue.`,
          ],
        },
      );

      const top = topShareholders(facts);
      nodes.push(
        { type: 'heading', level: 3, text: 'Top Ten Shareholders' },
        {
          type: 'table',
          caption: `Top ${top.length} shareholders as of the date of this ${t.documentName}`,
          headers: ['Sr. No.', 'Name of shareholder', 'Shares held', 'Percentage'],
          numericColumns: [0, 2, 3],
          rows: top.map((h, i) => [
            String(NUMERIC(top.length)[i]),
            h.name,
            shares(h.shares),
            h.preIssuePercent,
          ]),
        },
      );
    }

    /* ---------------------------------------------------------------- */
    /* Promoter contribution and lock-in                                 */
    /* ---------------------------------------------------------------- */
    const lock = lockIn(facts);
    if (facts.capital.promoterHoldings.length > 0) {
      nodes.push(
        { type: 'heading', level: 3, text: "Minimum Promoter's Contribution and Lock-in" },
        {
          type: 'paragraph',
          runs: [
            {
              text:
                `An aggregate of at least 20% of the post-${t.issueWordLower} equity share capital of ` +
                `our Company held by our Promoters — ${shares(lock.requiredMpcShares)} Equity Shares — ` +
                'shall be locked in for three years from the date of Allotment as the Minimum ' +
                "Promoter's Contribution. The promoter holding in excess of that is locked in for one " +
                'year as to the first half and two years as to the remainder.',
            },
          ],
        },
      );

      if (lock.shortfallShares > 0) {
        nodes.push({
          type: 'paragraph',
          runs: [
            {
              text:
                `[TO BE PROVIDED: ${shares(lock.shortfallShares)} further Equity Shares eligible for ` +
                "the Minimum Promoter's Contribution]",
              placeholder: {
                factPath: 'capital.promoterHoldings',
                ask:
                  `The promoters hold ${shares(lock.eligibleShares)} eligible Equity Shares against a requirement of ` +
                  `${shares(lock.requiredMpcShares)}. Shares ineligible for the minimum contribution, such as bonus ` +
                  'shares issued out of revaluation reserves, cannot make up the difference',
              },
            },
          ],
        });
      }

      nodes.push({
        type: 'table',
        caption: 'Lock-in of promoter holdings',
        headers: [
          'Promoter',
          'Date of acquisition',
          'Shares',
          'Cost per share (Rs)',
          'Lock-in',
          'Basis',
        ],
        numericColumns: [2, 3],
        rows: lock.tranches.map((tr) => [
          tr.promoterName,
          tr.acquisitionDate,
          shares(tr.shares),
          tr.costPerShare,
          `${tr.lockInYears} year${tr.lockInYears === 1 ? '' : 's'}`,
          tr.basis,
        ]),
        footnotes: [
          'The entire pre-issue capital held by persons other than the Promoters is locked in for one year from the date of Allotment.',
        ],
      });
    }

    return nodes;
  },
};
