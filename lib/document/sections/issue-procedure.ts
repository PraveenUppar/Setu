import { derivedTerms, type SectionSpec } from '../section';
import { renderTemplate } from '../template';

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
 *   Nothing. Every subsection observed in the corpus is now built.
 *
 * Built so far: Book Building Procedure, Phased Implementation of UPI,
 * Availability of the Offer Document and Forms, Application Size and Method of
 * Bidding, Bids by Investor Category, Bids at Different Price Levels and
 * Participation by Associates, Terms of Payment, Electronic Registration,
 * Build of the Book / Withdrawal / Price Discovery, Grounds for Technical
 * Rejection, General Instructions with the Do's and Don'ts, Information for
 * Bidders, Bids by Anchor Investors, Withdrawal of the Issue and the
 * Advertisements, Basis of Allotment, Impersonation and Undertakings.
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

/**
 * Closing block of Issue Procedure: impersonation, undertakings, utilisation.
 *
 * Extraction notes, 2026-09-10:
 *   Om Galaxy RHP (BSE SME) pp.455-457 and Maxwell DRHP (NSE Emerge) pp.350-352.
 *
 *   Impersonation is a verbatim quotation of Section 38(1) of the Companies
 *   Act, 2013 and is therefore fully invariant.
 *
 *   The undertakings are the same set in both, reordered — Om Galaxy numbers
 *   them, Maxwell bullets them. Where the two differ on a deadline, the more
 *   specific of the two is used: Om Galaxy says refund communication goes out
 *   "within two Working Days from the Issue Closing Date" where Maxwell says
 *   "within the time prescribed under applicable law". Maxwell carries two
 *   undertakings Om Galaxy omits (NRI certificate dispatch, and the wilful
 *   defaulter declaration); both are standard and are included.
 *
 * Held-out verification against Century Business Media: 14 of 15 checks matched.
 * The exception was the Section 40(3) separate-bank-account bullet under
 * Utilisation of Proceeds — Century references Section 40 only in a penalties
 * context, so that ONE bullet rested on Maxwell alone.
 *
 * RESOLVED 2026-09-10. Om Galaxy's own glossary defines "Public Issue Account"
 * as "the bank account opened with the Public Issue Account Bank under Section
 * 40(3) of the Companies Act, to receive monies from the Escrow Accounts and
 * from the ASBA Accounts on the Designated Date" — an independent second
 * source, in a different part of a different document. The bullet stands.
 */
export const issueProcedureUndertakings: SectionSpec = {
  id: 'issueRelated.issueProcedure.undertakings',
  title: 'Impersonation, Undertakings and Utilisation of Proceeds',
  producer: 'template',
  order: 3190,
  group: 'SECTION - ISSUE RELATED INFORMATION',
  appliesIf: (facts) => facts.offer.issueType === 'BOOK_BUILT',
  extractedFrom: [
    'bookbuilt__manufacturing__om-galaxy__bse-sme__2026-09__rhp.pdf pp.455-457',
    'bookbuilt__engineering__maxwell-engineering__nse-emerge__2026-08__drhp.pdf pp.350-352',
  ],
  template: `
### Impersonation

Attention of the Bidders is specifically drawn to the provisions of sub-section (1) of Section 38 of
the Companies Act, 2013, which is reproduced below:

"Any person who —

- makes or abets making of an application in a fictitious name to a company for acquiring, or subscribing for, its securities; or
- makes or abets making of multiple applications to a company in different names or in different combinations of his name or surname for acquiring or subscribing for its securities; or
- otherwise induces directly or indirectly a company to allot, or register any transfer of, securities to him, or to any other person in a fictitious name, shall be liable for action under Section 447."

### Undertakings by our Company

Our Company undertakes the following:

- That the complaints received in respect of the {{ terms.issueWord }} shall be attended to expeditiously and satisfactorily.
- That all steps will be taken for completion of the necessary formalities for listing and commencement of trading on the Stock Exchange where the Equity Shares are proposed to be listed within three Working Days from the {{ terms.issueWord }} Closing Date.
- That the funds required for making refunds as per the modes disclosed, or for dispatch of allotment advice by registered post or speed post, shall be made available to the Registrar to the {{ terms.issueWord }} by our Company.
- Where refunds, to the extent applicable, are made through electronic transfer of funds, a suitable communication shall be sent to the Bidder within two Working Days from the {{ terms.issueWord }} Closing Date, giving details of the bank where the refund shall be credited along with the amount and the expected date of electronic credit of refund.
- That our Promoters' contribution in full has already been brought in.
- That, except for the Allotment of Equity Shares pursuant to the Fresh Issue, no further issue of Equity Shares shall be made until the Equity Shares issued through this {{ terms.documentName }} are listed, or until the application monies are refunded on account of non-listing, under-subscription or otherwise.
- That adequate arrangements shall be made to collect all Applications Supported by Blocked Amount while finalising the Basis of Allotment.
- If our Company does not proceed with the {{ terms.issueWord }} after the Bid/{{ terms.issueWord }} Opening Date but before Allotment, the reason shall be given as a public notice issued by our Company within two days of the Bid/{{ terms.issueWord }} Closing Date. The public notice shall be issued in the same newspapers in which the pre-{{ terms.issueWordLower }} advertisement was published, and the Stock Exchange on which the Equity Shares are proposed to be listed shall also be informed promptly.
- If our Company withdraws the {{ terms.issueWord }} after the Bid/{{ terms.issueWord }} Closing Date, our Company shall be required to file a fresh {{ terms.documentName }} with the Stock Exchange, the RoC and SEBI, in the event our Company subsequently decides to proceed with the {{ terms.issueWord }}.
- If Allotment is not made within the prescribed time period under applicable law, the entire subscription amount received will be refunded or unblocked within the time prescribed under applicable law. If there is a delay beyond the prescribed time, our Company shall pay the interest prescribed under the Companies Act, 2013, the SEBI ICDR Regulations and applicable law for the delayed period.
- That the certificates of the securities or refund orders to Eligible NRIs shall be dispatched within the specified time.
- That none of our Promoters or Directors is a wilful defaulter or a fraudulent borrower.

### Utilisation of {{ terms.issueWord }} Proceeds

Our Board of Directors certifies that:

- All monies received out of the Fresh Issue shall be credited or transferred to a separate bank account other than the bank account referred to in sub-section (3) of Section 40 of the Companies Act, 2013.
- Details of all monies utilised out of the Fresh Issue shall be disclosed, and shall continue to be disclosed for so long as any part of the {{ terms.issueWord }} proceeds remains unutilised, under an appropriate head in the balance sheet of our Company, indicating the purpose for which such monies have been utilised.
- Details of all unutilised monies out of the Fresh Issue, if any, shall be disclosed under an appropriate separate head in the balance sheet, indicating the form in which such unutilised monies have been invested.
- Our Company shall comply with the requirements of the SEBI Listing Regulations in relation to the disclosure and monitoring of the utilisation of the proceeds of the {{ terms.issueWord }}.
- Our Company shall not have recourse to the {{ terms.issueWord }} proceeds until the approval for listing and trading of the Equity Shares has been received from the Stock Exchange where listing is sought.
`.trim(),
};

/**
 * Grounds for technical rejection.
 *
 * Extraction notes, 2026-09-10:
 *   Om Galaxy RHP (BSE SME) pp.447-448 and Maxwell DRHP (NSE Emerge) pp.343-344.
 *
 *   The two lists differ in LENGTH rather than substance — Om Galaxy runs to 25+
 *   grounds, Maxwell to 15, and each carries items the other omits. Both are
 *   legitimate; the union is used, since a ground omitted from the document is
 *   a ground the issuer cannot rely on.
 *
 *   CONFLICT RESOLVED BY HELD-OUT VERIFICATION. Maxwell lists "Bids at cut-off
 *   price by any category" as a rejection ground. Om Galaxy lists "Bids at
 *   Cut-off Price by NIIs and QIBs". Century Business Media settles it —
 *   "In case of Bidders (excluding NIIs and QIBs) Bidding at cut-off price..."
 *   confirms Individual Bidders MAY bid at cut-off. Om Galaxy's formulation is
 *   used; Maxwell's would have wrongly told issuers to reject valid retail bids.
 *
 *   DEFECT FOUND AND REMOVED, 2026-09-10. This list carried a ground reading
 *   "Bids by Individual Bidders with a Bid Amount exceeding Rs 2,00,000". It
 *   has NO support in any rejection-grounds list in the corpus — the phrase
 *   exists only in the Do's and Don'ts, where two documents state it and both
 *   are wrong for an SME issue. Left in, it told issuers to reject every valid
 *   SME retail bid, since R-006 requires the Bid Amount to EXCEED Rs 2,00,000.
 *   The generic "amounts greater than the maximum permissible" ground, which
 *   three documents do state, covers the legitimate case. See D29.
 */
