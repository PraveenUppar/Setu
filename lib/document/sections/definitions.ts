import type { DocumentNode } from '../nodes';
import { derivedTerms, type RenderContext, type SectionSpec } from '../section';
import { ABBREVIATIONS } from './abbreviations';

/**
 * DEFINITIONS AND ABBREVIATIONS — 16-17 pages, and a different shape from
 * every other section: a two-column glossary, not prose.
 *
 * So it is COMPUTED over a registry rather than templated. Each entry is one
 * of three kinds:
 *
 *   fact     — derived from the fact base (company name, registered office,
 *              auditors, bankers). These MUST be per-issuer.
 *   standard — invariant, drawn from ICDR or the Companies Act. Static data.
 *   sector   — sector-specific technical and industry terms.
 *
 * Extraction, 2026-09-10: 215 term/description pairs pulled from Om Galaxy RHP
 * pp.6-24 using `pdftotext -table` with per-page column detection (see the
 * `template-extraction` skill). Saved to
 * `fixtures/definitions/om-galaxy-definitions.json`.
 *
 * STATUS: partial, and it says so through a gap. 78 entries are authored —
 * company and governance, issue mechanics, bidding process and intermediaries.
 * Roughly 130 remain, mostly conventional abbreviations and sector terms.
 *
 * They are NOT a bulk import. Per D21, a filter that tried to separate
 * reusable glossary text from issuer-specific text passed 31 of 207 entries,
 * and three of those still carried Om Galaxy's face value, its auditor's
 * registration number and its exchange. Issuer specifics are often bare
 * numbers and codes, not capitalised proper nouns, so no regex catches them —
 * and the result reads perfectly while being wrong.
 *
 * So every entry here was READ in full from the corpus and authored: issuer
 * facts either stripped where incidental or substituted where structural.
 * `scripts/build-glossary.mjs` remains as a triage tool for working through
 * the rest; its output is a review queue, never a source.
 */

type DefinitionKind = 'fact' | 'standard' | 'sector';

export interface Definition {
  term: string;
  kind: DefinitionKind;
  /**
   * Whether the term applies to this issuer at all. A company with no separate
   * corporate office and no group companies simply does not define those terms
   * — the entry is absent from a real glossary, not shown as missing.
   *
   * This is the distinction between NOT APPLICABLE and MISSING, and conflating
   * them puts noise in the gap list: an issuer told to supply a corporate
   * office it does not have will go looking for one.
   */
  appliesIf?: (ctx: RenderContext) => boolean;
  /** Returns the description, or null when the underlying fact IS missing. */
  describe: (ctx: RenderContext) => string | null;
}

