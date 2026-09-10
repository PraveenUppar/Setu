import type { SectionSpec } from '../section';

/**
 * TERMS OF THE ISSUE — measured at ~10 pages and near-fully invariant.
 *
 * Extraction notes, 2026-09-10:
 *   Om Galaxy RHP (BSE SME) pp.408-412 and Maxwell DRHP (NSE Emerge) pp.307-311.
 *   Substance identical. Every difference is a fact we already hold: face
 *   value, price band, the newspapers, the approval dates.
 *
 *   Authority for the Issue appears BOTH here and in Other Regulatory and
 *   Statutory Disclosures, with the same dates. That is how the real documents
 *   read, so it is reproduced in both rather than cross-referenced — a reader
 *   of either section gets the dates without turning pages.
 *
 *   Jurisdiction is a fact, not a derivation. Om Galaxy is registered in Vasai,
 *   Thane and names Mumbai — the High Court seat, not the office city.
 *
 * Still to extract: allotment only in dematerialised form, joint holders,
 * nomination facility, period of subscription, withdrawal of the issue,
 * arrangements for disposal of odd lots, restrictions on transfer.
 */
export const termsOfIssue: SectionSpec = {
  id: 'issueRelated.termsOfIssue',
  title: 'Terms of the Issue',
  producer: 'template',
  order: 3000,
  group: 'SECTION - ISSUE RELATED INFORMATION',
  appliesIf: (facts) => facts.offer.issueType === 'BOOK_BUILT',
  clause: 'R-005, R-006',
  requiredFacts: [
    'capital.faceValue',
    'offer.floorPrice',
    'offer.capPrice',
    'offer.jurisdiction',
  ],
  asks: {
    'offer.floorPrice': 'Floor Price per Equity Share, being the lower end of the Price Band',
    'offer.capPrice': 'Cap Price per Equity Share, being the higher end of the Price Band',
    'offer.jurisdiction': 'City and state of the courts having exclusive jurisdiction',
  },
  extractedFrom: [
    'bookbuilt__manufacturing__om-galaxy__bse-sme__2026-09__rhp.pdf pp.408-412',
    'bookbuilt__engineering__maxwell-engineering__nse-emerge__2026-08__drhp.pdf pp.307-311',
  ],
  template: `
## Terms of the {{ terms.issueWord }}

The Equity Shares being issued are subject to the provisions of the Companies Act, 2013, the SCRA,
the SCRR, the SEBI ICDR Regulations, the SEBI LODR Regulations, our Memorandum of Association and
Articles of Association, the terms of this {{ terms.documentName }}, the Prospectus, the Abridged
Prospectus, the Bid cum Application Form, the Revision Form, the Allotment advices, and such other
terms and conditions as may be incorporated in the Allotment advices and other documents or
certificates executed in respect of the {{ terms.issueWord }}. The Equity Shares shall also be
subject to all applicable laws, guidelines, rules, notifications and regulations relating to the
issue of capital and the listing and trading of securities, issued from time to time by SEBI, the
Government of India, the Stock Exchange, the RoC and any other authority, as in force on the date of
the {{ terms.issueWord }}.

### The {{ terms.issueWord }}

The {{ terms.issueWord }} comprises a Fresh Issue by our Company{{#if offer.sellingShareholders.length }} and an Offer for Sale by the Selling Shareholders{{/if}}.
The fees and expenses relating to the {{ terms.issueWord }} shall be borne in accordance with
applicable law.

### Authority for the {{ terms.issueWord }}

The present public {{ terms.issueWord }} of up to {{ offer.freshIssueShares | number }} Equity
Shares has been authorised by a resolution of the Board of Directors of our Company at its meeting
held on {{ offer.boardResolutionDate | date }}, and was approved by the Shareholders of our Company
by a special resolution passed at the Extraordinary General Meeting held on
{{ offer.shareholderResolutionDate | date }}, in accordance with the provisions of Section 62(1)(c)
of the Companies Act, 2013.

### Ranking of Equity Shares

The Equity Shares being issued shall be subject to the provisions of the Companies Act, 2013 and our
Memorandum of Association and Articles of Association, and shall rank pari passu in all respects
with the existing Equity Shares of our Company, including in respect of dividend. The Allottees,
upon Allotment of Equity Shares under this {{ terms.issueWord }}, will be entitled to receive
dividends and other corporate benefits, if any, declared by our Company after the date of Allotment.

### Mode of Payment of Dividend

Our Company shall pay dividends, if declared, to the Shareholders in accordance with the provisions
of the Companies Act, 2013, our Memorandum of Association and Articles of Association, the SEBI LODR
Regulations, and any other guidelines or directions issued by the Government in this regard.
Dividends, if any, declared by our Company after the date of Allotment will be payable to those
Bidders who have been Allotted Equity Shares pursuant to the {{ terms.issueWord }}, for the entire
year, in accordance with applicable law.

### Face Value and Issue Price

The face value of each Equity Share is Rs {{ capital.faceValue }}. The Issue Price at the lower end
of the Price Band is Rs {{ offer.floorPrice }} per Equity Share (the "Floor Price"), and at the
higher end of the Price Band is Rs {{ offer.capPrice }} per Equity Share (the "Cap Price").

The Price Band and the minimum Bid Lot for the {{ terms.issueWord }} have been decided by our
Company in consultation with the Book Running Lead Manager, and will be published in all editions of
{{ offer.englishNewspaper }}, an English national daily newspaper, all editions of
{{ offer.hindiNewspaper }}, a Hindi national daily newspaper, and all editions of
{{ offer.regionalNewspaper }}, a regional daily newspaper{{#unless terms.regionalLanguageIsHindi }}
({{ terms.regionalLanguage }} being the regional language of {{ terms.registeredOfficeState }},
where our Registered Office is located){{/unless}}, each with wide circulation, at least two Working
Days prior to the Bid/{{ terms.issueWord }} Opening Date, and shall be made available to the Stock
Exchange for uploading on its website.

The Price Band, along with the relevant financial ratios calculated at the Floor Price and at the Cap
Price, shall be pre-filled in the Bid cum Application Forms available on the website of the Stock
Exchange.

### Minimum Application Value, Market Lot and Trading Lot

The Equity Shares shall be Allotted only in dematerialised form. In terms of the SEBI ICDR
Regulations, the trading of the Equity Shares shall only be in dematerialised form for all
investors. The Bid Lot is {{ offer.lotSize | number }} Equity Shares, and the minimum Bid is for two
lots, being {{ terms.minimumBidShares | number }} Equity Shares, such that the Bid Amount exceeds
Rs 2,00,000.

### Minimum Number of Allottees

In accordance with Regulation 268 of the SEBI ICDR Regulations, the minimum number of Allottees in
the {{ terms.issueWord }} shall be 200. If the minimum number of prospective Allottees is fewer than
200, no Allotment will be made pursuant to the {{ terms.issueWord }} and the monies collected shall
be unblocked forthwith.

### Jurisdiction

Exclusive jurisdiction for the purpose of this {{ terms.issueWord }} is with the competent courts and
authorities in {{ offer.jurisdiction }}.

The Equity Shares have not been and will not be registered under the U.S. Securities Act of 1933, as
amended (the "Securities Act"), or any state securities laws in the United States, and may not be
offered or sold within the United States, or to or for the account or benefit of U.S. persons as
defined in Regulation S under the Securities Act, except pursuant to an exemption from, or in a
transaction not subject to, the registration requirements of the Securities Act. Accordingly, the
Equity Shares will be offered and sold outside the United States in compliance with Regulation S and
the applicable laws of the jurisdiction where those offers and sales occur.
`.trim(),
};
