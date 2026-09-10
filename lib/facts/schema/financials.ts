import { z } from 'zod';
import { zMoney } from './shared';

/**
 * Module M6 — Financials.
 *
 * We do NOT produce restated financial statements — that requires a
 * peer-reviewed CA, and in the offer document it is a one-page pointer into a
 * separately paginated annexure anyway (see 07-section-map.md, Finding 4).
 *
 * What we capture here is the structured figures the eligibility engine and
 * the computed tables need.
 */

/**
 * One financial year. Every figure the eligibility rules touch lives here,
 * so a rule never has to recompute from raw statements.
 */
export const zFinancialYear = z.object({
  /** Financial year ending 31 March of this year, e.g. 2026 for FY 2025-26. */
  yearEnding: z.number().int().min(2000).max(2100),

  revenue: zMoney.describe('Revenue from operations'),
  otherIncome: zMoney.describe('Other income, excluded from operating profit'),
  profitBeforeTax: zMoney,
  profitAfterTax: zMoney,

  /**
   * Operating profit = PBT + finance costs + depreciation and amortisation
   * - other income. Both exchanges require at least Rs 1 crore in 2 of the
   * 3 preceding years (R-002). Note that other income is EXCLUDED — the
   * corpus documents are explicit about this.
   */
  financeCosts: zMoney,
  depreciationAndAmortisation: zMoney,

  /** Net worth: share capital + reserves, excluding deferred IPO expenses. E-01. */
  netWorth: zMoney.describe('Net worth excluding deferred IPO expenses and minority interest'),

  totalAssets: zMoney,
  totalLiabilities: zMoney,
  intangibleAssets: zMoney,
  deferredIpoExpenses: zMoney.describe('Excluded from net worth and net tangible assets'),

  /**
   * R-029: BSE SME requires net tangible assets of at least Rs 3 crore with
   * NOT MORE THAN 50% held in monetary assets — cash, bank balances and
   * current investments. An issuer that clears Rs 3 crore by sitting on cash
   * has not met the criterion.
   *
   * Nullable because the split is not always disclosed separately, and a
   * default of zero would silently pass a test that was never run.
   */
  monetaryAssets: zMoney
    .nullable()
    .default(null)
    .describe('Cash, bank balances and current investments included in total assets'),

  totalBorrowings: zMoney.describe("Drives BSE's debt-to-equity test, E-04"),
  shareholdersEquity: zMoney,

  /** NSE Emerge requires positive FCFE in 2 of 3 years (N-04). BSE does not. */
  cashFlowFromOperations: zMoney,
  netPurchaseOfFixedAssets: zMoney,
  proceedsFromIssuanceOfCapital: zMoney,
  netBorrowings: zMoney,
  interestPaidNetOfTax: zMoney,

  contingentLiabilities: zMoney.default('0'),
  relatedPartyTransactionsTotal: zMoney.default('0'),
});

export const zFinancials = z.object({
  /** Three preceding financial years plus any stub period, most recent first. */
  years: z
    .array(zFinancialYear)
    .describe('At least the three financial years preceding the application, most recent first'),

  hasRestatedStatements: z
    .boolean()
    .default(false)
    .describe('Whether the peer-reviewed CA has delivered restated financial information'),

  auditorName: z.string().optional(),
  auditorPeerReviewNumber: z.string().optional(),
});

export type FinancialYear = z.infer<typeof zFinancialYear>;
export type Financials = z.infer<typeof zFinancials>;
