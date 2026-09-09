import { describe, it, expect } from 'vitest';
import { vardhman } from './vardhman';
import { zFactBase } from '../facts/schema';
import { add, money, multiply, subtract, eq, gte, percentOf } from '../facts/money';

/**
 * The seed is the fixture every downstream stage tests against, so its
 * internal arithmetic has to tie. A seed whose capital build-up does not sum
 * to paid-up capital would make every capital-table test meaningless.
 */
describe('Vardhman seed', () => {
  it('validates against the full fact base schema', () => {
    const result = zFactBase.safeParse(vardhman);
    if (!result.success) {
      // Surface the actual paths so a schema change points at the fix
      console.error(JSON.stringify(result.error.issues, null, 2));
    }
    expect(result.success).toBe(true);
  });

  it('capital build-up sums exactly to pre-issue paid-up shares', () => {
    const total = vardhman.capital.allotments.reduce((sum, a) => sum + a.shares, 0);
    expect(total).toBe(vardhman.capital.paidUpShares);
    expect(total).toBe(12000000);
  });

  it('paid-up capital equals shares times face value', () => {
    const computed = multiply(vardhman.capital.faceValue, vardhman.capital.paidUpShares);
    expect(eq(computed, vardhman.capital.paidUpCapital)).toBe(true);
  });

  it('shareholding register sums to paid-up shares', () => {
    const total = vardhman.capital.shareholders.reduce((sum, s) => sum + s.shares, 0);
    expect(total).toBe(vardhman.capital.paidUpShares);
  });

  it('promoter holdings reconcile with the shareholding register', () => {
    const fromHoldings = vardhman.capital.promoterHoldings.reduce((sum, h) => sum + h.shares, 0);
    const fromRegister = vardhman.capital.shareholders
      .filter((s) => s.category === 'PROMOTER')
      .reduce((sum, s) => sum + s.shares, 0);
    expect(fromHoldings).toBe(fromRegister);
    expect(fromHoldings).toBe(7800000);
  });

  it('objects plus issue expenses equal the issue size at cap price', () => {
    const { objects, issueExpenses, freshIssueShares, capPrice } = vardhman.offer;
    const objectsTotal = add(...objects.map((o) => o.amount));
    const applied = add(objectsTotal, issueExpenses);
    const issueSize = multiply(capPrice!, freshIssueShares);

    expect(eq(applied, issueSize)).toBe(true);
    expect(subtract(issueSize, applied)).toBe('0');
    expect(issueSize).toBe(money('22.05', 'crores'));
  });

  it('general corporate purposes is within the 15% / Rs 10 crore cap (R-010)', () => {
    const { objects, freshIssueShares, capPrice } = vardhman.offer;
    const gross = multiply(capPrice!, freshIssueShares);
    const gcp = add(...objects.filter((o) => o.isGeneralCorporatePurposes).map((o) => o.amount));

    const sharePercent = percentOf(gcp, gross)!;
    expect(sharePercent.lessThanOrEqualTo(15)).toBe(true);
    // and the absolute Rs 10 crore ceiling
    expect(gte(money('10', 'crores'), gcp)).toBe(true);
  });

  it('post-issue capital stays inside the Reg 229(2) band (R-001)', () => {
    const postIssueShares = vardhman.capital.paidUpShares + vardhman.offer.freshIssueShares;
    const postIssueCapital = multiply(vardhman.capital.faceValue, postIssueShares);

    // More than Rs 10 crore and up to Rs 25 crore
    expect(gte(postIssueCapital, money('10', 'crores'))).toBe(true);
    expect(gte(money('25', 'crores'), postIssueCapital)).toBe(true);
    expect(postIssueCapital).toBe(money('16.5', 'crores'));
  });

  it('meets the operating profit test in at least 2 of 3 years (R-002)', () => {
    // Operating profit = PBT + finance costs + depreciation - other income.
    // Other income is excluded; the corpus documents are explicit about this.
    const operatingProfits = vardhman.financials.years.map((y) =>
      subtract(add(y.profitBeforeTax, y.financeCosts, y.depreciationAndAmortisation), y.otherIncome),
    );

    const threshold = money('1', 'crores');
    const qualifying = operatingProfits.filter((op) => gte(op, threshold));

    expect(qualifying.length).toBeGreaterThanOrEqual(2);
    expect(operatingProfits[0]).toBe(money('6.40', 'crores'));
  });

  it('meets the net worth test in at least 2 of 3 years (E-01)', () => {
    const threshold = money('1', 'crores');
    const qualifying = vardhman.financials.years.filter((y) => gte(y.netWorth, threshold));
    expect(qualifying.length).toBeGreaterThanOrEqual(2);
  });

  it('net tangible assets reconcile with net worth each year (E-05)', () => {
    for (const y of vardhman.financials.years) {
      const nta = subtract(
        subtract(subtract(y.totalAssets, y.totalLiabilities), y.intangibleAssets),
        y.deferredIpoExpenses,
      );
      expect(eq(nta, y.netWorth)).toBe(true);
    }
  });

  it('leverage stays within the 3:1 BSE ceiling every year (E-04)', () => {
    for (const y of vardhman.financials.years) {
      const ratio = percentOf(y.totalBorrowings, y.shareholdersEquity)!.dividedBy(100);
      expect(ratio.lessThanOrEqualTo(3)).toBe(true);
    }
  });

  it('has positive free cash flow to equity in at least 2 of 3 years (N-04)', () => {
    const fcfe = vardhman.financials.years.map((y) =>
      subtract(
        add(subtract(y.cashFlowFromOperations, y.netPurchaseOfFixedAssets), y.proceedsFromIssuanceOfCapital, y.netBorrowings),
        y.interestPaidNetOfTax,
      ),
    );
    const positive = fcfe.filter((v) => gte(v, '0') && v !== '0');
    expect(positive.length).toBeGreaterThanOrEqual(2);
  });

  it('top-5 customer concentration exceeds materiality, firing the risk factor', () => {
    const top5 = vardhman.business.topCustomers
      .slice(0, 5)
      .reduce((sum, c) => sum + c.revenueShare, 0);
    expect(top5).toBeCloseTo(61.3, 1);
    expect(top5).toBeGreaterThan(50);
  });

  it('clears the Reg 228 and Reg 230(1) hard blockers', () => {
    expect(vardhman.capital.hasOutstandingConvertibles).toBe(false); // 228(e)
    expect(vardhman.capital.hasPartlyPaidShares).toBe(false); // 230(1)(c)
    expect(vardhman.promoters.anyDebarredBySebi).toBe(false); // 228(a)
    expect(vardhman.promoters.anyWilfulDefaulterOrFraudulentBorrower).toBe(false); // 228(c)
    expect(vardhman.promoters.anyFugitiveEconomicOffender).toBe(false); // 228(d)
    // 230(1)(h): no object may repay promoter or related party loans
    expect(vardhman.offer.objects.every((o) => !o.involvesPromoterLoanRepayment)).toBe(true);
    // 230(1)(d): promoter and promoter group securities in demat form
    expect(vardhman.capital.shareholders.every((s) => s.isDematerialised)).toBe(true);
  });
});