const FACT_DEFINITIONS: Definition[] = [
  {
    term: 'Our Company, the Company, the Issuer',
    kind: 'fact',
    describe: ({ facts }) => {
      const o = facts.company.registeredOffice;
      return (
        `${facts.company.name}, a public limited company incorporated under the ` +
        `${facts.company.incorporatedUnder === 'COMPANIES_ACT_1956' ? 'Companies Act, 1956' : 'Companies Act, 2013'}, ` +
        `having its Registered Office at ${o.line1}${o.line2 ? ', ' + o.line2 : ''}, ${o.city}, ` +
        `${o.state} ${o.pincode}, ${o.country}`
      );
    },
  },
  {
    term: '"we", "us" and "our"',
    kind: 'fact',
    describe: () =>
      'Unless the context otherwise indicates or implies, refers to our Company',
  },
  {
    term: 'AOA, Articles, Articles of Association',
    kind: 'standard',
    describe: () => 'The Articles of Association of our Company, as amended from time to time',
  },
  {
    term: 'MOA, Memorandum, Memorandum of Association',
    kind: 'standard',
    describe: () => 'The Memorandum of Association of our Company, as amended from time to time',
  },
  {
    term: 'Board of Directors, the Board',
    kind: 'fact',
    describe: ({ facts }) =>
      facts.management.directors.length > 0
        ? 'The board of directors of our Company, as described in "Our Management"'
        : null,
  },
  {
    term: 'Company Secretary and Compliance Officer',
    kind: 'fact',
    describe: ({ facts }) => facts.company.companySecretary?.name ?? null,
  },
  {
    term: 'Statutory Auditors, Peer Review Auditor',
    kind: 'fact',
    describe: ({ facts }) => facts.financials.auditorName ?? null,
  },
  {
    term: 'Registrar of Companies, RoC',
    kind: 'fact',
    describe: ({ facts }) => `Registrar of Companies, ${facts.company.registeredOffice.state}`,
  },
  {
    term: 'Promoters',
    kind: 'fact',
    describe: ({ facts }) =>
      facts.promoters.promoters.length > 0
        ? `The promoters of our Company, namely ${facts.promoters.promoters.map((p) => p.name).join(', ')}. ` +
          'For details, see "Our Promoters and Promoter Group"'
        : null,
  },
  {
    term: 'Equity Shares',
    kind: 'fact',
    describe: ({ facts }) =>
      `Equity shares of our Company of face value of Rs ${facts.capital.faceValue} each`,
  },
  {
    term: 'Book Running Lead Manager, BRLM',
    kind: 'fact',
    describe: ({ facts }) => facts.offer.bookRunningLeadManager ?? null,
  },
  {
    term: 'Registrar to the Issue',
    kind: 'fact',
    describe: ({ facts }) => facts.offer.registrarToIssue ?? null,
  },
  {
    term: 'Market Maker',
    kind: 'fact',
    describe: ({ facts }) => facts.offer.marketMakerName ?? null,
  },
  {
    term: 'Stock Exchange, Designated Stock Exchange',
    kind: 'fact',
    describe: ({ facts }) => derivedTerms(facts).designatedStockExchange,
  },
  {
    term: 'Floor Price',
    kind: 'fact',
    describe: ({ facts }) =>
      facts.offer.floorPrice
        ? `Rs ${facts.offer.floorPrice} per Equity Share, being the lower end of the Price Band`
        : null,
  },
  {
    term: 'Cap Price',
    kind: 'fact',
    describe: ({ facts }) =>
      facts.offer.capPrice
        ? `Rs ${facts.offer.capPrice} per Equity Share, being the higher end of the Price Band`
        : null,
  },
  {
    term: 'Net Issue',
    kind: 'fact',
    appliesIf: ({ facts }) => derivedTerms(facts).marketMakerShares > 0,
    describe: ({ facts }) =>
      `The ${derivedTerms(facts).issueWord} less the Market Maker Reservation Portion`,
  },
];

/**
 * Issue-related definitions, authored deliberately per D21 rather than bulk
 * copied. Each was read in full from the corpus and any issuer fact either
 * stripped (where incidental) or substituted (where structural).
 *
 * What was stripped, and why it mattered:
 *   Bid Lot        Om Galaxy states "1,600 equity shares" - its own lot size
 *   Price Band     states its own Rs 85 / Rs 90 and names its own newspapers
 *   Working Day    scoped to banks in Mumbai - its own jurisdiction
 *   Stock Exchange "refers to, BSE Limited" - its own exchange
 *
 * A regex filter passed three of these as safe. Reading them did not.
 */
