import { z } from 'zod';
import { zDate, zMoney } from './shared';

/**
 * Module M7 — Legal and Litigation.
 *
 * "Outstanding Litigation and Material Developments" (section map #28) is
 * COMPUTED from this. Both primary sources organise it the same way, and the
 * schema follows them rather than a lawyer's taxonomy:
 *
 *   by PARTY      company / promoters / directors / KMP and senior management
 *                 / subsidiaries / group companies
 *   by DIRECTION  proceedings against, proceedings initiated by
 *   by CATEGORY   criminal / actions by statutory or regulatory authorities /
 *                 disciplinary action by SEBI or an exchange in the last five
 *                 years / direct tax / indirect tax / other material
 *
 * Tax proceedings are disclosed "in a consolidated manner giving the total
 * number of claims and total amounts involved" — so they are counted and
 * summed, not listed one by one (Om Galaxy p.306, Maxwell p.244).
 *
 * The materiality threshold is COMPUTED, not asked. Both documents state the
 * same test — the lower of 2% of turnover, 2% of net worth and 5% of the
 * average absolute profit after tax over three years — and it follows from
 * the financials in M6. See lib/legal/materiality.ts.
 */

export const zLitigationParty = z.enum([
  'COMPANY',
  'PROMOTER',
  'DIRECTOR',
  'KMP_SENIOR_MANAGEMENT',
  'SUBSIDIARY',
  'GROUP_COMPANY',
]);

export const zLitigationDirection = z.enum(['AGAINST', 'BY']);

export const zLitigationCategory = z.enum([
  'CRIMINAL',
  'STATUTORY_REGULATORY',
  'SEBI_DISCIPLINARY',
  'DIRECT_TAX',
  'INDIRECT_TAX',
  'OTHER_MATERIAL',
]);

export const zLitigation = z.object({
  party: zLitigationParty.describe('Whose litigation this is: the company, a promoter, a director...'),
  partyName: z
    .string()
    .describe('The promoter, director or entity involved; the company name for COMPANY'),
  direction: zLitigationDirection
    .default('AGAINST')
    .describe('Whether the proceeding is against the party or was initiated by the party'),
  category: zLitigationCategory,
  counterparty: z.string().describe('The other side: the authority, the claimant or the defendant'),
  forum: z.string().optional().describe('Court, tribunal or authority before which it is pending'),
  caseNumber: z.string().optional(),
  amount: zMoney
    .nullable()
    .describe('Amount involved in rupees; null where not quantifiable'),
  status: z.string().describe('Present stage, e.g. "Appeal pending before the CIT (Appeals)"'),
  description: z.string().describe('The matter in two or three sentences'),
});

export const zLegal = z.object({
  litigation: z.array(zLitigation).default([]),

  /**
   * The board resolution adopting the materiality policy, quoted in the
   * section intro. The THRESHOLD is computed from the financials, not asked.
   */
  materialityPolicyDate: zDate
    .optional()
    .describe('Date of the board resolution adopting the materiality policy for litigation'),
  /**
   * Creditors are material above a stated share of trade payables — 5% in
   * Om Galaxy, 10% in Maxwell. The policy sets it; the document quotes it.
   */
  materialCreditorThresholdPercent: z
    .number()
    .min(0)
    .max(100)
    .optional()
    .describe('Share of total trade payables above which a creditor is material, per the policy'),

  /** E-11 (BSE) / N-06 (NSE): reference to NCLT under the IBC. */
  referredToNCLT: z.boolean().default(false),
  /**
   * N-06 extends the IBC test to the PROMOTING companies as well as the
   * issuer. E-11 asks only about the issuer, so this is NSE-only.
   */
  ibcProceedingsAgainstPromotingCompanies: z
    .boolean()
    .default(false)
    .describe('IBC proceedings admitted against any company promoting the issuer'),
  /** E-12 (BSE) / N-07 (NSE): admitted winding-up petition or a liquidator. */
  windingUpPetitionAdmitted: z.boolean().default(false),
  /** E-17 (BSE) / N-06 (NSE). */
  referredToBIFR: z.boolean().default(false),

  /**
   * E-13 and N-09 — regulatory or disciplinary action, by DATE rather than a
   * boolean, because the two exchanges apply different windows to different
   * subjects: BSE looks back 3 years at the company and 1 year at the
   * promoters; NSE states no window at all but widens the subject to promoting
   * and group companies. A boolean could not answer either question.
   *
   * Null means none, which is the ordinary case.
   */
  regulatoryActionAgainstCompanySince: zDate
    .nullable()
    .default(null)
    .describe('Date of the most recent regulatory or disciplinary action against the company'),
  regulatoryActionAgainstPromotersSince: zDate
    .nullable()
    .default(null)
    .describe('Date of the most recent regulatory or disciplinary action against a promoter'),
  regulatoryActionAgainstGroupCompaniesSince: zDate
    .nullable()
    .default(null)
    .describe(
      'Date of the most recent regulatory or disciplinary action against a promoting or group company',
    ),

  /** N-10: trading suspended against promoters or promoted companies. */
  tradingSuspendedForPromoterCompanies: z
    .boolean()
    .default(false)
    .describe('Any nationwide exchange has suspended trading against a promoter or promoted company'),

  /** E-18: pending defaults to debenture, bond or fixed deposit holders. */
  pendingDebtSecurityDefaults: z
    .boolean()
    .default(false)
    .describe('Any pending default on interest or principal to debenture, bond or fixed deposit holders'),

  /**
   * E-20: the directors must not be associated with the securities market in
   * any manner, and no action may be outstanding against them from the Board
   * in the past five years. Stated at both exchanges (S2, S9, S8) and missed
   * entirely on the first pass through the criteria.
   */
  sebiActionAgainstDirectorsSince: zDate
    .nullable()
    .default(null)
    .describe('Date of the most recent SEBI action initiated against a director'),

  /**
   * The closing statements of the litigation section. Each is a standing
   * negative in the ordinary case; where the answer is yes the document needs
   * the particulars, so these are details-or-null rather than booleans.
   */
  economicOffenceProceedings: z
    .string()
    .nullable()
    .default(null)
    .describe('Proceedings initiated against the company for economic offences; null if none'),
  materialFrauds: z
    .string()
    .nullable()
    .default(null)
    .describe('Material frauds committed against the company in the last three years; null if none'),
  statutoryDuesDefaults: z
    .string()
    .nullable()
    .default(null)
    .describe('Outstanding defaults in payment of statutory dues; null if none'),
  pastInquiriesInspections: z
    .string()
    .nullable()
    .default(null)
    .describe('Inquiries, inspections or investigations under the Companies Act in the last five years; null if none'),
  materialDevelopmentsSinceBalanceSheet: z
    .string()
    .nullable()
    .default(null)
    .describe('Material developments since the last balance sheet date; null if none'),
});

export type Litigation = z.infer<typeof zLitigation>;
export type LitigationParty = z.infer<typeof zLitigationParty>;
export type LitigationCategory = z.infer<typeof zLitigationCategory>;
export type Legal = z.infer<typeof zLegal>;
