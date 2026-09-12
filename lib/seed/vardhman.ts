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
 *   - Maharashtra is 64.5% of revenue, plausibly (the Chakan facility sits
 *     in the same cluster as several customers' own plants), which fires
 *     the geographic concentration risk factor with a real number too
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
    // The only name change is the 2025 conversion, well outside E-09's window,
    // so the revenue test never arises.
    revenueShareFromNewNameActivity: null,
    convertedFromFirmType: 'NONE',
    conversionFromFirmDate: null,
    sector: 'ENGINEERING',
    businessDescription:
      'Manufacture of precision machined components and sub-assemblies for commercial vehicle and off-highway powertrain applications, supplied directly to original equipment manufacturers.',
    // D69: standard Table F (Companies Act 2013, Schedule I) provisions, the same statutory
    // text every Indian company's Articles restate near-identically — paraphrased from the
    // corpus's own real AoA chapters, not company-specific facts, so no source-per-issuer risk.
    articlesProvisions: {
      votingRights:
        'On a show of hands, every member present in person shall have one vote. On a poll, the voting rights of a member shall be in proportion to such member’s share of the paid-up equity share capital of the Company. In the case of joint holders, the vote of the senior holder who tenders a vote, whether in person or by proxy, shall be accepted to the exclusion of the votes of the other joint holders, seniority being determined by the order in which the names stand in the register of members. No member shall be entitled to vote at any general meeting unless all calls or other sums presently payable by such member in respect of shares in the Company have been paid.',
      dividend:
        'The Company in general meeting may declare dividends, but no dividend shall exceed the amount recommended by the Board. The Board may, from time to time, pay to the members such interim dividends as appear to it to be justified by the profits of the Company. The Board may, before recommending any dividend, set aside out of the profits of the Company such sums as it thinks fit as a reserve or reserves. All dividends shall be declared and paid according to the amounts paid up on the shares in respect of which the dividend is paid.',
      lien:
        'The Company shall have a first and paramount lien on every share (not being a fully paid share) for all monies, whether presently payable or not, called or payable at a fixed time in respect of that share, and on all shares standing registered in the name of a single person for all monies presently payable by such person to the Company. Fully paid shares shall be free from all lien. The Company’s lien, if any, on a share shall extend to all dividends payable and bonuses declared in respect of such shares.',
      forfeiture:
        'If a member fails to pay any call or instalment on or before the due date, the Board may serve a notice requiring payment together with any accrued interest. The notice shall name a further date, not earlier than fourteen days from the date of the notice, on or before which payment is to be made, and shall state that in the event of non-payment the shares in respect of which the call was made shall be liable to be forfeited. If the notice is not complied with, the shares may be forfeited by a resolution of the Board. A person whose shares have been forfeited ceases to be a member in respect of those shares but remains liable to the Company for all monies presently payable at the date of forfeiture.',
      transferAndTransmission:
        'The instrument of transfer of any share shall be executed by or on behalf of both the transferor and the transferee, and the transferor shall be deemed to remain the holder of the share until the name of the transferee is entered in the register of members. The Board may decline to register a transfer of a share on which the Company has a lien, or where the instrument of transfer is not accompanied by the share certificate and such other evidence as the Board may reasonably require. On the death of a member, the survivor or survivors where the member was a joint holder, and the legal representatives where the member was a sole holder, shall be the only persons recognised by the Company as having title to the member’s shares.',
      consolidationAndSplitting:
        'The Company may, from time to time, by ordinary resolution, increase its share capital, consolidate and divide all or any of its share capital into shares of a larger amount than its existing shares, sub-divide its existing shares into shares of a smaller amount than is fixed by the memorandum, or convert fully paid-up shares into stock and reconvert that stock into fully paid-up shares of any denomination, in each case subject to the provisions of Section 61 of the Companies Act, 2013.',
    },
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
    // BSE SME requires both (E-15); the agreements are tripartite with Bigshare.
    depositoryAgreements: { nsdl: true, cdsl: true, nsdlDate: '2026-06-18', cdslDate: '2026-06-24' },
  },

  promoters: {
    promoters: [
      {
        name: 'Rajesh Vardhman',
        kind: 'INDIVIDUAL',
        pan: 'AFKPV1234C',
        din: '07123456',
        dateOfBirth: '1974-09-03',
        address: 'Flat 1201, Sapphire Towers, Baner Road, Pune 411045, Maharashtra',
        occupation: 'Business',
        nationality: 'Indian',
        designation: 'Chairman and Managing Director',
        qualification: 'B.E. (Mechanical), College of Engineering Pune',
        experienceYears: 26,
        experienceSummary:
          'Rajesh Vardhman has over 26 years of experience in precision machining and automotive component manufacturing. He founded the business in 2016 after sixteen years with a tier-one powertrain supplier, and is responsible for overall strategy, key customer relationships and plant expansion.',
        otherDirectorships: ['Vardhman Tooling Private Limited'],
        otherVentures: [],
      },
      {
        name: 'Sunita Vardhman',
        kind: 'INDIVIDUAL',
        pan: 'AFKPV5678D',
        din: '07123457',
        dateOfBirth: '1977-01-22',
        address: 'Flat 1201, Sapphire Towers, Baner Road, Pune 411045, Maharashtra',
        occupation: 'Business',
        nationality: 'Indian',
        designation: 'Whole-time Director and Chief Financial Officer',
        qualification: 'B.Com, University of Pune; MBA (Finance)',
        experienceYears: 19,
        experienceSummary:
          'Sunita Vardhman has 19 years of experience in corporate finance and administration. She has led the finance function of our Company since incorporation and oversees banking, treasury, statutory compliance and investor relations.',
        otherDirectorships: [],
        otherVentures: [],
      },
    ],
    promoterGroupMembers: [
      { name: 'Sunita Vardhman', relationship: 'Spouse of the promoter', kind: 'INDIVIDUAL', relatedTo: 'Rajesh Vardhman' },
      { name: 'Kamla Vardhman', relationship: 'Mother of the promoter', kind: 'INDIVIDUAL', relatedTo: 'Rajesh Vardhman' },
      { name: 'Anil Vardhman', relationship: 'Brother of the promoter', kind: 'INDIVIDUAL', relatedTo: 'Rajesh Vardhman' },
      { name: 'Aarav Vardhman', relationship: 'Son of the promoter', kind: 'INDIVIDUAL', relatedTo: 'Rajesh Vardhman' },
      { name: 'Rajesh Vardhman', relationship: 'Spouse of the promoter', kind: 'INDIVIDUAL', relatedTo: 'Sunita Vardhman' },
      { name: 'Prakash Mehta', relationship: 'Father of the promoter', kind: 'INDIVIDUAL', relatedTo: 'Sunita Vardhman' },
      {
        name: 'Vardhman Tooling Private Limited',
        relationship: 'Body corporate in which the promoters hold more than 20% of the equity',
        kind: 'ENTITY',
        relatedTo: 'Rajesh Vardhman',
      },
    ],
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
    directors: [
      {
        name: 'Rajesh Vardhman',
        din: '07123456',
        designation: 'Chairman and Managing Director',
        isIndependent: false,
        isExecutive: true,
        hasListedCompanyExperience: false,
        appointedOn: '2025-02-18',
        dateOfBirth: '1974-09-03',
        nationality: 'Indian',
        occupation: 'Business',
        address: 'Flat 1201, Sapphire Towers, Baner Road, Pune 411045, Maharashtra',
        qualification: 'B.E. (Mechanical), College of Engineering Pune',
        experienceSummary:
          'Rajesh Vardhman has over 26 years of experience in precision machining and automotive component manufacturing, and has led our Company since its incorporation.',
        otherDirectorships: ['Vardhman Tooling Private Limited'],
        term: 'Five years from February 18, 2025, not liable to retire by rotation',
        remuneration: cr('0.48'),
        relatedTo: 'Spouse of Sunita Vardhman',
      },
      {
        name: 'Sunita Vardhman',
        din: '07123457',
        designation: 'Whole-time Director and Chief Financial Officer',
        isIndependent: false,
        isExecutive: true,
        hasListedCompanyExperience: false,
        appointedOn: '2025-02-18',
        dateOfBirth: '1977-01-22',
        nationality: 'Indian',
        occupation: 'Business',
        address: 'Flat 1201, Sapphire Towers, Baner Road, Pune 411045, Maharashtra',
        qualification: 'B.Com, University of Pune; MBA (Finance)',
        experienceSummary:
          'Sunita Vardhman has 19 years of experience in corporate finance and has headed the finance function of our Company since incorporation.',
        otherDirectorships: [],
        term: 'Five years from February 18, 2025, liable to retire by rotation',
        remuneration: cr('0.36'),
        relatedTo: 'Spouse of Rajesh Vardhman',
      },
      {
        name: 'Meera Kulkarni',
        din: '09876541',
        designation: 'Independent Director',
        isIndependent: true,
        isExecutive: false,
        hasListedCompanyExperience: false,
        appointedOn: '2025-03-28',
        dateOfBirth: '1968-11-14',
        nationality: 'Indian',
        occupation: 'Chartered Accountant',
        address: '14 Prabhat Road, Erandwane, Pune 411004, Maharashtra',
        qualification: 'B.Com; Fellow Member, Institute of Chartered Accountants of India',
        experienceSummary:
          'Meera Kulkarni is a practising chartered accountant with 30 years of experience in audit and taxation, and has served on the boards of two other manufacturing companies.',
        otherDirectorships: ['Kirloskar Ferrous Castings Private Limited'],
        term: 'Five years from March 28, 2025, not liable to retire by rotation',
      },
      {
        name: 'Suresh Iyer',
        din: '09876542',
        designation: 'Independent Director',
        isIndependent: true,
        isExecutive: false,
        hasListedCompanyExperience: false,
        appointedOn: '2025-03-28',
        dateOfBirth: '1962-05-30',
        nationality: 'Indian',
        occupation: 'Retired banker',
        address: '7 Model Colony, Shivajinagar, Pune 411016, Maharashtra',
        qualification: 'M.Sc. (Statistics); CAIIB',
        experienceSummary:
          'Suresh Iyer retired as Deputy General Manager of a public sector bank after 34 years in credit and risk, the last eight heading the mid-corporate group in Pune.',
        otherDirectorships: [],
        term: 'Five years from March 28, 2025, not liable to retire by rotation',
      },
      {
        name: 'Arvind Joshi',
        din: '09876543',
        designation: 'Independent Director',
        isIndependent: true,
        isExecutive: false,
        // The only one of the five: his own profile below says "two listed
        // component manufacturers" — kept internally consistent, and gives
        // the "majority, not all, lack it" fixture the corpus itself shows.
        hasListedCompanyExperience: true,
        appointedOn: '2025-03-28',
        dateOfBirth: '1970-02-09',
        nationality: 'Indian',
        occupation: 'Consultant',
        address: '22 Koregaon Park Lane 5, Pune 411001, Maharashtra',
        qualification: 'B.Tech (Production); PGDM, IIM Ahmedabad',
        experienceSummary:
          'Arvind Joshi advises automotive suppliers on operations and quality systems, after 22 years in plant management with two listed component manufacturers.',
        otherDirectorships: [],
        term: 'Five years from March 28, 2025, not liable to retire by rotation',
      },
    ],
    boardChanges: [
      { name: 'Rajesh Vardhman', date: '2025-02-18', reason: 'Redesignated as Chairman and Managing Director' },
      { name: 'Sunita Vardhman', date: '2025-02-18', reason: 'Redesignated as Whole-time Director' },
      { name: 'Meera Kulkarni', date: '2025-03-10', reason: 'Appointment as Additional Director' },
      { name: 'Suresh Iyer', date: '2025-03-10', reason: 'Appointment as Additional Director' },
      { name: 'Arvind Joshi', date: '2025-03-10', reason: 'Appointment as Additional Director' },
      { name: 'Meera Kulkarni', date: '2025-03-28', reason: 'Regularised as Independent Director' },
      { name: 'Suresh Iyer', date: '2025-03-28', reason: 'Regularised as Independent Director' },
      { name: 'Arvind Joshi', date: '2025-03-28', reason: 'Regularised as Independent Director' },
    ],
    keyManagerialPersonnel: [
      {
        name: 'Sunita Vardhman',
        designation: 'Chief Financial Officer',
        appointedOn: '2025-02-18',
        dateOfBirth: '1977-01-22',
        qualification: 'B.Com, University of Pune; MBA (Finance)',
        remuneration: cr('0.36'),
      },
      {
        name: 'Priya Deshmukh',
        designation: 'Company Secretary and Compliance Officer',
        appointedOn: '2025-03-01',
        dateOfBirth: '1990-07-19',
        qualification: 'B.Com; Associate Member, Institute of Company Secretaries of India (A48211)',
        experienceSummary:
          'Priya Deshmukh has eight years of experience in secretarial practice, and was previously with a practising company secretary firm in Pune.',
        remuneration: cr('0.09'),
      },
    ],
    seniorManagement: [
      {
        name: 'Nitin Pawar',
        designation: 'Head of Operations',
        appointedOn: '2018-06-01',
        dateOfBirth: '1980-03-25',
        qualification: 'Diploma in Mechanical Engineering',
        experienceSummary:
          'Nitin Pawar has 20 years of experience in machine shop operations and has run the Chakan facility since 2018.',
        remuneration: cr('0.18'),
      },
      {
        name: 'Shalini Rao',
        designation: 'Head of Quality',
        appointedOn: '2020-01-15',
        dateOfBirth: '1984-12-02',
        qualification: 'B.E. (Production); Six Sigma Black Belt',
        experienceSummary:
          'Shalini Rao leads quality assurance and customer audits, and has 15 years of experience with automotive OEM suppliers.',
        remuneration: cr('0.15'),
      },
    ],
    committees: [
      {
        committee: 'AUDIT',
        constitutedOn: '2025-03-28',
        chairperson: 'Meera Kulkarni',
        members: ['Suresh Iyer', 'Rajesh Vardhman'],
      },
      {
        committee: 'NOMINATION_AND_REMUNERATION',
        constitutedOn: '2025-03-28',
        chairperson: 'Suresh Iyer',
        members: ['Meera Kulkarni', 'Arvind Joshi'],
      },
      {
        committee: 'STAKEHOLDERS_RELATIONSHIP',
        constitutedOn: '2025-03-28',
        chairperson: 'Arvind Joshi',
        members: ['Meera Kulkarni', 'Sunita Vardhman'],
      },
    ],
    // Shareholders' resolution under s.180(1)(c) at the EGM of March 28, 2025
    borrowingPowersResolutionDate: '2025-03-28',
    borrowingPowersLimit: cr('50'),
    // Matches the typical corpus pattern (Om Galaxy, Century) rather than
    // Ideas Electricals' — fires the key man insurance archetype (D48).
    hasKeyManInsurance: false,
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
        name: 'Chakan facility',
        location: 'Plot No. 42, Chakan Industrial Area, Phase II, Pune, Maharashtra',
        owned: true,
        capacity: '1,850 MT per annum of machined components',
        capacityUtilisationPercent: 78,
        areaSqFt: 42000,
      },
    ],
    employeeCount: 214,
    orderBook: cr('31.60'),
    productLines:
      'Precision machined transmission components\nAxle and differential sub-assemblies\nHydraulic valve bodies for off-highway equipment',
    exportRevenueShare: 8.4,
    // Realistic, not just convenient: the Chakan facility sits in the same
    // Pune-Chakan auto cluster as several principal customers' own plants
    // (Tata Motors, Bajaj, Mahindra all have plants in the region), so
    // revenue concentrating in Maharashtra follows from where the
    // customers already are — fires the geographic concentration risk
    // factor with a real number (D54).
    primaryMarketDescription: 'the State of Maharashtra',
    primaryMarketRevenueSharePercent: 64.5,
  },

  financials: {
    hasRestatedStatements: false,
    auditorName: 'Kalyani & Associates, Chartered Accountants',
    auditorPeerReviewNumber: 'PR-014782',
    auditorFirmRegistrationNumber: '118204W',
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
        // Cash and current investments. R-029 caps these at 50% of net
        // tangible assets; 4.20 against 19.40 is comfortably inside.
        monetaryAssets: cr('4.20'),
        totalBorrowings: cr('8.60'),
        shareholdersEquity: cr('19.40'),
        cashFlowFromOperations: cr('5.20'),
        netPurchaseOfFixedAssets: cr('3.80'),
        proceedsFromIssuanceOfCapital: cr('0'),
        netBorrowings: cr('1.40'),
        interestPaidNetOfTax: cr('0.58'),
        contingentLiabilities: cr('0.90'),
        relatedPartyTransactionsTotal: cr('2.10'),
        // Capitalisation statement lines. Current plus non-current ties to
        // total borrowings; share capital plus other equity ties to net worth.
        currentBorrowings: cr('3.50'),
        nonCurrentBorrowings: cr('5.10'),
        equityShareCapital: cr('12.00'),
        otherEquity: cr('7.40'),
        tradePayables: cr('6.80'),
        tradeReceivables: cr('9.20'),
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
        monetaryAssets: cr('3.05'),
        totalBorrowings: cr('7.20'),
        shareholdersEquity: cr('14.20'),
        cashFlowFromOperations: cr('3.10'),
        netPurchaseOfFixedAssets: cr('2.40'),
        proceedsFromIssuanceOfCapital: cr('0'),
        netBorrowings: cr('0.90'),
        interestPaidNetOfTax: cr('0.48'),
        contingentLiabilities: cr('0.62'),
        relatedPartyTransactionsTotal: cr('1.75'),
        currentBorrowings: cr('2.90'),
        nonCurrentBorrowings: cr('4.30'),
        equityShareCapital: cr('12.00'),
        otherEquity: cr('2.20'),
        tradePayables: cr('5.60'),
        tradeReceivables: cr('7.10'),
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
        monetaryAssets: cr('2.10'),
        totalBorrowings: cr('6.10'),
        shareholdersEquity: cr('9.80'),
        cashFlowFromOperations: cr('2.05'),
        netPurchaseOfFixedAssets: cr('1.60'),
        proceedsFromIssuanceOfCapital: cr('0'),
        netBorrowings: cr('0.70'),
        interestPaidNetOfTax: cr('0.39'),
        contingentLiabilities: cr('0.41'),
        relatedPartyTransactionsTotal: cr('1.20'),
        currentBorrowings: cr('2.40'),
        nonCurrentBorrowings: cr('3.70'),
        equityShareCapital: cr('1.20'),
        otherEquity: cr('8.60'),
        tradePayables: cr('4.10'),
        tradeReceivables: cr('5.30'),
      },
    ],

    // Fund-based outstanding ties to FY2026 total borrowings: 4.20 + 2.65 +
    // 0.25 + 1.50 = Rs 8.60 cr. The bank guarantee is non-fund based and
    // sits outside that total.
    borrowingsAsOn: '2026-09-30',
    borrowingsCertifiedBy: 'Kalyani & Associates, Chartered Accountants, certificate dated October 10, 2026',
    borrowings: [
      {
        lender: 'HDFC Bank Limited',
        category: 'TERM_LOAN',
        secured: true,
        fundBased: true,
        sanctionDate: '2024-09-12',
        sanctionedAmount: cr('6.00'),
        rateOfInterest: 'Repo rate + 2.55%, currently 9.05% p.a.',
        outstanding: cr('4.20'),
        repaymentTerms: '84 equal monthly instalments from October 2024',
        security:
          'Exclusive charge by hypothecation of the plant and machinery financed; personal guarantees of Rajesh Vardhman and Sunita Vardhman',
        personalGuaranteeByPromoter: true,
        purpose: 'Purchase of CNC machining centres for the Chakan facility',
      },
      {
        lender: 'HDFC Bank Limited',
        category: 'CASH_CREDIT',
        secured: true,
        fundBased: true,
        sanctionDate: '2025-11-20',
        sanctionedAmount: cr('3.00'),
        rateOfInterest: 'Repo rate + 2.75%, currently 9.25% p.a.',
        outstanding: cr('2.65'),
        repaymentTerms: 'Repayable on demand; renewed annually',
        security:
          'First charge by hypothecation of current assets; collateral charge on the Chakan factory land and building; personal guarantees of the Promoters',
        personalGuaranteeByPromoter: true,
        purpose: 'Working capital',
      },
      {
        lender: 'Bajaj Finance Limited',
        category: 'VEHICLE_LOAN',
        secured: true,
        fundBased: true,
        sanctionDate: '2023-07-05',
        sanctionedAmount: cr('0.45'),
        rateOfInterest: '8.90% p.a. fixed',
        outstanding: cr('0.25'),
        repaymentTerms: '60 equal monthly instalments from August 2023',
        security: 'Hypothecation of the vehicles financed',
        personalGuaranteeByPromoter: false,
        purpose: 'Purchase of commercial vehicles',
      },
      {
        lender: 'Rajesh Vardhman',
        category: 'UNSECURED_LOAN_FROM_DIRECTORS',
        secured: false,
        fundBased: true,
        sanctionDate: '2023-12-01',
        sanctionedAmount: cr('1.50'),
        rateOfInterest: '9.00% p.a.',
        outstanding: cr('1.50'),
        repaymentTerms: 'Repayable on demand',
        security: 'Unsecured',
        personalGuaranteeByPromoter: false,
        purpose: 'General business requirements',
      },
      {
        lender: 'HDFC Bank Limited',
        category: 'BANK_GUARANTEE',
        secured: true,
        fundBased: false,
        sanctionDate: '2025-11-20',
        sanctionedAmount: cr('0.75'),
        rateOfInterest: 'Commission at 1.25% p.a.',
        outstanding: cr('0.40'),
        repaymentTerms: 'Valid for the tenure of the underlying performance obligations',
        security: 'Counter-guarantee of our Company; 10% cash margin',
        personalGuaranteeByPromoter: false,
        purpose: 'Performance guarantees in favour of customers',
      },
    ],

    // Items tie to each year's total: 0.40 + 0.34 + 0.16 = 0.90; 0.32 + 0.30 = 0.62;
    // 0.25 + 0.16 = 0.41
    contingentLiabilityItems: [
      { particulars: 'Bank guarantees issued on behalf of our Company', amountLatest: cr('0.40'), amountPrior1: cr('0.32'), amountPrior2: cr('0.25') },
      { particulars: 'Disputed demand under the Maharashtra Goods and Services Tax Act, 2017, under appeal', amountLatest: cr('0.34'), amountPrior1: null, amountPrior2: null },
      { particulars: 'Letters of credit outstanding', amountLatest: cr('0.16'), amountPrior1: cr('0.30'), amountPrior2: cr('0.16') },
    ],

    // MSME plus other dues tie to FY2026 trade payables: 2.15 + 4.65 = Rs 6.80 cr.
    // Two creditors sit above the 5% threshold (Rs 34 lakhs).
    creditors: {
      msmeCount: 38,
      msmeAmount: cr('2.15'),
      otherCount: 61,
      otherAmount: cr('4.65'),
      materialCount: 2,
      materialAmount: cr('1.02'),
    },
  },

  legal: {
    litigation: [
      {
        party: 'COMPANY',
        partyName: 'Vardhman Precision Components Limited',
        direction: 'AGAINST',
        category: 'INDIRECT_TAX',
        counterparty: 'Deputy Commissioner of State Tax, Pune',
        forum: 'Joint Commissioner of State Tax (Appeals), Pune',
        caseNumber: 'GST/APL/2025/1187',
        amount: cr('0.34'),
        status: 'Appeal pending before the Joint Commissioner (Appeals)',
        description:
          'Demand raised on account of alleged mismatch in input tax credit claimed for the financial year 2022-23.',
      },
      {
        party: 'COMPANY',
        partyName: 'Vardhman Precision Components Limited',
        direction: 'AGAINST',
        category: 'STATUTORY_REGULATORY',
        counterparty: 'Maharashtra Pollution Control Board',
        forum: 'Maharashtra Pollution Control Board, Regional Office, Pune',
        amount: null,
        status: 'Show cause notice replied; no further communication received',
        description:
          'Show cause notice regarding effluent discharge parameters at the Chakan facility, replied to within the stipulated period.',
      },
      {
        party: 'COMPANY',
        partyName: 'Vardhman Precision Components Limited',
        direction: 'BY',
        category: 'OTHER_MATERIAL',
        counterparty: 'Shree Auto Ancillaries Private Limited',
        forum: 'Commercial Court, Pune',
        caseNumber: 'Com. Suit No. 412 of 2025',
        amount: cr('0.42'),
        status: 'Written statement filed; matter listed for framing of issues',
        description:
          'Suit for recovery of outstanding dues towards supplies made between April 2024 and January 2025, together with interest.',
      },
    ],
    materialityPolicyDate: '2026-08-14',
    materialCreditorThresholdPercent: 5,
    referredToNCLT: false,
    ibcProceedingsAgainstPromotingCompanies: false,
    windingUpPetitionAdmitted: false,
    referredToBIFR: false,
    /**
     * The pollution-control show cause notice above is NOT a regulatory action
     * for E-13 or N-09 — a notice replied to, with no order and no further
     * communication, is not an action by an exchange or a regulator against
     * the company. Litigation disclosure and eligibility are different tests,
     * and conflating them would fire a finding on an ordinary tax appeal.
     */
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

  approvals: {
    pan: 'AAECV1234C',
    tan: 'PNEV04471B',
    gstin: '27AAECV1234C1ZP',
    licences: [
      {
        name: 'Certificate of Registration under the Goods and Services Tax Act, 2017',
        authority: 'Government of Maharashtra',
        number: '27AAECV1234C1ZP',
        issuedOn: '2017-07-01',
        validUntil: null,
        category: 'TAX',
        status: 'OBTAINED',
      },
      {
        name: 'Certificate of Enrolment under the Maharashtra State Tax on Professions, Trades, Callings and Employments Act, 1975',
        authority: 'Profession Tax Officer, Pune',
        number: '27089654321P',
        issuedOn: '2016-06-14',
        validUntil: null,
        category: 'TAX',
        status: 'OBTAINED',
      },
      {
        name: 'Importer Exporter Code',
        authority: 'Directorate General of Foreign Trade',
        number: '0316012345',
        issuedOn: '2016-09-02',
        validUntil: null,
        category: 'BUSINESS',
        status: 'OBTAINED',
      },
      {
        name: 'Udyam Registration Certificate',
        authority: 'Ministry of Micro, Small and Medium Enterprises',
        number: 'UDYAM-MH-26-0012345',
        issuedOn: '2020-10-12',
        validUntil: null,
        category: 'BUSINESS',
        status: 'OBTAINED',
      },
      {
        name: 'Factory Licence under the Factories Act, 1948 read with the Maharashtra Factories Rules, 1963',
        authority: 'Directorate of Industrial Safety and Health, Maharashtra',
        number: 'PUN/CHK/2016/4421',
        issuedOn: '2025-01-03',
        validUntil: '2027-12-31',
        category: 'BUSINESS',
        unit: 'Chakan facility',
        status: 'OBTAINED',
      },
      {
        name: 'Fire Safety No Objection Certificate',
        authority: 'Chief Fire Officer, Pune Metropolitan Region Development Authority',
        number: 'PMRDA/FIRE/2025/0912',
        issuedOn: '2025-04-18',
        validUntil: '2026-04-17',
        category: 'BUSINESS',
        unit: 'Chakan facility',
        status: 'RENEWAL_APPLIED',
      },
      {
        name: 'Consent to Operate under the Water (Prevention and Control of Pollution) Act, 1974 and the Air (Prevention and Control of Pollution) Act, 1981',
        authority: 'Maharashtra Pollution Control Board',
        number: 'MPCB/CO/2024/8817',
        issuedOn: '2024-07-01',
        validUntil: '2028-06-30',
        category: 'ENVIRONMENT',
        unit: 'Chakan facility',
        status: 'OBTAINED',
      },
      {
        name: 'Registration under the Employees Provident Funds and Miscellaneous Provisions Act, 1952',
        authority: 'Employees Provident Fund Organisation',
        number: 'MHPUN1234567000',
        issuedOn: '2016-11-10',
        validUntil: null,
        category: 'LABOUR',
        status: 'OBTAINED',
      },
      {
        name: "Registration under the Employees' State Insurance Act, 1948",
        authority: "Employees' State Insurance Corporation",
        number: '33000123450001099',
        issuedOn: '2016-11-10',
        validUntil: null,
        category: 'LABOUR',
        status: 'OBTAINED',
      },
      {
        name: 'Trade mark registration for the "VARDHMAN PRECISION" device mark in Class 12',
        authority: 'Registrar of Trade Marks, Mumbai',
        number: 'Application No. 6123456',
        issuedOn: '2025-08-22',
        validUntil: null,
        category: 'INTELLECTUAL_PROPERTY',
        status: 'APPLIED',
      },
    ],
    approvalsRequiredNotObtained: null,
  },

  offer: {
    issueType: 'BOOK_BUILT',
    exchange: 'BSE_SME',
    documentStage: 'DRHP',
    terminology: 'ISSUE',

    freshIssueShares: 4500000,
    // 5.00% of the issue, and an exact 75 lots at 3,000 per lot
    marketMakerReservationShares: 225000,
    sellingShareholders: [],

    // D64: fictional peer companies, same discipline as the rest of this
    // seed (Vardhman itself is entirely synthetic) — never real, identifiable
    // listed companies with invented financials attached to their name.
    industryPeers: [
      {
        name: 'Precitech Forgings Limited',
        faceValue: money('10'),
        basicEps: '14.20',
        peRatio: '18.50',
        returnOnNetWorthPercent: 16.8,
        netAssetValuePerShare: '84.50',
      },
      {
        name: 'Chakan Auto Components Limited',
        faceValue: money('10'),
        basicEps: '9.80',
        peRatio: '22.10',
        returnOnNetWorthPercent: 12.4,
        netAssetValuePerShare: '79.20',
      },
    ],

    floorPrice: money('47'),
    capPrice: money('49'),
    // Not fixed until the book closes, so it renders as a gap. Every corpus
    // document prints it as "[dot]" at this stage too.
    issuePrice: null,
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
    // Firm finance arrangements confirmed for the plant and machinery object
    firmFinanceConfirmed: true,
    issueExpenses: cr('1.05'),

    underwritingPercent: 100,
    brlmUnderwritingPercent: 15,

    marketMakerName: 'Nikunj Stock Brokers Limited',
    marketMakingYears: 3,

    bookRunningLeadManager: 'Indorient Financial Services Limited',
    registrarToIssue: 'Bigshare Services Private Limited',
    sponsorBank: 'HDFC Bank Limited',
    escrowCollectionBank: 'ICICI Bank Limited',
    monitoringAgency: 'Brickwork Ratings India Private Limited',
    legalAdvisor: 'Kanga and Company, Advocates and Solicitors',
    isin: 'INE9V8K01015',
    // The six-month rules: neither has happened. E-10 asks about the company,
    // N-08 about the merchant banker — two different questions.
    // No Reg 300(1)(c) application; the section prints the standard negative.
    exemptionApplicationDetails: null,
    registrarAgreementDate: '2026-07-14',
    issueAgreementDate: '2026-07-02',
    // Signed before the RHP, so absent at DRHP stage, as the corpus prints them
    bankerToIssueAgreementDate: undefined,
    marketMakingAgreementDate: undefined,
    monitoringAgencyAgreementDate: '2026-08-20',
    exchangeApplicationRejectedSince: null,
    brlmDraftReturnedSince: null,

    jurisdiction: 'Mumbai, Maharashtra',
    bidOpeningDate: '2026-12-08',
    bidClosingDate: '2026-12-10',
    underwritingAgreementDate: '2026-11-28',
    boardResolutionDate: '2026-08-14',
    shareholderResolutionDate: '2026-08-28',
    boardApprovalOfDocumentDate: '2026-11-12',
    dueDiligenceCertificateDate: '2026-11-10',
    inPrincipleApprovalDate: '2026-10-22',

    englishNewspaper: 'Business Standard',
    hindiNewspaper: 'Business Standard (Hindi)',
    regionalNewspaper: 'Navshakti',

    intendedFilingDate: '2026-11-15',
  },

  groupCompanies: {
    companies: [
      {
        name: 'Vardhman Tooling Private Limited',
        cin: 'U29220MH2019PTC331204',
        relationship: 'Entity controlled by the Promoters',
        natureOfBusiness: 'Design and manufacture of jigs, fixtures and cutting tools',
        registeredOffice: 'Gat No. 118, Kuruli, Chakan, Pune 410501, Maharashtra',
        isListed: false,
        publicOrRightsIssueInLastThreeYears: false,
      },
    ],
    materialityResolutionDate: '2026-08-14',
    materialityThresholdPercent: 10,
    materialityBase: 'PROFIT_AFTER_TAX',
    relatedParties: [
      { name: 'Rajesh Vardhman', relationship: 'Chairman and Managing Director' },
      { name: 'Sunita Vardhman', relationship: 'Whole-time Director and Chief Financial Officer' },
      { name: 'Priya Deshmukh', relationship: 'Company Secretary' },
      { name: 'Anil Vardhman', relationship: 'Brother of the Managing Director' },
      { name: 'Vardhman Tooling Private Limited', relationship: 'Entity controlled by the Promoters' },
    ],
    // Each year ties to relatedPartyTransactionsTotal: 0.48 + 0.36 + 1.26 = 2.10;
    // 0.42 + 0.30 + 1.03 = 1.75; 0.36 + 0.27 + 0.57 = 1.20
    relatedPartyTransactions: [
      { nature: 'Remuneration', partyName: 'Rajesh Vardhman', amountLatest: cr('0.48'), amountPrior1: cr('0.42'), amountPrior2: cr('0.36') },
      { nature: 'Remuneration', partyName: 'Sunita Vardhman', amountLatest: cr('0.36'), amountPrior1: cr('0.30'), amountPrior2: cr('0.27') },
      { nature: 'Purchase of tooling and fixtures', partyName: 'Vardhman Tooling Private Limited', amountLatest: cr('1.26'), amountPrior1: cr('1.03'), amountPrior2: cr('0.57') },
    ],
  },
};
