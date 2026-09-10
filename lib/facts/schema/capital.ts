import { z } from 'zod';
import { zDate, zMoney, zShares } from './shared';

/**
 * Module M2 — Capital & Shareholding. The most laborious module and the one
 * that produces the most tables.
 *
 * Everything in the Capital Structure section is DERIVED from `allotments`
 * and `shareholders` — the build-up history, pre/post-issue shareholding,
 * lock-in allocation, top-ten shareholders. Nothing there is typed by hand.
 *
 * Source of truth for a real issuer is the PAS-3 filings on MCA21.
 */

export const zAllotmentNature = z.enum([
  'SUBSCRIPTION_TO_MOA',
  'FURTHER_ALLOTMENT',
  'RIGHTS_ISSUE',
  'PREFERENTIAL_ALLOTMENT',
  'PRIVATE_PLACEMENT',
  'BONUS_ISSUE',
  'CONVERSION',
  'SCHEME_OF_ARRANGEMENT',
  'ESOP',
]);

export const zConsideration = z.enum(['CASH', 'OTHER_THAN_CASH', 'BONUS']);

/**
 * One line of the capital build-up history. Must cover EVERY allotment since
 * incorporation — the cumulative total has to reconcile with paid-up capital,
 * and a consistency rule checks exactly that.
 */
export const zAllotment = z.object({
  date: zDate.describe('Date of allotment'),
  shares: zShares.describe('Number of equity shares allotted'),
  faceValue: zMoney.describe('Face value per share in rupees at the time of allotment'),
  issuePrice: zMoney
    .nullable()
    .describe('Issue price per share in rupees; null for a bonus issue'),
  consideration: zConsideration,
  nature: zAllotmentNature,
  allottees: z
    .string()
    .optional()
    .describe('Who the shares were allotted to, as stated in the PAS-3 filing'),
});

export const zShareholderCategory = z.enum([
  'PROMOTER',
  'PROMOTER_GROUP',
  'PUBLIC_INDIVIDUAL',
  'PUBLIC_BODY_CORPORATE',
  'INSTITUTIONAL',
  'EMPLOYEE',
]);

export const zShareholder = z.object({
  name: z.string(),
  category: zShareholderCategory,
  shares: zShares.describe('Shares held pre-issue'),
  /**
   * Reg 230(1)(d) requires securities held by promoters, promoter group,
   * selling shareholders, directors, KMP, senior management, QIBs and
   * employees to be in dematerialised form before the issue.
   */
  isDematerialised: z.boolean().default(true),
});

/**
 * Per-promoter acquisition detail, needed because lock-in attaches to
 * specific tranches. Minimum Promoter's Contribution is 20% of post-issue
 * capital locked for 3 years; the excess releases 50% at one year and 50%
 * at two (R-009).
 */
export const zPromoterHolding = z.object({
  promoterName: z.string(),
  shares: zShares,
  acquisitionDate: zDate,
  /** Weighted average cost per share, disclosed in the offer document. */
  costPerShare: zMoney,
  natureOfAcquisition: zAllotmentNature.or(z.literal('TRANSFER')),
  /** Some securities are ineligible for minimum promoter contribution. */
  eligibleForMPC: z
    .boolean()
    .default(true)
    .describe('False for bonus shares out of revaluation reserves and other ineligible classes'),
});

export const zCapital = z.object({
  faceValue: zMoney.describe('Current face value per equity share in rupees'),

  authorisedShares: zShares.describe('Authorised equity share capital, in number of shares'),
  authorisedCapital: zMoney.describe('Authorised equity share capital in rupees'),

  /**
   * Pre-issue paid-up capital. The cumulative total of `allotments` must equal
   * `paidUpShares` — a consistency rule enforces it.
   */
  paidUpShares: zShares.describe('Pre-issue paid-up equity shares'),
  paidUpCapital: zMoney.describe('Pre-issue paid-up equity share capital in rupees'),

  allotments: z
    .array(zAllotment)
    .describe('Every allotment since incorporation, oldest first'),

  shareholders: z.array(zShareholder).describe('Complete pre-issue shareholding register'),

  promoterHoldings: z
    .array(zPromoterHolding)
    .describe('Per-promoter, per-tranche holdings with acquisition dates and cost'),

  /** Reg 228(e): outstanding convertibles are a hard blocker on eligibility. */
  hasOutstandingConvertibles: z
    .boolean()
    .default(false)
    .describe('Any outstanding convertible securities or rights to receive equity shares'),

  hasPartlyPaidShares: z
    .boolean()
    .default(false)
    .describe('Reg 230(1)(c) requires all present equity capital to be fully paid up'),

  /**
   * Reg 230(1)(b) requires an agreement with the depositories for
   * dematerialisation. BSE goes further at E-15 and requires TRIPARTITE
   * agreements with BOTH depositories and the registrar — so the two are
   * tracked separately rather than as one "demat arranged" flag.
   */
  depositoryAgreements: z
    .object({
      nsdl: z.boolean().default(false).describe('Tripartite agreement executed with NSDL'),
      cdsl: z.boolean().default(false).describe('Tripartite agreement executed with CDSL'),
    })
    .default({ nsdl: false, cdsl: false }),
});

export type Allotment = z.infer<typeof zAllotment>;
export type Shareholder = z.infer<typeof zShareholder>;
export type PromoterHolding = z.infer<typeof zPromoterHolding>;
export type Capital = z.infer<typeof zCapital>;
export type ShareholderCategory = z.infer<typeof zShareholderCategory>;
