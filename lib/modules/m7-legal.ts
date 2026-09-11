import { z } from 'zod';
import { zDate, zLitigation, zPercent } from '../facts/schema';
import type { Module } from './types';
import type { RepeaterColumn } from './repeater-spec';

/**
 * M7 — Legal and Litigation.
 *
 * Counsel's module. Two to three hours, most of it the litigation table, and
 * the one module where "nil" answers are as important as the entries: the
 * section prints a standing negative under every heading that has nothing
 * under it, and the exchange reads the negatives as confirmations.
 *
 * The MATERIALITY THRESHOLD is not asked. Both primary sources state the same
 * test — the lower of 2% of turnover, 2% of net worth and 5% of the average
 * absolute profit after tax over three years — and it follows from M6. What
 * IS asked is the board resolution that adopted the policy, and the creditor
 * threshold, which the policy sets.
 *
 * Seven eligibility rules read the flags at the end. Litigation disclosure and
 * eligibility are different tests: a tax appeal is disclosed here and is not
 * a "regulatory action" for E-13.
 */

const LITIGATION = 'legal.litigation';
const STATUTORY = 'regulatory.statutoryStatements';

export const LITIGATION_COLUMNS: RepeaterColumn[] = [
  {
    key: 'party',
    label: 'Whose matter',
    type: 'select',
    width: '11rem',
    options: [
      { value: 'COMPANY', label: 'The company' },
      { value: 'PROMOTER', label: 'A promoter' },
      { value: 'DIRECTOR', label: 'A director (not a promoter)' },
      { value: 'KMP_SENIOR_MANAGEMENT', label: 'KMP or senior management' },
      { value: 'SUBSIDIARY', label: 'A subsidiary' },
      { value: 'GROUP_COMPANY', label: 'A group company' },
    ],
  },
  { key: 'partyName', label: 'Name of that party', type: 'text', width: '13rem' },
  {
    key: 'direction',
    label: 'Direction',
    type: 'select',
    width: '8rem',
    options: [
      { value: 'AGAINST', label: 'Against them' },
      { value: 'BY', label: 'Initiated by them' },
    ],
  },
  {
    key: 'category',
    label: 'Category',
    type: 'select',
    width: '13rem',
    options: [
      { value: 'CRIMINAL', label: 'Criminal' },
      { value: 'STATUTORY_REGULATORY', label: 'Action by a statutory or regulatory authority' },
      { value: 'SEBI_DISCIPLINARY', label: 'Disciplinary action by SEBI or an exchange' },
      { value: 'DIRECT_TAX', label: 'Direct tax' },
      { value: 'INDIRECT_TAX', label: 'Indirect tax' },
      { value: 'OTHER_MATERIAL', label: 'Other material proceeding' },
    ],
  },
  { key: 'counterparty', label: 'Other side', type: 'text', width: '14rem' },
  { key: 'forum', label: 'Court / authority', type: 'text', width: '14rem' },
  { key: 'caseNumber', label: 'Case number', type: 'text', width: '9rem' },
  { key: 'amount', label: 'Amount involved (Rs)', type: 'money', total: true, width: '9rem', placeholder: 'Blank if not quantifiable' },
  { key: 'status', label: 'Present status', type: 'text', width: '16rem' },
  { key: 'description', label: 'The matter, briefly', type: 'text', width: '24rem' },
];

const nullableText = z.string().nullable();