export const issueProcedureTechnicalRejection: SectionSpec = {
  id: 'issueRelated.issueProcedure.technicalRejection',
  title: 'Grounds for Technical Rejection',
  producer: 'template',
  order: 3160,
  group: 'SECTION - ISSUE RELATED INFORMATION',
  appliesIf: (facts) => facts.offer.issueType === 'BOOK_BUILT',
  extractedFrom: [
    'bookbuilt__manufacturing__om-galaxy__bse-sme__2026-09__rhp.pdf pp.447-448',
    'bookbuilt__engineering__maxwell-engineering__nse-emerge__2026-08__drhp.pdf pp.343-344',
  ],
  template: `
### Grounds for Technical Rejection

In addition to the grounds for rejection of Bids on technical grounds set out in the General
Information Document, Bidders should note that Bids are liable to be rejected, inter alia, on the
following technical grounds:

- The amount blocked does not tally with the amount payable for the Equity Shares Bid for, or there are inadequate funds in the bank account to block the Bid Amount at the time of blocking.
- Bids submitted without instruction to the SCSBs to block the entire Bid Amount, or where no confirmation is received from the SCSB for blocking of funds.
- Bids which do not contain details of the Bid Amount and the bank account details in the ASBA Form.
- Bids submitted on plain paper.
- The ASBA Form submitted to a Designated Intermediary does not bear the stamp of that Designated Intermediary.
- PAN not mentioned in the Bid cum Application Form, or a GIR number furnished instead of PAN.
- Bids by persons for whom PAN details have not been verified and whose beneficiary accounts are "suspended for credit".
- Where no corresponding record is available with the Depositories matching all three parameters: the names of the Bidders including the order of joint holders, the Depository Participant's identity (DP ID), and the beneficiary's account number.
- Bids submitted without the signature of the sole or First Bidder, or the ASBA Form not signed by the account holder where the account holder differs from the Bidder.
- **Bids at Cut-off Price by Non-Institutional Investors and QIBs.**
- Bids at a price below the Floor Price or above the Cap Price.
- Bids for a number of Equity Shares lower than the minimum specified for that category of investor, or not in the multiples specified in this {{ terms.documentName }}.
- Category not ticked.
- Multiple Bids, as defined in this {{ terms.documentName }}.
- Bids for amounts greater than the maximum permissible amount prescribed by applicable regulations.
- Bids by persons not competent to contract under the Indian Contract Act, 1872, including minors and persons of unsound mind.
- In the case of partnership firms, Equity Shares may be registered in the names of the individual partners; no firm as such shall be entitled to apply.
- Bids under power of attorney, or by limited companies, corporate bodies or trusts, where the relevant documents are not submitted.
- Bids by persons who are not eligible to acquire Equity Shares under applicable laws, rules, regulations, guidelines and approvals.
- Bids by OCBs.
- Bids by US persons other than in reliance on Regulation S, or by "qualified institutional buyers" as defined in Rule 144A under the Securities Act.
- Bids accompanied by stock invest, money order, postal order, cash, cheque, demand draft or pay order.
- Bids submitted by Individual Bidders using the UPI Mechanism through an SCSB or a mobile application or UPI handle not listed on the website of SEBI, or using third party bank accounts or a third party linked bank account UPI ID.
- Bids not uploaded on the terminals of the Stock Exchange.
- Bids uploaded by QIBs after 4.00 p.m. and by Non-Institutional Bidders after 4.00 p.m. on the Bid/{{ terms.issueWord }} Closing Date, and Bids by Individual Bidders uploaded after 5.00 p.m. on the Bid/{{ terms.issueWord }} Closing Date, unless extended by the Stock Exchange.
- Bid cum Application Forms not delivered by the Bidder within the time prescribed in the Bid cum Application Form, the Bid/{{ terms.issueWord }} Opening Date advertisement and this {{ terms.documentName }}.

Bidders should note that in the event the PAN, the DP ID and the Client ID mentioned in the Bid cum
Application Form, and entered into the electronic application system of the Stock Exchange by the
Bid collecting intermediaries, do not match with the PAN, DP ID and Client ID available in the
Depository database, the Bid cum Application Form is liable to be rejected.

In the case of any delay in unblocking of amounts in the ASBA Accounts, including amounts blocked
through the UPI Mechanism, exceeding two Working Days from the Bid/{{ terms.issueWord }} Closing
Date, the Bidder shall be compensated at a uniform rate of Rs 100 per day for the entire duration of
the delay exceeding two Working Days, by the intermediary responsible for causing such delay. The
Book Running Lead Manager shall, in its sole discretion, identify and fix liability on the
intermediary or entity responsible for the delay.

In the case of any pre-{{ terms.issueWordLower }} or post-{{ terms.issueWordLower }} issue regarding
share certificates, demat credit, refund orders or unblocking, investors should contact the Company
Secretary and Compliance Officer.

The authorised employees of the Designated Stock Exchange, along with the Book Running Lead Manager
and the Registrar to the {{ terms.issueWord }}, shall ensure that the Basis of Allotment is finalised
in a fair and proper manner in accordance with the procedure specified in the SEBI ICDR Regulations.
`.trim(),
};

/**
 * Allotment procedure and basis of allotment.
 *
 * Extraction notes, 2026-09-10:
 *   Om Galaxy RHP (BSE SME) pp.448-450 and Maxwell DRHP (NSE Emerge) pp.344-346.
 *   Near-identical, down to the worked allotment-ratio example. Om Galaxy adds
 *   the minimum-bid-lot sentence for Non-Institutional Investors; included.
 *
 *   The 90% minimum subscription (R-025) is stated in both plus Century, so it
 *   rests on three sources across both exchanges.
 *
 *   The corpus leaves the per-category share counts as "[dot]" because they are
 *   fixed at pricing. They are NOT computed here: the category portions are
 *   percentages of the NET issue, and net issue is the issue less the market
 *   maker reservation, which is not yet a fact-base field. Stating a count
 *   derived from the gross issue would be quietly wrong. The method is stated
 *   without asserting counts, and the counts belong to Issue Structure.
 */
