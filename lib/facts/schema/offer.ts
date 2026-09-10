import { z } from 'zod';
import { zDate, zExchange, zIssueType, zMoney, zPercent, zShares } from './shared';

/**
 * Module M9 — The Offer.
 *
 * Note: SME documents say "Issue", not "Offer" — 4 of 5 corpus documents use
 * it (07-section-map.md, Finding 2). The code says `offer` because that is
 * the domain concept; the RENDERED text uses whichever term the issuer's
 * house style selects, via `terminology`.
 */

export const zObjectOfIssue = z.object({
  description: z.string().describe('What the proceeds will be applied to'),
  amount: zMoney.describe('Amount in rupees'),
  /**
   * General Corporate Purposes is capped at 15% of gross proceeds or
   * Rs 10 crore, whichever is lower (R-010). Issue expenses are NOT part of
   * GCP and must not be counted toward that cap.
   */
  isGeneralCorporatePurposes: z.boolean().default(false),
  /** Reg 230(1)(e): capex objects need firm finance for 75% of stated means. */
  isProject: z.boolean().default(false),
  /** Reg 230(1)(h): a hard blocker if true. */
  involvesPromoterLoanRepayment: z.boolean().default(false),
});

export const zSellingShareholder = z.object({
  name: z.string(),
  type: z.enum(['PROMOTER', 'PROMOTER_GROUP', 'OTHER']),
  sharesOffered: zShares,
  /** Reg 230(1)(g): may not exceed 50% of their pre-issue holding, fully diluted. */
  preIssueShares: zShares,
  weightedAverageCostOfAcquisition: zMoney,
});

