import { z } from 'zod';
import { zCompany } from './company';
import { zCapital } from './capital';
import { zFinancials } from './financials';
import { zOffer } from './offer';
import { zDate, zDIN, zMoney, zPAN, zPercent, zShares } from './shared';

export * from './shared';
export * from './company';
export * from './capital';
export * from './financials';
export * from './offer';

/* ------------------------------------------------------------------ */
/* Domains filled out at S8 — shaped now so the composite type is real */
/* ------------------------------------------------------------------ */

/** M3 — Promoters & Promoter Group. */
export const zPromoters = z.object({
  promoters: z
    .array(
      z.object({
        name: z.string(),
        pan: zPAN.optional(),
        din: zDIN.optional(),
        dateOfBirth: zDate.optional(),
        qualification: z.string().optional(),
        experienceYears: z.number().int().optional(),
        otherDirectorships: z.array(z.string()).default([]),
      }),
    )
    .default([]),
  /** Family relationships define the promoter group under ICDR. */
  promoterGroupMembers: z
    .array(z.object({ name: z.string(), relationship: z.string() }))
    .default([]),
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
});

/** M4 — Board & Management. */
export const zManagement = z.object({
  directors: z
    .array(
      z.object({
        name: z.string(),
        din: zDIN.optional(),
        designation: z.string(),
        isIndependent: z.boolean().default(false),
        appointedOn: zDate.optional(),
        remuneration: zMoney.optional(),
      }),
    )
    .default([]),
  keyManagerialPersonnel: z
    .array(z.object({ name: z.string(), designation: z.string() }))
    .default([]),
});

/** M5 — Business Operations. */
export const zBusiness = z.object({
  topCustomers: z
    .array(z.object({ name: z.string(), revenueShare: zPercent }))
    .default([])
    .describe('Top customers by share of revenue; drives the concentration risk factor'),
  topSuppliers: z.array(z.object({ name: z.string(), purchaseShare: zPercent })).default([]),
  facilities: z
    .array(z.object({ location: z.string(), owned: z.boolean(), capacity: z.string().optional() }))
    .default([]),
  employeeCount: z.number().int().optional(),
  orderBook: zMoney.optional(),
});

/** M7 — Legal & Litigation. */
export const zLegal = z.object({
  litigation: z
    .array(
      z.object({
        against: z.enum(['COMPANY', 'DIRECTOR', 'PROMOTER', 'SUBSIDIARY', 'GROUP_COMPANY']),
        partyName: z.string(),
        type: z.enum(['CRIMINAL', 'CIVIL', 'TAX', 'STATUTORY', 'REGULATORY']),
        amount: zMoney.nullable(),
        status: z.string(),
        description: z.string(),
      }),
    )
    .default([]),
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
});

/** M8 — Approvals & Licences. Sector-switched checklist. */
export const zApprovals = z.object({
  licences: z
    .array(
      z.object({
        name: z.string(),
        authority: z.string(),
        number: z.string().optional(),
        validUntil: zDate.nullable(),
      }),
    )
    .default([]),
});

/** M10 — Group Companies & Related Parties. */
export const zGroupCompanies = z.object({
  companies: z
    .array(
      z.object({
        name: z.string(),
        relationship: z.string(),
        isListed: z.boolean().default(false),
        shareholding: zShares.optional(),
      }),
    )
    .default([]),
});

/* ------------------------------------------------------------------ */
/* The composite                                                       */
/* ------------------------------------------------------------------ */

/**
 * The Issuer Fact Base — one canonical object per issuer.
 *
 * Values are PLAIN, matching these schemas exactly. Provenance lives beside
 * it in a ProvenanceMap keyed by FactPath (see provenance.ts, D18), because
 * these same schemas generate Claude's extraction tool schema and we want
 * plain values back from the model, not self-reported provenance.
 *
 * Every domain is `.partial()`-friendly in practice: a fact base is filled in
 * progressively, so parse with `zFactBase.partial()` or per-domain during
 * intake, and with the full schema only when checking completeness.
 */
export const zFactBase = z.object({
  company: zCompany,
  capital: zCapital,
  promoters: zPromoters,
  management: zManagement,
  business: zBusiness,
  financials: zFinancials,
  legal: zLegal,
  approvals: zApprovals,
  offer: zOffer,
  groupCompanies: zGroupCompanies,
});

export type FactBase = z.infer<typeof zFactBase>;

/** A partially filled fact base, which is what exists for most of the process. */
export type PartialFactBase = {
  [K in keyof FactBase]?: Partial<FactBase[K]>;
};

export type Promoters = z.infer<typeof zPromoters>;
export type Management = z.infer<typeof zManagement>;
export type Business = z.infer<typeof zBusiness>;
export type Legal = z.infer<typeof zLegal>;
export type Approvals = z.infer<typeof zApprovals>;
export type GroupCompanies = z.infer<typeof zGroupCompanies>;

type JsonSchema = Record<string, unknown>;

/**
 * Claude's strict tool use requires `additionalProperties: false` on every
 * object node. Zod 4 emits it in `output` mode but NOT in `input` mode, and
 * we want input mode: it keeps fields that have defaults out of `required`,
 * so the model is not forced to invent values it could not find.
 *
 * So: generate with input semantics, then close every object ourselves.
 */
function closeObjects(node: unknown): unknown {
  if (Array.isArray(node)) return node.map(closeObjects);
  if (node === null || typeof node !== 'object') return node;

  const out: JsonSchema = {};
  for (const [key, value] of Object.entries(node as JsonSchema)) {
    out[key] = closeObjects(value);
  }
  if (out.type === 'object' && out.additionalProperties === undefined) {
    out.additionalProperties = false;
  }
  return out;
}

/**
 * Claude's extraction tool schema for one domain, from the same definition
 * that validates the form. This is MM3 — one schema, five uses.
 *
 * `.describe()` text on each field becomes the field description the model
 * reads, so those strings are instructions, not comments.
 */
export function extractionSchemaFor(domain: keyof FactBase): JsonSchema {
  const generated = z.toJSONSchema(zFactBase.shape[domain], { io: 'input' });
  return closeObjects(generated) as JsonSchema;
}
