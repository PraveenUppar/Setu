import type { SectionSpec } from '../section';

/**
 * ISSUE PROCEDURE — the largest single template in the document.
 *
 * Measured at 29-36 pages across the corpus and roughly 95% invariant, which
 * makes it the highest-value extraction in Wave 1.
 *
 * Extraction notes, 2026-09-09:
 *   Diffed Om Galaxy RHP (BSE SME) pp.421-460 against Maxwell DRHP
 *   (NSE Emerge) pp.323-355. The substance is identical; the differences are:
 *     - "Issue" vs "Offer" house style (handled by terms.issueWord)
 *     - "our Company" vs "our Company and selling shareholder" (OFS conditional)
 *     - Om Galaxy leaves the issue percentage as "[dot]%"; we compute it
 *     - Maxwell adds the mutual-fund shortfall clause, which is included here
 *       because it states the general rule rather than an issuer specific
 *
 *   Shakti Polytarp was EXCLUDED — it is pre-amendment vintage (D16) and its
 *   Issue Procedure carries superseded figures.
 *
 * Held-out verification against Century Business Media (BSE SME), which was
 * NOT used for extraction: 13 of 16 invariant phrases matched verbatim. The
 * mismatch that mattered — Century cites **Regulation 229(1)** where both
 * extraction sources cite 229(2), because its post-issue capital is under
 * Rs 10 crore. Hardcoding 229(2) would have stated the wrong regulation for
 * every smaller issuer. Now derived from post-issue capital (R-001).
 * The other two mismatches were a page-range artefact and British vs American
 * spelling of "dematerialised".
 *
 * Being built incrementally. Subsections still to extract, in document order:
 *   Phased implementation of UPI, Availability of the RHP and forms, Maximum
 *   and minimum application size, Method of bidding, Bids at different price
 *   levels, Bids by [12 investor categories], Terms of payment, Electronic
 *   registration, Build of the book, Withdrawal of bids, Price discovery and
 *   allocation, Underwriting agreement and RoC filing, Pre-issue advertisement,
 *   General instructions, Grounds for technical rejection, Basis of allotment,
 *   Impersonation, Undertakings, Utilisation of issue proceeds.
 */