export const issueProcedureBasisOfAllotment: SectionSpec = {
  id: 'issueRelated.issueProcedure.basisOfAllotment',
  title: 'Allotment Procedure and Basis of Allotment',
  producer: 'template',
  order: 3170,
  group: 'SECTION - ISSUE RELATED INFORMATION',
  appliesIf: (facts) => facts.offer.issueType === 'BOOK_BUILT',
  clause: 'R-024, R-025',
  extractedFrom: [
    'bookbuilt__manufacturing__om-galaxy__bse-sme__2026-09__rhp.pdf pp.448-450',
    'bookbuilt__engineering__maxwell-engineering__nse-emerge__2026-08__drhp.pdf pp.344-346',
  ],
  template: `
### Allotment Procedure and Basis of Allotment

The Allotment of Equity Shares to Bidders other than Individual Investors, Non-Institutional
Investors and Anchor Investors may be on a proportionate basis. No Individual Investor will be
Allotted less than the minimum Bid Lot, subject to availability of Equity Shares in the Individual
Investor category, and the remaining available Equity Shares, if any, will be Allotted on a
proportionate basis. No Non-Institutional Investor will be Allotted less than the minimum Bid Lot,
subject to availability of Equity Shares in the Non-Institutional Investor category, and the
remaining available Equity Shares, if any, will be Allotted on a proportionate basis.

**Our Company is required to receive a minimum subscription of 90% of the
{{ terms.issueWord }}.** However, where the {{ terms.issueWord }} is in the nature of an offer for
sale only, minimum subscription may not be applicable.

**Flow of events from the closure of the Bidding period (T Day) until Allotment:**

- On T Day, the Registrar validates the electronic Bid details against the depository records, and reconciles the final certificates received from the Sponsor Bank for the UPI process and from the SCSBs for the ASBA and Syndicate ASBA processes against the electronic Bid details.
- The Registrar identifies cases where the account number per the Bid file or final certificate does not match the Bidder's bank account linked to the depository demat account, and seeks clarification from the SCSB to identify applications made through third party accounts for rejection.
- Third party confirmation of applications is to be completed by the SCSBs on T+1 Day.
- The Registrar prepares the list of final rejections and circulates it to the Book Running Lead Manager and our Company for review and comment.
- Following rejections, the Registrar submits the Basis of Allotment to the Designated Stock Exchange.
- The Designated Stock Exchange, after verification, approves the Basis of Allotment and generates the drawal of lots wherever applicable, through random number generation software.
- The Registrar uploads the drawal numbers into its system and generates the final list of Allottees.

**Process for generating the list of Allottees:**

- The Registrar instructs its system to reverse, category-wise, all application numbers in ascending order and to generate buckets according to the allotment ratio. For example, if the application number is 78654321 the system reverses it to 12345687; and if the ratio of Allottees to applicants in a category is 2:7, the system creates lots of seven. If the drawal of lots provided by the Designated Stock Exchange is three and five, the system picks every third and fifth application in each lot of that category, and those applications are Allotted Equity Shares in that category.
- In categories where allotment is proportionate, the Registrar prepares the proportionate working based on the number of times the category is oversubscribed.
- In categories where there is under-subscription, the Registrar makes full Allotment for all valid applications.
- On this basis the Registrar works out the Allottees, partial Allottees and non-Allottees, prepares the fund transfer letters, and advises the SCSBs to debit or unblock the respective accounts.

**Basis of Allotment by category.** Bids received at or above the Issue Price within each of the
Individual Investor, Non-Institutional Investor and QIB categories are grouped together to determine
the total demand in that category. Allotment to all successful Bidders in a category is made at the
Issue Price. Where the aggregate demand in a category is less than or equal to the Equity Shares
available for that category, full Allotment is made to the extent of valid Bids. Where the aggregate
demand exceeds the Equity Shares available, Allotment is made on a proportionate basis, subject to a
minimum Allotment of one Bid Lot and in multiples of {{ offer.lotSize | number }} Equity Shares
thereafter.
`.trim(),
};

/**
 * Phased Implementation of the Unified Payments Interface.
 *
 * Extraction notes, 2026-09-10:
 *   - "Phase III ... mandatory for public issues opening on or after
 *     December 1, 2023" appears in five of the six documents. The sponsor bank
 *     conduit sentence appears in four.
 *   - **The Phase I and Phase II history is deliberately omitted.** Real
 *     documents carry three paragraphs recounting the 2019 and 2020 phases
 *     with their circular numbers and extended deadlines. None of it has any
 *     effect on an issue opening in 2026 — every such issue is Phase III
 *     mandatory — and quoting circular numbers that only two documents
 *     corroborate is citation risk for no reader benefit. A merchant banker
 *     who wants the history can add it; we are not inventing it.
 *   - **NOT included, both single-sourced in Om Galaxy (D26):** the list of
 *     four entity types with whom a UPI ID may be lodged, and "All SCSBs
 *     offering the facility of making applications in public issues shall also
 *     provide the facility to apply using the UPI Mechanism". The
 *     single-source sentences keep turning up in Om Galaxy because it is the
 *     longest document in the corpus and the primary extraction source — the
 *     risk is systematically higher there, not evenly spread.
 *   - **Held-out verification disagreed, and the held-out document lost.**
 *     Century describes Phase III as a future timeline "as may be prescribed
 *     by SEBI", which is the pre-2023 framing. Five documents state the
 *     December 1, 2023 mandatory date. Century is carrying stale boilerplate
 *     here, the way Shakti carries pre-amendment figures (D16). A held-out
 *     mismatch is a question to adjudicate, not an automatic veto.
 */
export const issueProcedureUpi: SectionSpec = {
  id: 'issueRelated.issueProcedure.upi',
  title: 'Phased Implementation of the Unified Payments Interface',
  producer: 'template',
  order: 3102,
  group: 'SECTION - ISSUE RELATED INFORMATION',
  clause: 'SEBI UPI Circulars; SEBI ICDR Master Circular',
  extractedFrom: [
    'bookbuilt__manufacturing__om-galaxy__bse-sme__2026-09__rhp.pdf p.356',
    'bookbuilt__gas-engineering__axiom-gas__nse-emerge__2026-09__rhp.pdf',
    'bookbuilt__engineering__maxwell-engineering__nse-emerge__2026-08__drhp.pdf',
  ],
  asks: {
    'offer.sponsorBank': 'Sponsor Bank — the SCSB acting as conduit to NPCI for UPI mandates',
  },
  template: `
## Phased Implementation of the Unified Payments Interface

SEBI has issued the UPI Circulars in relation to streamlining the process of public issues of, inter
alia, equity shares. Pursuant to those circulars, the UPI Mechanism was introduced in a phased
manner as a payment mechanism, in addition to the mechanism of blocking funds in an account
maintained with a SCSB under the ASBA process.

Using the UPI Mechanism for applications by UPI Bidders was made voluntary for public issues opening
on or after September 1, 2023, and **mandatory for public issues opening on or after December 1,
2023**. This {{ terms.issueWord }} is being made under that mandatory phase.

In accordance with the UPI Circulars, our Company has appointed {{ offer.sponsorBank }} as the
Sponsor Bank, to act as a conduit between the Stock Exchange and NPCI in order to facilitate
collection of requests or payment instructions of the UPI Bidders into the UPI Mechanism.

SEBI has prescribed that all individual investors applying in initial public offerings opening on or
after May 1, 2022, where the application amount is **up to Rs 5,00,000**, shall use the UPI
Mechanism. Note that this is the threshold at which UPI becomes mandatory, not a limit on what an
Individual Investor may bid — for an SME issue the minimum application already exceeds Rs 2,00,000.

Pursuant to the SEBI ICDR Master Circular, SEBI has set out specific requirements for the redressal
of investor grievances for applications made through the UPI Mechanism. These include the
appointment of a nodal officer by the SCSB and submission of their details to SEBI, the requirement
for SCSBs to send SMS alerts for the blocking and unblocking of UPI mandates, and the requirement
for the Registrar to the {{ terms.issueWord }} to submit details of cancelled, withdrawn or deleted
applications.

The processing fees for applications made by UPI Bidders using the UPI Mechanism may be released to
the SCSBs only after those banks provide a written confirmation in compliance with the SEBI RTA
Master Circular, in the format prescribed by SEBI from time to time. For further details, refer to
the General Information Document available on the websites of the Stock Exchange and the Book
Running Lead Manager.
`.trim(),
};

/**
 * Availability of the offer document and the forms, and who may submit what
 * to whom.
 *
 * Extraction notes, 2026-09-10:
 *   - The submission routes by investor category, and the "3 in 1 type
 *     accounts" phrasing, appear in all five extraction sources and in the
 *     held-out document.
 *   - The Anchor Investor form being available only at the Book Running Lead
 *     Manager's offices is in four sources, and is the one asymmetry in this
 *     subsection worth keeping: everything else is available in three places.
 */
