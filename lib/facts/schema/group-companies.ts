import { z } from 'zod';
import { zCIN, zDate, zMoney, zPercent, zShares } from './shared';

/**
 * Module M10 — Group Companies and Related Party Transactions.
 *
 * Two computed sections read this: "Our Group Companies" (section map #21)
 * and "Summary of Related Party Transactions" (#8).
 *
 * A group company under ICDR Reg 2(1)(t) is one with which there were related
 * party transactions in the restated financials, plus any the board considers
 * material under its policy. Both primary sources state the policy — a board
 * resolution date and a threshold — and then either list the companies or
 * state that there are none (Om Galaxy p.261, Maxwell p.227; neither has any).
 *
 * The RPT summary is two tables in both: the list of related parties with
 * their relationship, and the transactions by nature and party with an
 * amount for each of the three years (Om Galaxy p.72, Maxwell p.60).
 */

export const zGroupCompany = z.object({
  name: z.string(),
  cin: zCIN.optional(),
  relationship: z.string().describe('Why it is a group company, e.g. "Entity controlled by the Promoters"'),
  natureOfBusiness: z.string().optional(),
  registeredOffice: z.string().optional(),
  isListed: z.boolean().default(false),
  shareholding: zShares.optional().describe('Equity shares of the group company held by the issuer, if any'),
  /** The section states whether any group company has made a public or rights issue in three years. */
  publicOrRightsIssueInLastThreeYears: z.boolean().default(false),
});

export const zRelatedParty = z.object({
  name: z.string(),
  relationship: z
    .string()
    .describe('e.g. "Managing Director", "Spouse of a Director", "Proprietorship of a Promoter"'),
});

/**
 * One line of the RPT table. Amounts are per financial year, most recent
 * first, matching `financials.years`; null where there was no transaction.
 */
export const zRelatedPartyTransaction = z.object({
  nature: z.string().describe('Nature of the transaction, e.g. "Remuneration", "Rent paid", "Loan taken"'),
  partyName: z.string(),
  amountLatest: zMoney.nullable().describe('Amount in the most recent financial year, in rupees'),
  amountPrior1: zMoney.nullable().describe('Amount in the year before that'),
  amountPrior2: zMoney.nullable().describe('Amount two years before'),
});

/**
 * Section map #18 — legally distinct from a "group company" above: a
 * subsidiary/associate/JV is an entity the ISSUER itself controls or holds
 * a stake in (Companies Act s.2(6)/s.2(87)), not a promoter-group entity.
 * Four of the five ToC-mapped documents state plainly that the Company has
 * none; only Photonics Watertech has one. Most SME issuers answer "none",
 * and that is a complete, real answer — not a gap.
 */
export const zSubsidiary = z.object({
  name: z.string(),
  cin: zCIN.optional(),
  relationship: z.enum(['SUBSIDIARY', 'ASSOCIATE', 'JOINT_VENTURE']),
  shareholdingPercent: zPercent.optional(),
  natureOfBusiness: z.string().optional(),
});

export const zGroupCompanies = z.object({
  companies: z.array(zGroupCompany).default([]),
  subsidiaries: z.array(zSubsidiary).default([]),

  materialityResolutionDate: zDate
    .optional()
    .describe('Date of the board resolution adopting the group company materiality policy'),
  /**
   * The second limb of both policies: a promoter-group company becomes a group
   * company where transactions with it exceed a share of a base — 10% of
   * profit after tax in Om Galaxy, 10% of revenue in Maxwell. The base varies
   * by drafter, so both are asked.
   */
  materialityThresholdPercent: z
    .number()
    .min(0)
    .max(100)
    .optional()
    .describe('Share of the base above which transactions make a promoter-group company material'),
  materialityBase: z
    .enum(['PROFIT_AFTER_TAX', 'REVENUE'])
    .optional()
    .describe('Whether the threshold is measured against profit after tax or revenue'),

  relatedParties: z.array(zRelatedParty).default([]),
  relatedPartyTransactions: z.array(zRelatedPartyTransaction).default([]),
});

export type GroupCompany = z.infer<typeof zGroupCompany>;
export type Subsidiary = z.infer<typeof zSubsidiary>;
export type RelatedParty = z.infer<typeof zRelatedParty>;
export type RelatedPartyTransaction = z.infer<typeof zRelatedPartyTransaction>;
export type GroupCompanies = z.infer<typeof zGroupCompanies>;