const ISSUE_DEFINITIONS: Definition[] = [
  {
    term: 'Allottee(s)',
    kind: 'standard',
    describe: () => 'A successful Bidder to whom the Equity Shares are Allotted',
  },
  {
    term: 'Allotment Advice',
    kind: 'standard',
    describe: () =>
      'A note, advice or intimation of Allotment sent to the successful Bidders who have been or are to be Allotted the Equity Shares after the Basis of Allotment has been approved by the Designated Stock Exchange',
  },
  {
    term: 'Anchor Investor Portion',
    kind: 'standard',
    describe: () =>
      'Up to 60% of the QIB Portion, which may be allocated by our Company in consultation with the Book Running Lead Manager to Anchor Investors on a discretionary basis in accordance with the SEBI ICDR Regulations, of which 33.33% is reserved for domestic Mutual Funds and 6.67% for life insurance companies and pension funds',
  },
  {
    term: 'ASBA Account',
    kind: 'standard',
    describe: () =>
      'A bank account maintained by an ASBA Bidder with an SCSB and specified in the ASBA Form, in which funds will be blocked by that SCSB to the extent of the Bid Amount',
  },
  {
    term: 'Bid Amount',
    kind: 'fact',
    describe: ({ facts }) =>
      `The amount at which a Bidder makes a Bid for the Equity Shares of our Company in terms of this ${derivedTerms(facts).documentName}`,
  },
  {
    term: 'Bid Lot',
    kind: 'fact',
    describe: ({ facts }) =>
      `${facts.offer.lotSize} Equity Shares, and in multiples of ${facts.offer.lotSize} Equity Shares thereafter`,
  },
  {
    term: 'Cut-off Price',
    kind: 'standard',
    describe: () =>
      'The Issue Price, being any price within the Price Band as finalised by our Company in consultation with the Book Running Lead Manager. Only Individual Investors are entitled to Bid at the Cut-off Price; QIBs, including Anchor Investors, and Non-Institutional Investors are not',
  },
  {
    term: 'Designated Date',
    kind: 'standard',
    describe: () =>
      'The date on which the relevant amounts are transferred from the ASBA Accounts to the Public Issue Account or the Refund Account, as the case may be, or on which instructions are issued to the SCSBs, and in the case of UPI Bidders through the Sponsor Bank, for the transfer of such amounts',
  },
  {
    term: 'Escrow Account(s)',
    kind: 'standard',
    describe: () =>
      'The account opened with the Escrow Collection Bank, in whose favour Anchor Investors transfer money in respect of the Bid Amount when submitting a Bid',
  },
  {
    term: 'General Information Document, GID',
    kind: 'standard',
    describe: () =>
      'The General Information Document for investing in public issues, prepared and issued in accordance with the SEBI circular dated March 17, 2020 and the UPI Circulars, available on the websites of the Stock Exchange and the Book Running Lead Manager',
  },
  {
    term: 'Net Proceeds',
    kind: 'standard',
    describe: () => 'The Gross Proceeds received from the Fresh Issue less the issue related expenses',
  },
  {
    term: 'Price Band',
    kind: 'fact',
    describe: ({ facts }) =>
      facts.offer.floorPrice && facts.offer.capPrice
        ? `A Price Band with a minimum price of Rs ${facts.offer.floorPrice} (the Floor Price) and a maximum price of Rs ${facts.offer.capPrice} (the Cap Price), including any revisions thereof, decided by our Company in consultation with the Book Running Lead Manager`
        : null,
  },
  {
    term: 'Public Issue Account',
    kind: 'standard',
    describe: () =>
      'The bank account opened with the Public Issue Account Bank under Section 40(3) of the Companies Act, 2013, to receive monies from the Escrow Accounts and from the ASBA Accounts on the Designated Date',
  },
  {
    term: 'Qualified Institutional Buyers, QIBs',
    kind: 'standard',
    describe: () =>
      'Qualified institutional buyers as defined under Regulation 2(1)(ss) of the SEBI ICDR Regulations',
  },
  {
    term: 'Refund Account',
    kind: 'standard',
    describe: () =>
      'The no-lien and non-interest bearing account opened with the Refund Bank, from which refunds, in whole or in part, of the Bid Amount to Anchor Investors shall be made',
  },
  {
    term: 'Bid/Issue Opening Date',
    kind: 'fact',
    describe: ({ facts }) =>
      facts.offer.bidOpeningDate
        ? 'Except in relation to Bids received from Anchor Investors, the date on which the Syndicate, the Designated Branches and the Registered Brokers shall start accepting Bids'
        : null,
  },
  {
    term: 'Bid/Issue Closing Date',
    kind: 'fact',
    describe: ({ facts }) =>
      facts.offer.bidClosingDate
        ? 'Except in relation to Bids received from Anchor Investors, the date after which the Syndicate, the Designated Branches and the Registered Brokers shall not accept Bids'
        : null,
  },
  {
    term: 'Underwriting Agreement',
    kind: 'fact',
    describe: ({ facts }) =>
      facts.offer.underwritingAgreementDate
        ? 'The agreement entered into between the Underwriters, the Book Running Lead Manager and our Company'
        : null,
  },
  {
    term: 'Working Day',
    kind: 'fact',
    describe: ({ facts }) => {
      // Om Galaxy scopes this to banks in Mumbai - its own jurisdiction, not a
      // universal. Scoped here to the issuer's own.
      const where = facts.offer.jurisdiction;
      return where
        ? `All days on which commercial banks in ${where} are open for business; provided that, in relation to the announcement of the Price Band and the Bid/Issue Period, "Working Day" means all days excluding Saturdays, Sundays and public holidays on which commercial banks in ${where} are open for business`
        : null;
    },
  },
];