export const zOffer = z.object({
  issueType: zIssueType.describe('D15: book-built is the current target'),
  exchange: zExchange.describe('Selects the eligibility rule set and the boilerplate'),

  /**
   * Which document is being produced. Book-built runs DRHP -> RHP -> Prospectus;
   * fixed price runs Draft Prospectus -> Prospectus. The name appears dozens of
   * times in the boilerplate, so it is a template variable.
   */
  documentStage: z
    .enum(['DRHP', 'RHP', 'PROSPECTUS'])
    .default('DRHP')
    .describe('Which stage of the offer document is being drafted'),

  /** Which word the rendered document uses. 4 of 5 corpus documents say "Issue". */
  terminology: z.enum(['ISSUE', 'OFFER']).default('ISSUE'),

  freshIssueShares: zShares.describe('Shares being freshly issued; 0 for a pure OFS'),

  /**
   * Every SME issue carves out a portion for the market maker, who must
   * provide liquidity for three years (R-004). The Net Issue is the issue less
   * this reservation, and the QIB / NII / Individual portions are percentages
   * of the NET issue, not the gross.
   *
   * Observed at roughly 5% of issue size, rounded to a whole number of lots.
   */
  marketMakerReservationShares: zShares
    .optional()
    .describe('Shares reserved for subscription by the Market Maker'),

  /**
   * Reg 230(1)(f): total OFS may not exceed 20% of total issue size.
   * Leave empty for a pure fresh issue.
   */
  sellingShareholders: z.array(zSellingShareholder).default([]),

  /** Book-built: floor and cap. Fixed price: both equal to the issue price. */
  floorPrice: zMoney.nullable().describe('Null until the price band is determined'),
  capPrice: zMoney.nullable(),

  lotSize: zShares.describe('Shares per lot; minimum application is two lots above Rs 2,00,000'),

  objects: z.array(zObjectOfIssue).describe('Objects of the issue with amounts'),
  issueExpenses: zMoney.describe('Estimated issue expenses, excluded from GCP'),

  /**
   * Whether firm arrangements of finance are in place through verifiable means
   * for 75% of the stated means of finance, excluding the issue proceeds and
   * existing internal accruals (R-022, Reg 230(1)(e)). Only meaningful where
   * some object is a project.
   *
   * This exists so EL-016 has a pass state. Without it the rule fires for every
   * issuer with a capex object and can never be cleared, which makes it a
   * notice rather than a check — and a dashboard item that never goes away is
   * one the reader learns to skip past, taking the real findings with it.
   */
  firmFinanceConfirmed: z
    .boolean()
    .default(false)
    .describe('Firm arrangements of finance confirmed for 75% of the stated means of finance'),

  /** Reg 260: 100% underwritten, BRLM underwrites at least 15% on own account. */
  underwritingPercent: zPercent.default(100),
  brlmUnderwritingPercent: zPercent.describe('Must be at least 15'),

  /**
   * Courts having exclusive jurisdiction for the issue. This is the relevant
   * High Court seat, NOT the registered office city — Om Galaxy is registered
   * in Thane and names Mumbai. Asked rather than derived, since the mapping
   * from state to bench is not one we should guess at.
   */
  jurisdiction: z
    .string()
    .optional()
    .describe('City and state of the courts having exclusive jurisdiction for the issue'),

  /** The bid period. Minimum three Working Days, maximum ten (R-006 vicinity). */
  bidOpeningDate: zDate.optional().describe('Bid/Issue Opening Date'),
  bidClosingDate: zDate.optional().describe('Bid/Issue Closing Date'),

  /** Reg 260 requires 100% underwriting; the agreement is dated and quoted. */
  underwritingAgreementDate: zDate.optional().describe('Date of the Underwriting Agreement'),

  /** Reg 261(1): compulsory market making for a minimum of 3 years. */
  marketMakerName: z.string().optional(),
  marketMakingYears: z.number().int().default(3),

  bookRunningLeadManager: z.string().optional(),
  registrarToIssue: z.string().optional(),

  /**
   * Price band, bid period and any revision must be advertised in an English
   * national daily, a Hindi national daily, and a regional daily in the
   * language of the state where the registered office is situated — each with
   * wide circulation, at least two working days before the bid opening date.
   * Named in the Method of Bidding and Pre-Issue Advertisement subsections.
   */
  /**
   * Authority for the issue. The board authorises it, the shareholders approve
   * it by special resolution under Companies Act s.62(1)(c), and the board then
   * approves the text of the offer document itself. All three dates are stated.
   */
  boardResolutionDate: zDate
    .optional()
    .describe('Date of the Board resolution authorising the issue'),
  shareholderResolutionDate: zDate
    .optional()
    .describe('Date of the shareholders special resolution under Section 62(1)(c)'),
  boardApprovalOfDocumentDate: zDate
    .optional()
    .describe('Date of the Board resolution approving this offer document'),

  /**
   * The BRLM furnishes SEBI a due diligence certificate in the Schedule V(A)
   * format, with the site visit report annexed (R-016). Its date is quoted in
   * the SEBI disclaimer clause.
   */
  dueDiligenceCertificateDate: zDate
    .optional()
    .describe("Date of the Book Running Lead Manager's due diligence certificate"),

  /** The exchange's letter permitting use of its name, quoted in its disclaimer. */
  inPrincipleApprovalDate: zDate
    .optional()
    .describe('Date of the exchange letter granting in-principle approval'),

  englishNewspaper: z.string().optional().describe('English national daily with wide circulation'),
  hindiNewspaper: z.string().optional().describe('Hindi national daily with wide circulation'),
  regionalNewspaper: z
    .string()
    .optional()
    .describe('Regional daily in the language of the registered office state'),

  /**
   * D17: the tool serves issuers preparing now, so current rules always apply.
   * Retained for the record and for future effective-date handling.
   */
  intendedFilingDate: zDate.optional(),
});

export type Offer = z.infer<typeof zOffer>;
export type ObjectOfIssue = z.infer<typeof zObjectOfIssue>;
export type SellingShareholder = z.infer<typeof zSellingShareholder>;
