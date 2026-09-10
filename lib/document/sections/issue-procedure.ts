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
 * The exception is the Section 40(3) separate-bank-account bullet under
 * Utilisation of Proceeds — Century references Section 40 only in a penalties
 * context, so that ONE bullet rests on Maxwell alone. The other four bullets of
 * that subsection matched. Worth re-confirming against a third document before
 * this ships.
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
- Bids by Individual Bidders with a Bid Amount exceeding Rs 2,00,000.
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

export const issueRelatedSections: SectionSpec[] = [
  issueProcedure,
  issueProcedureApplicationSize,
  issueProcedureBidsByCategory,
  issueProcedureTechnicalRejection,
  issueProcedureBasisOfAllotment,
  issueProcedureUndertakings,
];
