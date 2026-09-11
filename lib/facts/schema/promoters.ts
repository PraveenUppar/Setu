import { z } from 'zod';
import { zDate, zDIN, zPAN } from './shared';

/**
 * Module M3 — Promoters and Promoter Group.
 *
 * "Our Promoters and Promoter Group" (section map #20) is COMPUTED from this:
 * the promoter list and aggregate holding, the brief profiles, the other
 * ventures, the promoter group table by relationship, and the standing
 * statements on change of control, pledged shares and disassociations. The
 * aggregate holding is not asked — it is read off the register in M2, so the
 * two cannot disagree.
 *
 * Shape follows Om Galaxy pp.244-256 and Maxwell pp.212-226, which agree on
 * every heading.
 */

export const zPromoter = z.object({
  name: z.string().describe('Full name as it appears in the register of members'),
  kind: z
    .enum(['INDIVIDUAL', 'BODY_CORPORATE'])
    .default('INDIVIDUAL')
    .describe('A promoter may be a person or a company'),
  pan: zPAN.optional().describe('Permanent Account Number, printed in the promoter profile'),
  din: zDIN.optional().describe('Director Identification Number, where the promoter is a director'),
  dateOfBirth: zDate.optional().describe('Date of birth, from which the stated age is computed'),
  address: z.string().optional().describe('Residential address'),
  occupation: z.string().optional().describe('Occupation, e.g. "Business"'),
  nationality: z.string().optional().describe('Nationality, e.g. "Indian"'),
  designation: z
    .string()
    .optional()
    .describe('Position held in the company, e.g. "Chairman and Managing Director"'),
  qualification: z.string().optional().describe('Educational qualifications'),
  experienceYears: z.number().int().optional().describe('Years of experience in the business'),
  experienceSummary: z
    .string()
    .optional()
    .describe('Two or three sentences on experience and role, for the brief profile'),
  otherDirectorships: z
    .array(z.string())
    .default([])
    .describe('Companies, other than the issuer, in which the promoter is a director'),
  otherVentures: z
    .array(z.string())
    .default([])
    .describe('Firms, LLPs and proprietorships the promoter is interested in'),
});

export const zPromoterGroupMember = z.object({
  name: z.string(),
  relationship: z
    .string()
    .describe('Relationship to the promoter, e.g. "Spouse of the promoter", "Brother of the promoter"'),
  kind: z.enum(['INDIVIDUAL', 'ENTITY']).default('INDIVIDUAL'),
  relatedTo: z.string().optional().describe('Which promoter this member is related to'),
});

/** Om Galaxy p.253: "Disassociation by our Promoters in the last three years". */
export const zDisassociation = z.object({
  promoterName: z.string(),
  entityName: z.string().describe('The company or firm the promoter disassociated from'),
  date: zDate.describe('Date of disassociation'),
  reason: z.string().describe('Reason for and circumstances of the disassociation'),
});

export const zPromoters = z.object({
  promoters: z.array(zPromoter).default([]),
  /** Family relationships define the promoter group under ICDR Reg 2(1)(pp). */
  promoterGroupMembers: z.array(zPromoterGroupMember).default([]),

  /** Reg 228: any of these makes the issuer ineligible. */
  anyDebarredBySebi: z.boolean().default(false),
  anyWilfulDefaulterOrFraudulentBorrower: z.boolean().default(false),
  anyFugitiveEconomicOffender: z.boolean().default(false),
  /** E-08: no change in promoters having significant control in the preceding year. */
  controlChangedInPastYear: z.boolean().default(false),

  /**
   * R-027 (Reg 229(5)): a complete change of promoter, or new promoters
   * acquiring more than 50% of the shareholding, starts a one-year clock
   * before the draft offer document may be filed. A regulation rather than an
   * exchange criterion, so it binds at both venues — and distinct from
   * `controlChangedInPastYear`, which is BSE's softer "significant control"
   * test with no numeric trigger.
   */
  majorityPromoterChangeDate: zDate
    .nullable()
    .default(null)
    .describe(
      'Date of the final change where promoters changed completely or new promoters acquired more than 50%',
    ),
  /**
   * E-16 / N-11, settled by R-031: the test EXCLUDES independent directors at
   * both exchanges. Only a promoter, an executive director or a non-executive
   * non-independent director counts, so the flag is defined to exclude
   * independent directorships rather than leaving the rule to subtract them
   * from a wider answer it cannot see.
   */
  anyAssociatedWithDelistedCompany: z
    .boolean()
    .default(false)
    .describe(
      'Any promoter, executive director or non-executive non-independent director is a promoter or director of a compulsorily delisted or trading-suspended company. Independent directorships are excluded (R-031)',
    ),

  /**
   * The standing statements in the promoter section. Null means "none", which
   * prints the standard negative; text prints as the disclosure. Asked as
   * details rather than booleans because where the answer is yes, the
   * document needs the particulars and not a tick.
   */
  managementControlChangeDetails: z
    .string()
    .nullable()
    .default(null)
    .describe('Any change in management or control of the company in the last three years; null if none'),
  pledgedSharesDetails: z
    .string()
    .nullable()
    .default(null)
    .describe('Promoter shares pledged or encumbered, with the lender and the number of shares; null if none'),
  materialGuaranteesDetails: z
    .string()
    .nullable()
    .default(null)
    .describe('Material guarantees given by promoters to third parties in respect of the specified securities; null if none'),
  disassociations: z
    .array(zDisassociation)
    .default([])
    .describe('Companies or firms the promoters disassociated from in the last three years'),
  /**
   * "Common Pursuits": a promoter or promoter group entity in the same line
   * of business. Maxwell discloses one (Maxwell Dies and Moulds); Om Galaxy
   * states none. Null prints the standard negative; text prints as the
   * disclosure.
   */
  commonPursuitsDetails: z
    .string()
    .nullable()
    .default(null)
    .describe('Promoters or promoter group entities engaged in the same line of business as the company; null if none'),
});

export type Promoter = z.infer<typeof zPromoter>;
export type PromoterGroupMember = z.infer<typeof zPromoterGroupMember>;
export type Disassociation = z.infer<typeof zDisassociation>;
export type Promoters = z.infer<typeof zPromoters>;
