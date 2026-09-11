import Decimal from 'decimal.js';
import { formatAs } from '../../facts/money';
import { fiscal, lakhs, longDate, rupees, sum } from '../format';
import type { DocumentNode } from '../nodes';
import { derivedTerms, type RenderContext, type SectionSpec } from '../section';
import { gap, gapRun, h2, h3, para, runs, table } from './helpers';

/**
 * The four short subsections of SECTION - INTRODUCTION that the section map
 * lists after the Risk Factors: The Issue (#5), Summary of Financial
 * Information (#6), Summary of Contingent Liabilities (#7) and Summary of
 * Related Party Transactions (#8).
 */

const GROUP = 'SECTION - INTRODUCTION';

/**
 * THE ISSUE — section map #5, 2 to 3 pages. COMPUTED from M9 and M2.
 *
 * A two-column table, particulars against details, in both primary sources
 * (Om Galaxy pp.65-66, Maxwell pp.51-52). The deterministic rows are
 * computed: the issue, the market maker reservation, the net issue, the pre
 * and post-issue capital. The QIB, NII and individual SHARE COUNTS are not —
 * they are the banker's judgement within the R-024 bounds and no rule
 * reproduces the published figures (D20) — so those rows state the
 * percentage bounds and carry a gap for the count. The price is "[dot]" in
 * every corpus document at this stage and is a gap here for the same reason.
 */
