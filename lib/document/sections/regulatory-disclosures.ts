import type { SectionSpec } from '../section';

/**
 * OTHER REGULATORY AND STATUTORY DISCLOSURES
 *
 * Measured at 13-17 pages across the corpus and roughly 90% invariant. Being
 * built in chunks; this is the disclaimer and listing group.
 *
 * Extraction notes, 2026-09-10:
 *   Om Galaxy RHP (BSE SME) pp.397-400 and Maxwell DRHP (NSE Emerge) pp.298-300.
 *
 *   The SEBI disclaimer is statutory boilerplate set in capitals and is
 *   identical in both but for the BRLM name, the due diligence certificate
 *   date, and the document stage.
 *
 *   The EXCHANGE disclaimer is genuinely different text per exchange, not a
 *   name substitution — BSE's is a numbered "BSE does not in any manner" list
 *   including a limb on the validity of the issue price that NSE's lacks; NSE's
 *   runs as prose. Both branches are reproduced.
 *
 *   Maxwell's SEBI disclaimer independently confirms R-016: the due diligence
 *   certificate is in the Schedule V(A) format "TO WHICH THE SITE VISIT REPORT
 *   OF THE ISSUER ... ALSO ANNEXED". That entry was single-sourced; it is now
 *   corroborated.
 *
 *   Om Galaxy's text reads "vide its letter dated August June 29, 2026" — a
 *   drafting slip in the source, not reproduced.
 *
 * Still to extract for this section: authority for the issue, lender NOC,
 * prohibition by SEBI/RBI, confirmations, caution, disclaimer in respect of
 * jurisdiction, consents, experts opinion, stock market data, investor
 * grievance mechanism, fees payable, purchase of property, revaluation.
 */