/**
 * Bidding process and intermediary definitions, second authored batch.
 *
 * Two things caught by reading rather than filtering:
 *
 * 1. Om Galaxy's own glossary DEFINES "Individual Investor Portion" as "not
 *    less than 15% of the Issue" — which is wrong. Individual Investors get
 *    not less than 35% (R-024); 15% is the Non-Institutional Portion. Its own
 *    Issue Structure table says 35%. The glossary entry is a copy-paste slip
 *    from the adjacent definition. NOT reproduced.
 *
 * 2. Both portion definitions state share COUNTS. Those are the banker's call
 *    at pricing and are not computable (D20), so the percentages are stated
 *    and the counts omitted.
 */
const BIDDING_DEFINITIONS: Definition[] = [
  {
    term: 'ASBA Form, Bid cum Application Form',
    kind: 'fact',
    describe: ({ facts }) =>
      `An application form, with or without a UPI ID as applicable, whether physical or electronic, used by Bidders, which will be considered as the application for Allotment in terms of this ${derivedTerms(facts).documentName}`,
  },
  {
    term: 'Banker to the Issue Agreement',
    kind: 'standard',
    describe: () =>
      'The agreement entered into amongst our Company, the Book Running Lead Manager, the Registrar to the Issue and the Banker to the Issue',
  },
  {
    term: 'Basis of Allotment',
    kind: 'standard',
    describe: () =>
      'The basis on which the Equity Shares will be Allotted to successful Bidders under the Issue, as described in "Issue Procedure"',
  },
  {
    term: 'Bid',
    kind: 'standard',
    describe: () =>
      'An indication to make an offer during the Bid/Issue Period by a Bidder other than an Anchor Investor, pursuant to submission of the ASBA Form, or during the Anchor Investor Bid/Issue Period by an Anchor Investor',
  },
  {
    term: 'Bid/Issue Period',
    kind: 'standard',
    describe: () =>
      'Except in relation to Bids received from Anchor Investors, the period between the Bid/Issue Opening Date and the Bid/Issue Closing Date, inclusive of both days, during which Bidders may submit their Bids',
  },
  {
    term: 'Bidder',
    kind: 'fact',
    describe: ({ facts }) =>
      `Any prospective investor who makes a Bid pursuant to the terms of this ${derivedTerms(facts).documentName} and the Bid cum Application Form, and which, unless otherwise stated or implied, includes an ASBA Bidder and an Anchor Investor`,
  },
  {
    term: 'Bidding Centres',
    kind: 'standard',
    describe: () =>
      'Centres at which the Designated Intermediaries shall accept ASBA Forms: Designated SCSB Branches for SCSBs, Specified Locations for the Syndicate, Broker Centres for Registered Brokers, and Designated RTA Locations for RTAs',
  },
  {
    term: 'Designated SCSB Branches',
    kind: 'standard',
    describe: () =>
      'Such branches of the SCSBs which shall collect the ASBA Form, other than ASBA Forms submitted by UPI Bidders where the Bid Amount is blocked upon acceptance of the UPI Mandate Request',
  },
  {
    term: 'Eligible NRI',
    kind: 'standard',
    describe: () =>
      'A Non-Resident Indian in a jurisdiction outside India where it is not unlawful to make an offer or invitation under the Issue',
  },
  {
    term: 'Individual Investor Portion',
    kind: 'standard',
    // R-024: not less than 35%. Om Galaxy's glossary says 15%, which is wrong.
    describe: () =>
      'The portion of the Net Issue being not less than 35%, available for allocation to Individual Investors who Bid for the minimum application size of two lots per application',
  },
  {
    term: 'Non-Institutional Investors, Non-Institutional Bidders',
    kind: 'standard',
    describe: () =>
      'All Bidders that are not QIBs or Individual Bidders and who have Bid for Equity Shares for an amount of more than two lots, but not including NRIs other than Eligible NRIs',
  },
  {
    term: 'Non-Institutional Portion',
    kind: 'standard',
    describe: () =>
      'The portion of the Net Issue being not less than 15%, of which one-third is reserved for Bidders with an application size of more than two lots and up to Rs 10.00 Lakhs, and two-thirds for Bidders with an application size of more than Rs 10.00 Lakhs',
  },
  {
    term: 'QIB Portion',
    kind: 'standard',
    describe: () =>
      'The portion of the Net Issue being not more than 50%, available for allocation to QIBs on a proportionate basis, including the Anchor Investor Portion',
  },
  {
    term: 'Registered Broker',
    kind: 'standard',
    describe: () =>
      'Stock brokers registered with SEBI under the Securities and Exchange Board of India (Stock Brokers) Regulations, 1992 and with the stock exchanges having nationwide terminals, other than the Members of the Syndicate, and eligible to procure Bids',
  },
  {
    term: 'Specified Locations',
    kind: 'standard',
    describe: () =>
      'Collection centres where the SCSBs shall accept ASBA Forms, a list of which is available on the website of SEBI and updated from time to time',
  },
  {
    term: 'UPI',
    kind: 'standard',
    describe: () =>
      'The Unified Payments Interface, an instant payment system developed by the National Payments Corporation of India, which allows instant transfer of money between two bank accounts using a payment address that uniquely identifies a person or account',
  },
  {
    term: 'UPI Bidders',
    kind: 'standard',
    describe: () =>
      'Collectively, Individual Bidders in the Individual Investor Portion and Non-Institutional Bidders with a Bid size of up to Rs 5.00 Lakhs in the Non-Institutional Portion, applying under the UPI Mechanism through an ASBA Form',
  },
  {
    term: 'UPI ID',
    kind: 'standard',
    describe: () =>
      'An identifier created on the UPI single-window mobile payment system developed by the National Payments Corporation of India',
  },
  {
    term: 'UPI Mechanism',
    kind: 'standard',
    describe: () =>
      'The mechanism used by a UPI Bidder to make a Bid in the Issue in accordance with the UPI Circulars on streamlining of public issues',
  },
  {
    term: 'Underwriters',
    kind: 'standard',
    describe: () =>
      'The parties to the Underwriting Agreement who have agreed to underwrite the Issue, the Issue being 100% underwritten in accordance with Regulation 260 of the SEBI ICDR Regulations',
  },
];

