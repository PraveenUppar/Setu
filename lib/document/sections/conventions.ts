import { derivedTerms, type SectionSpec } from '../section';
import { renderTemplate } from '../template';

/**
 * The last of the extractable Wave 1 boilerplate: four short subsections
 * measured at 2-3, 1, 2-3 and 1 pages, and among the most invariant text in
 * the document.
 *
 * Extraction notes, 2026-09-10:
 *   Om Galaxy RHP (BSE SME) and Maxwell DRHP (NSE Emerge), corroborated
 *   clause by clause against Photonics, Ideas and Axiom. Century Business
 *   Media is held out.
 *
 *   Every clause below carries at least three extraction sources, and most
 *   appear in the held-out document too — the highest corroboration of any
 *   section built so far, which is what "99% invariant" in the section map
 *   turned out to mean in practice.
 *
 *   PAGE CROSS-REFERENCES ARE DROPPED. The corpus writes 'see "Definitions
 *   and Abbreviations" on page 1'. We do not paginate until DOCX export, and
 *   a page number invented here would be wrong in every document. Section
 *   names are kept; the numbers are not.
 */

/**
 * #2 — Certain Conventions, Presentation of Financial, Industry and
 * Market Data.
 */
export const conventions: SectionSpec = {
  id: 'general.conventions',
  partOf: '2. Certain Conventions, Presentation of Financial, Industry and Market Data',
  title: 'Certain Conventions, Presentation of Financial, Industry and Market Data',
  producer: 'template',
  order: 200,
  group: 'SECTION I - GENERAL',
  clause: 'ICDR Schedule VI Part A',
  extractedFrom: [
    'bookbuilt__manufacturing__om-galaxy__bse-sme__2026-09__rhp.pdf pp.17-19',
    'bookbuilt__engineering__maxwell-engineering__nse-emerge__2026-08__drhp.pdf pp.16-17',
  ],
  template: `
## Certain Conventions, Presentation of Financial, Industry and Market Data

### Certain Conventions

All references to "India" in this {{ terms.documentName }} are to the Republic of India and its
territories and possessions. All references to the "Government", "Indian Government", "GoI",
"Central Government" or the "State Government" are to the Government of India, central or state, as
applicable. All references to the "U.S.", "USA" or "United States" are to the United States of
America and its territories and possessions.

Unless otherwise specified, all references to time in this {{ terms.documentName }} are to Indian
Standard Time.

### Financial Data

Unless the context requires otherwise, the financial information in this {{ terms.documentName }} is
derived from the Restated Financial Information of our Company.

Our Company's financial year commences on April 1 of the immediately preceding calendar year and
ends on March 31 of that calendar year, so all references to a particular financial year or fiscal
are to the twelve-month period ending on March 31 of that year.

The degree to which the Restated Financial Information included in this {{ terms.documentName }}
will provide meaningful information is entirely dependent on the reader's level of familiarity with
Indian accounting policies and practices, Indian GAAP, the Companies Act, 2013 and the SEBI ICDR
Regulations. Any reliance by persons not familiar with these on the financial disclosures presented
in this {{ terms.documentName }} should accordingly be limited.

### Currency and Units of Presentation

All references to:

- "Rupees", "Rs." or the rupee symbol are to Indian Rupees, the official currency of the Republic of India
- "US$", "US Dollar" or "USD" are to United States Dollars, the official currency of the United States of America
- "EUR" or the euro symbol are to the Euro, the official currency of certain member states of the European Union

In this {{ terms.documentName }}, unless the context otherwise requires, a reference to one gender
includes the other; "Lakh" means one hundred thousand; "million" means ten lakh; "Crore" means ten
million; and "Billion" means one hundred crore.

Any discrepancy in a table between the total and the sum of the amounts listed is due to rounding
off. All figures in decimals have been rounded off to the second decimal place, and all percentages
to two decimal places.

### Industry and Market Data

Unless stated otherwise, industry and market data used in this {{ terms.documentName }} has been
obtained or derived from publicly available information and industry publications. Industry
publications generally state that the information they contain has been obtained from sources
believed to be reliable, but that their accuracy and completeness are not guaranteed and their
reliability cannot be assured.

Although we believe the industry and market data used in this {{ terms.documentName }} is reliable,
it has not been independently verified by our Company, the Book Running Lead Manager, or any of
their respective affiliates or advisors. The data used in these sources may have been reclassified
by us for the purposes of presentation. Data from these sources may also not be comparable.

### Definitions

For definitions, see "Definitions and Abbreviations". In "Main Provisions of the Articles of
Association", defined terms have the meaning given to them in the Articles of Association of our
Company.
`.trim(),
};