export const regulatoryDisclaimers: SectionSpec = {
  id: 'regulatory.disclaimers',
  title: 'Disclaimer Clauses and Listing',
  producer: 'template',
  order: 2900,
  group: 'SECTION - OTHER REGULATORY AND STATUTORY DISCLOSURES',
  clause: 'R-015, R-016',
  requiredFacts: [
    'offer.bookRunningLeadManager',
    'offer.dueDiligenceCertificateDate',
    'offer.inPrincipleApprovalDate',
  ],
  asks: {
    'offer.dueDiligenceCertificateDate':
      "Date of the Book Running Lead Manager's due diligence certificate to SEBI",
    'offer.inPrincipleApprovalDate':
      'Date of the exchange letter granting in-principle approval',
  },
  extractedFrom: [
    'bookbuilt__manufacturing__om-galaxy__bse-sme__2026-09__rhp.pdf pp.397-400',
    'bookbuilt__engineering__maxwell-engineering__nse-emerge__2026-08__drhp.pdf pp.298-300',
  ],
  template: `
## Other Regulatory and Statutory Disclosures

### Disclaimer Clause of SEBI

IT IS TO BE DISTINCTLY UNDERSTOOD THAT SUBMISSION OF THE ISSUE DOCUMENT TO THE SECURITIES AND
EXCHANGE BOARD OF INDIA (SEBI) SHOULD NOT IN ANY WAY BE DEEMED OR CONSTRUED THAT THE SAME HAS BEEN
CLEARED OR APPROVED BY SEBI. SEBI DOES NOT TAKE ANY RESPONSIBILITY EITHER FOR THE FINANCIAL
SOUNDNESS OF ANY SCHEME OR THE PROJECT FOR WHICH THE {{ terms.issueWord | upper }} IS PROPOSED TO BE
MADE, OR FOR THE CORRECTNESS OF THE STATEMENTS MADE OR OPINIONS EXPRESSED IN THE ISSUE DOCUMENT.
THE BOOK RUNNING LEAD MANAGER, {{ offer.bookRunningLeadManager | upper }}, HAS CERTIFIED THAT THE
DISCLOSURES MADE IN THE ISSUE DOCUMENT ARE GENERALLY ADEQUATE AND ARE IN CONFORMITY WITH THE SEBI
(ISSUE OF CAPITAL AND DISCLOSURE REQUIREMENTS) REGULATIONS, 2018 IN FORCE FOR THE TIME BEING. THIS
REQUIREMENT IS TO FACILITATE INVESTORS TO TAKE AN INFORMED DECISION FOR MAKING INVESTMENT IN THE
PROPOSED {{ terms.issueWord | upper }}.

IT SHOULD ALSO BE CLEARLY UNDERSTOOD THAT WHILE THE ISSUER IS PRIMARILY RESPONSIBLE FOR THE
CORRECTNESS, ADEQUACY AND DISCLOSURE OF ALL RELEVANT INFORMATION IN THE ISSUE DOCUMENT, THE BOOK
RUNNING LEAD MANAGER IS EXPECTED TO EXERCISE DUE DILIGENCE TO ENSURE THAT THE ISSUER DISCHARGES ITS
RESPONSIBILITY ADEQUATELY IN THIS BEHALF. TOWARDS THIS PURPOSE, THE BOOK RUNNING LEAD MANAGER,
{{ offer.bookRunningLeadManager | upper }}, HAS FURNISHED TO SEBI A DUE DILIGENCE CERTIFICATE DATED
{{ offer.dueDiligenceCertificateDate | date | upper }}, IN THE FORMAT PRESCRIBED UNDER SCHEDULE V(A), TO
WHICH THE SITE VISIT REPORT OF THE ISSUER PREPARED BY THE BOOK RUNNING LEAD MANAGER IS ALSO
ANNEXED, AS PER THE SEBI (ISSUE OF CAPITAL AND DISCLOSURE REQUIREMENTS) REGULATIONS, 2018, AS
AMENDED.

THE FILING OF THIS {{ terms.documentName | upper }} DOES NOT, HOWEVER, ABSOLVE OUR COMPANY FROM ANY
LIABILITIES UNDER THE COMPANIES ACT, 2013, OR FROM THE REQUIREMENT OF OBTAINING SUCH STATUTORY OR
OTHER CLEARANCES AS MAY BE REQUIRED FOR THE PURPOSE OF THE PROPOSED {{ terms.issueWord | upper }}.
SEBI FURTHER RESERVES THE RIGHT TO TAKE UP AT ANY POINT OF TIME, WITH THE BOOK RUNNING LEAD MANAGER,
ANY IRREGULARITIES OR LAPSES IN THE ISSUE DOCUMENT.

All legal requirements pertaining to the {{ terms.issueWord }} will be complied with at the time of
filing of the Red Herring Prospectus with the RoC in terms of Section 32 of the Companies Act, 2013.
All legal requirements pertaining to the {{ terms.issueWord }} will be complied with at the time of
filing of the Prospectus with the RoC in terms of Sections 26, 33(1) and 33(2) of the Companies Act,
2013.

{{#if terms.isBSE }}
### Disclaimer Clause of the SME Platform of BSE

As required, a copy of this {{ terms.documentName }} has been submitted to the SME Platform of BSE.
BSE Limited ("BSE") has, vide its letter dated {{ offer.inPrincipleApprovalDate | date }}, given
permission to our Company to use its name in this {{ terms.documentName }} as the Stock Exchange on
whose Small and Medium Enterprises Platform our Company's securities are proposed to be listed. BSE
has scrutinised this {{ terms.documentName }} for the limited internal purpose of deciding on the
matter of granting the aforesaid permission to our Company.

BSE does not in any manner:

- warrant, certify or endorse the correctness or completeness of any of the contents of this {{ terms.documentName }};
- warrant that our Company's securities will be listed on completion of the initial public offering, or will continue to be listed on BSE;
- take any responsibility for the financial or other soundness of our Company, its Promoters, its management or any scheme or project of our Company; or
- warrant, certify or endorse the validity, correctness or reasonableness of the price at which the Equity Shares are offered.
{{/if}}
{{#unless terms.isBSE }}
### Disclaimer Clause of the Emerge Platform of the National Stock Exchange of India Limited

As required, a copy of this {{ terms.documentName }} has been submitted to NSE Emerge. NSE has, vide
its letter dated {{ offer.inPrincipleApprovalDate | date }}, given permission to our Company to use
the Exchange's name in this {{ terms.documentName }} as the Stock Exchange on which our Company's
securities are proposed to be listed. The Exchange has scrutinised this {{ terms.documentName }} for
the limited internal purpose of deciding on the matter of granting the aforesaid permission to our
Company.

It is to be distinctly understood that the aforesaid permission given by NSE should not in any way be
deemed or construed that this {{ terms.documentName }} has been cleared or approved by NSE; nor does
it in any manner warrant, certify or endorse the correctness or completeness of any of the contents
of this {{ terms.documentName }}; nor does it warrant that our Company's securities will be listed or
will continue to be listed on the Exchange; nor does it take any responsibility for the financial or
other soundness of our Company, its Promoters, its management or any scheme or project of our
Company.

Every person who desires to apply for or otherwise acquire any securities of our Company may do so
pursuant to independent inquiry, investigation and analysis, and shall not have any claim against
the Exchange whatsoever by reason of any loss which may be suffered by such person consequent to or
in connection with such subscription or acquisition.
{{/unless}}

### Listing

Application will be made to {{ terms.designatedStockExchange }} for permission to deal in, and for an
official quotation of, the Equity Shares being issued in terms of this {{ terms.documentName }}.
{{ terms.designatedStockExchange }} is the Designated Stock Exchange with which the Basis of
Allotment will be finalised.

If permission to deal in and for an official quotation of the Equity Shares is not granted by the
Stock Exchange, our Company shall forthwith repay, without interest, all monies received from the
applicants in pursuance of this {{ terms.documentName }}. If such money is not repaid within four
days from the date our Company becomes liable to repay it, then our Company and every officer in
default shall, on and from the expiry of the fourth day, be jointly and severally liable to repay
that money with interest at the rate of fifteen per cent per annum, in accordance with Regulation
272(2) of the SEBI ICDR Regulations.

Our Company shall ensure that all steps for the completion of the necessary formalities for listing
and commencement of trading at the Stock Exchange are taken within three Working Days of the
{{ terms.issueWord }} Closing Date.
`.trim(),
};

