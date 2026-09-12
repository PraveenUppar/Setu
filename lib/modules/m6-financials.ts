import { z } from 'zod';
import { zBorrowing, zContingentLiabilityItem, zDate, zFinancialYear, zMoney } from '../facts/schema';
import type { Module } from './types';
import type { RepeaterColumn } from './repeater-spec';

/**
 * M6 — Financials.
 *
 * The CFO's module, and the longest after M2: four to six hours, three
 * repeaters, and every figure the eligibility engine reads.
 *
 * We do NOT produce restated financial statements. The peer-reviewed auditor
 * does, and in the document they are a one-page pointer into an annexure with
 * its own pagination (07-section-map, Finding 4). What is collected here is
 * the structured figures — one row per financial year — that the rules test
 * and the computed sections tabulate: Capitalisation Statement, Financial
 * Indebtedness, Summary of Contingent Liabilities, and the litigation
 * materiality threshold.
 *
 * The year table is wide. It is one row per year on purpose: a CFO has these
 * figures in a spreadsheet with years as columns, and pasting a transposed
 * block is a minute's work against typing 25 figures three times over.
 */

const CAPITALISATION = 'financial.capitalisation';
const INDEBTEDNESS = 'financial.indebtedness';
const CONTINGENT = 'introduction.contingentLiabilities';
const LITIGATION = 'legal.litigation';
const SUMMARY = 'introduction.summaryOfFinancialInformation';
const RISK = 'general.riskFactors';

export const FINANCIAL_YEAR_COLUMNS: RepeaterColumn[] = [
  { key: 'yearEnding', label: 'FY ending (year)', type: 'number', width: '6rem', placeholder: '2026' },
  { key: 'revenue', label: 'Revenue from operations', type: 'money', width: '9rem' },
  { key: 'otherIncome', label: 'Other income', type: 'money', width: '8rem' },
  { key: 'profitBeforeTax', label: 'PBT', type: 'money', width: '8rem' },
  { key: 'profitAfterTax', label: 'PAT', type: 'money', width: '8rem' },
  { key: 'financeCosts', label: 'Finance costs', type: 'money', width: '8rem' },
  { key: 'depreciationAndAmortisation', label: 'Depreciation and amortisation', type: 'money', width: '9rem' },
  { key: 'netWorth', label: 'Net worth', type: 'money', width: '8rem' },
  { key: 'totalAssets', label: 'Total assets', type: 'money', width: '8rem' },
  { key: 'totalLiabilities', label: 'Total liabilities', type: 'money', width: '8rem' },
  { key: 'intangibleAssets', label: 'Intangible assets', type: 'money', width: '8rem' },
  { key: 'deferredIpoExpenses', label: 'Deferred IPO expenses', type: 'money', width: '8rem' },
  { key: 'monetaryAssets', label: 'Monetary assets', type: 'money', width: '8rem' },
  { key: 'totalBorrowings', label: 'Total borrowings', type: 'money', width: '8rem' },
  { key: 'currentBorrowings', label: 'Current borrowings', type: 'money', width: '8rem' },
  { key: 'nonCurrentBorrowings', label: 'Non-current borrowings', type: 'money', width: '8rem' },
  { key: 'equityShareCapital', label: 'Equity share capital', type: 'money', width: '8rem' },
  { key: 'otherEquity', label: 'Other equity', type: 'money', width: '8rem' },
  { key: 'shareholdersEquity', label: 'Shareholders’ equity', type: 'money', width: '8rem' },
  { key: 'tradePayables', label: 'Trade payables', type: 'money', width: '8rem' },
  { key: 'tradeReceivables', label: 'Trade receivables', type: 'money', width: '8rem' },
  { key: 'cashFlowFromOperations', label: 'Cash flow from operations', type: 'money', width: '9rem' },
  { key: 'netPurchaseOfFixedAssets', label: 'Net purchase of fixed assets', type: 'money', width: '9rem' },
  { key: 'proceedsFromIssuanceOfCapital', label: 'Proceeds from issue of capital', type: 'money', width: '9rem' },
  { key: 'netBorrowings', label: 'Net borrowings', type: 'money', width: '8rem' },
  { key: 'interestPaidNetOfTax', label: 'Interest paid net of tax', type: 'money', width: '8rem' },
  { key: 'contingentLiabilities', label: 'Contingent liabilities (total)', type: 'money', width: '9rem' },
  { key: 'relatedPartyTransactionsTotal', label: 'RPTs (total)', type: 'money', width: '8rem' },
];