export const issueProcedureAvailability: SectionSpec = {
  id: 'issueRelated.issueProcedure.availability',
  title: 'Availability of the Offer Document and Application Forms',
  producer: 'template',
  order: 3103,
  group: 'SECTION - ISSUE RELATED INFORMATION',
  clause: 'ICDR Schedule VI Part A; SEBI ICDR Master Circular (ASBA)',
  extractedFrom: [
    'bookbuilt__manufacturing__om-galaxy__bse-sme__2026-09__rhp.pdf pp.360, 356',
    'bookbuilt__engineering__maxwell-engineering__nse-emerge__2026-08__drhp.pdf',
  ],
  template: `
## Availability of the {{ terms.documentName }} and Bid cum Application Forms

Copies of this {{ terms.documentName }}, the Bid cum Application Form and the Abridged Prospectus
will be available at the offices of the Book Running Lead Manager, with the Designated
Intermediaries at the Bidding Centres, and at the Registered Office of our Company. An electronic
copy will be available on the websites of SEBI, the Stock Exchange and the Book Running Lead
Manager.

Copies of the Anchor Investor Application Form will be available only at the offices of the Book
Running Lead Manager.

Our Company has filed this {{ terms.documentName }} with the RoC at least three days before the
Bid/{{ terms.issueWord }} Opening Date. Any Bidder who wishes to obtain this
{{ terms.documentName }} or the Bid cum Application Form may obtain it from our Registered Office.

### How Bids are Submitted

All Bidders other than Anchor Investors shall mandatorily participate in the
{{ terms.issueWord }} only through the ASBA process. ASBA Bidders must provide either the bank
account details and authorisation to block funds in the ASBA Form, or the UPI ID, as applicable.

- **Individual Investors not using the UPI Mechanism** may submit their ASBA Forms with SCSBs, physically or online, or online using the facility of linked online trading, demat and bank account (3 in 1 type accounts) provided by certain brokers.
- **Individual Investors using the UPI Mechanism** may submit their ASBA Forms with Registered Brokers, RTAs or CDPs, or online using the facility of linked online trading, demat and bank account (3 in 1 type accounts) provided by certain brokers.
- **QIBs and Non-Institutional Investors** may submit their ASBA Forms with SCSBs, Registered Brokers, RTAs or CDPs.

Bid cum Application Forms submitted directly to a SCSB should bear the stamp of the SCSB or its
Designated Branch. Bidders applying directly through a SCSB should ensure that the form is submitted
to a Designated Branch where the ASBA Account is maintained.

Except for applications by or on behalf of the Central or State Government, officials appointed by
the courts, and investors residing in the State of Sikkim, the Bidders must state their PAN. Where
the PAN, DP ID and Client ID stated on the form do not match those held in the depository's records,
the application is liable to be rejected.
`.trim(),
};

/**
 * Bids at different price levels, revision of bids, and participation by the
 * Book Running Lead Manager's own associates.
 *
 * Extraction notes, 2026-09-10:
 *   - The right to revise the price band without prior approval of, or
 *     intimation to, the Bidders appears in all five extraction sources and
 *     in the held-out document.
 *   - The cut-off price restriction here matches the finding already recorded
 *     in the handoff: only INDIVIDUAL bidders may bid at cut-off. Maxwell's
 *     wording elsewhere would have had issuers reject valid retail bids.
 *   - The anchor investor price floor — "shall not be lower than the price
 *     offered to other applicants" — is in three sources plus the held-out
 *     document.
 */
export const issueProcedurePriceLevels: SectionSpec = {
  id: 'issueRelated.issueProcedure.priceLevels',
  title: 'Bids at Different Price Levels and Participation by Associates',
  producer: 'template',
  order: 3115,
  group: 'SECTION - ISSUE RELATED INFORMATION',
  appliesIf: (facts) => facts.offer.issueType === 'BOOK_BUILT',
  clause: 'R-024; ICDR Reg 250',
  extractedFrom: [
    'bookbuilt__manufacturing__om-galaxy__bse-sme__2026-09__rhp.pdf pp.363-364',
    'bookbuilt__engineering__maxwell-engineering__nse-emerge__2026-08__drhp.pdf',
  ],
  template: `
## Bids at Different Price Levels and Revision of Bids

Our Company, in consultation with the Book Running Lead Manager and without the prior approval of,
or intimation to, the Bidders, reserves the right to revise the Price Band during the
Bid/{{ terms.issueWord }} Period, in accordance with the SEBI ICDR Regulations. Our Company, in
consultation with the Book Running Lead Manager, will finalise the {{ terms.issueWord }} Price
within the Price Band, again without prior approval of, or intimation to, the Bidders.

Bidders may Bid at any price within the Price Band, and must Bid for the desired number of Equity
Shares at a specific price. **Only Individual Bidders may Bid at the Cut-off Price.** Individual
Bidders who Bid at the Cut-off Price agree that they will purchase the Equity Shares at any price
within the Price Band, and shall submit the Bid cum Application Form for an amount calculated at the
Cap Price.

The price of the specified securities offered to an Anchor Investor shall not be lower than the
price offered to other applicants.

## Participation by Associates and Affiliates of the Book Running Lead Manager

The Book Running Lead Manager shall not be allowed to purchase in this {{ terms.issueWord }} in any
manner, except towards fulfilling its underwriting obligations. However, the associates and
affiliates of the Book Running Lead Manager may Bid in the {{ terms.issueWord }}, either in the QIB
Category or in the Non-Institutional Category, where the allocation is on a proportionate basis, and
such subscription may be on their own account or on behalf of their clients.

Neither the Book Running Lead Manager nor any person related to it, other than Mutual Funds
sponsored by entities related to the Book Running Lead Manager, may apply in the
{{ terms.issueWord }} under the Anchor Investor Portion.
`.trim(),
};

/**
 * Terms of Payment, the ASBA payment mechanism, and the anchor escrow.
 *
 * Extraction notes, 2026-09-10:
 *   - Four extraction sources agree, and every clause is also present in the
 *     held-out document.
 *   - **The anchor escrow account NAMES are not derivable.** The concept is in
 *     three sources, but each states a different convention:
 *       "OM GALAXY LIMITED-ANCHOR RESIDENT ACCOUNT"
 *       "AXIOM GAS ENGINEERING LIMITED - ANCHOR R ACCOUNT"
 *       "CENTURY BUSINESS MEDIA LIMITED-ANCHOR ACCOUNT-R"
 *     and a fourth prints it blank at draft stage. Building the string from
 *     the company name would look completely plausible and match no bank's
 *     records, so both names are facts and render as gaps. Same shape as the
 *     category allotment figures in D20.
 *   - The issue price is likewise a gap: all four documents print "[dot]"
 *     because the price is not fixed until the book closes.
 */
export const issueProcedureTermsOfPayment: SectionSpec = {
  id: 'issueRelated.issueProcedure.termsOfPayment',
  title: 'Terms of Payment and Payment Mechanism',
  producer: 'template',
  order: 3120,
  group: 'SECTION - ISSUE RELATED INFORMATION',
  clause: 'SEBI ICDR Master Circular (ASBA); ICDR Reg 254',
  extractedFrom: [
    'bookbuilt__manufacturing__om-galaxy__bse-sme__2026-09__rhp.pdf pp.372-373',
    'bookbuilt__engineering__maxwell-engineering__nse-emerge__2026-08__drhp.pdf',
  ],
  asks: {
    'offer.issuePrice': 'Final issue price per Equity Share — fixed at the close of bidding',
    'offer.anchorEscrowAccountResident':
      'Name of the escrow account for resident Anchor Investors, exactly as opened with the bank',
    'offer.anchorEscrowAccountNonResident':
      'Name of the escrow account for non-resident Anchor Investors',
  },
  template: `
## Terms of Payment

The entire {{ terms.issueWord }} Price of Rs {{ offer.issuePrice }} per Equity Share is payable on
application. Where a Bidder is allotted fewer Equity Shares than applied for, the Registrar to the
{{ terms.issueWord }} shall instruct the SCSBs to unblock the excess amount on the application.

The SCSBs will transfer the amount as per the instruction of the Registrar to the
{{ terms.issueWord }} to the Public {{ terms.issueWord }} Account, and the balance amount after
transfer will be unblocked by the SCSBs.

Bidders should note that the arrangement with the Bankers to the {{ terms.issueWord }} and the
Registrar to the {{ terms.issueWord }} is **not prescribed by SEBI**. It has been established as an
arrangement between our Company, the Banker to the {{ terms.issueWord }} and the Registrar to the
{{ terms.issueWord }} to facilitate collections from the Bidders.

### Payment Mechanism

Bidders shall specify their bank account number in the Bid cum Application Form, and the SCSB shall
block an amount equivalent to the Application Amount in that account. The SCSB shall keep the
Application Amount blocked until the finalisation of the Basis of Allotment and the consequent
transfer of the amount against the allocated Equity Shares to the Public {{ terms.issueWord }}
Account, or until the withdrawal or failure of the {{ terms.issueWord }}, or until the application
is rejected, as the case may be.

In terms of the SEBI ICDR Master Circular and the SEBI ICDR Regulations, all investors applying in a
public issue shall use only the Application Supported by Blocked Amount process, providing details
of the bank account to be blocked by the Self-Certified Syndicate Bank. Individual Investors may in
addition use the UPI Mechanism together with ASBA.

### Payment into the Escrow Account for Anchor Investors

All investors other than Anchor Investors are required to bid through the ASBA process. Our Company,
in consultation with the Book Running Lead Manager and in its absolute discretion, will decide the
list of Anchor Investors to whom the confirmation of allocation note will be sent, pursuant to which
the details of the Equity Shares allocated to them will be notified.

Anchor Investors shall transfer the Bid Amount to the escrow accounts opened for the purpose:

- **Resident Anchor Investors:** {{ offer.anchorEscrowAccountResident }}
- **Non-resident Anchor Investors:** {{ offer.anchorEscrowAccountNonResident }}

Bidders should note that the escrow mechanism is **not prescribed by SEBI**. It has been established
as an arrangement between our Company, the Book Running Lead Manager, the Escrow Collection Bank and
the Registrar to the {{ terms.issueWord }} to facilitate collections from Anchor Investors.
`.trim(),
};

