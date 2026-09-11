import Decimal from 'decimal.js';
import { type Money } from '../facts/money';
import type { Borrowing, FactBase } from '../facts/schema';

/**
 * The computed figures behind Financial Indebtedness and the Capitalisation
 * Statement. Pure functions over the fact base, so the tables can be tested
 * against the seed's arithmetic without rendering anything.
 */

/* ------------------------------------------------------------------ */
/* Indebtedness                                                        */
/* ------------------------------------------------------------------ */

export interface BorrowingLine {
  label: string;
  sanctioned: Money;
  outstanding: Money;
}

export interface IndebtednessSummary {
  fundBasedSecured: BorrowingLine[];
  fundBasedUnsecured: BorrowingLine[];
  fundBasedTotal: BorrowingLine;
  nonFundBased: BorrowingLine[];
  nonFundBasedTotal: BorrowingLine;
  total: BorrowingLine;
}

/** How the summary table names each category (Om Galaxy p.286). */
export const BORROWING_LABEL: Record<Borrowing['category'], string> = {
  TERM_LOAN: 'Term Loan',
  WORKING_CAPITAL_TERM_LOAN: 'Working Capital Term Loan',
  VEHICLE_LOAN: 'Term Loan for Vehicle',
  CASH_CREDIT: 'Cash Credit',
  OVERDRAFT: 'Bank Overdraft',
  BILL_DISCOUNTING: 'Bill Discounting',
  BANK_GUARANTEE: 'Bank Guarantee',
  LETTER_OF_CREDIT: 'Letter of Credit',
  UNSECURED_LOAN_FROM_DIRECTORS: 'Loan from Directors',
  UNSECURED_LOAN_OTHER: 'Unsecured Loans',
  CREDIT_CARD: 'Credit Card Dues',
  OTHER: 'Other Borrowings',
};

const sumLines = (label: string, lines: BorrowingLine[]): BorrowingLine => ({
  label,
  sanctioned: lines.reduce((s, l) => s.plus(l.sanctioned), new Decimal(0)).toFixed(),
  outstanding: lines.reduce((s, l) => s.plus(l.outstanding), new Decimal(0)).toFixed(),
});

/** Facilities of one kind collapse to one line, summed. */
function byCategory(items: Borrowing[]): BorrowingLine[] {
  const lines = new Map<string, BorrowingLine>();
  for (const b of items) {
    const label = BORROWING_LABEL[b.category];
    const line = lines.get(label) ?? { label, sanctioned: '0', outstanding: '0' };
    lines.set(label, {
      label,
      sanctioned: new Decimal(line.sanctioned).plus(b.sanctionedAmount).toFixed(),
      outstanding: new Decimal(line.outstanding).plus(b.outstanding).toFixed(),
    });
  }
  return [...lines.values()];
}

/**
 * The summary the section opens with: fund based (secured, then unsecured),
 * non-fund based, and totals — computed from the facility list so that the
 * summary and the detail cannot disagree.
 */
export function indebtednessSummary(borrowings: Borrowing[]): IndebtednessSummary {
  const fund = borrowings.filter((b) => b.fundBased);
  const fundBasedSecured = byCategory(fund.filter((b) => b.secured));
  const fundBasedUnsecured = byCategory(fund.filter((b) => !b.secured));
  const nonFundBased = byCategory(borrowings.filter((b) => !b.fundBased));

  const fundBasedTotal = sumLines('Sub Total (A)', [...fundBasedSecured, ...fundBasedUnsecured]);
  const nonFundBasedTotal = sumLines('Sub Total (B)', nonFundBased);
  return {
    fundBasedSecured,
    fundBasedUnsecured,
    fundBasedTotal,
    nonFundBased,
    nonFundBasedTotal,
    total: sumLines('Total (A+B)', [fundBasedTotal, nonFundBasedTotal]),
  };
}

/* ------------------------------------------------------------------ */
/* Capitalisation                                                      */
/* ------------------------------------------------------------------ */

export interface Capitalisation {
  asAt: number;
  currentBorrowings: Money;
  nonCurrentBorrowings: Money;
  totalBorrowings: Money;
  equityShareCapital: Money;
  otherEquity: Money;
  totalEquity: Money;
  /** Non-current borrowings / total equity, to two places. */
  longTermDebtToEquity: string;
  /** Total borrowings / total equity. */
  totalDebtToEquity: string;
}

/**
 * The pre-issue column of the Capitalisation Statement, from the latest
 * year. The post-issue column is NOT computed: both primary sources print it
 * as "[dot]" because it depends on the issue price, which is fixed at the
 * close of the book (D20 — derived versus discretionary).
 *
 * Returns null where the split is not on file; the section then renders a gap
 * rather than a table with dashes in it.
 */
export function capitalisation(facts: FactBase): Capitalisation | null {
  const y = facts.financials.years[0];
  if (!y || !y.currentBorrowings || !y.nonCurrentBorrowings || !y.equityShareCapital || !y.otherEquity) {
    return null;
  }
  const totalBorrowings = new Decimal(y.currentBorrowings).plus(y.nonCurrentBorrowings);
  const totalEquity = new Decimal(y.equityShareCapital).plus(y.otherEquity);
  const r = (n: Decimal) => (totalEquity.isZero() ? '-' : n.dividedBy(totalEquity).toFixed(2));
  return {
    asAt: y.yearEnding,
    currentBorrowings: y.currentBorrowings,
    nonCurrentBorrowings: y.nonCurrentBorrowings,
    totalBorrowings: totalBorrowings.toFixed(),
    equityShareCapital: y.equityShareCapital,
    otherEquity: y.otherEquity,
    totalEquity: totalEquity.toFixed(),
    longTermDebtToEquity: r(new Decimal(y.nonCurrentBorrowings)),
    totalDebtToEquity: r(totalBorrowings),
  };
}