export const BORROWING_COLUMNS: RepeaterColumn[] = [
  { key: 'lender', label: 'Lender', type: 'text', width: '13rem' },
  {
    key: 'category',
    label: 'Nature',
    type: 'select',
    width: '13rem',
    options: [
      { value: 'TERM_LOAN', label: 'Term loan' },
      { value: 'WORKING_CAPITAL_TERM_LOAN', label: 'Working capital term loan' },
      { value: 'VEHICLE_LOAN', label: 'Vehicle loan' },
      { value: 'CASH_CREDIT', label: 'Cash credit' },
      { value: 'OVERDRAFT', label: 'Overdraft' },
      { value: 'BILL_DISCOUNTING', label: 'Bill discounting' },
      { value: 'BANK_GUARANTEE', label: 'Bank guarantee' },
      { value: 'LETTER_OF_CREDIT', label: 'Letter of credit' },
      { value: 'UNSECURED_LOAN_FROM_DIRECTORS', label: 'Unsecured loan from directors' },
      { value: 'UNSECURED_LOAN_OTHER', label: 'Unsecured loan, other' },
      { value: 'CREDIT_CARD', label: 'Credit card' },
      { value: 'OTHER', label: 'Other' },
    ],
  },
  { key: 'secured', label: 'Secured?', type: 'boolean', width: '6rem' },
  { key: 'fundBased', label: 'Fund based?', type: 'boolean', width: '6rem' },
  { key: 'sanctionDate', label: 'Sanction date', type: 'date', width: '9rem' },
  { key: 'sanctionedAmount', label: 'Sanctioned (Rs)', type: 'money', total: true, width: '9rem' },
  { key: 'outstanding', label: 'Outstanding (Rs)', type: 'money', total: true, width: '9rem' },
  { key: 'rateOfInterest', label: 'Rate of interest', type: 'text', width: '12rem' },
  { key: 'repaymentTerms', label: 'Tenure / repayment', type: 'text', width: '14rem' },
  { key: 'security', label: 'Security', type: 'text', width: '20rem' },
  { key: 'personalGuaranteeByPromoter', label: 'Promoter personal guarantee?', type: 'boolean', width: '8rem' },
  { key: 'purpose', label: 'Purpose', type: 'text', width: '14rem' },
];

export const CONTINGENT_LIABILITY_COLUMNS: RepeaterColumn[] = [
  { key: 'particulars', label: 'Particulars', type: 'text', width: '22rem' },
  { key: 'amountLatest', label: 'Latest FY (Rs)', type: 'money', total: true, width: '9rem' },
  { key: 'amountPrior1', label: 'Year before (Rs)', type: 'money', total: true, width: '9rem' },
  { key: 'amountPrior2', label: 'Two years before (Rs)', type: 'money', total: true, width: '9rem' },
];