/**
 * Electronic Registration of Applications.
 *
 * Extraction notes, 2026-09-10:
 *   - Fifteen numbered clauses in Om Galaxy, corroborated against Maxwell,
 *     Ideas and Axiom. Every clause below has at least three extraction
 *     sources and appears in the held-out document.
 *   - The schedule of fields the intermediaries forward to the SCSBs is a
 *     numbered table in the corpus. It is a flat list of ten field names with
 *     no second column of substance, so it renders as a list rather than a
 *     table — unlike the price discovery illustration, which needed one.
 *   - The liability split is the point of this subsection and is stated twice
 *     from opposite directions: the Designated Intermediaries ARE responsible
 *     for what they accept and upload, and the Company, the Book Running Lead
 *     Manager and the Registrar are NOT. Both halves are kept.
 */
export const issueProcedureElectronicRegistration: SectionSpec = {
  id: 'issueRelated.issueProcedure.electronicRegistration',
  title: 'Electronic Registration of Applications',
  producer: 'template',
  order: 3130,
  group: 'SECTION - ISSUE RELATED INFORMATION',
  clause: 'SEBI ICDR Master Circular (bidding and upload)',
  extractedFrom: [
    'bookbuilt__manufacturing__om-galaxy__bse-sme__2026-09__rhp.pdf pp.373-374',
    'bookbuilt__engineering__maxwell-engineering__nse-emerge__2026-08__drhp.pdf',
    'bookbuilt__electricals__ideas-electricals__nse-emerge__2026-09__drhp.pdf',
  ],
  template: `
## Electronic Registration of Applications

The Designated Intermediaries will register the applications using the online facilities of the
Stock Exchange, and will undertake modification of selected fields in the application details
already uploaded before 5.00 p.m. on the Bid/{{ terms.issueWord }} Closing Date.

The Stock Exchange offers an electronic facility for registering applications. This facility is
available at the terminals of the Designated Intermediaries and their authorised agents during the
Bid/{{ terms.issueWord }} Period, and the Designated Intermediaries may upload applications until
such time as the Stock Exchange permits. This information is available with the Book Running Lead
Manager on a regular basis.

### Where responsibility sits

The Designated Intermediaries shall be responsible for any acts, mistakes, errors or omissions in
relation to the applications accepted by them, the applications uploaded by them, and the
applications accepted but not uploaded by them. Where an application is accepted and uploaded by a
Designated Intermediary other than a SCSB, the Bid cum Application Form along with the relevant
schedules shall be sent to the Designated Branch of the relevant SCSB for blocking of funds.

**Neither our Company, nor the Book Running Lead Manager, nor the Registrar to the
{{ terms.issueWord }} shall be responsible** for any acts, mistakes, errors or omissions in relation
to the applications accepted, uploaded, or accepted but not uploaded by any Designated Intermediary.

The permission given by the Stock Exchange to use its network and software for the online IPO system
should not in any way be deemed or construed to mean that compliance with the various statutory and
other requirements by our Company or the Book Running Lead Manager has been cleared or approved by
the Stock Exchange; nor does it warrant, certify or endorse the correctness or completeness of that
compliance.

### What is registered

At the time of registering an application, the Syndicate Members, Depository Participants and RTAs
shall forward a schedule to the Designated Branches of the SCSBs for blocking of funds, carrying the
symbol, intermediary code, location code, application number, category, PAN, DP ID, Client ID,
quantity and amount. The Stock Exchange prescribes a uniform character length for each of these
fields.

The Designated Intermediaries shall enter the following into the online system:

- Name of the Bidder
- Name of the issue
- Bid cum Application Form number
- Investor category
- PAN, of the first Bidder where there is more than one
- DP ID of the Bidder's demat account
- Client identification number of the Bidder's demat account
- Number of Equity Shares applied for
- Bank account details, and the bank code of the SCSB branch where the ASBA Account is maintained
- Location of the Banker to the {{ terms.issueWord }} or the Designated Branch, as applicable

Where an application is submitted electronically, the Bidder completes these details and states the
bank account number; the application form number is system generated.

### Acknowledgement and rejection

At the time of receipt of an application, the Designated Intermediary shall give the investor an
acknowledgement, by counterfoil or by specifying the application number, as proof of having accepted
the Bid cum Application Form in physical or electronic form. **That acknowledgement is
non-negotiable and by itself creates no obligation of any kind.**

Applications will not be rejected except on the technical grounds set out in this
{{ terms.documentName }}. The Designated Intermediaries have no right to reject applications on any
other basis.

### After the closing date

The Designated Intermediaries have until 5.00 p.m. on the Bid/{{ terms.issueWord }} Closing Date to
verify the DP ID and Client ID uploaded during the Bid/{{ terms.issueWord }} Period, after which the
Registrar to the {{ terms.issueWord }} receives that data from the Stock Exchange and validates it
against the depository records. The SCSBs have one day after the Bid/{{ terms.issueWord }} Closing
Date to send confirmation of funds blocked, the final certificate, to the Registrar to the
{{ terms.issueWord }}.

The details uploaded in the online IPO system shall be considered final, and Allotment will be based
on those details.
`.trim(),
};

/**
 * General Instructions — the Do's and Don'ts, and the other instructions.
 *
 * Extraction notes, 2026-09-10:
 *   - Om Galaxy lists 27 Do's and 17 Don'ts. **Only the items verified in at
 *     least two extraction sources are reproduced here.** The rest are one
 *     drafter's additions, and D26 is the record of what happens when those
 *     get copied across. A merchant banker may add more; we do not invent
 *     them.
 *
 *   - **TWO EXTRACTION SOURCES AGREE ON SOMETHING SELF-CONTRADICTORY, and it
 *     is omitted.** Om Galaxy: "Do not Bid for a Bid Amount exceeding
 *     Rs 200,000 for Bids by Individual Bidders". Maxwell: the same with
 *     "and 2 lots". Both contradict the SME minimum application size stated
 *     elsewhere in their OWN Issue Procedure — for an SME issue the Bid Amount
 *     must EXCEED Rs 2,00,000 (R-006). It is main-board retail boilerplate
 *     that survived a copy-paste.
 *
 *     The held-out document states the rule that actually exists: "Do not Bid
 *     for a Bid Amount exceeding Rs 500,000 (for Bids by UPI Bidders)" — the
 *     UPI ceiling, corroborated as a rule by all five extraction sources with
 *     the circular reference. That is what is reproduced.
 *
 *     This is the strongest case yet for the corpus discipline: two sources
 *     agreeing is not enough when both are copying the same wrong list.
 *
 *   - The cut-off Don't is phrased from the corroborated rule in
 *     `issueProcedurePriceLevels` rather than from Om Galaxy's single-source
 *     wording of it.
 */