/**
 * #22 — Dividend Policy.
 *
 * NOT included: the record-date entitlement paragraph — "all Equity
 * Shareholders whose names appear in the register of members on the record
 * date are entitled to be paid". It is in Om Galaxy alone, and Maxwell's only
 * mention of a record date is in a different context entirely. That is the
 * FOURTH single-sourced sentence caught in Om Galaxy (D26, D27), and the
 * pattern is now reliable enough to check for by default.
 */
export const dividendPolicy: SectionSpec = {
  id: 'general.dividendPolicy',
  partOf: '22. Dividend Policy',
  title: 'Dividend Policy',
  producer: 'template',
  order: 2700,
  group: 'SECTION - ABOUT THE COMPANY',
  clause: 'Companies Act 2013, s.123; SEBI LODR Regulations',
  extractedFrom: [
    'bookbuilt__manufacturing__om-galaxy__bse-sme__2026-09__rhp.pdf p.262',
    'bookbuilt__engineering__maxwell-engineering__nse-emerge__2026-08__drhp.pdf p.228',
  ],
  template: `
## Dividend Policy

The declaration and payment of dividend on our Equity Shares, if any, will be recommended by our
Board of Directors and approved by our Shareholders at their discretion, in accordance with the
provisions of our Articles of Association and applicable law, including the Companies Act, 2013 and
the rules issued thereunder. The Articles of Association also give our Board the discretion to
declare and pay interim dividends.

No dividend shall be payable for any financial year except out of the profits of our Company for
that year, or of any previous financial year or years, arrived at after providing for depreciation
in accordance with the provisions of the Companies Act, 2013.

Any dividend to be declared will be recommended by our Board depending upon our financial condition,
results of operations, capital requirements and surplus, contractual obligations and restrictions,
the terms of our credit facilities and other financing arrangements at the time the dividend is
considered, and other relevant factors, and approved by our Shareholders at their discretion.

Our ability to pay dividends in the future will depend on our future earnings, cash flows, working
capital requirements, capital expenditure and financial condition.

Dividends declared by our Company after the date of Allotment will be payable to the Bidders who
have been allotted Equity Shares pursuant to the {{ terms.issueWord }}, for the entire year, in
accordance with applicable law.
`.trim(),
};

/**
 * #34 — Restrictions on Foreign Ownership of Indian Securities.
 *
 * Measured at 2-3 pages and roughly 99% invariant: it describes the FDI
 * regime, which is the same for every issuer. The one thing that varies is
 * the sectoral cap, and that is NOT stated here — the corpus documents point
 * at the FDI Policy rather than reciting a number, and reciting one for the
 * wrong sector would be worse than silence.
 */
export const foreignOwnership: SectionSpec = {
  id: 'issueRelated.foreignOwnership',
  partOf: '34. Restrictions on Foreign Ownership of Indian Securities',
  title: 'Restrictions on Foreign Ownership of Indian Securities',
  producer: 'template',
  order: 3400,
  group: 'SECTION - ISSUE RELATED INFORMATION',
  clause: 'FEMA 1999; FEMA (Non-debt Instruments) Rules 2019; Consolidated FDI Policy',
  extractedFrom: [
    'bookbuilt__manufacturing__om-galaxy__bse-sme__2026-09__rhp.pdf p.390',
    'bookbuilt__engineering__maxwell-engineering__nse-emerge__2026-08__drhp.pdf',
  ],
  template: `
## Restrictions on Foreign Ownership of Indian Securities

Foreign investment in Indian securities is regulated through the Industrial Policy, 1991 of the
Government of India and the Foreign Exchange Management Act, 1999 ("FEMA"). While the Industrial
Policy prescribes the limits and the conditions subject to which foreign investment can be made in
different sectors of the Indian economy, FEMA regulates the precise manner in which that investment
may be made.

The Government of India has from time to time made policy pronouncements on foreign direct
investment through press notes and press releases. The Department for Promotion of Industry and
Internal Trade issued the Consolidated Foreign Direct Investment Policy (the "FDI Policy"), which
consolidates the policy framework in force. The Foreign Exchange Management (Non-debt Instruments)
Rules, 2019 (the "FEMA NDI Rules") govern the instruments through which that investment is made.

Under the FEMA NDI Rules, a person resident outside India may invest in India subject to the terms
and conditions specified there. **An entity of a country which shares a land border with India, or
where the beneficial owner of an investment into India is situated in or is a citizen of any such
country, may invest only through the Government approval route.** These restrictions also apply to
subscribers of offshore derivative instruments. Our Company cannot assure investors that any
required approval from the RBI or any other government agency will be obtained, on any particular
terms or at all.

The transfer of shares between an Indian resident and a non-resident does not require the prior
approval of the RBI, provided that the activities of the investee company are under the automatic
route under the FDI Policy and the transfer does not attract the provisions of the Takeover
Regulations, and provided that the transfer complies with the pricing guidelines and reporting
requirements specified by the RBI.

Under the FDI Policy, the maximum permitted foreign investment in an issuing entity — the sectoral
cap — is composite unless explicitly provided otherwise, and includes all types of foreign
investment, direct and indirect, whether made as FDI, by FPIs, by NRIs or OCIs, by LLPs, by FVCIs,
through investment vehicles or through depository receipts.

As per the existing policy of the Government of India, Overseas Corporate Bodies cannot participate
in this {{ terms.issueWord }}. Investors are advised to confirm their eligibility under the relevant
laws before investing or transferring Equity Shares.

The Equity Shares have not been and will not be registered under the U.S. Securities Act or any
state securities laws in the United States, and may not be offered or sold within the United States
except pursuant to an exemption from, or in a transaction not subject to, the registration
requirements of the U.S. Securities Act and applicable state securities laws.
`.trim(),
};