/**
 * Company and governance definitions, third authored batch.
 *
 * The corpus entries here are dense with issuer facts — Om Galaxy's CIN, its
 * CFO by name, its corporate office address, its ISIN, its legal advisers, its
 * material subsidiary. Each is either substituted from the fact base or, where
 * we do not hold the fact, omitted so it raises a gap.
 *
 * The governance terms proper (committees, director classes, KMP, senior
 * management, promoter group) are genuinely invariant: they cite Companies Act
 * sections and ICDR regulation numbers rather than describing the issuer.
 */
const COMPANY_DEFINITIONS: Definition[] = [
  {
    term: 'CIN',
    kind: 'fact',
    describe: ({ facts }) => `Corporate Identification Number of our Company, being ${facts.company.cin}`,
  },
  {
    term: 'Corporate Office',
    kind: 'fact',
    // Many SMEs operate from the registered office alone.
    appliesIf: ({ facts }) => facts.company.corporateOffice !== undefined,
    describe: ({ facts }) => {
      const o = facts.company.corporateOffice!;
      return `The corporate office of our Company, situated at ${o.line1}, ${o.city}, ${o.state} ${o.pincode}`;
    },
  },
  {
    term: 'Registered Office',
    kind: 'fact',
    describe: ({ facts }) => {
      const o = facts.company.registeredOffice;
      return `The registered office of our Company, situated at ${o.line1}${o.line2 ? ', ' + o.line2 : ''}, ${o.city}, ${o.state} ${o.pincode}`;
    },
  },
  {
    term: 'Managing Director',
    kind: 'fact',
    describe: ({ facts }) => {
      const md = facts.management.directors.find((d) => /managing director/i.test(d.designation));
      return md ? `The Managing Director of our Company, being ${md.name}` : null;
    },
  },
  {
    term: 'Chief Financial Officer, CFO',
    kind: 'fact',
    describe: ({ facts }) => {
      const cfo = facts.management.keyManagerialPersonnel.find((k) =>
        /chief financial officer/i.test(k.designation),
      );
      return cfo ? `The Chief Financial Officer of our Company, being ${cfo.name}` : null;
    },
  },
  {
    term: 'Group Companies',
    kind: 'fact',
    appliesIf: ({ facts }) => facts.groupCompanies.companies.length > 0,
    describe: ({ facts }) =>
      `Our group companies identified as such in accordance with the SEBI ICDR Regulations, namely ${facts.groupCompanies.companies.map((c) => c.name).join(', ')}`,
  },
  {
    term: 'Companies Act, the Act',
    kind: 'standard',
    describe: () =>
      'The Companies Act, 2013 and amendments thereto, and the erstwhile Companies Act, 1956 as applicable',
  },
  {
    term: 'Directors',
    kind: 'standard',
    describe: () => 'The directors on the board of our Company, as appointed from time to time',
  },
  {
    term: 'Executive Directors',
    kind: 'standard',
    describe: () => 'The executive directors of our Company. For details, see "Our Management"',
  },
  {
    term: 'Non-Executive Directors',
    kind: 'standard',
    describe: () => 'A director who is not an Executive Director',
  },
  {
    term: 'Independent Director',
    kind: 'standard',
    describe: () =>
      'An independent director as defined under Section 2(47) of the Companies Act, 2013 and the SEBI LODR Regulations',
  },
  {
    term: 'Key Managerial Personnel, KMP',
    kind: 'standard',
    describe: () =>
      'Key managerial personnel of our Company in terms of Regulation 2(1)(bb) of the SEBI ICDR Regulations. For details, see "Our Management"',
  },
  {
    term: 'Senior Management, SMP',
    kind: 'standard',
    describe: () =>
      'Senior management of our Company in terms of Regulation 2(1)(bbbb) of the SEBI ICDR Regulations. For details, see "Our Management"',
  },
  {
    term: 'Promoter Group',
    kind: 'standard',
    describe: () =>
      'Such individuals and entities as constitute the promoter group of our Company pursuant to Regulation 2(1)(pp) of the SEBI ICDR Regulations. For details, see "Our Promoters and Promoter Group"',
  },
  {
    term: 'Audit Committee',
    kind: 'standard',
    describe: () =>
      'The audit committee of our Board, constituted in accordance with Section 177 of the Companies Act, 2013 and the SEBI LODR Regulations, as described in "Our Management"',
  },
  {
    term: 'Nomination and Remuneration Committee',
    kind: 'standard',
    describe: () =>
      'The nomination and remuneration committee of our Board, constituted in accordance with Section 178 of the Companies Act, 2013 and the SEBI LODR Regulations, as described in "Our Management"',
  },
  {
    term: "Stakeholders' Relationship Committee",
    kind: 'standard',
    describe: () =>
      "The stakeholders' relationship committee of our Board, constituted in accordance with Section 178 of the Companies Act, 2013 and the SEBI LODR Regulations, as described in \"Our Management\"",
  },
  {
    term: 'Shareholders',
    kind: 'standard',
    describe: () =>
      'The equity shareholders of our Company whose names are entered into (i) the register of members of our Company, or (ii) the records of a depository as a beneficial owner of Equity Shares',
  },
  {
    term: 'Abridged Prospectus',
    kind: 'standard',
    describe: () =>
      'A memorandum containing such salient features of a Prospectus as may be specified by SEBI in this behalf',
  },
  {
    term: 'Acknowledgement Slip',
    kind: 'standard',
    describe: () =>
      'The slip or document issued by a Designated Intermediary to a Bidder as proof of registration of the Bid cum Application Form',
  },
  {
    term: 'Allotment, Allot, Allotted',
    kind: 'fact',
    describe: ({ facts }) =>
      `Unless the context otherwise requires, the allotment of Equity Shares pursuant to the ${derivedTerms(facts).issueWord} to successful Bidders`,
  },
  {
    term: 'Anchor Investor',
    kind: 'standard',
    describe: () =>
      'A Qualified Institutional Buyer applying under the Anchor Investor Portion in accordance with the SEBI ICDR Regulations, who has Bid for an amount of at least Rs 200 Lakhs',
  },
  {
    term: 'Anchor Investor Allocation Price',
    kind: 'standard',
    describe: () =>
      'The price at which Equity Shares will be allocated to Anchor Investors in terms of the Red Herring Prospectus and the Prospectus',
  },
  {
    term: 'Anchor Investor Issue Price',
    kind: 'standard',
    describe: () =>
      'The final price at which Equity Shares will be Allotted to Anchor Investors in terms of the Red Herring Prospectus and the Prospectus, which price will be equal to or higher than the Issue Price but not higher than the Cap Price',
  },
];

