import { money, multiply, type Money } from '../facts/money';
import type { Exchange, FactBase } from '../facts/schema';
import { preCheckRules } from './index';
import { bySeverity, evaluate, summarise, type Finding, type ReadinessSummary } from './types';

/**
 * The standalone eligibility pre-check.
 *
 * No signup, no document, no merchant banker. A promoter answers what they
 * already know and gets a cited verdict in about ten minutes.
 *
 * Today the alternative is paying an intermediary for a preliminary
 * assessment, or — far more often — never finding out at all. That is why
 * this runs before anything else and why it stays free of the rest of the app.
 *
 * It reuses the SAME rule objects as the full assessment. A pre-check that
 * diverged from the real engine would be worse than none: it would tell people
 * they are eligible and be wrong.
 */

/** One financial year, as a promoter can supply it from their own accounts. */
export interface PreCheckYear {
  yearEnding: number;
  profitBeforeTax: Money;
  financeCosts: Money;
  depreciationAndAmortisation: Money;
  otherIncome: Money;
  netWorth: Money;
  totalBorrowings: Money;
  shareholdersEquity: Money;
  /**
   * Cash flow figures, needed only for the NSE Emerge free cash flow test.
   * The form asks for them only when NSE Emerge is selected, so they are
   * present whenever EL-008 runs.
   */
  cashFlowFromOperations?: Money;
  netPurchaseOfFixedAssets?: Money;
  netBorrowings?: Money;
  interestPaidNetOfTax?: Money;
}

export interface PreCheckInput {
  exchange: Exchange;
  isPublicLimited: boolean;
  dateOfIncorporation: string;

  faceValue: Money;
  paidUpShares: number;
  authorisedShares: number;
  intendedFreshIssueShares: number;

  /** Most recent first. Three years is what the tests need. */
  years: PreCheckYear[];

  anyDebarredBySebi: boolean;
  anyWilfulDefaulterOrFraudulentBorrower: boolean;
  anyFugitiveEconomicOffender: boolean;
  hasOutstandingConvertibles: boolean;
  hasPartlyPaidShares: boolean;

  /**
   * The exchange criteria a promoter can answer on day one.
   *
   * These are the ones that cost months if discovered late: a name change or a
   * control change starts a one-year clock, a rejected application starts a
   * six-month one, and the insolvency tests are absolute. Everything else in
   * E-05 to E-18 and N-05 to N-11 needs a balance sheet, a merchant banker or a
   * drafted document, and asking for it here would turn a ten-minute check into
   * an interrogation people abandon.
   */
  referredToNCLT: boolean;
  windingUpPetitionAdmitted: boolean;
  referredToBIFR: boolean;
  anyAssociatedWithDelistedCompany: boolean;

  /** BSE SME only — E-08, E-09, E-10, E-18. */
  controlChangedInPastYear: boolean;
  /**
   * Dates, not booleans, because both rules are about a window that clears:
   * the issuer needs to be told WHEN, and a date the promoter supplies is a
   * fact, where a date derived from "yes" would be invented.
   */
  lastNameChangeDate?: string | null;
  /** Only asked where a name change falls inside E-09's window. */
  revenueShareFromNewNameActivity?: number | null;
  conversionToPublicDate?: string | null;
  exchangeApplicationRejectedSince?: string | null;
  pendingDebtSecurityDefaults: boolean;

  /**
   * Both venues, both regulations rather than exchange criteria, and both
   * start a clock the promoter cannot shorten — which makes them the highest
   * value questions in the whole pre-check.
   */
  convertedFromFirmType?: 'NONE' | 'PROPRIETORSHIP' | 'PARTNERSHIP' | 'LLP';
  conversionFromFirmDate?: string | null;
  majorityPromoterChangeDate?: string | null;
  sebiActionAgainstDirectorsSince?: string | null;

  /** NSE Emerge only — N-06, N-10. */
  ibcProceedingsAgainstPromotingCompanies: boolean;
  tradingSuspendedForPromoterCompanies: boolean;
}

const ZERO = money('0');

