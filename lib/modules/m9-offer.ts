import { z } from 'zod';
import { zDate, zIndustryPeer, zMoney, zObjectOfIssue, zPercent, zSellingShareholder } from '../facts/schema';
import type { Module } from './types';
import type { RepeaterColumn } from './repeater-spec';

/**
 * M9 — The Issue.
 *
 * Filled by the promoter with the merchant banker, once one is appointed:
 * the size and structure, the objects with their break-up, the price band,
 * and the intermediaries and dates that the boilerplate quotes in a hundred
 * places. Two hours, most of it the objects.
 *
 * This is the module the templates read most. Issue Structure, Terms of the
 * Issue, the whole of Issue Procedure and the regulatory disclosures all take
 * their variables from here, and every unanswered field in it is a gap in
 * several sections at once. The form says where each one lands.
 */

const STRUCTURE = 'issueRelated.issueStructure';
const TERMS = 'issueRelated.termsOfIssue';
const PROCEDURE = 'issueRelated.issueProcedure';
const THE_ISSUE = 'introduction.theIssue';
const OBJECTS = 'particulars.objectsOfTheIssue';
const DEFINITIONS = 'general.definitions';
const AUTHORITY = 'regulatory.authority';
const DISCLAIMERS = 'regulatory.disclaimers';
const CONSENTS = 'regulatory.consents';
const APPROVALS = 'legal.approvals';
const MATERIAL_CONTRACTS = 'other.materialContracts';
const BASIS_FOR_ISSUE_PRICE = 'particulars.basisForIssuePrice';

export const OBJECT_COLUMNS: RepeaterColumn[] = [
  { key: 'description', label: 'Object', type: 'text', width: '24rem' },
  { key: 'amount', label: 'Amount (Rs)', type: 'money', total: true, width: '10rem' },
  { key: 'isGeneralCorporatePurposes', label: 'General corporate purposes?', type: 'boolean', width: '7rem' },
  { key: 'isProject', label: 'A project (capex)?', type: 'boolean', width: '7rem' },
  { key: 'involvesPromoterLoanRepayment', label: 'Repays a promoter or related-party loan?', type: 'boolean', width: '7rem' },
];

export const SELLING_SHAREHOLDER_COLUMNS: RepeaterColumn[] = [
  { key: 'name', label: 'Selling shareholder', type: 'text', width: '14rem' },
  {
    key: 'type',
    label: 'Category',
    type: 'select',
    width: '10rem',
    options: [
      { value: 'PROMOTER', label: 'Promoter' },
      { value: 'PROMOTER_GROUP', label: 'Promoter group' },
      { value: 'OTHER', label: 'Other' },
    ],
  },
  { key: 'sharesOffered', label: 'Shares offered', type: 'number', total: true, width: '8rem' },
  { key: 'preIssueShares', label: 'Pre-issue holding (shares)', type: 'number', width: '8rem' },
  { key: 'weightedAverageCostOfAcquisition', label: 'Weighted average cost (Rs)', type: 'money', width: '8rem' },
];

export const INDUSTRY_PEER_COLUMNS: RepeaterColumn[] = [
  { key: 'name', label: 'Listed peer company', type: 'text', width: '16rem' },
  { key: 'faceValue', label: 'Face value (Rs)', type: 'money', width: '7rem' },
  { key: 'basicEps', label: 'Basic EPS (Rs)', type: 'text', width: '7rem' },
  { key: 'peRatio', label: 'P/E ratio', type: 'text', width: '7rem' },
  { key: 'returnOnNetWorthPercent', label: 'RoNW (%)', type: 'number', width: '7rem' },
  { key: 'netAssetValuePerShare', label: 'NAV per share (Rs)', type: 'text', width: '8rem' },
];

const optionalName = z.string().min(3);

