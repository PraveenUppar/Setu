import Decimal from 'decimal.js';
import { formatAs } from '../../facts/money';
import { capitalisation, indebtednessSummary } from '../../financials/tables';
import { lakhs, longDate, yearEnd } from '../format';
import type { DocumentNode } from '../nodes';
import { derivedTerms, type RenderContext, type SectionSpec } from '../section';
import { gap, h2, h3, para, table } from './helpers';

/**
 * FINANCIAL INDEBTEDNESS — section map #27, 2 to 19 pages by leverage.
 * COMPUTED from M6's facility list.
 *
 * Both primary sources open with a summary by category — fund based, secured
 * then unsecured, then non-fund based, with sanctioned and outstanding — and
 * follow it with the facility-level detail (Om Galaxy pp.286-289, Maxwell
 * pp.231-233). The summary is computed from the detail, so the two cannot
 * disagree, and the fund-based outstanding is checked against the balance
 * sheet's total borrowings.
 */
export const indebtedness: SectionSpec = {
  id: 'financial.indebtedness',
  partOf: '27. Financial Indebtedness',
  title: 'Financial Indebtedness',
  producer: 'computed',
  order: 2780,
  group: 'SECTION - FINANCIAL INFORMATION',
  clause: 'ICDR Schedule VI Part A',
  extractedFrom: [
    'bookbuilt__manufacturing__om-galaxy__bse-sme__2026-09__rhp.pdf pp.286-289',
    'bookbuilt__engineering__maxwell-engineering__nse-emerge__2026-08__drhp.pdf pp.231-233',
  ],
  compute: ({ facts }: RenderContext): DocumentNode[] => {
    const t = derivedTerms(facts);
    const f = facts.financials;
    const nodes: DocumentNode[] = [h2('Financial Indebtedness')];

    const asOn = f.borrowingsAsOn ? longDate(f.borrowingsAsOn) : undefined;
    nodes.push(
      para(
        `Our Company avails loans in the ordinary course of its business for purposes such as term loans, fund based working capital facilities, business requirements and general corporate purposes. For details of the resolution passed by our shareholders${facts.management.borrowingPowersResolutionDate ? ` on ${longDate(facts.management.borrowingPowersResolutionDate)}` : ''} authorising the borrowing powers of our Board, see "Our Management - Borrowing Powers of the Board".`,
      ),
    );

    if (f.borrowings.length === 0) {
      nodes.push(gap('financials.borrowings', 'Every borrowing facility, with lender, sanctioned amount, outstanding, rate, security and repayment terms — or confirm that the company has none'));
      return nodes;
    }
    if (!asOn) nodes.push(gap('financials.borrowingsAsOn', 'The date the outstanding borrowings are stated as on'));

    const s = indebtednessSummary(f.borrowings);
    const line = (l: { label: string; sanctioned: string; outstanding: string }) => [l.label, lakhs(l.sanctioned), lakhs(l.outstanding)];
    const rows: string[][] = [];
    if (s.fundBasedSecured.length + s.fundBasedUnsecured.length > 0) {
      rows.push(['Fund Based Borrowings', '', '']);
      if (s.fundBasedSecured.length > 0) rows.push(['Secured:', '', ''], ...s.fundBasedSecured.map(line));
      if (s.fundBasedUnsecured.length > 0) rows.push(['Unsecured:', '', ''], ...s.fundBasedUnsecured.map(line));
      rows.push(line(s.fundBasedTotal));
    }
    if (s.nonFundBased.length > 0) {
      rows.push(['Non-Fund Based Borrowings', '', ''], ...s.nonFundBased.map(line), line(s.nonFundBasedTotal));
    }
    rows.push(line(s.total));

    nodes.push(
      h3(`Details of borrowings sanctioned to our Company and outstanding as on ${asOn ?? '[date]'}`),
      table(
        ['Category of borrowing', `Sanctioned amount as on ${asOn ?? '[date]'} (Rs in Lakhs)`, `Outstanding amount as on ${asOn ?? '[date]'} (Rs in Lakhs)`],
        rows,
        {
          numericColumns: [1, 2],
          footnotes: f.borrowingsCertifiedBy ? [`As certified by ${f.borrowingsCertifiedBy}.`] : [],
        },
      ),
    );
    if (!f.borrowingsCertifiedBy) nodes.push(gap('financials.borrowingsCertifiedBy', 'The auditor certificate the indebtedness figures rest on, with its date'));

    /* Reconciliation against the balance sheet — a live check, stated where it fails */
    const latest = f.years[0];
    if (latest) {
      const diff = new Decimal(s.fundBasedTotal.outstanding).minus(latest.totalBorrowings);
      if (!diff.isZero()) {
        nodes.push(
          gap(
            'financials.borrowings',
            `The fund-based outstanding (${formatAs(s.fundBasedTotal.outstanding, 'lakhs')}) does not tie to total borrowings at ${yearEnd(latest.yearEnding)} (${formatAs(latest.totalBorrowings, 'lakhs')}); the difference is ${formatAs(diff.abs().toFixed(), 'lakhs')}. Either a facility is missing or the figures are as on different dates`,
            '[RECONCILIATION: fund-based borrowings do not tie to the balance sheet]',
          ),
        );
      }
    }

    /* Detail */
    const detail = (secured: boolean) => f.borrowings.filter((b) => b.fundBased && b.secured === secured);
    const detailTable = (items: typeof f.borrowings) =>
      table(
        ['Sr. No.', 'Name of lender', 'Nature of borrowing', 'Date of sanction', 'Sanctioned amount (Rs in Lakhs)', 'Rate of interest', `Outstanding (Rs in Lakhs)`, 'Tenure / repayment', 'Security', 'Purpose'],
        items.map((b, i) => [
          String(i + 1),
          b.lender,
          b.category.replace(/_/g, ' ').toLowerCase(),
          b.sanctionDate ? longDate(b.sanctionDate) : '-',
          lakhs(b.sanctionedAmount),
          b.rateOfInterest ?? '-',
          lakhs(b.outstanding),
          b.repaymentTerms ?? '-',
          b.security ?? '-',
          b.purpose ?? '-',
        ]),
        { numericColumns: [0, 4, 6] },
      );

    if (detail(true).length > 0) nodes.push(h3('Secured Borrowings'), para(`The terms of the secured borrowings availed by our Company as on ${asOn ?? '[date]'} are as follows:`), detailTable(detail(true)));
    if (detail(false).length > 0) nodes.push(h3('Unsecured Borrowings'), para(`The terms of the unsecured borrowings availed by our Company as on ${asOn ?? '[date]'} are as follows:`), detailTable(detail(false)));
    const nonFund = f.borrowings.filter((b) => !b.fundBased);
    if (nonFund.length > 0) nodes.push(h3('Non-Fund Based Facilities'), detailTable(nonFund));

    return nodes;
  },
};