/**
 * Build a FactBase carrying only what the pre-check asked for.
 *
 * Everything else is left empty rather than plausibly defaulted. That matters:
 * a rule whose `appliesTo` inspects a field we never asked about must find
 * nothing and stay silent, not find a made-up value and pass. Silence is the
 * honest answer to a question that was never put.
 */
export function toFactBase(input: PreCheckInput): FactBase {
  return {
    company: {
      name: '',
      cin: 'U00000XX0000XXX000000',
      dateOfIncorporation: input.dateOfIncorporation,
      incorporatedUnder: 'COMPANIES_ACT_2013',
      isPublicLimited: input.isPublicLimited,
      conversionToPublicDate: input.conversionToPublicDate ?? undefined,
      /**
       * Only the dates are known here — the pre-check does not ask what the
       * company used to be called, and EL-025 prints the from/to clause only
       * when it actually has both names.
       */
      nameChanges: [
        ...(input.conversionToPublicDate
          ? [{ previousName: '', newName: '', date: input.conversionToPublicDate }]
          : []),
        ...(input.lastNameChangeDate && input.lastNameChangeDate !== input.conversionToPublicDate
          ? [{ previousName: '', newName: '', date: input.lastNameChangeDate }]
          : []),
      ],
      registeredOffice: { line1: '', city: '', state: '', pincode: '000000', country: 'India' },
      website: '',
      email: '',
      telephone: '',
      companySecretary: { name: '', email: '', telephone: '' },
      revenueShareFromNewNameActivity: input.revenueShareFromNewNameActivity ?? null,
      convertedFromFirmType: input.convertedFromFirmType ?? 'NONE',
      conversionFromFirmDate: input.conversionFromFirmDate ?? null,
      sector: 'OTHER',
      businessDescription: '',
    },
    capital: {
      faceValue: input.faceValue,
      authorisedShares: input.authorisedShares,
      authorisedCapital: multiply(input.faceValue, input.authorisedShares),
      paidUpShares: input.paidUpShares,
      paidUpCapital: multiply(input.faceValue, input.paidUpShares),
      // Not asked for. Leaving these empty keeps CO-001 and CO-002 silent
      // rather than reporting a reconciliation failure against nothing.
      allotments: [],
      shareholders: [],
      promoterHoldings: [],
      hasOutstandingConvertibles: input.hasOutstandingConvertibles,
      hasPartlyPaidShares: input.hasPartlyPaidShares,
      /**
       * Not asked. The tripartite agreements are arranged with the registrar
       * during the process, not held on day one, so EL-037 is not a pre-check
       * rule and never reads these.
       */
      depositoryAgreements: { nsdl: false, cdsl: false },
    },
    promoters: {
      promoters: [],
      promoterGroupMembers: [],
      anyDebarredBySebi: input.anyDebarredBySebi,
      anyWilfulDefaulterOrFraudulentBorrower: input.anyWilfulDefaulterOrFraudulentBorrower,
      anyFugitiveEconomicOffender: input.anyFugitiveEconomicOffender,
      controlChangedInPastYear: input.controlChangedInPastYear,
      anyAssociatedWithDelistedCompany: input.anyAssociatedWithDelistedCompany,
      majorityPromoterChangeDate: input.majorityPromoterChangeDate ?? null,
    },
    management: { directors: [], keyManagerialPersonnel: [] },
    business: { topCustomers: [], topSuppliers: [], facilities: [] },
    financials: {
      hasRestatedStatements: false,
      years: input.years.map((y) => ({
        yearEnding: y.yearEnding,
        revenue: ZERO,
        otherIncome: y.otherIncome,
        profitBeforeTax: y.profitBeforeTax,
        profitAfterTax: ZERO,
        financeCosts: y.financeCosts,
        depreciationAndAmortisation: y.depreciationAndAmortisation,
        netWorth: y.netWorth,
        totalAssets: ZERO,
        totalLiabilities: ZERO,
        intangibleAssets: ZERO,
        deferredIpoExpenses: ZERO,
        // Not asked. The net tangible assets tests need a balance sheet and
        // are not pre-check rules, so they never read this.
        monetaryAssets: null,
        totalBorrowings: y.totalBorrowings,
        shareholdersEquity: y.shareholdersEquity,
        cashFlowFromOperations: y.cashFlowFromOperations ?? ZERO,
        netPurchaseOfFixedAssets: y.netPurchaseOfFixedAssets ?? ZERO,
        proceedsFromIssuanceOfCapital: ZERO,
        netBorrowings: y.netBorrowings ?? ZERO,
        interestPaidNetOfTax: y.interestPaidNetOfTax ?? ZERO,
        contingentLiabilities: ZERO,
        relatedPartyTransactionsTotal: ZERO,
      })),
    },
    legal: {
      litigation: [],
      referredToNCLT: input.referredToNCLT,
      ibcProceedingsAgainstPromotingCompanies: input.ibcProceedingsAgainstPromotingCompanies,
      windingUpPetitionAdmitted: input.windingUpPetitionAdmitted,
      referredToBIFR: input.referredToBIFR,
      /**
       * Not asked. E-13 and N-09 turn on whether an action was MATERIAL, which
       * is the exchange's judgement on facts a promoter cannot summarise in a
       * checkbox — so those rules are not pre-check rules and read null here.
       */
      regulatoryActionAgainstCompanySince: null,
      regulatoryActionAgainstPromotersSince: null,
      regulatoryActionAgainstGroupCompaniesSince: null,
      tradingSuspendedForPromoterCompanies: input.tradingSuspendedForPromoterCompanies,
      pendingDebtSecurityDefaults: input.pendingDebtSecurityDefaults,
      sebiActionAgainstDirectorsSince: input.sebiActionAgainstDirectorsSince ?? null,
    },
    approvals: { licences: [] },
    offer: {
      issueType: 'BOOK_BUILT',
      exchange: input.exchange,
      documentStage: 'DRHP',
      terminology: 'ISSUE',
      freshIssueShares: input.intendedFreshIssueShares,
      sellingShareholders: [],
      floorPrice: null,
      capPrice: null,
      issuePrice: null,
      lotSize: 0,
      objects: [],
      issueExpenses: ZERO,
      firmFinanceConfirmed: false,
      underwritingPercent: 100,
      brlmUnderwritingPercent: 15,
      marketMakingYears: 3,
      exchangeApplicationRejectedSince: input.exchangeApplicationRejectedSince ?? null,
      /**
       * N-08 is about the merchant bankers involved, and at pre-check time
       * there are none. Its BSE counterpart E-10 asks about the company and is
       * answerable now — the same six months, two different parties.
       */
      exemptionApplicationDetails: null,
      brlmDraftReturnedSince: null,
    },
    groupCompanies: { companies: [] },
  };
}

export interface PreCheckResult {
  eligible: boolean;
  findings: Finding[];
  summary: ReadinessSummary;
  /** Post-issue paid-up capital, the figure that decides the Reg 229 limb. */
  postIssueCapital: Money;
  /** Rough time to filing, in months, given what is outstanding. */
  estimatedMonths: number;
}

export function runPreCheck(input: PreCheckInput): PreCheckResult {
  const facts = toFactBase(input);
  const findings = bySeverity(evaluate(preCheckRules, facts));
  const summary = summarise(preCheckRules, facts);

  /**
   * Conversion to a public limited company alone runs 45 to 60 days, and it
   * gates everything after it. Saying "4 to 8 months" to someone who has not
   * started that is the kind of estimate that loses trust later, so blockers
   * push the number out.
   */
  const base = 5;
  const conversionPenalty = input.isPublicLimited ? 0 : 2;
  const blockerPenalty = summary.blockers > 0 ? 3 : 0;

  return {
    eligible: summary.blockers === 0,
    findings,
    summary,
    postIssueCapital: multiply(input.faceValue, input.paidUpShares + input.intendedFreshIssueShares),
    estimatedMonths: base + conversionPenalty + blockerPenalty,
  };
}