export const issueProcedure: SectionSpec = {
  id: 'issueRelated.issueProcedure',
  title: 'Issue Procedure',
  producer: 'template',
  order: 3100,
  group: 'SECTION - ISSUE RELATED INFORMATION',
  appliesIf: (facts) => facts.offer.issueType === 'BOOK_BUILT',
  clause: 'R-023, R-024',
  requiredFacts: [
    'offer.freshIssueShares',
    'capital.paidUpShares',
    'offer.bookRunningLeadManager',
  ],
  extractedFrom: [
    'bookbuilt__manufacturing__om-galaxy__bse-sme__2026-09__rhp.pdf pp.421-423',
    'bookbuilt__engineering__maxwell-engineering__nse-emerge__2026-08__drhp.pdf pp.323-325',
  ],
  template: `
## Issue Procedure

### Book Building Procedure

In terms of Rule 19(2)(b) of the Securities Contracts (Regulation) Rules, 1957, as amended
(the "SCRR") read with Regulation 252 of the SEBI ICDR Regulations, the {{ terms.issueWord }} is
being made for at least 25% of the post-{{ terms.issueWord }} paid-up equity share capital of our
Company. The {{ terms.issueWord }} is being made under {{ terms.eligibilityRegulation }} of
Chapter IX of the SEBI ICDR Regulations via the book building process, wherein not more than 50% of the Net
{{ terms.issueWord }} shall be allocated on a proportionate basis to QIBs, provided that our
Company{{#if offer.sellingShareholders.length }} and the Selling Shareholders{{/if}} may, in
consultation with the Book Running Lead Manager, allocate up to 60% of the QIB Portion to Anchor
Investors on a discretionary basis in accordance with the SEBI ICDR Regulations, of which 33.33%
shall be reserved for domestic Mutual Funds and 6.67% shall be reserved for life insurance
companies and pension funds, subject to valid Bids being received from them at or above the Anchor
Investor Allocation Price. Any under-subscription in the reserved category for life insurance
companies and pension funds may be allocated to domestic Mutual Funds. In the event of
under-subscription, or non-allocation in the Anchor Investor Portion, the balance Equity Shares
shall be added to the QIB Portion.

Further, 5% of the Net QIB Portion (excluding the Anchor Investor Portion) shall be available for
allocation on a proportionate basis only to Mutual Funds, and the remainder of the Net QIB Portion
shall be available for allocation on a proportionate basis to all QIBs (other than Anchor
Investors), including Mutual Funds, subject to valid Bids being received at or above the Issue
Price. However, if the aggregate demand from Mutual Funds is less than 5% of the Net QIB Portion,
the balance Equity Shares available for allocation in the Mutual Fund Portion will be added to the
remaining Net QIB Portion for proportionate allocation to QIBs.

Further, not less than 15% of the Net {{ terms.issueWord }} shall be available for allocation on a
proportionate basis to Non-Institutional Investors, of which one-third of the Non-Institutional
Portion shall be reserved for Bidders with an application size of more than two lots and up to such
lots equivalent to not more than Rs 10.00 Lakhs, and two-thirds of the Non-Institutional Portion
shall be reserved for Bidders with an application size of more than Rs 10.00 Lakhs.
Under-subscription in either of these two sub-categories of the Non-Institutional Portion may be
allocated to Bidders in the other sub-category of the Non-Institutional Portion, subject to valid
Bids being received at or above the Issue Price. Not less than 35% of the Net
{{ terms.issueWord }} shall be available for allocation to Individual Investors who apply for the
minimum application size of two lots per application, in accordance with the SEBI ICDR Regulations,
subject to valid Bids being received from them at or above the Issue Price.

Subject to valid Bids being received at or above the Issue Price, under-subscription, if any, in
any category, except the QIB Portion, would be allowed to be met with spill-over from any other
category or a combination of categories at the discretion of our Company in consultation with the
Book Running Lead Manager and the Designated Stock Exchange. However, under-subscription, if any,
in the QIB Portion will not be allowed to be met with spill-over from other categories or a
combination of categories.

In accordance with Rule 19(2)(b) of the SCRR, the {{ terms.issueWord }} will constitute
{{ terms.issuePercentOfPostIssueCapital }}% of the post-{{ terms.issueWord }} paid-up equity share
capital of our Company.

The Equity Shares, on Allotment, shall be traded only in the dematerialised segment of the Stock
Exchange.

Bidders should note that in accordance with Section 29(1) of the Companies Act, 2013, Allotment of
Equity Shares to all successful Bidders will only be in dematerialised form. Bid cum Application
Forms which do not have the details of the Bidder's depository account, including DP ID, Client ID,
PAN and UPI ID, as applicable, shall be treated as incomplete and will be rejected. Bidders will
not have the option of being Allotted Equity Shares in physical form. However, they may get the
Equity Shares rematerialised subsequent to Allotment of the Equity Shares in the
{{ terms.issueWord }}, subject to applicable laws.

Bidders must ensure that their PAN is linked with Aadhaar and are in compliance with the CBDT
notification dated February 13, 2020 and press release dated June 25, 2021 read with press release
dated September 17, 2021, and CBDT circular no. 7 of 2022 dated March 30, 2022, read with press
release dated March 28, 2023.

The Book Running Lead Manager to the {{ terms.issueWord }} is
{{ offer.bookRunningLeadManager }}. The Designated Stock Exchange for the
{{ terms.issueWord }} is {{ terms.designatedStockExchange }}.
`.trim(),
};