/**
 * Authority for the issue, prohibitions and confirmations.
 *
 * Extraction notes, 2026-09-10:
 *   Om Galaxy RHP (BSE SME) pp.391-394 and Maxwell DRHP (NSE Emerge) pp.294-297.
 *   Structurally identical. Every difference is a date or a name.
 *
 *   The CONFIRMATIONS list maps one-to-one onto Reg 228(a)-(e), already
 *   recorded as R-020, so the template states the clause explicitly rather
 *   than reciting the conditions loosely.
 *
 *   Lender NOC applies only where the company has secured borrowings, so it is
 *   conditional on the most recent year's total borrowings rather than always
 *   printed.
 */
export const regulatoryAuthority: SectionSpec = {
  id: 'regulatory.authority',
  title: 'Authority for the Issue and Confirmations',
  producer: 'template',
  order: 2850,
  group: 'SECTION - OTHER REGULATORY AND STATUTORY DISCLOSURES',
  clause: 'R-020',
  requiredFacts: [
    'offer.boardResolutionDate',
    'offer.shareholderResolutionDate',
    'offer.boardApprovalOfDocumentDate',
  ],
  asks: {
    'offer.boardResolutionDate': 'Date of the Board resolution authorising the issue',
    'offer.shareholderResolutionDate':
      'Date of the shareholders special resolution under Section 62(1)(c)',
    'offer.boardApprovalOfDocumentDate':
      'Date of the Board resolution approving this offer document',
  },
  extractedFrom: [
    'bookbuilt__manufacturing__om-galaxy__bse-sme__2026-09__rhp.pdf pp.391-394',
    'bookbuilt__engineering__maxwell-engineering__nse-emerge__2026-08__drhp.pdf pp.294-297',
  ],
  template: `
### Authority for the Issue

The Board of Directors has, pursuant to a resolution passed at its meeting held on
{{ offer.boardResolutionDate | date }}, authorised the {{ terms.issueWord }}, subject to the
approval of the shareholders of our Company under Section 62(1)(c) and all other applicable
provisions of the Companies Act, 2013.

The shareholders of our Company have, pursuant to a special resolution passed at an Extraordinary
General Meeting held on {{ offer.shareholderResolutionDate | date }}, authorised the
{{ terms.issueWord }} under Section 62(1)(c) and all other applicable provisions of the Companies
Act, 2013.

Our Board has approved this {{ terms.documentName }} through its resolution dated
{{ offer.boardApprovalOfDocumentDate | date }}.

{{#if terms.hasSecuredBorrowings }}
### Lender No Objection Certificates

Our Company has obtained No Objection Certificates from all of its existing secured lenders in
connection with the proposed initial public offering. These confirm that the secured lenders have no
objection to our Company proceeding with the {{ terms.issueWord }}.
{{/if}}

### In-Principle Approval

Our Company has received an in-principle approval letter dated
{{ offer.inPrincipleApprovalDate | date }} from {{ terms.designatedStockExchange }} for the use of
its name in this {{ terms.documentName }} for the listing of our Equity Shares on
{{ terms.exchangeLongName }}. {{ terms.designatedStockExchange }} is the Designated Stock Exchange
for the purpose of this {{ terms.issueWord }}.

### Prohibition by SEBI, RBI or Other Governmental Authorities

Our Company, our Promoters, the members of our Promoter Group and our Directors are not prohibited
from accessing the capital market, and are not debarred from buying, selling or dealing in
securities, under any order or direction passed by SEBI or any securities market regulator in any
other jurisdiction, or by any other authority or court.

None of the companies with which our Promoters and Directors are associated as promoters, directors
or persons in control have been debarred from accessing the capital markets under any order or
direction passed by SEBI or any other authority.

None of our Directors is associated with securities market related business in any manner, and there
have been no outstanding actions initiated by SEBI against our Directors in the five years preceding
the date of this {{ terms.documentName }}.

Our Company, our Promoters and our Directors have not been declared as wilful defaulters or
fraudulent borrowers by any bank or financial institution or consortium thereof, in accordance with
the guidelines on wilful defaulters or fraudulent borrowers issued by the RBI. Neither our Company
nor any of our Promoters or Directors has been declared a fraudulent borrower in terms of the Master
Directions on Frauds - Classification and Reporting by Commercial Banks and Select FIs, as amended,
issued by the Reserve Bank of India.

None of our Promoters or Directors has been declared a fugitive economic offender under Section 12
of the Fugitive Economic Offenders Act, 2018.

All the Equity Shares are fully paid up and there are no partly paid-up Equity Shares as on the date
of this {{ terms.documentName }}.

### Confirmations

Our Company is not ineligible in terms of Regulation 228 of the SEBI ICDR Regulations for this
{{ terms.issueWord }}, as:

- neither our Company nor any of its Promoters, members of the Promoter Group or Directors is debarred from accessing the capital market by the Board;
- neither our Promoters nor any of our Directors is a promoter or director of any other company which is debarred from accessing the capital market by the Board;
- neither our Company nor any of our Promoters or Directors is a wilful defaulter or a fraudulent borrower;
- none of our Promoters or Directors is declared a fugitive economic offender; and
- there are no outstanding convertible securities or any other right which would entitle any person to an option to receive Equity Shares of our Company.
`.trim(),
};