/**
 * CAPITALISATION STATEMENT — section map #25, 1 page. COMPUTED from the
 * latest year in M6.
 *
 * Pre-issue column only. Both primary sources print the post-issue column
 * as "[dot]" — it depends on the issue price, fixed when the book closes —
 * so it is a gap here, not a computation (D20).
 */
export const capitalisationStatement: SectionSpec = {
  id: 'financial.capitalisation',
  partOf: '25. Capitalisation Statement',
  title: 'Capitalisation Statement',
  producer: 'computed',
  order: 2750,
  group: 'SECTION - FINANCIAL INFORMATION',
  clause: 'ICDR Schedule VI Part A',
  extractedFrom: [
    'bookbuilt__manufacturing__om-galaxy__bse-sme__2026-09__rhp.pdf p.265',
    'bookbuilt__engineering__maxwell-engineering__nse-emerge__2026-08__drhp.pdf p.234',
  ],
  compute: ({ facts }: RenderContext): DocumentNode[] => {
    const t = derivedTerms(facts);
    const c = capitalisation(facts);
    const nodes: DocumentNode[] = [h2('Capitalisation Statement')];

    if (!c) {
      nodes.push(gap('financials.years', 'Current and non-current borrowings, equity share capital and other equity at the latest year end, for the capitalisation statement'));
      return nodes;
    }

    nodes.push(
      para(
        `The following table sets forth our capitalisation as at ${yearEnd(c.asAt)}, derived from our Restated Financial Information, and as adjusted for the ${t.issueWord}. This table should be read in conjunction with "Risk Factors", "Restated Financial Information" and "Management's Discussion and Analysis of Financial Condition and Results of Operations".`,
      ),
      gap('offer.issuePrice', `The post-${t.issueWord} capitalisation, which is determined after finalisation of the ${t.issueWord} Price`, `[Post-${t.issueWord} column to be completed at pricing]`),
      table(
        ['Particulars', `Pre-${t.issueWord} as at ${yearEnd(c.asAt)} (Rs in Lakhs)`, `As adjusted for the ${t.issueWord} (Rs in Lakhs)`],
        [
          ['Borrowings', '', ''],
          ['Current borrowings (1)', lakhs(c.currentBorrowings), '[.]'],
          ['Non-current borrowings (2)', lakhs(c.nonCurrentBorrowings), '[.]'],
          ['Total borrowings (A)', lakhs(c.totalBorrowings), '[.]'],
          ['Equity', '', ''],
          ['Equity share capital', lakhs(c.equityShareCapital), '[.]'],
          ['Other equity', lakhs(c.otherEquity), '[.]'],
          ['Total equity (B)', lakhs(c.totalEquity), '[.]'],
          ['Ratio: Non-current borrowings / Total equity (in times)', c.longTermDebtToEquity, '[.]'],
          ['Ratio: Total borrowings / Total equity (in times)', c.totalDebtToEquity, '[.]'],
        ],
        {
          numericColumns: [1, 2],
          footnotes: [
            '(1) Current borrowings represent debts repayable on demand and debts payable within twelve months, excluding instalments of term loans repayable within twelve months.',
            '(2) Non-current borrowings represent debts other than current borrowings as defined above, and include instalments of term loans repayable within twelve months.',
            `The post-${t.issueWord} capitalisation will be determined after finalisation of the ${t.issueWord} Price.`,
          ],
        },
      ),
    );
    return nodes;
  },
};