export const issueProcedureGeneralInstructions: SectionSpec = {
  id: 'issueRelated.issueProcedure.generalInstructions',
  title: 'General Instructions',
  producer: 'template',
  order: 3155,
  group: 'SECTION - ISSUE RELATED INFORMATION',
  clause: 'R-006 (minimum application); SEBI ICDR Master Circular; Companies Act 2013, s.72',
  extractedFrom: [
    'bookbuilt__manufacturing__om-galaxy__bse-sme__2026-09__rhp.pdf pp.376-379',
    'bookbuilt__engineering__maxwell-engineering__nse-emerge__2026-08__drhp.pdf',
    'bookbuilt__electricals__ideas-electricals__nse-emerge__2026-09__drhp.pdf',
  ],
  template: `
## General Instructions

Non-Institutional Investors are not permitted to withdraw their Bids, or to lower the size of their
Bids in terms of the quantity of Equity Shares or the Bid Amount, at any stage. Individual Investors
may revise their Bids during the Bid/{{ terms.issueWord }} Period, but only upwards. Anchor
Investors are not permitted to withdraw their Bids after the Anchor Investor Bidding Date.

### Do's

- Check that you are eligible to apply under the terms of this {{ terms.documentName }} and under applicable law, rules, regulations, guidelines and approvals
- Ensure that you have Bid within the Price Band
- Read all the instructions carefully and complete the Bid cum Application Form in the prescribed form
- Ensure that the PAN, DP ID, Client ID and UPI ID are correct and that the depository account is active, as Allotment will be in dematerialised form only
- Ensure that the Bid cum Application Form bearing the stamp of a Designated Intermediary is submitted to that Designated Intermediary at the Bidding Centre
- In the case of joint Bids, ensure that the first Bidder is the ASBA Account holder, or the holder of the bank account linked to the UPI ID, and that the first Bidder has signed the form
- Ensure that the names on the Bid cum Application Form are exactly the names in which the beneficiary account is held with the Depository Participant
- Ensure that you have funds equal to the Bid Amount in the account maintained with the SCSB before submitting the form
- Request and receive a stamped acknowledgement of the Bid cum Application Form for all your Bid options
- Submit any revised Bid to the same Designated Intermediary through whom the original Bid was placed, and obtain a revised acknowledgement
- Ensure that thumb impressions and signatures other than in the languages specified in the Eighth Schedule to the Constitution of India are attested by a Magistrate, a Notary Public or a Special Executive Magistrate under official seal
- Ensure that the Demographic Details held with the depository are true, correct and current
- Ensure that the investor category and status are indicated
- Ensure that, where the Bid is under a power of attorney or by a company, body corporate or trust, the relevant documents are submitted
- Ensure that the Bid cum Application Form is delivered within the time prescribed

### Don'ts

- Do not Bid for less than the minimum Bid size
- Do not Bid, or revise a Bid Amount, to less than the Floor Price or higher than the Cap Price
- Do not pay the Bid Amount in cash, by money order, cheque, demand draft, postal order or stock invest
- Do not send Bid cum Application Forms by post; submit them to a Designated Intermediary
- Do not submit the Bid cum Application Form to a non-SCSB bank or to our Company
- Do not Bid on a form that does not bear the stamp of the relevant Designated Intermediary
- Do not Bid at the Cut-off Price if you are a QIB or a Non-Institutional Investor; only Individual Bidders may do so
- **Do not Bid for an amount exceeding Rs 5,00,000 through the UPI Mechanism**
- Do not instruct your bank to release funds blocked in the ASBA Account
- Do not submit the General Index Register number instead of the PAN
- Do not submit a Bid without ensuring that funds equivalent to the entire Bid Amount are blocked in the ASBA Account
- Do not submit Bids on plain paper, on incomplete or illegible forms, or on a form in a colour prescribed for another category of applicant
- Do not submit a Bid if you are not eligible to acquire Equity Shares under applicable law or your constitutional documents
- Do not Bid if you are not competent to contract under the Indian Contract Act, 1872, other than a minor holding a valid depository account
- Do not withdraw or lower the size of your Bid at any stage if you are a QIB or a Non-Institutional Investor
- **Do not submit a Bid using a third party's bank account, or a UPI ID linked to a third party's bank account.** Bids made in that way are liable to be rejected

The Bid cum Application Form is liable to be rejected if these instructions, as applicable, are not
complied with.

## Other Instructions for Bidders

### Joint Bids

In the case of joint Bids, the Bid should be made in the name of the Bidder whose name appears first
in the depository account. That name should be the same as it appears in the depository records.

### Multiple Bids

A Bidder should submit only one Bid cum Application Form. A Bidder may make a maximum of three Bids
at different price levels within the same Bid cum Application Form, and those options are not
treated as multiple Bids.

### Nomination Facility

A nomination facility is available in accordance with Section 72 of the Companies Act, 2013. Where
Equity Shares are allotted in dematerialised form, there is no need to make a separate nomination
with our Company — the nomination registered with the Depository Participant applies.

### Investor Grievances

For any pre-{{ terms.issueWordLower }} or post-{{ terms.issueWordLower }} problem regarding demat
credit, refunds or unblocking, investors may contact the Company Secretary and Compliance Officer of
our Company.
`.trim(),
};

/**
 * Information for the Bidders, and Submission of Bids.
 *
 * Extraction notes, 2026-09-10:
 *   - Om Galaxy lists ten numbered items. **Two are its alone** — that the
 *     opening and closing dates are declared in the document and advertised,
 *     and that copies are available with the Registrar — so neither is
 *     reproduced (D26). The second is in any case already covered by
 *     `issueProcedureAvailability`, which has four sources.
 *   - **Not reproduced:** "In case of Bidders (excluding NIIs and QIBs)
 *     Bidding at cut-off price, the Bidders may instruct the SCSBs to block
 *     Bid Amount based on the Cap Price less Discount". Om Galaxy is the only
 *     extraction source; the held-out document also states it, but using the
 *     held-out document as a source is what makes it stop being a check. The
 *     substance is covered by `issueProcedurePriceLevels`, which says the same
 *     thing from two sources.
 */
export const issueProcedureInformationForBidders: SectionSpec = {
  id: 'issueRelated.issueProcedure.informationForBidders',
  title: 'Information for the Bidders and Submission of Bids',
  producer: 'template',
  order: 3106,
  group: 'SECTION - ISSUE RELATED INFORMATION',
  clause: 'SEBI ICDR Master Circular (ASBA and bidding)',
  extractedFrom: [
    'bookbuilt__manufacturing__om-galaxy__bse-sme__2026-09__rhp.pdf pp.364-365',
    'bookbuilt__engineering__maxwell-engineering__nse-emerge__2026-08__drhp.pdf',
  ],
  template: `
## Information for the Bidders

Bidders interested in subscribing for the Equity Shares should approach a Designated Intermediary to
register their applications. During the Bid/{{ terms.issueWord }} Period, Bidders may approach any
of the Designated Intermediaries for this purpose.

The Bid cum Application Form may be submitted in physical or electronic mode, either to the SCSB
with whom the ASBA Account is maintained or to another Designated Intermediary. SCSBs may provide an
electronic mode of collecting applications.

Bidders applying directly through a SCSB should ensure that the Bid cum Application Form is
submitted to a Designated Branch of that SCSB where the ASBA Account is maintained. Forms submitted
directly to a SCSB should bear the stamp of the SCSB or its Designated Branch; a form that does not
is liable to be rejected.

Where the PAN, DP ID and Client ID stated on the Bid cum Application Form, and entered into the
electronic collecting system of the Stock Exchange by the Designated Intermediary, do not match
those held in the depository's records, the application is liable to be rejected.
`.trim(),
};