export const theIssue: SectionSpec = {
  id: 'introduction.theIssue',
  partOf: '5. The Issue / The Offer',
  title: 'The Issue',
  producer: 'computed',
  order: 500,
  group: GROUP,
  clause: 'R-024 (allocation); R-023 (SCRR Rule 19(2)(b)); ICDR Schedule VI Part A',
  extractedFrom: [
    'bookbuilt__manufacturing__om-galaxy__bse-sme__2026-09__rhp.pdf pp.65-66',
    'bookbuilt__engineering__maxwell-engineering__nse-emerge__2026-08__drhp.pdf pp.51-52',
  ],
  compute: ({ facts }: RenderContext): DocumentNode[] => {
    const t = derivedTerms(facts);
    const o = facts.offer;
    const fv = facts.capital.faceValue;
    const nodes: DocumentNode[] = [h2(`The ${t.issueWord}`)];

    if (o.freshIssueShares === 0) {
      nodes.push(gap('offer.freshIssueShares', 'The number of Equity Shares in the fresh issue'));
      return nodes;
    }

    const price = o.issuePrice ? rupees(o.issuePrice) : '[.]';
    const at = `Equity Shares of face value of ${rupees(fv)} each for cash at a price of ${price} per Equity Share aggregating to ${o.issuePrice ? formatAs(new Decimal(o.issuePrice).times(t.offeredShares).toFixed(), 'lakhs') : 'Rs [.] Lakhs'}`;
    const ofNet = (pct: string) => `${pct} of the Net ${t.issueWord}: [.] Equity Shares of face value of ${rupees(fv)} each`;

    nodes.push(
      para(`Present ${t.issueWord} in terms of this ${t.documentName}:`),
      gap('offer.issuePrice', `The ${t.issueWord} Price, fixed at the close of the book`, `[${t.issueWord} Price to be determined at pricing]`),
      gap('offer.categoryAllocation', `The QIB, Non-Institutional and Individual portions in Equity Shares — the banker's allocation within the Regulation 253 bounds`, '[Category allocation in shares to be supplied by the Book Running Lead Manager]'),
      table(
        ['Particulars', 'Details'],
        [
          [`Equity Shares offered through the ${t.issueWord} (1)`, `${t.offeredShares.toLocaleString('en-IN')} ${at}`],
          ['Out of which:', ''],
          [`${t.issueWord} reserved for the Market Maker`, `${t.marketMakerShares.toLocaleString('en-IN')} ${at}`],
          [`Net ${t.issueWord} to the public`, `${t.netIssueShares.toLocaleString('en-IN')} ${at}`],
          [`The Net ${t.issueWord} comprises:`, ''],
          ['QIB Portion (2)', ofNet('Not more than 50%')],
          ['Of which: Anchor Investor Portion', `Up to 60% of the QIB Portion, allocated on a discretionary basis`],
          ['Of which: available for allocation to Mutual Funds only', `5% of the Net QIB Portion`],
          ['Non-Institutional Portion (3)', ofNet('Not less than 15%')],
          ['Individual Investor Portion', ofNet('Not less than 35%')],
          [`Pre and post-${t.issueWord} Equity Shares`, ''],
          [`Equity Shares outstanding prior to the ${t.issueWord}`, `${facts.capital.paidUpShares.toLocaleString('en-IN')} Equity Shares of face value of ${rupees(fv)} each`],
          [`Equity Shares outstanding after the ${t.issueWord}`, `${t.postIssueShares.toLocaleString('en-IN')} Equity Shares of face value of ${rupees(fv)} each`],
          [`Use of Net Proceeds`, `See "Objects of the ${t.issueWord}"`],
        ],
        {
          footnotes: [
            `(1) The ${t.issueWord} is being made in terms of Chapter IX of the SEBI ICDR Regulations, under ${t.eligibilityRegulation} read with Rule 19(2)(b) of the SCRR, wherein not less than 25% of the post-${t.issueWord} paid-up Equity Share capital of our Company is being offered to the public for subscription.`,
            `(2) Our Company may, in consultation with the Book Running Lead Manager, allocate up to 60% of the QIB Portion to Anchor Investors on a discretionary basis, of which one third shall be reserved for domestic Mutual Funds, subject to valid Bids at or above the Anchor Investor Allocation Price. 5% of the Net QIB Portion shall be available for allocation on a proportionate basis to Mutual Funds only.`,
            `(3) One third of the Non-Institutional Portion is reserved for applicants with an application size of more than two lots and up to Rs 10 lakhs, and two thirds for applicants with an application size of more than Rs 10 lakhs; the unsubscribed portion in either sub-category may be allocated to applicants in the other.`,
            `Subject to valid Bids being received at or above the ${t.issueWord} Price, under-subscription, if any, in any category except the QIB Portion may be met with spill-over from any other category or combination of categories at the discretion of our Company in consultation with the Book Running Lead Manager and the Designated Stock Exchange.`,
          ],
        },
      ),
    );

    nodes.push(
      runs([
        { text: `The present ${t.issueWord} has been authorised by our Board pursuant to a resolution passed at its meeting held on ` },
        o.boardResolutionDate ? { text: longDate(o.boardResolutionDate) } : gapRun('offer.boardResolutionDate', 'Date of the board resolution authorising the issue'),
        { text: ' and by our shareholders pursuant to a special resolution under Section 62(1)(c) of the Companies Act, 2013 passed on ' },
        o.shareholderResolutionDate ? { text: longDate(o.shareholderResolutionDate) } : gapRun('offer.shareholderResolutionDate', 'Date of the shareholders special resolution'),
        { text: '.' },
      ]),
    );
    return nodes;
  },
};

/**
 * SUMMARY OF FINANCIAL INFORMATION — section map #6, 4 to 7 pages.
 * EXTERNAL: it is the summary statements of assets and liabilities, profit
 * and loss and cash flows from the Restated Financial Information, which
 * the peer-reviewed auditor produces. Both primary sources reproduce those
 * statements in full (Om Galaxy pp.67-70, Maxwell pp.52-58). The fact base
 * carries key figures, not statements, and a condensed table of our own
 * would not be what the section is.
 */
export const summaryOfFinancialInformation: SectionSpec = {
  id: 'introduction.summaryOfFinancialInformation',
  partOf: '6. Summary of Financial Information',
  title: 'Summary of Financial Information',
  producer: 'external',
  order: 600,
  group: GROUP,
  clause: 'ICDR Schedule VI Part A, para 11',
  externalNote:
    'Summary of the restated statement of assets and liabilities, profit and loss and cash flows for the three financial years, from the Restated Financial Information delivered by the peer-reviewed auditor',
};