/**
 * Bids by investor category — twelve subsections, the bulk of Issue Procedure
 * and the most invariant material in it.
 *
 * Extraction notes, 2026-09-10:
 *   Om Galaxy RHP (BSE SME) pp.436-437 and Maxwell DRHP (NSE Emerge) pp.333-338.
 *   Substance is identical throughout. Differences are ordering (Om Galaxy puts
 *   the mutual fund NAV limit before the registration requirement, Maxwell after),
 *   "10%" vs "10.00%", and "Bids" vs "Applications" phrasing.
 *
 *   The numeric limits quoted here belong to OTHER regulations — SEBI Mutual Fund,
 *   VCF, FVCI, AIF and FPI Regulations, FEMA Non-debt Instrument Rules, the Banking
 *   Regulation Act, IRDAI Investment Regulations. They are reproduced as the corpus
 *   states them, not authored by us, so they are not rule-pack entries.
 *
 * Still to extract: the full IRDAI exposure-norms list (only the first limb is
 * verified so far) and the Anchor Investor subsection.
 */
export const issueProcedureBidsByCategory: SectionSpec = {
  id: 'issueRelated.issueProcedure.bidsByCategory',
  title: 'Bids by Investor Category',
  producer: 'template',
  order: 3110,
  group: 'SECTION - ISSUE RELATED INFORMATION',
  appliesIf: (facts) => facts.offer.issueType === 'BOOK_BUILT',
  extractedFrom: [
    'bookbuilt__manufacturing__om-galaxy__bse-sme__2026-09__rhp.pdf pp.436-437',
    'bookbuilt__engineering__maxwell-engineering__nse-emerge__2026-08__drhp.pdf pp.333-338',
  ],
  template: `
### Bids by Hindu Undivided Families

Bids by Hindu Undivided Families or HUFs should be made in the individual name of the Karta. The
Bidder should specify that the Bid is being made in the name of the HUF in the Bid cum Application
Form as follows: "Name of sole or first Bidder: XYZ Hindu Undivided Family applying through XYZ",
where XYZ is the name of the Karta. Bids by HUFs will be considered at par with Bids from
individuals.

### Bids by Mutual Funds

With respect to Bids by Mutual Funds, a certified copy of their SEBI registration certificate must
be lodged along with the Bid cum Application Form. Failing this, our Company, in consultation with
the Book Running Lead Manager, reserves the right to reject any Bid without assigning any reason
thereof.

Bids made by asset management companies or custodians of Mutual Funds shall specifically state the
names of the concerned schemes for which such Bids are made.

In the case of a Mutual Fund, a separate Bid can be made in respect of each scheme of the Mutual
Fund registered with SEBI, and such Bids in respect of more than one scheme of the Mutual Fund will
not be treated as multiple Bids, provided that the Bids clearly indicate the scheme concerned for
which the Bid has been made.

No Mutual Fund scheme shall invest more than 10% of its net asset value in equity shares or equity
related instruments of any single company, provided that the limit of 10% shall not be applicable
for investments in index funds or sector or industry specific schemes. No Mutual Fund under all its
schemes should own more than 10% of any company's paid-up share capital carrying voting rights.

### Bids by Eligible NRIs

Eligible NRIs may obtain copies of the Bid cum Application Form from the Designated Intermediaries.
Only Bids accompanied by payment in Indian Rupees or freely convertible foreign exchange will be
considered for Allotment.

Eligible NRIs Bidding on a repatriation basis, using the Non-Resident Form, should authorise their
SCSB or confirm or accept the UPI Mandate Request, in the case of Individual Investors using the
UPI Mechanism, to block their Non-Resident External ("NRE") accounts or Foreign Currency
Non-Resident ("FCNR") ASBA Accounts. Eligible NRIs Bidding on a non-repatriation basis, using
Resident Forms, should authorise their SCSB or confirm or accept the UPI Mandate Request to block
their Non-Resident Ordinary ("NRO") accounts for the full Bid Amount at the time of submission of
the Bid cum Application Form.

Participation of Eligible NRIs in the {{ terms.issueWord }} shall be subject to the Foreign Exchange
Management Act ("FEMA") Non-debt Instrument Rules. In accordance with those Rules, the total holding
by any individual NRI on a repatriation basis shall not exceed 5% of the total paid-up equity share
capital on a fully diluted basis, and the total holdings of all NRIs and Overseas Citizens of India
("OCI") put together shall not exceed 10% of the total paid-up equity share capital on a fully
diluted basis.

Eligible NRIs Bidding on a non-repatriation basis are advised to use the Bid cum Application Form
for residents (white in colour). Eligible NRIs Bidding on a repatriation basis are advised to use
the Bid cum Application Form meant for non-residents (blue in colour).

### Bids by FPIs

In terms of the SEBI FPI Regulations, any qualified foreign investor or FII holding a valid
certificate of registration from SEBI shall be deemed to be an FPI until the expiry of the block of
three years for which fees have been paid under the SEBI FII Regulations.

In the case of Bids made by FPIs, a certified copy of the certificate of registration issued by the
designated depository participant under the SEBI FPI Regulations is required to be attached to the
Bid cum Application Form, failing which our Company reserves the right to reject any Bid without
assigning any reason.

In terms of the SEBI FPI Regulations, the {{ terms.issueWord }} of Equity Shares to a single FPI or
an investor group, meaning the same set of ultimate beneficial owners investing through multiple
entities, must be below 10% of our post-{{ terms.issueWord }} equity share capital. Further, in
terms of the FEMA Regulations, the total holding by each FPI shall be below 10% of the total paid-up
equity share capital of our Company, and the total holdings of all FPIs put together shall not
exceed 24% of the paid-up equity share capital of our Company.

### Bids by SEBI-registered AIFs, VCFs and FVCIs

The Securities and Exchange Board of India (Venture Capital Funds) Regulations, 1996, as amended
(the "SEBI VCF Regulations") and the Securities and Exchange Board of India (Foreign Venture Capital
Investor) Regulations, 2000, as amended, prescribe, among other things, the investment restrictions
on VCFs and FVCIs registered with SEBI. Further, the Securities and Exchange Board of India
(Alternative Investment Funds) Regulations, 2012 (the "SEBI AIF Regulations") prescribe, amongst
others, the investment restrictions on AIFs.

The holding by any individual VCF or FVCI registered with SEBI in one venture capital undertaking
should not exceed 25% of the corpus of the VCF. Further, VCFs and FVCIs can invest only up to 33.33%
of their investible funds by way of subscription to an initial public offering.

### Bids by Limited Liability Partnerships

In the case of Bids made by limited liability partnerships registered under the Limited Liability
Partnership Act, 2008, a certified copy of the certificate of registration issued under that Act
must be attached to the Bid cum Application Form. Failing this, our Company, in consultation with
the Book Running Lead Manager, reserves the right to reject any Bid without assigning any reason
thereof.

### Bids by Banking Companies

In the case of Bids made by banking companies registered with the RBI, certified copies of (i) the
certificate of registration issued by the RBI and (ii) the approval of such banking company's
investment committee are required to be attached to the Bid cum Application Form. Failing this, our
Company, in consultation with the Book Running Lead Manager, reserves the right to reject any Bid
without assigning any reason thereof.

The investment limit for banking companies in non-financial services companies, as prescribed by the
Banking Regulation Act, the Reserve Bank of India (Financial Services provided by Banks) Directions,
2016, as amended, and the Master Circular on Basel III Capital Regulations, is 10% of the paid-up
share capital of the investee company, not being its subsidiary engaged in non-financial services,
or 10% of the bank's own paid-up share capital and reserves, whichever is lower.

### Bids by SCSBs

SCSBs participating in the {{ terms.issueWord }} are required to comply with the terms of the
circulars issued by SEBI dated September 13, 2012 and January 2, 2013. Such SCSBs are required to
ensure that, for making applications on their own account using ASBA, they have a separate account
in their own name with any other SEBI-registered SCSB. Further, such account shall be used solely
for the purpose of making applications in public issues, and clear demarcated funds should be
available in such account for such applications.

### Bids by Systemically Important Non-Banking Financial Companies

In the case of Bids made by Systemically Important Non-Banking Financial Companies registered with
the RBI, certified copies of (i) the certificate of registration issued by the RBI, (ii) the last
audited financial statements on a standalone basis, (iii) a net worth certificate from its statutory
auditors, and (iv) such other approval as may be required, are required to be attached to the Bid
cum Application Form. Failing this, our Company, in consultation with the Book Running Lead Manager,
reserves the right to reject any Bid without assigning any reason thereof.

Systemically Important Non-Banking Financial Companies participating in the {{ terms.issueWord }}
shall comply with all applicable regulations, directions, guidelines and circulars issued by the RBI
from time to time. The investment limit for Systemically Important Non-Banking Financial Companies
shall be as prescribed by the RBI from time to time.

### Bids by Insurance Companies

In the case of Bids made by insurance companies registered with the IRDAI, a certified copy of the
certificate of registration issued by the IRDAI must be attached to the Bid cum Application Form.
Failing this, our Company reserves the right to reject any Bid by an insurance company without
assigning any reason thereof.

The exposure norms for insurers prescribed under the Insurance Regulatory and Development Authority
(Investment) Regulations, as amended, provide in respect of equity shares of a company for the least
of 10% of the investee company's subscribed capital at face value, or 10% of the respective fund in
the case of a life insurer, or 10% of investment assets in the case of a general insurer or
reinsurer.

### Bids by Provident Funds and Pension Funds

In the case of Bids made by provident funds or pension funds with a minimum corpus of Rs 2,500 lakhs,
subject to applicable laws, a certified copy of a certificate from a chartered accountant certifying
the corpus of the provident fund or pension fund must be attached to the Bid cum Application Form.
Failing this, our Company, in consultation with the Book Running Lead Manager, reserves the right to
reject any Bid without assigning any reason thereof.

### Bids under Power of Attorney

In the case of Bids made pursuant to a power of attorney by limited companies, corporate bodies,
registered societies, eligible FPIs, AIFs, Mutual Funds, insurance companies, insurance funds set up
by the army, navy or air force of the Union of India, insurance funds set up by the Department of
Posts, India, the National Investment Fund, and provident funds and pension funds with a minimum
corpus of Rs 2,500 lakhs, subject to applicable laws, a certified copy of the power of attorney or
the relevant resolution or authority, as the case may be, along with a certified copy of the
memorandum of association and articles of association or bye-laws, as applicable, must be lodged
along with the Bid cum Application Form. Failing this, our Company reserves the right to accept or
reject any Bid in whole or in part, in either case without assigning any reason therefor.
`.trim(),
};