/**
 * Consents and the investor grievance mechanism.
 *
 * Extraction notes, 2026-09-10:
 *   Maxwell DRHP (NSE Emerge) pp.300-306, cross-checked against Om Galaxy.
 *   Both are near-pure boilerplate carrying SEBI circular references, and the
 *   only issuer-specific values are the intermediary names we already hold.
 *
 * EXPERTS OPINION is deliberately NOT built here. It turns on the statutory
 * auditor's written consent date, the examination report date on the restated
 * financials, the tax benefits report date, and any practising company
 * secretary certificate — all auditor-supplied, none in the fact base. It
 * belongs with M6 (Financials), not with regulatory boilerplate.
 */
export const regulatoryConsents: SectionSpec = {
  id: 'regulatory.consents',
  title: 'Consents and Investor Grievances',
  producer: 'template',
  order: 2950,
  group: 'SECTION - OTHER REGULATORY AND STATUTORY DISCLOSURES',
  requiredFacts: ['offer.registrarToIssue', 'company.companySecretary'],
  extractedFrom: [
    'bookbuilt__engineering__maxwell-engineering__nse-emerge__2026-08__drhp.pdf pp.300-306',
    'bookbuilt__manufacturing__om-galaxy__bse-sme__2026-09__rhp.pdf pp.397-404',
  ],
  template: `
### Consents

Consents in writing of our Directors, our Promoters, the Company Secretary and Compliance Officer,
the Chief Financial Officer, the Statutory Auditors and Peer Review Auditor, and the Bankers to our
Company; and of the Book Running Lead Manager, the Registrar to the {{ terms.issueWord }}, the Legal
Advisor, the Banker to the {{ terms.issueWord }}, the Sponsor Bank, the Syndicate Member, the
Underwriter and the Market Maker, to act in their respective capacities, have been obtained as
required under Section 26 of the Companies Act, 2013. These consents will be filed with a copy of
the Red Herring Prospectus and the Prospectus with the RoC, and will not be withdrawn up to the time
of delivery of the Red Herring Prospectus and the Prospectus for registration with the RoC.

The consents of the Sponsor Bank, the Syndicate Member, the Underwriter and the Market Maker will be
obtained at the time of filing the Red Herring Prospectus with the RoC.

### Mechanism for Redressal of Investor Grievances

SEBI has, by way of its Master Circular dated May 7, 2024, identified the need for measures to manage
investor issues arising out of the UPI Mechanism, including delays in receipt of mandates for
blocking of funds due to systemic issues at Designated Intermediaries or SCSBs, and failures to
unblock funds in cases of partial or non-allotment within the prescribed timelines. The measures
prescribed include:

- identification of a nodal officer by SCSBs for the UPI Mechanism;
- delivery of SMS alerts by SCSBs for the blocking and unblocking of UPI Mandate Requests;
- hosting of a web portal by the Sponsor Bank containing statistical details of mandate blocks and unblocks;
- limiting the facility of reinitiating UPI Bids by Syndicate Members to once per Bid; and
- requiring SCSBs to complete the unblock process for non-allotted or partially allotted applications by the closing hours of one Working Day following the finalisation of the Basis of Allotment.

The Registrar Agreement provides for retention of records by the Registrar to the
{{ terms.issueWord }} for a period of at least eight years from the date of listing and commencement
of trading of the Equity Shares on the Stock Exchange, to enable investors to approach the Registrar
for redressal of their grievances.

Investors may contact {{ company.companySecretary.name }}, our Company Secretary and Compliance
Officer, the Book Running Lead Manager, or {{ offer.registrarToIssue }}, the Registrar to the
{{ terms.issueWord }}, in the case of any pre-{{ terms.issueWordLower }} or
post-{{ terms.issueWordLower }} problem, such as non-receipt of letters of Allotment, non-credit of
Allotted Equity Shares to the beneficiary account, non-receipt of refund orders, or non-receipt of
funds by electronic mode.

All grievances relating to the {{ terms.issueWord }} may be addressed to the Registrar to the
{{ terms.issueWord }}, with a copy to the relevant Designated Intermediary to whom the Bid cum
Application Form was submitted, giving full particulars: the name of the Bidder, the Bid cum
Application Form number, the Bidder's DP ID, Client ID, PAN and address, the number of Equity Shares
applied for, the ASBA Account number in which the Bid Amount was blocked or the UPI ID, the date of
the Bid cum Application Form, and the name and address of the Designated Intermediary where the Bid
was submitted. The Bidder must also enclose the acknowledgement slip or the application number from
the Designated Intermediary. Grievances relating to Bids submitted through Registered Brokers may be
addressed to the Stock Exchange, with a copy to the Registrar to the {{ terms.issueWord }}.

Our Company Secretary and Compliance Officer may be contacted at
{{ company.companySecretary.email }} and {{ company.companySecretary.telephone }}.
`.trim(),
};

export const regulatorySections: SectionSpec[] = [
  regulatoryAuthority,
  regulatoryConsents,
  regulatoryDisclaimers,
];