export const m7Legal: Module = {
  id: 'M7',
  title: 'Legal and Litigation',
  estimatedMinutes: 150,
  assignableTo: 'LEGAL',
  dependsOn: ['M1', 'M6'],
  requestsDocuments: [
    'Litigation register, or the list counsel maintains',
    'Every notice from a tax, statutory or regulatory authority in the last three years',
    'The board resolution adopting the materiality policy',
    'Trade payables ageing, for the material creditors disclosure',
  ],
  purpose:
    'Every proceeding involving the company, its promoters, directors, KMP, subsidiaries and group companies, and the standing confirmations. The litigation section and its materiality threshold are computed from this and the financials.',
  fields: [
    {
      path: 'legal.materialityPolicyDate',
      label: 'Date of the board resolution adopting the materiality policy',
      type: 'date',
      schema: zDate,
      helpText:
        'The board adopts a policy that decides which proceedings are material enough to disclose. The threshold itself is computed here from the financials — the lower of 2% of turnover, 2% of net worth and 5% of the three-year average absolute profit after tax, which is what both platforms’ documents apply — and the section cites the resolution date.',
      clause: 'ICDR Schedule VI Part A, para 10(A)',
      feedsInto: [LITIGATION],
    },
    {
      path: 'legal.materialCreditorThresholdPercent',
      label: 'Share of trade payables above which a creditor is material',
      type: 'percent',
      suffix: '% of total trade payables',
      schema: zPercent,
      helpText:
        'The materiality policy also sets when a creditor is "material" for disclosure — 5% of total trade payables in some documents, 10% in others. The section states the percentage, the resulting rupee threshold, and that dues to MSMEs are disclosed separately.',
      clause: 'ICDR Schedule VI Part A, para 10(A)(ix)',
      feedsInto: [LITIGATION],
    },
    {
      path: 'legal.litigation',
      label: 'Outstanding proceedings',
      type: 'table',
      schema: z.array(zLitigation),
      columns: LITIGATION_COLUMNS,
      helpText:
        'Every outstanding proceeding, one row each, tagged by whose matter it is, whether it is against them or brought by them, and its category. The section is organised exactly that way. Criminal matters and actions by authorities are disclosed regardless of amount; tax matters are counted and totalled rather than listed; other civil matters are disclosed above the materiality threshold or where the outcome could materially affect the company. Include pre-litigation notices only from governmental, statutory or regulatory authorities — a third party’s legal notice is not litigation until a case is filed.',
      clause: 'ICDR Schedule VI Part A, para 10(A)',
      feedsInto: [LITIGATION, 'general.riskFactors'],
      extractionHint: 'The "Outstanding Litigation and Material Developments" section, every listed matter.',
    },
    {
      path: 'legal.referredToNCLT',
      label: 'Has the company been referred to the NCLT under the Insolvency and Bankruptcy Code?',
      type: 'boolean',
      schema: z.boolean(),
      helpText:
        'An admitted insolvency application makes the company ineligible on both platforms. This includes applications by operational creditors that were admitted, even if since withdrawn.',
      clause: 'E-11 / N-06',
      feedsInto: [LITIGATION, STATUTORY],
    },
    {
      path: 'legal.ibcProceedingsAgainstPromotingCompanies',
      label: 'Are any IBC proceedings admitted against a company that promotes the issuer?',
      type: 'boolean',
      schema: z.boolean(),
      helpText:
        'Where a promoter is a body corporate, or where the promoters also promote other companies, insolvency proceedings against those companies are tested too. Both exchanges state this limb.',
      clause: 'E-17 / N-06',
      feedsInto: [LITIGATION],
    },
    {
      path: 'legal.windingUpPetitionAdmitted',
      label: 'Has any winding-up petition been admitted, or a liquidator appointed?',
      type: 'boolean',
      schema: z.boolean(),
      helpText:
        'A petition that was filed and dismissed is not admitted; one that a court has taken on board is. Either exchange treats an admitted petition as a bar.',
      clause: 'E-12 / N-07',
      feedsInto: [LITIGATION, STATUTORY],
    },
    {
      path: 'legal.referredToBIFR',
      label: 'Was the company ever referred to the BIFR?',
      type: 'boolean',
      schema: z.boolean(),
      helpText:
        'The Board for Industrial and Financial Reconstruction was wound up in 2016, so for a company incorporated after that the answer is no; older companies with a sick-industry history must say so.',
      clause: 'E-17 / N-06',
      feedsInto: [LITIGATION],
    },
    {
      path: 'legal.regulatoryActionAgainstCompanySince',
      label: 'Date of the most recent material regulatory or disciplinary action against the company',
      type: 'date',
      schema: zDate.nullable(),
      helpText:
        'By a stock exchange or a regulator — SEBI, RBI, a sectoral regulator — against the company itself. BSE looks back three years. A show cause notice replied to, with no order, is not an action. Choose "None" where there is nothing to state.',
      clause: 'E-13 / N-09',
      feedsInto: [LITIGATION],
    },
    {
      path: 'legal.regulatoryActionAgainstPromotersSince',
      label: 'Date of the most recent material regulatory or disciplinary action against a promoter',
      type: 'date',
      schema: zDate.nullable(),
      helpText:
        'The same test, applied to the promoters personally. BSE looks back one year; NSE states no window. Choose "None" where there is nothing to state.',
      clause: 'E-13 / N-09',
      feedsInto: [LITIGATION],
    },
    {
      path: 'legal.regulatoryActionAgainstGroupCompaniesSince',
      label: 'Date of the most recent material regulatory or disciplinary action against a group company or a company promoted by the promoters',
      type: 'date',
      schema: zDate.nullable(),
      helpText:
        'The widest limb: companies the promoters promote, and the group companies. Both exchanges reach them. Choose "None" where there is nothing to state.',
      clause: 'E-13 / N-09',
      feedsInto: [LITIGATION],
    },
    {
      path: 'legal.tradingSuspendedForPromoterCompanies',
      label: 'Has any nationwide exchange suspended trading against a promoter or a company they promote?',
      type: 'boolean',
      schema: z.boolean(),
      helpText:
        'A promoter whose other listed company was suspended for non-compliance is caught here, on both platforms.',
      clause: 'E-19 / N-10',
      feedsInto: [LITIGATION],
    },
    {
      path: 'legal.pendingDebtSecurityDefaults',
      label: 'Any pending default on interest or principal to debenture, bond or fixed deposit holders?',
      type: 'boolean',
      schema: z.boolean(),
      helpText:
        'By the company, its promoters, promoting companies or subsidiaries. Bank loan defaults are disclosed in Financial Indebtedness; this question is about debt securities and deposits.',
      clause: 'E-18',
      feedsInto: [LITIGATION, STATUTORY],
    },
    {
      path: 'legal.sebiActionAgainstDirectorsSince',
      label: 'Date of the most recent action initiated by SEBI against any director',
      type: 'date',
      schema: zDate.nullable(),
      helpText:
        'Directors must not be associated with the securities market in any manner and must have no outstanding SEBI action against them in the past five years. Choose "None" where there is nothing to state.',
      clause: 'E-20',
      feedsInto: [LITIGATION, STATUTORY],
    },
    {
      path: 'legal.economicOffenceProceedings',
      label: 'Proceedings against the company for economic offences',
      type: 'longtext',
      schema: nullableText,
      placeholder: 'The particulars, where there are any',
      helpText:
        'The section carries a standing statement that there are no proceedings for economic offences. Where there are, the document needs the particulars.',
      clause: 'ICDR Schedule VI Part A',
      feedsInto: [LITIGATION],
    },
    {
      path: 'legal.materialFrauds',
      label: 'Material frauds against the company in the last three years',
      type: 'longtext',
      schema: nullableText,
      placeholder: 'The particulars, where there are any',
      helpText:
        'Frauds committed against the company — by employees, customers or others — that were material, with the action taken. Choose "None" where there is nothing to state.',
      clause: 'ICDR Schedule VI Part A',
      feedsInto: [LITIGATION],
    },
    {
      path: 'legal.statutoryDuesDefaults',
      label: 'Outstanding defaults in payment of statutory dues',
      type: 'longtext',
      schema: nullableText,
      placeholder: 'The particulars, where there are any',
      helpText:
        'Provident fund, ESI, GST, TDS, professional tax — any statutory due overdue as on the date of the document. The auditor’s CARO report will say the same thing, and the two must agree.',
      clause: 'ICDR Schedule VI Part A',
      feedsInto: [LITIGATION],
    },
    {
      path: 'legal.pastInquiriesInspections',
      label: 'Inquiries, inspections or investigations under the Companies Act in the last five years',
      type: 'longtext',
      schema: nullableText,
      placeholder: 'The particulars, where there are any',
      helpText:
        'Against the company or its subsidiaries, by the Registrar, the Regional Director, the SFIO or any other authority, and any prosecutions filed or fines imposed as a result. Choose "None" where there is nothing to state.',
      clause: 'ICDR Schedule VI Part A',
      feedsInto: [LITIGATION],
    },
    {
      path: 'legal.materialDevelopmentsSinceBalanceSheet',
      label: 'Material developments since the last balance sheet date',
      type: 'longtext',
      schema: nullableText,
      placeholder: 'The particulars, where there are any',
      helpText:
        'Anything since the last audited balance sheet that would affect the trading or profitability of the company, its assets, or its ability to pay its liabilities in the next twelve months — a lost customer, a fire, a large order, a new borrowing. The directors confirm this in the document. Choose "None" where there is nothing to state.',
      clause: 'ICDR Schedule VI Part A; Companies Act 2013, s.26',
      feedsInto: [LITIGATION],
    },
  ],
};
