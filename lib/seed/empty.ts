import { money } from '../facts/money';
import type { FactBase, PartialFactBase } from '../facts/schema';

/**
 * A fact base with nothing in it.
 *
 * The document engine takes a complete `FactBase`, because every section needs
 * to be able to ASK for any fact. A real issuer starts with none of them, so
 * this supplies the shape without supplying any answers: every string is empty
 * and every list is empty, which means every section renders its gaps rather
 * than crashing or inventing.
 *
 * The alternative — starting a real issuer on the demo seed and letting them
 * overwrite it field by field — would produce a document that reads as
 * complete while carrying another company's figures in every unanswered
 * place. That is D21's finding as a product decision rather than a text one.
 */
export function emptyFactBase(): FactBase {
  const ZERO = money('0');
  return {
    company: {
      name: '',
      cin: 'U00000XX0000XXX000000',
      dateOfIncorporation: '',
      incorporatedUnder: 'COMPANIES_ACT_2013',
      isPublicLimited: false,
      nameChanges: [],
      registeredOffice: { line1: '', city: '', state: '', pincode: '000000', country: 'India' },
      website: '',
      email: '',
      telephone: '',
      companySecretary: { name: '', email: '', telephone: '' },
      revenueShareFromNewNameActivity: null,
      convertedFromFirmType: 'NONE',
      conversionFromFirmDate: null,
      sector: 'OTHER',
      businessDescription: '',
      articlesProvisions: {},
    },
    capital: {
      faceValue: ZERO,
      authorisedShares: 0,
      authorisedCapital: ZERO,
      paidUpShares: 0,
      paidUpCapital: ZERO,
      allotments: [],
      shareholders: [],
      promoterHoldings: [],
      hasOutstandingConvertibles: false,
      hasPartlyPaidShares: false,
      depositoryAgreements: { nsdl: false, cdsl: false },
    },
    promoters: {
      promoters: [],
      promoterGroupMembers: [],
      anyDebarredBySebi: false,
      anyWilfulDefaulterOrFraudulentBorrower: false,
      anyFugitiveEconomicOffender: false,
      controlChangedInPastYear: false,
      anyAssociatedWithDelistedCompany: false,
      majorityPromoterChangeDate: null,
      managementControlChangeDetails: null,
      pledgedSharesDetails: null,
      materialGuaranteesDetails: null,
      disassociations: [],
      commonPursuitsDetails: null,
    },
    management: {
      directors: [],
      boardChanges: [],
      keyManagerialPersonnel: [],
      seniorManagement: [],
      committees: [],
      hasKeyManInsurance: false,
    },
    business: { topCustomers: [], topSuppliers: [], facilities: [] },
    financials: {
      hasRestatedStatements: false,
      years: [],
      borrowings: [],
      contingentLiabilityItems: [],
      creditors: {},
    },
    legal: {
      litigation: [],
      referredToNCLT: false,
      ibcProceedingsAgainstPromotingCompanies: false,
      windingUpPetitionAdmitted: false,
      referredToBIFR: false,
      regulatoryActionAgainstCompanySince: null,
      regulatoryActionAgainstPromotersSince: null,
      regulatoryActionAgainstGroupCompaniesSince: null,
      tradingSuspendedForPromoterCompanies: false,
      pendingDebtSecurityDefaults: false,
      sebiActionAgainstDirectorsSince: null,
      economicOffenceProceedings: null,
      materialFrauds: null,
      statutoryDuesDefaults: null,
      pastInquiriesInspections: null,
      materialDevelopmentsSinceBalanceSheet: null,
    },
    approvals: { licences: [], approvalsRequiredNotObtained: null },
    offer: {
      issueType: 'BOOK_BUILT',
      exchange: 'BSE_SME',
      documentStage: 'DRHP',
      terminology: 'ISSUE',
      freshIssueShares: 0,
      sellingShareholders: [],
      industryPeers: [],
      floorPrice: null,
      capPrice: null,
      issuePrice: null,
      lotSize: 0,
      objects: [],
      issueExpenses: ZERO,
      firmFinanceConfirmed: false,
      underwritingPercent: 100,
      brlmUnderwritingPercent: 0,
      marketMakingYears: 0,
      exchangeApplicationRejectedSince: null,
      brlmDraftReturnedSince: null,
      exemptionApplicationDetails: null,
    },
    groupCompanies: { companies: [], relatedParties: [], relatedPartyTransactions: [] },
  };
}

/**
 * The issuer's own answers laid over the empty shape.
 *
 * Domain by domain, not field by field: the store writes whole domains when
 * seeding and individual paths when a person types, and both land inside the
 * right domain object. Anything unanswered stays empty and renders as a gap.
 */
export function withAnswers(answers: PartialFactBase): FactBase {
  const base = emptyFactBase();
  const merged = { ...base } as Record<string, unknown>;
  for (const [domain, value] of Object.entries(answers)) {
    if (value && typeof value === 'object' && !Array.isArray(value)) {
      merged[domain] = { ...(base as Record<string, unknown>)[domain] as object, ...value };
    }
  }
  return merged as FactBase;
}