/**
 * SUMMARY OF CONTINGENT LIABILITIES — section map #7, 1 page. COMPUTED from
 * M6's contingent liability items, three years across.
 *
 * Both primary sources print particulars against the three fiscal years and
 * cite the note in the restated financials (Om Galaxy p.71, Maxwell p.59).
 * The totals are checked against the year table; where they do not tie the
 * section says so rather than printing two different numbers for one thing.
 */
export const contingentLiabilities: SectionSpec = {
  id: 'introduction.contingentLiabilities',
  partOf: '7. Summary of Contingent Liabilities',
  title: 'Summary of Contingent Liabilities',
  producer: 'computed',
  order: 700,
  group: GROUP,
  clause: 'ICDR Schedule VI Part A',
  extractedFrom: [
    'bookbuilt__manufacturing__om-galaxy__bse-sme__2026-09__rhp.pdf p.71',
    'bookbuilt__engineering__maxwell-engineering__nse-emerge__2026-08__drhp.pdf p.59',
  ],
  compute: ({ facts }: RenderContext): DocumentNode[] => {
    const years = facts.financials.years.slice(0, 3);
    const items = facts.financials.contingentLiabilityItems;
    const nodes: DocumentNode[] = [h2('Summary of Contingent Liabilities')];

    if (years.length === 0) {
      nodes.push(gap('financials.years', 'The financial years the contingent liabilities are stated for'));
      return nodes;
    }
    const yearList = years.map((y) => `March 31, ${y.yearEnding}`);
    nodes.push(
      para(
        `The following is a summary of the contingent liabilities of our Company as at ${yearList.length > 1 ? `${yearList.slice(0, -1).join(', ')} and ${yearList[yearList.length - 1]}` : yearList[0]}, as derived from the Restated Financial Information:`,
      ),
    );

    if (items.length === 0) {
      const anyReported = years.some((y) => new Decimal(y.contingentLiabilities).greaterThan(0));
      nodes.push(
        anyReported
          ? gap('financials.contingentLiabilityItems', 'The contingent liabilities by particular for each year, from the note to the accounts — the year table reports a total but no items')
          : para('Our Company had no contingent liabilities as at the end of any of the above financial years.'),
      );
      return nodes;
    }

    const amountAt = (item: (typeof items)[number], i: number) =>
      [item.amountLatest, item.amountPrior1, item.amountPrior2][i] ?? null;
    const totals = years.map((_, i) => sum(items.map((it) => amountAt(it, i))));
    nodes.push(
      table(
        ['Sr. No.', 'Particulars', ...years.map((y) => `${fiscal(y.yearEnding)} (Rs in Lakhs)`)],
        [
          ...items.map((it, n) => [String(n + 1), it.particulars, ...years.map((_, i) => lakhs(amountAt(it, i)))]),
          ['', 'Total', ...totals.map((tot) => lakhs(tot))],
        ],
        { numericColumns: [0, ...years.map((_, i) => i + 2)] },
      ),
      para('For details, see the note on contingent liabilities in the Restated Financial Information.'),
    );

    years.forEach((y, i) => {
      if (!new Decimal(totals[i]).equals(y.contingentLiabilities)) {
        nodes.push(
          gap(
            'financials.contingentLiabilityItems',
            `The contingent liability items for ${fiscal(y.yearEnding)} total ${formatAs(totals[i], 'lakhs')} but the year table states ${formatAs(y.contingentLiabilities, 'lakhs')}`,
            `[RECONCILIATION: contingent liabilities for ${fiscal(y.yearEnding)} do not tie]`,
          ),
        );
      }
    });
    return nodes;
  },
};

/**
 * SUMMARY OF RELATED PARTY TRANSACTIONS — section map #8, 2 to 4 pages.
 * COMPUTED from M10: the list of related parties, then the transactions by
 * nature and party with three years across (Om Galaxy pp.72-74, Maxwell
 * pp.60-61). Yearly totals are checked against M6.
 */