/**
 * Application size and bidding mechanics.
 *
 * Extraction notes, 2026-09-10:
 *   Om Galaxy RHP (BSE SME) pp.429-431 and Maxwell DRHP (NSE Emerge) pp.329-331.
 *   Substance identical. Every difference is a variable: Om Galaxy states its
 *   lot size (1,600) and names its newspapers, while Maxwell leaves both as
 *   "[dot]" because a DRHP predates those decisions. The Rs 2,00,000 minimum
 *   (R-006, Reg 267) and the three-to-ten working day bid period are invariant.
 *
 *   Surfaced two missing fact fields, now added: the three newspapers, and the
 *   regional language, which is derived from the registered office state.
 */
export const issueProcedureApplicationSize: SectionSpec = {
  id: 'issueRelated.issueProcedure.applicationSize',
  title: 'Maximum and Minimum Application Size',
  producer: 'template',
  order: 3105,
  group: 'SECTION - ISSUE RELATED INFORMATION',
  appliesIf: (facts) => facts.offer.issueType === 'BOOK_BUILT',
  clause: 'R-006',
  requiredFacts: ['offer.lotSize', 'offer.englishNewspaper', 'offer.hindiNewspaper', 'offer.regionalNewspaper'],
  asks: {
    'offer.englishNewspaper': 'English national daily for the issue advertisements',
    'offer.hindiNewspaper': 'Hindi national daily for the issue advertisements',
    'offer.regionalNewspaper': 'Regional daily for the issue advertisements',
    'offer.lotSize': 'Bid lot size, in number of equity shares',
  },
  extractedFrom: [
    'bookbuilt__manufacturing__om-galaxy__bse-sme__2026-09__rhp.pdf pp.429-431',
    'bookbuilt__engineering__maxwell-engineering__nse-emerge__2026-08__drhp.pdf pp.329-331',
  ],
  template: `
### Maximum and Minimum Application Size

**For Individual Bidders.** The Bid must be for a minimum of two lots, being
{{ offer.lotSize | number }} Equity Shares per lot, and in multiples of
{{ offer.lotSize | number }} Equity Shares thereafter, so that the Bid Amount exceeds
Rs 2,00,000. Individual Bidders may only revise their Bids upwards and are not permitted to cancel
or withdraw their Bids.

**For Bidders other than Individual Bidders, being Non-Institutional Investors and QIBs.** The Bid
must be for such number of Equity Shares that the Bid Amount exceeds Rs 2,00,000 and is for more
than two lots, and in multiples of {{ offer.lotSize | number }} Equity Shares thereafter. A Bid
cannot be submitted for more than the Net {{ terms.issueWord }} size. The maximum Bid by a QIB must
not exceed the investment limits prescribed for it by applicable law. Under the SEBI ICDR
Regulations, QIBs and Non-Institutional Investors cannot withdraw their Bids after the
Bid/{{ terms.issueWord }} Closing Date and are required to pay 100% of the Bid Amount upon
submission of the Bid. In the case of revision, Non-Institutional Investors and QIBs may not revise
their Bids downwards.

In the case of an upward revision, Non-Institutional Investors who are individuals must ensure that
the Bid Amount is greater than Rs 2,00,000 and is for more than two lots, in order to be considered
for allocation in the Non-Institutional Portion.

Bidders are advised to ensure that any single Bid from them does not exceed the investment limits or
the maximum number of Equity Shares that can be held by them under applicable law or regulation, or
as specified in this {{ terms.documentName }}.

The above information is given for the benefit of the Bidders. Our Company and the Book Running Lead
Manager are not liable for any amendment, modification or change in applicable law or regulation
which may occur after the date of this {{ terms.documentName }}. Bidders are advised to make their
own independent investigations and to ensure that the number of Equity Shares Bid for does not
exceed the applicable limits under law or regulation.

### Method of Bidding Process

Our Company, in consultation with the Book Running Lead Manager, has determined the Price Band and
the minimum Bid lot size for the {{ terms.issueWord }}, which will be advertised in all editions of
{{ offer.englishNewspaper }}, an English national daily newspaper, all editions of
{{ offer.hindiNewspaper }}, a Hindi national daily newspaper, and all editions of
{{ offer.regionalNewspaper }}, a regional daily newspaper{{#unless terms.regionalLanguageIsHindi }}
({{ terms.regionalLanguage }} being the regional language of {{ terms.registeredOfficeState }},
where our Registered Office is located){{/unless}}{{#if terms.regionalLanguageIsHindi }} circulated
in {{ terms.registeredOfficeState }}, where our Registered Office is situated{{/if}}, each with wide
circulation, at least two Working Days prior to the Bid/{{ terms.issueWord }} Opening Date. The Book Running Lead Manager and the SCSBs shall
accept Bids from Bidders during the Bid/{{ terms.issueWord }} Period.

- The Bid/{{ terms.issueWord }} Period shall be for a minimum of three Working Days and shall not exceed ten Working Days. It may be extended, if required, by an additional three Working Days, subject to the total Bid/{{ terms.issueWord }} Period not exceeding ten Working Days. Any revision in the Price Band, and the revised Bid/{{ terms.issueWord }} Period if applicable, will be published in the same newspapers and indicated on the website of the Book Running Lead Manager.
- During the Bid/{{ terms.issueWord }} Period, Bidders should approach the Book Running Lead Manager, their authorised agents, or the Designated Branches, to register their Bids.
- Each Bid cum Application Form gives the Bidder the choice to Bid for up to three optional prices within the Price Band, specifying the number of Equity Shares Bid for at each option.
`.trim(),
};

export const issueRelatedSections: SectionSpec[] = [
  issueProcedure,
  issueProcedureApplicationSize,
  issueProcedureBidsByCategory,
];
