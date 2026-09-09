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

export const issueRelatedSections: SectionSpec[] = [issueProcedure];
