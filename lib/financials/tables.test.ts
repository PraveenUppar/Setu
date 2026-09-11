import { describe, expect, it } from 'vitest';
import { money } from '../facts/money';
import { vardhman } from '../seed/vardhman';
import { capitalisation, indebtednessSummary } from './tables';

const cr = (v: string) => money(v, 'crores');

describe('the indebtedness summary', () => {
  const s = indebtednessSummary(vardhman.financials.borrowings);

  it('groups fund-based facilities as secured then unsecured, by category', () => {
    expect(s.fundBasedSecured.map((l) => l.label)).toEqual(['Term Loan', 'Cash Credit', 'Term Loan for Vehicle']);
    expect(s.fundBasedUnsecured.map((l) => l.label)).toEqual(['Loan from Directors']);
    expect(s.nonFundBased.map((l) => l.label)).toEqual(['Bank Guarantee']);
  });

  it('sums sanctioned and outstanding exactly', () => {
    expect(s.fundBasedTotal).toEqual({ label: 'Sub Total (A)', sanctioned: cr('10.95'), outstanding: cr('8.60') });
    expect(s.nonFundBasedTotal).toEqual({ label: 'Sub Total (B)', sanctioned: cr('0.75'), outstanding: cr('0.40') });
    expect(s.total).toEqual({ label: 'Total (A+B)', sanctioned: cr('11.70'), outstanding: cr('9.00') });
  });

  it('ties the fund-based outstanding to the balance sheet, which is the seed invariant', () => {
    expect(s.fundBasedTotal.outstanding).toBe(vardhman.financials.years[0].totalBorrowings);
  });

  it('collapses two facilities of one kind into one line', () => {
    const two = indebtednessSummary([
      ...vardhman.financials.borrowings,
      { ...vardhman.financials.borrowings[0], lender: 'Another Bank', sanctionedAmount: cr('1'), outstanding: cr('0.5') },
    ]);
    const term = two.fundBasedSecured.find((l) => l.label === 'Term Loan')!;
    expect(term.sanctioned).toBe(cr('7.00'));
    expect(term.outstanding).toBe(cr('4.70'));
  });
});

describe('the capitalisation statement', () => {
  it('computes totals and both ratios from the latest year', () => {
    const c = capitalisation(vardhman)!;
    expect(c.asAt).toBe(2026);
    expect(c.totalBorrowings).toBe(cr('8.60'));
    expect(c.totalEquity).toBe(cr('19.40'));
    // 5.10 / 19.40 and 8.60 / 19.40
    expect(c.longTermDebtToEquity).toBe('0.26');
    expect(c.totalDebtToEquity).toBe('0.44');
  });

  it('ties to the seed: borrowings split sums to total borrowings, equity to net worth', () => {
    const y = vardhman.financials.years[0];
    const c = capitalisation(vardhman)!;
    expect(c.totalBorrowings).toBe(y.totalBorrowings);
    expect(c.totalEquity).toBe(y.netWorth);
  });

  it('is null rather than a table of dashes where the split is not on file', () => {
    const noSplit = {
      ...vardhman,
      financials: {
        ...vardhman.financials,
        years: vardhman.financials.years.map((y, i) => (i === 0 ? { ...y, otherEquity: undefined } : y)),
      },
    };
    expect(capitalisation(noSplit)).toBeNull();
  });
});