export const m6Financials: Module = {
  id: 'M6',
  title: 'Financials',
  estimatedMinutes: 300,
  assignableTo: 'CFO',
  dependsOn: ['M1'],
  requestsDocuments: [
    'Audited financial statements for the last three financial years and any stub period',
    'Restated financial information, once the peer-reviewed auditor has delivered it',
    'Sanction letters for every borrowing, and the latest statements of outstanding',
    'The contingent liabilities note to the accounts, for each year',
    'The auditor’s peer review certificate',
  ],
  purpose:
    'The figures every eligibility rule reads, one row per financial year, plus every borrowing and every contingent liability. The capitalisation statement, financial indebtedness and the contingent liabilities summary are computed from these.',
  fields: [
    {
      path: 'financials.years',
      label: 'Key figures by financial year',
      type: 'table',
      schema: z.array(zFinancialYear),
      columns: FINANCIAL_YEAR_COLUMNS,
      helpText:
        'One row per financial year, most recent first — at least the three years preceding the application. Every figure in rupees, from the restated financials where they exist and the audited ones until then. Operating profit for the Rs 1 crore test is computed as PBT plus finance costs plus depreciation less other income; net worth excludes deferred IPO expenses; net tangible assets exclude intangibles. Leave monetary assets blank rather than zero if the split is not disclosed — a zero passes a test that was never run. Paste the whole block from a spreadsheet, one year per row.',
      clause: 'R-002 (Reg 229(6)); E-01, E-04, E-05, N-04',
      feedsInto: [CAPITALISATION, LITIGATION, SUMMARY, 'regulatory.statutoryStatements', RISK],
      extractionHint: 'The restated statement of profit and loss, balance sheet and cash flow, for each year.',
    },
    {
      path: 'financials.hasRestatedStatements',
      label: 'Has the peer-reviewed auditor delivered the restated financial information?',
      type: 'boolean',
      schema: z.boolean(),
      helpText:
        'The restated financials are the auditor’s deliverable and the document annexes them with separate pagination. Until they exist, the figures above are from the audited accounts and the eligibility tests are provisional — the restatement can move operating profit and net worth.',
      clause: 'ICDR Schedule VI Part A, para 11',
      feedsInto: [SUMMARY, 'financial.restatedFinancialInformation'],
    },
    {
      path: 'financials.auditorName',
      label: 'Statutory auditor',
      type: 'text',
      schema: z.string().min(3),
      placeholder: 'Kalyani & Associates, Chartered Accountants',
      helpText:
        'The firm’s name as it signs, with "Chartered Accountants". It appears in the glossary, the experts’ consents and the indebtedness certificate. The auditor must be peer reviewed by the ICAI to certify the restated financials.',
      feedsInto: ['general.definitions', 'regulatory.jurisdiction', INDEBTEDNESS],
    },
    {
      path: 'financials.auditorFirmRegistrationNumber',
      label: 'Auditor’s firm registration number',
      type: 'text',
      schema: z.string().min(3),
      placeholder: '118204W',
      helpText:
        'The ICAI firm registration number, printed with the auditor’s name in the glossary and General Information.',
      feedsInto: ['general.definitions'],
    },
    {
      path: 'financials.auditorPeerReviewNumber',
      label: 'Auditor’s peer review certificate number',
      type: 'text',
      schema: z.string().min(3),
      helpText:
        'Only a peer-reviewed auditor may certify restated financials for an offer document. The certificate number is stated, and the exchange checks it against the ICAI register.',
      clause: 'ICDR Reg 2(1)(zzza) read with Schedule VI',
      feedsInto: ['general.definitions'],
    },
    {
      path: 'financials.borrowings',
      label: 'Borrowings',
      type: 'table',
      schema: z.array(zBorrowing),
      columns: BORROWING_COLUMNS,
      helpText:
        'Every facility, one row each: term loans, cash credit, vehicle loans, unsecured loans from directors, and the non-fund based limits — bank guarantees and letters of credit. Financial Indebtedness prints a summary by category over this detail, and the summary is computed from these rows so it cannot disagree with them. The fund-based outstanding should tie to total borrowings in the latest year above. Mark which facilities, if any, are secured in part by a Promoter\'s personal guarantee — a standard risk factor names this specifically.',
      clause: 'ICDR Schedule VI Part A',
      feedsInto: [INDEBTEDNESS, CAPITALISATION, RISK],
      extractionHint: 'The Financial Indebtedness section, and the sanction letters.',
    },
    {
      path: 'financials.borrowingsAsOn',
      label: 'Outstanding amounts are as on',
      type: 'date',
      schema: zDate,
      helpText:
        'The date the outstanding column is stated at. The section is headed with it, and the auditor certifies the figures as on that date — it should be recent, typically the last month end before filing.',
      feedsInto: [INDEBTEDNESS],
    },
    {
      path: 'financials.borrowingsCertifiedBy',
      label: 'Certificate the indebtedness figures rest on',
      type: 'text',
      schema: z.string().min(5),
      placeholder: 'Kalyani & Associates, Chartered Accountants, certificate dated October 10, 2026',
      helpText:
        'The statutory auditor certifies the borrowings as on the stated date, and the section cites the certificate. Name the firm and the certificate date.',
      feedsInto: [INDEBTEDNESS],
    },
    {
      path: 'financials.creditors.msmeCount',
      label: 'Number of MSME creditors at the latest year end',
      type: 'number',
      suffix: 'creditors',
      schema: z.number().int().nonnegative(),
      helpText:
        'Trade payables are disclosed split between micro, small and medium enterprises and other creditors, by number and amount, in the litigation section. The MSME status is as declared by the creditors and relied on by the auditors.',
      clause: 'ICDR Schedule VI Part A, para 10(A)(ix); MSMED Act 2006, s.2',
      feedsInto: [LITIGATION],
    },
    {
      path: 'financials.creditors.msmeAmount',
      label: 'Total dues to MSME creditors (Rs)',
      type: 'currency',
      schema: zMoney,
      helpText: 'At the latest year end, from the trade payables note. MSME and other dues together must equal total trade payables; the section checks.',
      feedsInto: [LITIGATION],
    },
    {
      path: 'financials.creditors.otherCount',
      label: 'Number of other trade creditors at the latest year end',
      type: 'number',
      suffix: 'creditors',
      schema: z.number().int().nonnegative(),
      helpText: 'Creditors other than micro, small and medium enterprises, at the latest year end.',
      feedsInto: [LITIGATION],
    },
    {
      path: 'financials.creditors.otherAmount',
      label: 'Total dues to other trade creditors (Rs)',
      type: 'currency',
      schema: zMoney,
      helpText: 'At the latest year end. With the MSME dues this must sum to total trade payables in the year table.',
      feedsInto: [LITIGATION],
    },
    {
      path: 'financials.creditors.materialCount',
      label: 'Number of material creditors',
      type: 'number',
      suffix: 'creditors',
      schema: z.number().int().nonnegative(),
      helpText:
        'Creditors above the materiality threshold the legal module sets — a percentage of trade payables. The document prints the count and the total; the names are published on the company website, not in the document.',
      clause: 'ICDR Schedule VI Part A, para 10(A)(ix)',
      feedsInto: [LITIGATION],
    },
    {
      path: 'financials.creditors.materialAmount',
      label: 'Total dues to material creditors (Rs)',
      type: 'currency',
      schema: zMoney,
      helpText: 'The aggregate outstanding to the material creditors at the latest year end. Zero is an answer where there are none.',
      feedsInto: [LITIGATION],
    },
    {
      path: 'financials.contingentLiabilityItems',
      label: 'Contingent liabilities',
      type: 'table',
      schema: z.array(zContingentLiabilityItem),
      columns: CONTINGENT_LIABILITY_COLUMNS,
      helpText:
        'Each contingent liability from the notes to the accounts, with its amount at each of the three year ends — bank guarantees, disputed tax demands, claims not acknowledged as debt, letters of credit, capital commitments. The rows should total to the contingent liabilities figure in the year table above; a summary that does not tie to the note is a query.',
      clause: 'ICDR Schedule VI Part A; AS 29 / Ind AS 37',
      feedsInto: [CONTINGENT, LITIGATION],
    },
  ],
};