export const m9Offer: Module = {
  id: 'M9',
  title: 'The Issue',
  estimatedMinutes: 120,
  assignableTo: 'PROMOTER',
  dependsOn: ['M1', 'M2', 'M6'],
  requestsDocuments: [
    'Board and shareholder resolutions authorising the issue',
    'The merchant banker’s engagement letter and the objects working',
    'Quotations and the chartered engineer’s certificate for any capital expenditure object',
    'Appointment letters of the registrar, market maker, banker, legal advisor and sponsor bank',
  ],
  purpose:
    'The size and structure of the issue, the objects, the price band, and the intermediaries and dates the boilerplate quotes throughout. The templates read this module more than any other.',
  fields: [
    {
      path: 'offer.exchange',
      label: 'SME platform',
      type: 'select',
      options: [
        { value: 'BSE_SME', label: 'BSE SME' },
        { value: 'NSE_EMERGE', label: 'NSE Emerge' },
      ],
      schema: z.enum(['BSE_SME', 'NSE_EMERGE']),
      helpText:
        'The exchange decides which eligibility rules apply — BSE tests net tangible assets and leverage, NSE tests free cash flow — and switches the disclaimers, the listing paragraphs and the name of the designated stock exchange throughout.',
      clause: 'R-021 (Reg 230(1)(a))',
      feedsInto: [DISCLAIMERS, STRUCTURE, TERMS, PROCEDURE, DEFINITIONS],
    },
    {
      path: 'offer.issueType',
      label: 'Issue type',
      type: 'select',
      options: [
        { value: 'BOOK_BUILT', label: 'Book built' },
        { value: 'FIXED_PRICE', label: 'Fixed price' },
      ],
      schema: z.enum(['BOOK_BUILT', 'FIXED_PRICE']),
      helpText:
        'Seven of the eight corpus prospectuses are book built, and that is the branch built first. Fixed price changes the cover page, the basis for issue price, issue structure and the application procedure; those variants are not drafted yet.',
      clause: 'D15',
      feedsInto: [STRUCTURE, TERMS, PROCEDURE, DEFINITIONS],
    },
    {
      path: 'offer.documentStage',
      label: 'Which document is being drafted',
      type: 'select',
      options: [
        { value: 'DRHP', label: 'Draft Red Herring Prospectus' },
        { value: 'RHP', label: 'Red Herring Prospectus' },
        { value: 'PROSPECTUS', label: 'Prospectus' },
      ],
      schema: z.enum(['DRHP', 'RHP', 'PROSPECTUS']),
      helpText:
        'The document names itself dozens of times. A book-built issue runs Draft Red Herring Prospectus, then Red Herring Prospectus once the exchange has given in-principle approval, then Prospectus once the price is fixed.',
      feedsInto: [DEFINITIONS, 'general.conventions', DISCLAIMERS],
    },
    {
      path: 'offer.terminology',
      label: 'House style: "Issue" or "Offer"',
      type: 'select',
      options: [
        { value: 'ISSUE', label: 'Issue (most SME documents)' },
        { value: 'OFFER', label: 'Offer' },
      ],
      schema: z.enum(['ISSUE', 'OFFER']),
      helpText:
        'Four of five corpus documents say "the Issue", "Objects of the Issue", "Issue Procedure". One says "Offer". Same content, one word, chosen once here and applied everywhere.',
      feedsInto: [DEFINITIONS, STRUCTURE, TERMS, PROCEDURE],
    },
    {
      path: 'offer.freshIssueShares',
      label: 'Equity Shares in the fresh issue',
      type: 'number',
      suffix: 'shares',
      schema: z.number().int().nonnegative(),
      helpText:
        'The number of new Equity Shares the company will issue. With the price band it gives the issue size; with pre-issue capital it gives the post-issue capital that decides the Regulation 229 limb, the 25% minimum public offer test and the promoter contribution.',
      clause: 'R-001 (Reg 229); R-023 (SCRR Rule 19(2)(b))',
      feedsInto: [THE_ISSUE, STRUCTURE, 'capital.structure', DEFINITIONS],
    },
    {
      path: 'offer.marketMakerReservationShares',
      label: 'Equity Shares reserved for the Market Maker',
      type: 'number',
      suffix: 'shares',
      schema: z.number().int().nonnegative(),
      helpText:
        'Every SME issue reserves a portion for the market maker, who must provide two-way quotes for three years. Observed at about 5% of the issue, rounded to whole lots. The Net Issue is the issue less this, and the QIB, NII and individual portions are percentages of the Net Issue.',
      clause: 'R-004 (Reg 261(1))',
      feedsInto: [THE_ISSUE, STRUCTURE, PROCEDURE],
    },
    {
      path: 'offer.lotSize',
      label: 'Lot size',
      type: 'number',
      suffix: 'shares per lot',
      schema: z.number().int().positive(),
      helpText:
        'The minimum application is two lots, and two lots at the floor price must exceed Rs 2,00,000 — that is the SME regime’s deliberate retail filter. The lot size is set so the arithmetic works at the floor of the band.',
      clause: 'R-006 (Reg 267)',
      feedsInto: [THE_ISSUE, STRUCTURE, TERMS, PROCEDURE],
    },
    {
      path: 'offer.floorPrice',
      label: 'Floor price (Rs)',
      type: 'currency',
      schema: zMoney,
      helpText:
        'The bottom of the price band. Left blank until the band is fixed, and the document prints a gap wherever it appears — which is how the corpus documents print it at draft stage too.',
      feedsInto: [THE_ISSUE, STRUCTURE, TERMS, PROCEDURE],
    },
    {
      path: 'offer.capPrice',
      label: 'Cap price (Rs)',
      type: 'currency',
      schema: zMoney,
      helpText:
        'The top of the band, and the price the issue size and gross proceeds are stated at. The objects plus issue expenses must equal the fresh issue at the cap price; a consistency rule checks it.',
      feedsInto: [THE_ISSUE, STRUCTURE, TERMS, PROCEDURE, OBJECTS],
    },
    {
      path: 'offer.objects',
      label: 'Objects of the issue',
      type: 'table',
      schema: z.array(zObjectOfIssue),
      columns: OBJECT_COLUMNS,
      helpText:
        'What the net proceeds will be applied to, with the amount for each. Three flags matter: general corporate purposes is capped at 15% of gross proceeds or Rs 10 crore, whichever is lower; a capital expenditure object needs firm finance for 75% of the stated means and a chartered engineer’s certificate; and repaying a loan from a promoter or related party out of the proceeds is prohibited outright. Issue expenses are a separate line, not an object.',
      clause: 'R-010 (Reg 230(2)); R-011 (Reg 230(1)(h)); R-022 (Reg 230(1)(e))',
      feedsInto: [OBJECTS, 'regulatory.statutoryStatements', DEFINITIONS],
    },
    {
      path: 'offer.issueExpenses',
      label: 'Estimated issue expenses (Rs)',
      type: 'currency',
      schema: zMoney,
      helpText:
        'Fees to the merchant banker, registrar, legal advisor, market maker, the exchange and SEBI, printing and advertising. Stated separately from the objects, and excluded from general corporate purposes. Objects plus expenses must equal the issue size at the cap price.',
      clause: 'R-010 (Reg 230(2))',
      feedsInto: [OBJECTS, 'regulatory.jurisdiction'],
    },
    {
      path: 'offer.objectsAppraisedByBankOrAgency',
      label: 'Have the objects of the Issue been appraised by a bank, financial institution or independent agency?',
      type: 'boolean',
      schema: z.boolean(),
      helpText:
        'Almost never done for an SME raise — the cost of a formal appraisal rarely justifies itself against the size of the issue — which is why every corpus prospectus checked states this as a risk factor in near-identical words. Answering no (the common case) fires that risk factor; answering yes because a bank genuinely appraised the funded project mutes it.',
      feedsInto: [OBJECTS, 'general.riskFactors'],
    },
    {
      path: 'offer.firmFinanceConfirmed',
      label: 'Are firm arrangements of finance in place for 75% of the stated means of finance, excluding the issue proceeds and internal accruals?',
      type: 'boolean',
      schema: z.boolean(),
      helpText:
        'Only where an object is a project. The regulation requires verifiable arrangements — sanction letters — for three quarters of whatever the project needs beyond the issue and existing accruals. Answering no keeps a finding open until the sanctions are in hand.',
      clause: 'R-022 (Reg 230(1)(e))',
      feedsInto: [OBJECTS, 'regulatory.statutoryStatements'],
      showIf: (f) => (f.offer?.objects ?? []).some((o) => o?.isProject === true),
    },
    {
      path: 'offer.sellingShareholders',
      label: 'Offer for sale',
      type: 'table',
      schema: z.array(zSellingShareholder),
      columns: SELLING_SHAREHOLDER_COLUMNS,
      helpText:
        'Leave empty for a pure fresh issue. Where existing shareholders sell, the offer for sale may not exceed 20% of the total issue, and no seller may offer more than half of their pre-issue holding on a fully diluted basis. Each seller’s weighted average cost of acquisition is printed.',
      clause: 'R-008 (Reg 230(1)(f), 230(1)(g))',
      feedsInto: [THE_ISSUE, STRUCTURE, 'capital.structure'],
    },
    {
      path: 'offer.industryPeers',
      label: 'Comparison with listed industry peers',
      type: 'table',
      schema: z.array(zIndustryPeer),
      columns: INDUSTRY_PEER_COLUMNS,
      helpText:
        'The quantitative half of Basis for Issue Price: two or three listed companies in the same line of business, with their own latest EPS, P/E ratio, return on net worth and NAV per share — from their own published financial results, not ours. Our own EPS, RoNW and NAV are already computed from M6 and M2 and need no separate entry here. Leave empty until the merchant banker has identified comparable listed peers; the section renders a gap until then.',
      clause: 'ICDR Schedule VI Part A, item 11(3) — basis for issue price',
      feedsInto: [BASIS_FOR_ISSUE_PRICE],
    },
    {
      path: 'offer.brlmUnderwritingPercent',
      label: 'Share of the issue the Book Running Lead Manager underwrites on its own account',
      type: 'percent',
      suffix: '% of the issue',
      schema: zPercent,
      helpText:
        'The issue must be 100% underwritten, and the lead manager must take at least 15% of it on its own book. The figure is quoted in the underwriting paragraph.',
      clause: 'R-003 (Reg 260)',
      feedsInto: [TERMS, 'regulatory.authority'],
      validate: (value) =>
        typeof value === 'number' && value < 15 ? ['Regulation 260 requires at least 15%.'] : [],
    },
    {
      path: 'offer.bookRunningLeadManager',
      label: 'Book Running Lead Manager',
      type: 'text',
      schema: optionalName,
      helpText:
        'The merchant banker, by its full registered name. Named on the cover, in the glossary, in every procedure paragraph and in the due diligence certificate. Its SEBI registration number goes in General Information.',
      feedsInto: [DEFINITIONS, PROCEDURE, DISCLAIMERS, CONSENTS],
    },
    {
      path: 'offer.registrarToIssue',
      label: 'Registrar to the Issue',
      type: 'text',
      schema: optionalName,
      helpText:
        'The registrar handles applications, allotment and refunds, and is party to the tripartite agreements with the depositories. Named in the glossary, the grievance mechanism and the approvals section.',
      feedsInto: [DEFINITIONS, CONSENTS, APPROVALS],
    },
    {
      path: 'offer.registrarAgreementDate',
      label: 'Date of the agreement with the Registrar',
      type: 'date',
      schema: zDate,
      helpText: 'Quoted in "Fees Payable to the Registrar to the Issue", which refers to the agreement rather than restating the fee, and listed with the material contracts.',
      feedsInto: ['regulatory.jurisdiction', MATERIAL_CONTRACTS],
    },
    {
      path: 'offer.issueAgreementDate',
      label: 'Date of the Issue Agreement with the Book Running Lead Manager',
      type: 'date',
      schema: zDate,
      helpText:
        'The engagement agreement with the merchant banker, the first of the material contracts listed for inspection. Signed when the banker is appointed, so it usually exists at draft stage.',
      feedsInto: [MATERIAL_CONTRACTS],
    },
    {
      path: 'offer.bankerToIssueAgreementDate',
      label: 'Date of the Banker to the Issue Agreement',
      type: 'date',
      schema: zDate,
      helpText:
        'Between the company, the lead manager, the banker to the issue and the registrar. Signed before the red herring prospectus, so a gap at draft stage — which is how the corpus prints it.',
      feedsInto: [MATERIAL_CONTRACTS],
    },
    {
      path: 'offer.marketMakingAgreementDate',
      label: 'Date of the Market Making Agreement',
      type: 'date',
      schema: zDate,
      helpText:
        'Between the company, the lead manager and the market maker, committing the market maker to three years of two-way quotes. Signed before the red herring prospectus.',
      clause: 'R-004 (Reg 261(1))',
      feedsInto: [MATERIAL_CONTRACTS],
    },
    {
      path: 'offer.monitoringAgencyAgreementDate',
      label: 'Date of the Monitoring Agency Agreement',
      type: 'date',
      schema: zDate,
      helpText: 'Where a monitoring agency has been appointed, its agreement is listed with the material contracts.',
      feedsInto: [MATERIAL_CONTRACTS],
      showIf: (f) => Boolean(f.offer?.monitoringAgency),
    },
    {
      path: 'offer.auditorExaminationReportDate',
      label: 'Date of the auditor’s examination report on the restated financials',
      type: 'date',
      schema: zDate,
      helpText:
        'The peer-reviewed auditor’s report on the Restated Financial Information, listed among the material documents and cited in the experts’ consents. Exists once the restatement is delivered.',
      feedsInto: [MATERIAL_CONTRACTS, 'regulatory.jurisdiction'],
      showIf: (f) => f.financials?.hasRestatedStatements === true,
    },
    {
      path: 'offer.taxBenefitsStatementDate',
      label: 'Date of the statement of special tax benefits',
      type: 'date',
      schema: zDate,
      helpText:
        'The auditor’s statement of the tax benefits available to the company and its shareholders, delivered with the restated financials and listed among the material documents.',
      feedsInto: [MATERIAL_CONTRACTS, 'particulars.taxBenefits'],
      showIf: (f) => f.financials?.hasRestatedStatements === true,
    },
    {
      path: 'offer.marketMakerName',
      label: 'Market Maker',
      type: 'text',
      schema: optionalName,
      helpText:
        'The SEBI-registered stock broker appointed to provide two-way quotes for at least three years from listing. Named in the glossary and the market making paragraph.',
      clause: 'R-004 (Reg 261(1))',
      feedsInto: [DEFINITIONS, STRUCTURE, TERMS],
    },
    {
      path: 'offer.sponsorBank',
      label: 'Sponsor Bank',
      type: 'text',
      schema: optionalName,
      helpText:
        'The SCSB appointed as the conduit between the exchange and NPCI for UPI mandates. Named in the UPI subsection of Issue Procedure; prints as a gap until appointed.',
      feedsInto: [PROCEDURE, DEFINITIONS],
    },
    {
      path: 'offer.escrowCollectionBank',
      label: 'Escrow Collection Bank / Banker to the Issue',
      type: 'text',
      schema: optionalName,
      helpText: 'The bank that holds the anchor investor escrow account and the public issue account. Named in the glossary and in the payment mechanism.',
      feedsInto: [DEFINITIONS, PROCEDURE],
    },
    {
      path: 'offer.anchorEscrowAccountResident',
      label: 'Name of the escrow account for resident Anchor Investors',
      type: 'text',
      schema: optionalName,
      helpText:
        'Exactly as the bank opened it. Three corpus documents spell the convention three different ways, so it cannot be derived from the company name — a wrong account name misdirects anchor money. Leave blank until the account exists; it prints as a gap.',
      clause: 'D28',
      feedsInto: [PROCEDURE],
    },
    {
      path: 'offer.anchorEscrowAccountNonResident',
      label: 'Name of the escrow account for non-resident Anchor Investors',
      type: 'text',
      schema: optionalName,
      helpText: 'As for the resident account: exactly as the bank opened it, and a gap until then. Non-resident anchor investors pay through this account.',
      clause: 'D28',
      feedsInto: [PROCEDURE],
    },
    {
      path: 'offer.legalAdvisor',
      label: 'Legal Advisor to the Issue',
      type: 'text',
      schema: optionalName,
      helpText: 'Named in the glossary and in General Information with its address and contact details, as one of the intermediaries to the issue.',
      feedsInto: [DEFINITIONS],
    },
    {
      path: 'offer.monitoringAgency',
      label: 'Monitoring Agency',
      type: 'text',
      schema: optionalName,
      helpText:
        'Required where the issue size exceeds Rs 100 crore, and appointed voluntarily by some smaller issuers. Named in the glossary and Objects of the Issue where it exists.',
      feedsInto: [DEFINITIONS, OBJECTS],
    },
    {
      path: 'offer.isin',
      label: 'ISIN of the Equity Shares',
      type: 'text',
      schema: z.string().regex(/^INE[0-9A-Z]{9}$/, 'An ISIN is "INE" followed by nine characters'),
      placeholder: 'INE9V8K01015',
      helpText: 'Allotted by the depository once the shares are admitted. Quoted in the glossary and the approvals section.',
      feedsInto: [DEFINITIONS, APPROVALS],
    },
    {
      path: 'offer.jurisdiction',
      label: 'Courts with exclusive jurisdiction for the issue',
      type: 'text',
      schema: optionalName,
      placeholder: 'Mumbai, Maharashtra',
      helpText:
        'The seat of the High Court whose courts have exclusive jurisdiction — not the registered office city. A Thane company names Mumbai. Asked rather than derived, since the mapping from district to bench is not one to guess at.',
      feedsInto: ['regulatory.jurisdiction'],
    },
    {
      path: 'offer.boardResolutionDate',
      label: 'Date of the board resolution authorising the issue',
      type: 'date',
      schema: zDate,
      helpText: 'The first of three authority dates the document quotes: the board authorises the issue, subject to the shareholders approving it by special resolution.',
      clause: 'Companies Act 2013, s.62(1)(c)',
      feedsInto: [AUTHORITY, APPROVALS],
    },
    {
      path: 'offer.shareholderResolutionDate',
      label: 'Date of the shareholders’ special resolution under Section 62(1)(c)',
      type: 'date',
      schema: zDate,
      helpText: 'The special resolution at a general meeting authorising the further issue to the public.',
      clause: 'Companies Act 2013, s.62(1)(c)',
      feedsInto: [AUTHORITY, APPROVALS],
    },
    {
      path: 'offer.boardApprovalOfDocumentDate',
      label: 'Date of the board resolution approving this offer document',
      type: 'date',
      schema: zDate,
      helpText: 'The board approves the text of the draft offer document before it is filed with the exchange. The third of the three authority dates.',
      feedsInto: [AUTHORITY, APPROVALS],
    },
    {
      path: 'offer.dueDiligenceCertificateDate',
      label: 'Date of the Book Running Lead Manager’s due diligence certificate',
      type: 'date',
      schema: zDate,
      helpText:
        'The lead manager furnishes SEBI a due diligence certificate in the Schedule V(A) format, with the site visit report annexed. Its date is quoted in the SEBI disclaimer clause.',
      clause: 'R-016 (Reg 246(3))',
      feedsInto: [DISCLAIMERS],
    },
    {
      path: 'offer.inPrincipleApprovalDate',
      label: 'Date of the exchange’s in-principle approval letter',
      type: 'date',
      schema: zDate,
      helpText:
        'The letter permitting use of the exchange’s name in the document. Does not exist at DRHP stage — it prints as a gap until the exchange issues it, which is correct.',
      feedsInto: [DISCLAIMERS, APPROVALS],
      showIf: (f) => f.offer?.documentStage !== 'DRHP',
    },
    {
      path: 'offer.underwritingAgreementDate',
      label: 'Date of the Underwriting Agreement',
      type: 'date',
      schema: zDate,
      helpText: 'Quoted in the underwriting paragraph in Terms of the Issue. The agreement is signed before the RHP is filed, so it is a gap at draft stage.',
      clause: 'R-003 (Reg 260)',
      feedsInto: [TERMS, AUTHORITY],
    },
    {
      path: 'offer.bidOpeningDate',
      label: 'Bid / Issue Opening Date',
      type: 'date',
      schema: zDate,
      helpText: 'Fixed at RHP stage. The bid period is at least three and at most ten working days, and anchor investors bid on the working day before it opens.',
      feedsInto: [STRUCTURE, TERMS, PROCEDURE],
      showIf: (f) => f.offer?.documentStage !== 'DRHP',
    },
    {
      path: 'offer.bidClosingDate',
      label: 'Bid / Issue Closing Date',
      type: 'date',
      schema: zDate,
      helpText: 'Fixed at RHP stage, with the opening date. The bid period may be extended by up to three working days on a revision of the price band.',
      feedsInto: [STRUCTURE, TERMS, PROCEDURE],
      showIf: (f) => f.offer?.documentStage !== 'DRHP',
    },
    {
      path: 'offer.englishNewspaper',
      label: 'English national daily for the pre-issue advertisement',
      type: 'text',
      schema: optionalName,
      helpText:
        'The price band and bid period are advertised in an English national daily, a Hindi national daily and a regional daily in the language of the registered office state, each with wide circulation.',
      feedsInto: [PROCEDURE],
    },
    {
      path: 'offer.hindiNewspaper',
      label: 'Hindi national daily',
      type: 'text',
      schema: optionalName,
      helpText: 'A Hindi national daily with wide circulation, as above; both the price band advertisement and any revision appear in it.',
      feedsInto: [PROCEDURE],
    },
    {
      path: 'offer.regionalNewspaper',
      label: 'Regional daily',
      type: 'text',
      schema: optionalName,
      helpText:
        'In the regional language of the state where the registered office is — Marathi for Maharashtra, Gujarati for Gujarat. The document names the language; it is derived from the address in M1.',
      feedsInto: [PROCEDURE],
    },
    {
      path: 'offer.expertConsents',
      label: 'Expert consents obtained',
      type: 'longtext',
      schema: z.string().min(10),
      placeholder: 'The statutory auditor, by consent dated ..., for the examination report and the statement of tax benefits; ...',
      helpText:
        'Everyone whose report or certificate appears in the document is an "expert" under Section 2(38) of the Companies Act and must consent: the statutory auditor, the chartered engineer for a capex object, the practising company secretary. State each with the date and what the consent covers.',
      clause: 'Companies Act 2013, s.26(5)',
      feedsInto: ['regulatory.jurisdiction'],
    },
    {
      path: 'offer.exemptionApplicationDetails',
      label: 'Any application to SEBI for exemption from a disclosure requirement?',
      type: 'longtext',
      schema: z.string().nullable(),
      placeholder: 'The particulars, where there are any',
      helpText:
        'Under Regulation 300(1)(c) an issuer may seek exemption from a disclosure. Almost none do; the section prints the standard negative for a blank. Where one was made, state it and SEBI’s response.',
      clause: 'ICDR Reg 300(1)(c)',
      feedsInto: ['regulatory.statutoryStatements'],
    },
    {
      path: 'offer.exchangeApplicationRejectedSince',
      label: 'Date the exchange last rejected this company’s own listing application, if ever',
      type: 'date',
      schema: zDate.nullable(),
      helpText:
        'BSE SME will not consider an application within six complete months of rejecting one from the same company. Choose "None" if it has not happened.',
      clause: 'E-10',
      feedsInto: ['regulatory.statutoryStatements'],
      showIf: (f) => f.offer?.exchange === 'BSE_SME',
    },
    {
      path: 'offer.brlmDraftReturnedSince',
      label: 'Date NSE last returned a draft offer document filed by this merchant banker, if ever',
      type: 'date',
      schema: zDate.nullable(),
      helpText:
        'NSE Emerge’s six-month rule is about the MERCHANT BANKER, not the company: none of the lead managers may have had a draft returned in the past six months. Ask the banker. Choose "None" if not.',
      clause: 'N-08',
      feedsInto: ['regulatory.statutoryStatements'],
      showIf: (f) => f.offer?.exchange === 'NSE_EMERGE',
    },
    {
      path: 'offer.intendedFilingDate',
      label: 'Intended date of filing the draft offer document',
      type: 'date',
      schema: zDate,
      helpText:
        'The look-back windows in the exchange criteria — six months, one year, three years — are measured from the application, not from today. An issuer planning to file in four months needs to know whether a window will still be open then.',
      feedsInto: ['regulatory.statutoryStatements'],
    },
  ],
};
