import { z } from 'zod';
import { zDate, zMoney } from './shared';

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

  /**
   * The Capitalisation Statement (section map #25) splits borrowings into
   * current and non-current and equity into share capital and other equity,
   * then states two ratios. Both primary sources use exactly these four lines
   * (Om Galaxy p.265, Maxwell p.234). Optional because the pre-check never
   * asks for them; the section renders a gap where they are missing.
   */
  currentBorrowings: zMoney
    .optional()
    .describe('Short-term borrowings repayable within twelve months, as per the restated balance sheet'),
  nonCurrentBorrowings: zMoney
    .optional()
    .describe('Long-term borrowings, including current maturities of term loans'),
  equityShareCapital: zMoney.optional().describe('Paid-up equity share capital at year end'),
  otherEquity: zMoney.optional().describe('Reserves and surplus / other equity at year end'),

  /** The litigation section states material creditors against total trade payables. */
  tradePayables: zMoney.optional().describe('Total trade payables at year end'),
});

export const zBorrowingCategory = z.enum([
  'TERM_LOAN',
  'WORKING_CAPITAL_TERM_LOAN',
  'VEHICLE_LOAN',
  'CASH_CREDIT',
  'OVERDRAFT',
  'BILL_DISCOUNTING',
  'BANK_GUARANTEE',
  'LETTER_OF_CREDIT',
  'UNSECURED_LOAN_FROM_DIRECTORS',
  'UNSECURED_LOAN_OTHER',
  'CREDIT_CARD',
  'OTHER',
]);

/**
 * One facility, for "Financial Indebtedness" (section map #27).
 *
 * The section is a summary by category — secured and unsecured within fund
 * based, then non-fund based, each with sanctioned and outstanding — over a
 * detail table with lender, nature, sanction date, amount, rate, outstanding,
 * repayment, security and purpose (Om Galaxy p.286, Maxwell p.231). The
 * summary is computed from the detail, so the two cannot disagree.
 */
export const zBorrowing = z.object({
  lender: z.string(),
  category: zBorrowingCategory,
  secured: z.boolean().default(true),
  /** Bank guarantees and letters of credit are non-fund based. */
  fundBased: z.boolean().default(true),
  sanctionDate: zDate.optional().describe('Date of the sanction letter'),
  sanctionedAmount: zMoney.describe('Sanctioned amount in rupees'),
  rateOfInterest: z.string().optional().describe('e.g. "Repo rate + 2.55%, currently 9.05% p.a."'),
  outstanding: zMoney.describe('Outstanding amount in rupees as on the stated date'),
  repaymentTerms: z.string().optional().describe('Tenure and repayment schedule'),
  security: z.string().optional().describe('Primary and collateral security, and any personal guarantees'),
  purpose: z.string().optional().describe('Purpose of the facility'),
});

/** One line of "Summary of Contingent Liabilities" (#7): a particular, three years. */
export const zContingentLiabilityItem = z.object({
  particulars: z.string().describe('e.g. "Bank guarantees", "Income tax demands under appeal"'),
  amountLatest: zMoney.nullable().describe('Amount at the most recent year end, in rupees'),
  amountPrior1: zMoney.nullable(),
  amountPrior2: zMoney.nullable(),
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
  auditorFirmRegistrationNumber: z.string().optional(),

  borrowings: z.array(zBorrowing).default([]).describe('Every facility outstanding or sanctioned'),
  borrowingsAsOn: zDate
    .optional()
    .describe('The date the outstanding amounts are stated as on'),
  borrowingsCertifiedBy: z
    .string()
    .optional()
    .describe('The auditor certificate the indebtedness figures rest on, with its date'),

  contingentLiabilityItems: z.array(zContingentLiabilityItem).default([]),

  /**
   * "Outstanding dues to creditors" in the litigation section: trade payables
   * split between MSMEs and others by count and amount, and the creditors
   * the materiality policy makes material (Om Galaxy p.311, Maxwell p.247).
   * As at the latest year end. The two amounts must sum to trade payables;
   * the section checks. The material creditors' NAMES go on the website, not
   * in the document, which is why only the count and amount are asked.
   */
  creditors: z
    .object({
      msmeCount: z.number().int().nonnegative().optional().describe('Number of micro, small and medium enterprise creditors'),
      msmeAmount: zMoney.optional().describe('Total dues to MSME creditors, in rupees'),
      otherCount: z.number().int().nonnegative().optional().describe('Number of other trade creditors'),
      otherAmount: zMoney.optional().describe('Total dues to other trade creditors, in rupees'),
      materialCount: z.number().int().nonnegative().optional().describe('Number of creditors above the materiality threshold'),
      materialAmount: zMoney.optional().describe('Total dues to material creditors, in rupees'),
    })
    .default({}),
});

export type FinancialYear = z.infer<typeof zFinancialYear>;
export type Borrowing = z.infer<typeof zBorrowing>;
export type BorrowingCategory = z.infer<typeof zBorrowingCategory>;
export type ContingentLiabilityItem = z.infer<typeof zContingentLiabilityItem>;
export type Financials = z.infer<typeof zFinancials>;
