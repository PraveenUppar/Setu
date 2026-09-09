import { money } from '../facts/money';
import type { FactBase } from '../facts/schema';

/**
 * Vardhman Precision Components Limited — the demo issuer.
 *
 * A synthetic but realistic SME: auto components, Chakan (Pune), Rs 48.2 cr
 * revenue, raising Rs 22.05 cr on BSE SME through a book-built issue.
 *
 * Deliberately constructed so that:
 *   - it PASSES every eligibility test, with the arithmetic actually tying
 *   - the capital build-up sums exactly to pre-issue paid-up capital
 *   - objects of the issue plus issue expenses equal the issue size exactly
 *   - top-5 customer concentration is 61.3%, which fires the customer
 *     concentration risk factor with a real number
 *
 * SYNTHETIC. Not a real company. Never present it as one.
 */

const cr = (v: string | number) => money(v, 'crores');

export const vardhman: FactBase = {
  company: {
    name: 'Vardhman Precision Components Limited',
    cin: 'U29253MH2016PLC098765',
    dateOfIncorporation: '2016-04-12',
    incorporatedUnder: 'COMPANIES_ACT_2013',
    isPublicLimited: true,
    conversionToPublicDate: '2025-02-18',
    nameChanges: [
      {
        previousName: 'Vardhman Precision Components Private Limited',
        newName: 'Vardhman Precision Components Limited',
        date: '2025-02-18',
        reason: 'Conversion from private limited to public limited company',
      },
    ],
    registeredOffice: {
      line1: 'Plot No. 42, Chakan Industrial Area, Phase II',
      line2: 'Village Mahalunge, Taluka Khed',
      city: 'Pune',
      state: 'Maharashtra',
      pincode: '410501',
      country: 'India',
    },
    website: 'https://www.vardhmanprecision.in',
    email: 'info@vardhmanprecision.in',
    telephone: '+91 20 6712 4400',
    companySecretary: {
      name: 'Priya Deshmukh',
      email: 'cs@vardhmanprecision.in',
      telephone: '+91 20 6712 4412',
    },
    sector: 'ENGINEERING',
    businessDescription:
      'Manufacture of precision machined components and sub-assemblies for commercial vehicle and off-highway powertrain applications, supplied directly to original equipment manufacturers.',
  },

  capital: {
    faceValue: money('10'),
    authorisedShares: 20000000,
    authorisedCapital: cr('20'),
    // Cumulative of the allotments below: 1,20,00,000 shares at Rs 10 = Rs 12 cr
    paidUpShares: 12000000,
    paidUpCapital: cr('12'),

    allotments: [
      {
        date: '2016-04-12',
        shares: 10000,
        faceValue: money('10'),
        issuePrice: money('10'),
        consideration: 'CASH',
        nature: 'SUBSCRIPTION_TO_MOA',
        allottees: 'Rajesh Vardhman (6,000), Sunita Vardhman (4,000)',
      },
      {
        date: '2017-08-22',
        shares: 240000,
        faceValue: money('10'),
        issuePrice: money('10'),
        consideration: 'CASH',
        nature: 'FURTHER_ALLOTMENT',
        allottees: 'Promoters',
      },
      {
        date: '2019-11-05',
        shares: 350000,
        faceValue: money('10'),
        issuePrice: money('25'),
        consideration: 'CASH',
        nature: 'PREFERENTIAL_ALLOTMENT',
        allottees: 'Kirti Investments Private Limited',
      },
      {
        date: '2021-06-18',
        shares: 600000,
        faceValue: money('10'),
        issuePrice: money('40'),
        consideration: 'CASH',
        nature: 'PREFERENTIAL_ALLOTMENT',
        allottees: 'Promoters and non-promoter individuals',
      },
      {
        date: '2024-06-20',
        shares: 10800000,
        faceValue: money('10'),
        issuePrice: null,
        consideration: 'BONUS',
        nature: 'BONUS_ISSUE',
        allottees: 'All shareholders, in the ratio 9:1',
      },
    ],

    shareholders: [
      { name: 'Rajesh Vardhman', category: 'PROMOTER', shares: 4680000, isDematerialised: true },
      { name: 'Sunita Vardhman', category: 'PROMOTER', shares: 3120000, isDematerialised: true },
      { name: 'Anil Vardhman', category: 'PROMOTER_GROUP', shares: 1200000, isDematerialised: true },
      {
        name: 'Kirti Investments Private Limited',
        category: 'PUBLIC_BODY_CORPORATE',
        shares: 1800000,
        isDematerialised: true,
      },
      {
        name: 'Other individual shareholders (11 holders)',
        category: 'PUBLIC_INDIVIDUAL',
        shares: 1200000,
        isDematerialised: true,
      },
    ],

    promoterHoldings: [
      {
        promoterName: 'Rajesh Vardhman',
        shares: 468000,
        acquisitionDate: '2016-04-12',
        costPerShare: money('10'),
        natureOfAcquisition: 'SUBSCRIPTION_TO_MOA',
        eligibleForMPC: true,
      },
      {
        promoterName: 'Rajesh Vardhman',
        shares: 4212000,
        acquisitionDate: '2024-06-20',
        costPerShare: money('0'),
        natureOfAcquisition: 'BONUS_ISSUE',
        eligibleForMPC: true,
      },
      {
        promoterName: 'Sunita Vardhman',
        shares: 312000,
        acquisitionDate: '2016-04-12',
        costPerShare: money('10'),
        natureOfAcquisition: 'SUBSCRIPTION_TO_MOA',
        eligibleForMPC: true,
      },
      {
        promoterName: 'Sunita Vardhman',
        shares: 2808000,
        acquisitionDate: '2024-06-20',
        costPerShare: money('0'),
        natureOfAcquisition: 'BONUS_ISSUE',
        eligibleForMPC: true,
      },
    ],

    hasOutstandingConvertibles: false,
    hasPartlyPaidShares: false,
  },

  promoters: {
    promoters: [
      {
        name: 'Rajesh Vardhman',
        pan: 'AFKPV1234C',
        din: '07123456',
        dateOfBirth: '1974-09-03',
        qualification: 'B.E. (Mechanical), College of Engineering Pune',
        experienceYears: 26,
        otherDirectorships: ['Vardhman Tooling Private Limited'],
      },
      {
        name: 'Sunita Vardhman',
        pan: 'AFKPV5678D',
        din: '07123457',
        dateOfBirth: '1977-01-22',
        qualification: 'B.Com, University of Pune; MBA (Finance)',
        experienceYears: 19,
        otherDirectorships: [],
      },
    ],
    promoterGroupMembers: [
      { name: 'Anil Vardhman', relationship: 'Brother of Rajesh Vardhman' },
      { name: 'Vardhman Tooling Private Limited', relationship: 'Entity controlled by promoters' },
    ],
    anyDebarredBySebi: false,
    anyWilfulDefaulterOrFraudulentBorrower: false,
    anyFugitiveEconomicOffender: false,
    controlChangedInPastYear: false,
  },

  management: {
    directors: [
      {
        name: 'Rajesh Vardhman',
        din: '07123456',
        designation: 'Chairman and Managing Director',
        isIndependent: false,
        appointedOn: '2016-04-12',
        remuneration: cr('0.48'),
      },
      {
        name: 'Sunita Vardhman',
        din: '07123457',
        designation: 'Whole-time Director and Chief Financial Officer',
        isIndependent: false,
        appointedOn: '2016-04-12',
        remuneration: cr('0.36'),
      },
      {
        name: 'Meera Kulkarni',
        din: '09876541',
        designation: 'Independent Director',
        isIndependent: true,
        appointedOn: '2025-03-10',
      },
      {
        name: 'Suresh Iyer',
        din: '09876542',
        designation: 'Independent Director',
        isIndependent: true,
        appointedOn: '2025-03-10',
      },
    ],
    keyManagerialPersonnel: [
      { name: 'Sunita Vardhman', designation: 'Chief Financial Officer' },
      { name: 'Priya Deshmukh', designation: 'Company Secretary and Compliance Officer' },
    ],
  },

  business: {
    // Top five total 61.3%, above the 50% materiality threshold. This fires
    // the customer concentration risk factor with the real number.
    topCustomers: [
      { name: 'Mahindra & Mahindra Limited', revenueShare: 22.4 },
      { name: 'Tata Motors Limited', revenueShare: 15.1 },
      { name: 'Bajaj Auto Limited', revenueShare: 10.3 },
      { name: 'Force Motors Limited', revenueShare: 7.2 },
      { name: 'Greaves Cotton Limited', revenueShare: 6.3 },
    ],
    topSuppliers: [
      { name: 'Jindal Stainless Limited', purchaseShare: 18.6 },
      { name: 'Sunflag Iron and Steel Company Limited', purchaseShare: 12.4 },
    ],
    facilities: [
      {
        location: 'Chakan Industrial Area, Phase II, Pune, Maharashtra',
        owned: true,
        capacity: '1,850 MT per annum of machined components',
      },
    ],
    employeeCount: 214,
    orderBook: cr('31.60'),
  },

  financials: {
    hasRestatedStatements: false,
    auditorName: 'Kalyani & Associates, Chartered Accountants',
    auditorPeerReviewNumber: 'PR-014782',
    years: [
      {
        yearEnding: 2026,
        revenue: cr('48.20'),
        otherIncome: cr('0.35'),
        profitBeforeTax: cr('4.85'),
        profitAfterTax: cr('3.60'),
        financeCosts: cr('0.78'),
        depreciationAndAmortisation: cr('1.12'),
        // Operating profit = 4.85 + 0.78 + 1.12 - 0.35 = Rs 6.40 cr
        netWorth: cr('19.40'),
        totalAssets: cr('42.60'),
        totalLiabilities: cr('22.90'),
        intangibleAssets: cr('0.18'),
        deferredIpoExpenses: cr('0.12'),
        totalBorrowings: cr('8.60'),
        shareholdersEquity: cr('19.40'),
        cashFlowFromOperations: cr('5.20'),
        netPurchaseOfFixedAssets: cr('3.80'),
        proceedsFromIssuanceOfCapital: cr('0'),
        netBorrowings: cr('1.40'),
        interestPaidNetOfTax: cr('0.58'),
        contingentLiabilities: cr('0.90'),
        relatedPartyTransactionsTotal: cr('2.10'),
      },
      {
        yearEnding: 2025,
        revenue: cr('39.50'),
        otherIncome: cr('0.28'),
        profitBeforeTax: cr('3.42'),
        profitAfterTax: cr('2.55'),
        financeCosts: cr('0.64'),
        depreciationAndAmortisation: cr('0.98'),
        // Operating profit = Rs 4.76 cr
        netWorth: cr('14.20'),
        totalAssets: cr('33.10'),
        totalLiabilities: cr('18.75'),
        intangibleAssets: cr('0.15'),
        deferredIpoExpenses: cr('0'),
        totalBorrowings: cr('7.20'),
        shareholdersEquity: cr('14.20'),
        cashFlowFromOperations: cr('3.10'),
        netPurchaseOfFixedAssets: cr('2.40'),
        proceedsFromIssuanceOfCapital: cr('0'),
        netBorrowings: cr('0.90'),
        interestPaidNetOfTax: cr('0.48'),
        contingentLiabilities: cr('0.62'),
        relatedPartyTransactionsTotal: cr('1.75'),
      },
      {
        yearEnding: 2024,
        revenue: cr('28.10'),
        otherIncome: cr('0.19'),
        profitBeforeTax: cr('1.48'),
        profitAfterTax: cr('1.10'),
        financeCosts: cr('0.52'),
        depreciationAndAmortisation: cr('0.81'),
        // Operating profit = Rs 2.62 cr
        netWorth: cr('9.80'),
        totalAssets: cr('24.30'),
        totalLiabilities: cr('14.38'),
        intangibleAssets: cr('0.12'),
        deferredIpoExpenses: cr('0'),
        totalBorrowings: cr('6.10'),
        shareholdersEquity: cr('9.80'),
        cashFlowFromOperations: cr('2.05'),
        netPurchaseOfFixedAssets: cr('1.60'),
        proceedsFromIssuanceOfCapital: cr('0'),
        netBorrowings: cr('0.70'),
        interestPaidNetOfTax: cr('0.39'),
        contingentLiabilities: cr('0.41'),
        relatedPartyTransactionsTotal: cr('1.20'),
      },
    ],
  },

  legal: {
    litigation: [
      {
        against: 'COMPANY',
        partyName: 'Deputy Commissioner of State Tax, Pune',
        type: 'TAX',
        amount: cr('0.34'),
        status: 'Appeal pending before the Joint Commissioner (Appeals)',
        description:
          'Demand raised on account of alleged mismatch in input tax credit claimed for the financial year 2022-23.',
      },
      {
        against: 'COMPANY',
        partyName: 'Maharashtra Pollution Control Board',
        type: 'REGULATORY',
        amount: null,
        status: 'Show cause notice replied; no further communication received',
        description:
          'Show cause notice regarding effluent discharge parameters at the Chakan facility, replied to within the stipulated period.',
      },
    ],
    referredToNCLT: false,
    windingUpPetitionAdmitted: false,
    referredToBIFR: false,
  },

  approvals: {
    licences: [
      {
        name: 'Certificate of Registration under GST',
        authority: 'Government of Maharashtra',
        number: '27AAECV1234C1ZP',
        validUntil: null,
      },
      {
        name: 'Factory Licence',
        authority: 'Directorate of Industrial Safety and Health, Maharashtra',
        number: 'PUN/CHK/2016/4421',
        validUntil: '2027-12-31',
      },
      {
        name: 'Consent to Operate',
        authority: 'Maharashtra Pollution Control Board',
        number: 'MPCB/CO/2024/8817',
        validUntil: '2028-06-30',
      },
      {
        name: 'Importer Exporter Code',
        authority: 'Directorate General of Foreign Trade',
        number: '0316012345',
        validUntil: null,
      },
    ],
  },

  offer: {
    issueType: 'BOOK_BUILT',
    exchange: 'BSE_SME',
    documentStage: 'DRHP',
    terminology: 'ISSUE',

    freshIssueShares: 4500000,
    sellingShareholders: [],

    floorPrice: money('47'),
    capPrice: money('49'),
    lotSize: 3000,

    // Objects plus issue expenses total Rs 22.05 cr, which is exactly
    // 45,00,000 shares at the Rs 49 cap price. A consistency rule checks this.
    objects: [
      {
        description:
          'Funding capital expenditure towards purchase of plant and machinery at the Chakan facility',
        amount: cr('12.00'),
        isGeneralCorporatePurposes: false,
        isProject: true,
        involvesPromoterLoanRepayment: false,
      },
      {
        description: 'Funding incremental working capital requirements',
        amount: cr('6.00'),
        isGeneralCorporatePurposes: false,
        isProject: false,
        involvesPromoterLoanRepayment: false,
      },
      {
        description:
          'Repayment or pre-payment, in full or in part, of certain borrowings availed by our Company',
        amount: cr('2.00'),
        isGeneralCorporatePurposes: false,
        isProject: false,
        involvesPromoterLoanRepayment: false,
      },
      {
        description: 'General corporate purposes',
        amount: cr('1.00'),
        isGeneralCorporatePurposes: true,
        isProject: false,
        involvesPromoterLoanRepayment: false,
      },
    ],
    issueExpenses: cr('1.05'),

    underwritingPercent: 100,
    brlmUnderwritingPercent: 15,

    marketMakerName: 'Nikunj Stock Brokers Limited',
    marketMakingYears: 3,

    bookRunningLeadManager: 'Indorient Financial Services Limited',
    registrarToIssue: 'Bigshare Services Private Limited',

    intendedFilingDate: '2026-11-15',
  },

  groupCompanies: {
    companies: [
      {
        name: 'Vardhman Tooling Private Limited',
        relationship: 'Entity controlled by the Promoters',
        isListed: false,
      },
    ],
  },
};