/**
 * Bids by Anchor Investors.
 *
 * **This closes a gap carried in the handoff since the first Issue Procedure
 * extraction** — the Anchor Investor subsection was listed as not extracted.
 *
 * Extraction notes, 2026-09-10:
 *   - Unusually well corroborated: the 60% ceiling, the Rs 200.00 Lakhs
 *     minimum bid, the one-working-day-early bidding window, the allottee
 *     bands, the no-withdrawal rule and the two-working-day top-up all appear
 *     in FIVE extraction sources, and most appear in the held-out document
 *     too. The 40% reservation split appears in three.
 *   - The allottee bands are stated in Lakhs exactly as the corpus states
 *     them, rather than converted, because the bands are thresholds and
 *     restating a threshold in different units invites an off-by-one.
 */
export const issueProcedureAnchorInvestors: SectionSpec = {
  id: 'issueRelated.issueProcedure.anchorInvestors',
  title: 'Bids by Anchor Investors',
  producer: 'template',
  order: 3112,
  group: 'SECTION - ISSUE RELATED INFORMATION',
  appliesIf: (facts) => facts.offer.issueType === 'BOOK_BUILT',
  clause: 'R-024 (allocation); ICDR Reg 2(1)(ss) (QIB definition)',
  extractedFrom: [
    'bookbuilt__manufacturing__om-galaxy__bse-sme__2026-09__rhp.pdf pp.365-366',
    'bookbuilt__engineering__maxwell-engineering__nse-emerge__2026-08__drhp.pdf',
    'bookbuilt__watertech__photonics-watertech__nse-emerge__2026-06__drhp.pdf',
  ],
  template: `
## Bids by Anchor Investors

Our Company, in consultation with the Book Running Lead Manager, may consider participation by
Anchor Investors in the {{ terms.issueWord }} for **up to 60% of the QIB Portion**, in accordance
with the SEBI ICDR Regulations. Only QIBs as defined in Regulation 2(1)(ss) of the SEBI ICDR
Regulations, and who meet the conditions specified for Anchor Investors, are eligible.

Anchor Investor Application Forms will be made available at the offices of the Book Running Lead
Manager.

A Bid by an Anchor Investor must be for such number of Equity Shares that the **Bid Amount is at
least Rs 200.00 Lakhs**, and no Bid may be submitted for more than 60% of the QIB Portion. In the
case of a Mutual Fund, separate Bids by individual schemes of the same Mutual Fund are aggregated.

**40% of the Anchor Investor Portion** is reserved as to 33.33% for domestic Mutual Funds and 6.67%
for life insurance companies and pension funds, subject to valid Bids being received from them at or
above the Anchor Investor Allocation Price.

Bidding for Anchor Investors opens **one Working Day before the Bid/{{ terms.issueWord }} Opening
Date** and is completed on the same day.

### How many Anchor Investors

Our Company, in consultation with the Book Running Lead Manager, will finalise allocation to Anchor
Investors on a discretionary basis, subject to the following limits on the number of Allottees:

- Where the allocation in the Anchor Investor Portion is **up to Rs 200.00 Lakhs**: a maximum of two Anchor Investors.
- Where it is **more than Rs 200.00 Lakhs and up to Rs 2,500.00 Lakhs**: a minimum of two and a maximum of fifteen Anchor Investors, subject to a minimum Allotment of Rs 100.00 Lakhs per Anchor Investor.
- Where it is **more than Rs 2,500.00 Lakhs**: a minimum of five and a maximum of fifteen Anchor Investors for allocation up to Rs 2,500.00 Lakhs, and an additional ten Anchor Investors for every additional Rs 2,500.00 Lakhs or part thereof, subject to a minimum Allotment of Rs 100.00 Lakhs per Anchor Investor.

Allocation to Anchor Investors is completed on the Anchor Investor Bid/{{ terms.issueWord }} Period.
The number of Equity Shares allocated to Anchor Investors, and the price at which the allocation is
made, will be made available in the public domain by the Book Running Lead Manager before the
Bid/{{ terms.issueWord }} Opening Date.

### Terms binding on Anchor Investors

**Anchor Investors cannot withdraw or lower the size of their Bids at any stage after submission.**

Where the {{ terms.issueWord }} Price is higher than the Anchor Investor Allocation Price, the
difference is payable by the Anchor Investors **within two Working Days** of the
Bid/{{ terms.issueWord }} Closing Date. Where the {{ terms.issueWord }} Price is lower than the
Anchor Investor Allocation Price, Allotment to successful Anchor Investors will be at the higher
price, that is, at the Anchor Investor Allocation Price.

The price at which Equity Shares are offered to an Anchor Investor shall not be lower than the price
offered to other applicants.
`.trim(),
};

/**
 * Build of the Book, Withdrawal, Price Discovery and the illustration.
 *
 * COMPUTED rather than template, for one reason: the price discovery
 * illustration is a table, and the template engine emits only headings,
 * paragraphs and lists. The prose still comes from `renderTemplate` — the
 * compute function assembles template output around a table node rather than
 * building the paragraphs by hand, so the boilerplate stays editable as data.
 *
 * Extraction notes, 2026-09-10:
 *   - Om Galaxy RHP (BSE SME) pp.374-375 diffed against Maxwell DRHP
 *     (NSE Emerge), corroborated clause by clause against Photonics, Ideas and
 *     Axiom. Every clause below carries at least two extraction sources;
 *     Century Business Media is held out.
 *   - The illustration is IDENTICAL in all five extraction sources, down to
 *     the Rs 20 to Rs 24 band, the 3,000 Equity Shares and the five bid
 *     quantities. It is deliberately generic in the real documents — "solely
 *     for illustrative purposes and is not specific to the Issue" — so it is
 *     literal text here rather than being derived from the issuer's own band.
 *   - Withdrawal splits by investor category and that split is load-bearing:
 *     individual investors may withdraw until the closing date, QIBs and NIIs
 *     may neither withdraw nor lower their bids at any stage.
 */
export const issueProcedureBookBuilding: SectionSpec = {
  id: 'issueRelated.issueProcedure.bookBuilding',
  title: 'Build of the Book, Withdrawal and Price Discovery',
  producer: 'computed',
  order: 3150,
  group: 'SECTION - ISSUE RELATED INFORMATION',
  appliesIf: (facts) => facts.offer.issueType === 'BOOK_BUILT',
  clause: 'R-024 (allocation); ICDR Reg 247, Reg 250',
  extractedFrom: [
    'bookbuilt__manufacturing__om-galaxy__bse-sme__2026-09__rhp.pdf pp.374-375',
    'bookbuilt__engineering__maxwell-engineering__nse-emerge__2026-08__drhp.pdf',
  ],
  compute: ({ facts, provenance }) => {
    const ctx = { facts: { ...facts, terms: derivedTerms(facts) }, provenance };

    const before = renderTemplate(
      `
## Build of the Book

Bids received from various Bidders through the Designated Intermediaries are electronically uploaded
on the Bidding Platform of the Stock Exchange on a regular basis. The book gets built up at various
price levels. This information is available with the Book Running Lead Manager at the end of the
Bid/{{ terms.issueWord }} Period.

Based on the aggregate demand and price for Bids registered on the Stock Exchange Platform, a
graphical representation of consolidated demand and price, as available on the website of the Stock
Exchange, is made available at the Bidding centres during the Bid/{{ terms.issueWord }} Period.

## Withdrawal of Bids

Individual Investors can withdraw their Bids until the Bid/{{ terms.issueWord }} Closing Date. Where
an Individual Investor wishes to withdraw a Bid during the Bid/{{ terms.issueWord }} Period, this is
done by submitting a request to the Designated Intermediary concerned, who shall do the requisite,
including unblocking of the funds by the SCSB in the ASBA Account.

The Registrar to the {{ terms.issueWord }} shall instruct the SCSB to unblock the ASBA Account on
the Designated Date. **QIBs and Non-Institutional Investors can neither withdraw nor lower the size
of their Bids at any stage.**

## Price Discovery and Allocation

Based on the demand generated at various price levels, our Company, in consultation with the Book
Running Lead Manager, shall finalise the {{ terms.issueWord }} Price and the Anchor Investor
{{ terms.issueWord }} Price.

Under-subscription in any category, except the QIB Category, may be met with spillover from any
other category or combination of categories at the discretion of our Company, in consultation with
the Book Running Lead Manager and the Designated Stock Exchange, and in accordance with the SEBI
ICDR Regulations. **The unsubscribed portion in the QIB Category is not available for subscription
to other categories.**

Where the Individual Investor category is entitled to more than the allocated portion on a
proportionate basis, that category shall be allotted the higher percentage. Allocation to Anchor
Investors shall be at the discretion of our Company, in consultation with the Book Running Lead
Manager, subject to compliance with the SEBI ICDR Regulations.

**Illustration of the book building and price discovery process.** This example is solely for
illustrative purposes and is not specific to this {{ terms.issueWord }}; it also excludes Bidding by
Anchor Investors. Bidders may bid at any price within the Price Band. Assume a Price Band of Rs 20
to Rs 24 per share, an issue size of 3,000 Equity Shares, and receipt of five Bids, as below.
`.trim(),
      ctx,
    );

    const after = renderTemplate(
      `
The price discovery is a function of demand at various prices. The highest price at which our
Company is able to issue the desired number of Equity Shares is the price at which the book cuts
off — Rs 22.00 in the example above. Our Company, in consultation with the Book Running Lead
Manager, may finalise the {{ terms.issueWord }} Price at or below that Cut-Off Price. All Bids at or
above the {{ terms.issueWord }} Price, and cut-off Bids, are valid Bids and are considered for
allocation in the respective categories.
`.trim(),
      ctx,
    );

    return [
      ...before,
      {
        type: 'table',
        caption: 'Illustrative book at five bid levels',
        headers: ['Bid quantity', 'Bid amount (Rs)', 'Cumulative quantity', 'Subscription'],
        numericColumns: [0, 1, 2, 3],
        rows: [
          ['500', '24', '500', '16.67%'],
          ['1,000', '23', '1,500', '50.00%'],
          ['1,500', '22', '3,000', '100.00%'],
          ['2,000', '21', '5,000', '166.67%'],
          ['2,500', '20', '7,500', '250.00%'],
        ],
        footnotes: [
          'Illustrative only. The figures are identical in every corpus document and are not derived from this issuer\'s price band.',
        ],
      },
      ...after,
    ];
  },
};