export const relatedPartyTransactions: SectionSpec = {
  id: 'introduction.relatedPartyTransactions',
  partOf: '8. Summary of Related Party Transactions',
  title: 'Summary of Related Party Transactions',
  producer: 'computed',
  order: 750,
  group: GROUP,
  clause: 'ICDR Schedule VI Part A; AS 18 / Ind AS 24',
  extractedFrom: [
    'bookbuilt__manufacturing__om-galaxy__bse-sme__2026-09__rhp.pdf pp.72-74',
    'bookbuilt__engineering__maxwell-engineering__nse-emerge__2026-08__drhp.pdf pp.60-61',
  ],
  compute: ({ facts }: RenderContext): DocumentNode[] => {
    const years = facts.financials.years.slice(0, 3);
    const g = facts.groupCompanies;
    const nodes: DocumentNode[] = [h2('Summary of Related Party Transactions')];

    if (years.length === 0) {
      nodes.push(gap('financials.years', 'The financial years the related party transactions are stated for'));
      return nodes;
    }
    const yearList = years.map((y) => `March 31, ${y.yearEnding}`);
    nodes.push(
      para(
        `The details of related party transactions entered into by our Company for the financial years ended ${yearList.length > 1 ? `${yearList.slice(0, -1).join(', ')} and ${yearList[yearList.length - 1]}` : yearList[0]}, as derived from the Restated Financial Information, are set out below.`,
      ),
      h3('List of Related Parties'),
    );
    nodes.push(
      g.relatedParties.length === 0
        ? gap('groupCompanies.relatedParties', 'The related parties from the note to the accounts, with their relationship')
        : table(['Name of related party', 'Nature of relationship'], g.relatedParties.map((p) => [p.name, p.relationship])),
    );

    nodes.push(h3('Related Party Transactions'));
    if (g.relatedPartyTransactions.length === 0) {
      nodes.push(gap('groupCompanies.relatedPartyTransactions', 'The related party transactions by nature and party, with the amount in each of the three financial years'));
      return nodes;
    }
    const byParty = new Map(g.relatedParties.map((p) => [p.name, p.relationship]));
    const amountAt = (tx: (typeof g.relatedPartyTransactions)[number], i: number) =>
      [tx.amountLatest, tx.amountPrior1, tx.amountPrior2][i] ?? null;
    const totals = years.map((_, i) => sum(g.relatedPartyTransactions.map((tx) => amountAt(tx, i))));
    nodes.push(
      table(
        ['Nature of transaction', 'Name of related party', 'Relationship', ...years.map((y) => `${fiscal(y.yearEnding)} (Rs in Lakhs)`)],
        [
          ...g.relatedPartyTransactions.map((tx) => [tx.nature, tx.partyName, byParty.get(tx.partyName) ?? '-', ...years.map((_, i) => lakhs(amountAt(tx, i)))]),
          ['Total', '', '', ...totals.map((tot) => lakhs(tot))],
        ],
        { numericColumns: years.map((_, i) => i + 3) },
      ),
    );
    years.forEach((y, i) => {
      if (!new Decimal(totals[i]).equals(y.relatedPartyTransactionsTotal)) {
        nodes.push(
          gap(
            'groupCompanies.relatedPartyTransactions',
            `The related party transactions for ${fiscal(y.yearEnding)} total ${formatAs(totals[i], 'lakhs')} but the year table states ${formatAs(y.relatedPartyTransactionsTotal, 'lakhs')}`,
            `[RECONCILIATION: related party transactions for ${fiscal(y.yearEnding)} do not tie]`,
          ),
        );
      }
    });
    for (const tx of g.relatedPartyTransactions) {
      if (!byParty.has(tx.partyName)) {
        nodes.push(gap('groupCompanies.relatedParties', `${tx.partyName} appears in the transactions but not in the list of related parties`));
      }
    }
    return nodes;
  },
};