function computeDefinitions(ctx: RenderContext): DocumentNode[] {
  const t = derivedTerms(ctx.facts);

  const resolved = [
    ...FACT_DEFINITIONS,
    ...ISSUE_DEFINITIONS,
    ...BIDDING_DEFINITIONS,
    ...COMPANY_DEFINITIONS,
  ]
    .filter((d) => !d.appliesIf || d.appliesIf(ctx))
    .map((d) => ({ term: d.term, description: d.describe(ctx) }));

  const present = resolved.filter((d) => d.description !== null);
  const missing = resolved.filter((d) => d.description === null);

  const nodes: DocumentNode[] = [
    { type: 'heading', level: 2, text: 'Definitions and Abbreviations' },
    {
      type: 'paragraph',
      runs: [
        {
          text:
            `This ${t.documentName} uses certain definitions and abbreviations which, unless the ` +
            'context otherwise indicates or implies, or unless otherwise specified, shall have the ' +
            'meaning set out below. References to any legislation, act, regulation, rule, guideline, ' +
            'policy, circular, notification, clarification or direction shall be to that instrument ' +
            'as amended, updated, supplemented, re-enacted or modified from time to time.',
        },
      ],
    },
    {
      type: 'paragraph',
      runs: [
        {
          text:
            `The words and expressions used in this ${t.documentName} but not defined herein shall ` +
            'have, to the extent applicable, the meaning ascribed to such terms under the Companies ' +
            'Act, 2013, the SEBI ICDR Regulations, the Securities Contracts (Regulation) Act, 1956, ' +
            'the Depositories Act, 1996, or the rules and regulations made thereunder.',
        },
      ],
    },
    { type: 'heading', level: 3, text: 'Company and Issue Related Terms' },
    {
      type: 'table',
      headers: ['Term', 'Description'],
      // Alphabetical, as a real glossary is. Sorted on the first alias so
      // "AOA, Articles, Articles of Association" files under A.
      rows: present
        .slice()
        .sort((a, b) =>
          a.term.replace(/^["']/, '').localeCompare(b.term.replace(/^["']/, ''), 'en'),
        )
        .map((d) => [d.term, d.description as string]),
    },
  ];

  nodes.push(
    { type: 'heading', level: 3, text: 'Conventional Terms and Abbreviations' },
    {
      type: 'table',
      headers: ['Abbreviation', 'Full Form'],
      rows: ABBREVIATIONS.map((d) => [d.term, d.describe(ctx) as string]),
    },
  );

  // Technical and industry terms remain: they are sector-specific, so they
  // cannot come from a single issuer's glossary at all.
  nodes.push({
    type: 'paragraph',
    runs: [
      {
        text: '[TO BE PROVIDED: Technical and industry related terms for this sector]',
        placeholder: {
          factPath: 'definitions.sectorGlossary',
          ask: 'Technical and industry related terms for this sector - these are sector-specific and cannot be taken from another issuer',
        },
      },
    ],
  });

  for (const m of missing) {
    nodes.push({
      type: 'paragraph',
      runs: [
        {
          text: `[TO BE PROVIDED: Definition of "${m.term}"]`,
          placeholder: {
            factPath: `definitions.${m.term}`,
            ask: `Definition of "${m.term}" — the underlying fact is not yet recorded`,
          },
        },
      ],
    });
  }

  return nodes;
}

export const definitions: SectionSpec = {
  id: 'general.definitions',
  title: 'Definitions and Abbreviations',
  producer: 'computed',
  order: 100,
  group: 'SECTION I - GENERAL',
  extractedFrom: [
    'bookbuilt__manufacturing__om-galaxy__bse-sme__2026-09__rhp.pdf pp.6-24 (215 pairs, fixtures/definitions/)',
  ],
  compute: computeDefinitions,
};