/**
 * #37 — Declaration.
 *
 * The final page of the document, and the one that carries personal
 * liability: it is signed by every Director, the Company Secretary and the
 * Chief Financial Officer. The signature block is built from the fact base
 * rather than typed, so it cannot silently omit a signatory.
 */
export const declaration: SectionSpec = {
  id: 'other.declaration',
  partOf: '37. Declaration',
  title: 'Declaration',
  producer: 'computed',
  order: 3900,
  group: 'SECTION - OTHER INFORMATION',
  clause: 'Companies Act 2013, s.26; SEBI ICDR Regulations',
  extractedFrom: [
    'bookbuilt__engineering__maxwell-engineering__nse-emerge__2026-08__drhp.pdf',
    'bookbuilt__gas-engineering__axiom-gas__nse-emerge__2026-09__rhp.pdf',
  ],
  compute: ({ facts, provenance }) => {
    const ctx = { facts: { ...facts, terms: derivedTerms(facts) }, provenance };

    const prose = renderTemplate(
      `
## Declaration

We hereby declare that all relevant provisions of the Companies Act, 2013 and the rules, regulations
and guidelines issued by the Government of India, and the rules, regulations and guidelines issued
by the Securities and Exchange Board of India established under Section 3 of the Securities and
Exchange Board of India Act, 1992, as the case may be, have been complied with, and that no
statement made in this {{ terms.documentName }} is contrary to the provisions of the Companies Act,
2013, the Securities Contracts (Regulation) Act, 1956, the Securities Contracts (Regulation) Rules,
1957 or the Securities and Exchange Board of India Act, 1992, each as amended, or the rules,
regulations or guidelines issued thereunder, as the case may be.

**We further certify that all the statements and disclosures made in this
{{ terms.documentName }} are true and correct.**

### Signed by all the Directors, the Company Secretary and the Chief Financial Officer
`.trim(),
      ctx,
    );

    /**
     * The signature block is built from the fact base rather than typed, so it
     * cannot silently omit a director. A missing signatory on the page that
     * carries personal liability under Section 26 is not a formatting slip.
     *
     * The CFO signs in that capacity even where they are also a director, and
     * the corpus shows the same person listed twice for that reason — so the
     * roles are listed, not the people deduplicated.
     */
    const signatories: string[] = [
      ...facts.management.directors.map((d) => `${d.name} — ${d.designation}`),
      ...facts.management.keyManagerialPersonnel
        .filter((k) => /chief financial officer|company secretary/i.test(k.designation))
        .map((k) => `${k.name} — ${k.designation}`),
    ];

    if (signatories.length === 0) {
      return [
        ...prose,
        {
          type: 'paragraph',
          runs: [
            {
              text: '[TO BE PROVIDED: Signatories to the Declaration]',
              placeholder: {
                factPath: 'management.directors',
                ask: 'Every Director, the Company Secretary and the Chief Financial Officer sign the Declaration',
              },
            },
          ],
        },
      ];
    }

    return [
      ...prose,
      { type: 'list', ordered: false, items: signatories.map((s) => [{ text: s }]) },
      {
        type: 'paragraph',
        runs: [
          {
            text:
              `Place: ${facts.company.registeredOffice.city}. ` +
              'Date: to be inserted on signing.',
          },
        ],
      },
    ];
  },
};

export const conventionsSections: SectionSpec[] = [
  conventions,
  dividendPolicy,
  foreignOwnership,
  declaration,
];