/**
 * Withdrawal of the Issue, the underwriting agreement, RoC filing and the
 * advertisements.
 *
 * Extraction notes, 2026-09-10:
 *   - Om Galaxy pp.349-350 and 375-376, against Maxwell, Photonics, Ideas and
 *     Axiom. The pre-issue advertisement clause cites Reg 247(2) in four
 *     sources; the Part A of Schedule X format in five.
 *   - The newspapers and the regional-language gloss reuse the same derived
 *     terms as Application Size, including the Hindi-state suppression that
 *     held-out verification produced (see the handoff).
 */
export const issueProcedureWithdrawalAndAdvertisement: SectionSpec = {
  id: 'issueRelated.issueProcedure.withdrawalAndAdvertisement',
  title: 'Withdrawal of the Issue, Underwriting and Advertisements',
  producer: 'template',
  order: 3180,
  group: 'SECTION - ISSUE RELATED INFORMATION',
  clause: 'ICDR Reg 247(2), Reg 250, Schedule X Part A; Companies Act 2013, s.26, s.30, s.32',
  extractedFrom: [
    'bookbuilt__manufacturing__om-galaxy__bse-sme__2026-09__rhp.pdf pp.349-350, 375-376',
    'bookbuilt__engineering__maxwell-engineering__nse-emerge__2026-08__drhp.pdf',
  ],
  asks: {
    'offer.underwritingAgreementDate': 'Date of the Underwriting Agreement',
    'offer.englishNewspaper': 'English national daily with wide circulation',
    'offer.hindiNewspaper': 'Hindi national daily with wide circulation',
    'offer.regionalNewspaper': 'Regional daily in the language of the registered office state',
  },
  template: `
## Withdrawal of the {{ terms.issueWord }}

Our Company, in consultation with the Book Running Lead Manager, reserves the right not to proceed
with the {{ terms.issueWord }} at any time before the {{ terms.issueWord }} Opening Date without
assigning any reason. In such an event, our Company shall issue a public notice in the newspapers in
which the pre-{{ terms.issueWordLower }} advertisements were published, within two days of the
Bid/{{ terms.issueWord }} Closing Date or such other time as may be prescribed by SEBI, giving the
reasons for not proceeding. The Book Running Lead Manager, through the Registrar to the
{{ terms.issueWord }}, shall notify the SCSBs to unblock the bank accounts of the ASBA Bidders
within one working day from the date of receipt of such notification. Our Company shall also inform
the Stock Exchange on which the Equity Shares are proposed to be listed.

If our Company, in consultation with the Book Running Lead Manager, withdraws the
{{ terms.issueWord }} after the Bid/{{ terms.issueWord }} Closing Date and thereafter determines
that it will proceed with a public offering of the Equity Shares, our Company shall file a fresh
draft offer document with the Stock Exchange.

Notwithstanding the foregoing, the {{ terms.issueWord }} is subject to obtaining the final listing
and trading approvals of the Stock Exchange, which our Company shall apply for after Allotment, and
to the filing of the Prospectus with the RoC.

## Signing of the Underwriting Agreement and Filing with the RoC

Our Company has entered into an Underwriting Agreement dated
{{ offer.underwritingAgreementDate | date }}.

A copy of this {{ terms.documentName }} has been filed with the RoC, and a copy of the Prospectus
will be filed with the RoC in terms of Section 26 and Section 32 of the Companies Act, 2013.

## Pre-{{ terms.issueWord }} Advertisement

As required by Regulation 247(2) of the SEBI ICDR Regulations, our Company made a public
announcement within two working days of filing the draft offer document with
{{ terms.exchangeLongName }}, in all editions of the English national daily newspaper
{{ offer.englishNewspaper }}, all editions of the Hindi national daily newspaper
{{ offer.hindiNewspaper }}, and all editions of the {{ terms.regionalLanguage }} regional daily
newspaper {{ offer.regionalNewspaper }}{{#unless terms.regionalLanguageIsHindi }}
({{ terms.regionalLanguage }} being the regional language of {{ terms.registeredOfficeState }},
where our Registered Office is located){{/unless}}, disclosing the fact of filing and inviting the
public to provide their comments to the exchange, our Company or the Book Running Lead Manager in
respect of the disclosures made.

Subject to Section 30 of the Companies Act, 2013, our Company shall, after filing this
{{ terms.documentName }} with the RoC, publish a pre-{{ terms.issueWordLower }} advertisement in the
form prescribed by the SEBI ICDR Regulations, in the same newspapers, each with wide circulation. In
that advertisement we shall state the Bid/{{ terms.issueWord }} Opening Date, the
Bid/{{ terms.issueWord }} Closing Date and the floor price or price band, subject to Regulation 250
of the SEBI ICDR Regulations. The advertisement shall be in the format prescribed in **Part A of
Schedule X** of the SEBI ICDR Regulations.

## Advertisement Regarding {{ terms.issueWord }} Price and Prospectus

Our Company will issue a statutory advertisement after the filing of the Prospectus with the RoC.
In addition to the information required in a statutory advertisement, it shall indicate the final
derived {{ terms.issueWord }} Price. Any material updates between the date of this
{{ terms.documentName }} and the date of the Prospectus will be included in that advertisement.
`.trim(),
};

export const issueRelatedSections: SectionSpec[] = [
  issueProcedure,
  issueProcedureUpi,
  issueProcedureAvailability,
  issueProcedureInformationForBidders,
  issueProcedureApplicationSize,
  issueProcedureBidsByCategory,
  issueProcedureAnchorInvestors,
  issueProcedurePriceLevels,
  issueProcedureTermsOfPayment,
  issueProcedureElectronicRegistration,
  issueProcedureBookBuilding,
  issueProcedureGeneralInstructions,
  issueProcedureTechnicalRejection,
  issueProcedureWithdrawalAndAdvertisement,
  issueProcedureBasisOfAllotment,
  issueProcedureUndertakings,
];
