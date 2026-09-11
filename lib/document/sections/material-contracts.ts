import { longDate } from '../format';
import type { DocumentNode, Run } from '../nodes';
import { derivedTerms, type RenderContext, type SectionSpec } from '../section';
import { gap, gapRun, h2, h3, para } from './helpers';

/**
 * MATERIAL CONTRACTS AND DOCUMENTS FOR INSPECTION — section map #36, 2 to
 * 3 pages. COMPUTED from M9 (the agreements, by date), M1 (the incorporation
 * certificates), M2 (the depository agreements) and M6 (the auditor).
 *
 * Both primary sources open with the same two paragraphs and split the list
 * the same way — contracts for the issue, then documents (Om Galaxy pp.431-
 * 433, Maxwell pp.338-339). An agreement not yet signed prints as a gap in
 * its line, which is how Maxwell's DRHP prints its market making, banker and
 * underwriting agreements: "dated [dot]".
 *
 * Items that are pure inventory — the memorandum and articles, the annual
 * reports — need no fact and are printed. Items with a date need one.
 */

/** A list item with a date in it, or a gap where the date is not yet known. */
function dated(before: string, date: string | undefined, path: string, ask: string, after: string): Run[] {
  return [{ text: before }, date ? { text: longDate(date) } : gapRun(path, ask), { text: after }];
}

export const materialContracts: SectionSpec = {
  id: 'other.materialContracts',
  partOf: '36. Material Contracts and Documents for Inspection',
  title: 'Material Contracts and Documents for Inspection',
  producer: 'computed',
  order: 3800,
  group: 'SECTION - OTHER INFORMATION',
  clause: 'ICDR Schedule VI Part A; Companies Act 2013 s.26',
  extractedFrom: [
    'bookbuilt__manufacturing__om-galaxy__bse-sme__2026-09__rhp.pdf pp.431-433',
    'bookbuilt__engineering__maxwell-engineering__nse-emerge__2026-08__drhp.pdf pp.338-339',
  ],
  compute: ({ facts }: RenderContext): DocumentNode[] => {
    const t = derivedTerms(facts);
    const o = facts.offer;
    const c = facts.company;
    const f = facts.financials;
    const dep = facts.capital.depositoryAgreements;
    const nodes: DocumentNode[] = [h2('Material Contracts and Documents for Inspection')];

    nodes.push(
      para(
        `Copies of the following contracts which have been entered or are to be entered into by our Company (not being contracts entered into in the ordinary course of business carried on by our Company) which are or may be deemed material will be attached to the copy of the ${t.documentName === 'Prospectus' ? 'Prospectus' : 'Red Herring Prospectus'} to be filed with the Registrar of Companies. Copies of the contracts and also the documents for inspection referred to hereunder may be inspected at our Registered Office between 10.00 a.m. and 5.00 p.m. on all Working Days from the date of the ${t.documentName} until the Bid/${t.issueWord} Closing Date, and will also be available on the website of our Company at ${c.website || '[company website]'} (except for such agreements executed after the Bid/${t.issueWord} Closing Date).`,
      ),
      para(
        'Any of the contracts or documents mentioned in this document may be amended or modified at any time if so required in the interest of our Company or if required by the other parties, without reference to the shareholders, subject to compliance with the provisions contained in the Companies Act, 2013 and other applicable law.',
      ),
    );

    /* Material contracts for the issue */
    nodes.push(h3(`Material Contracts for the ${t.issueWord}`));
    const brlm = o.bookRunningLeadManager ? ` (${o.bookRunningLeadManager})` : '';
    const contracts: Run[][] = [
      dated(`${t.issueWord} Agreement dated `, o.issueAgreementDate, 'offer.issueAgreementDate', 'Date of the Issue Agreement', ` between our Company and the Book Running Lead Manager${brlm}.`),
      dated('Registrar Agreement dated ', o.registrarAgreementDate, 'offer.registrarAgreementDate', 'Date of the Registrar Agreement', ` between our Company and the Registrar to the ${t.issueWord}${o.registrarToIssue ? ` (${o.registrarToIssue})` : ''}.`),
      dated(`Banker to the ${t.issueWord} Agreement dated `, o.bankerToIssueAgreementDate, 'offer.bankerToIssueAgreementDate', 'Date of the Banker to the Issue Agreement', ` between our Company, the Book Running Lead Manager, the Banker to the ${t.issueWord} and the Registrar to the ${t.issueWord}.`),
      dated('Market Making Agreement dated ', o.marketMakingAgreementDate, 'offer.marketMakingAgreementDate', 'Date of the Market Making Agreement', ` between our Company, the Book Running Lead Manager and the Market Maker${o.marketMakerName ? ` (${o.marketMakerName})` : ''}.`),
      dated('Underwriting Agreement dated ', o.underwritingAgreementDate, 'offer.underwritingAgreementDate', 'Date of the Underwriting Agreement', ' between our Company, the Book Running Lead Manager and the Underwriters.'),
      ...(o.monitoringAgency
        ? [dated('Monitoring Agency Agreement dated ', o.monitoringAgencyAgreementDate, 'offer.monitoringAgencyAgreementDate', 'Date of the Monitoring Agency Agreement', ` between our Company and the Monitoring Agency (${o.monitoringAgency}).`)]
        : []),
      dep.nsdl
        ? dated('Tripartite agreement dated ', dep.nsdlDate, 'capital.depositoryAgreements.nsdlDate', 'Date of the tripartite agreement with NSDL', ` between National Securities Depository Limited, our Company and the Registrar to the ${t.issueWord}.`)
        : [gapRun('capital.depositoryAgreements.nsdl', 'Tripartite agreement with NSDL and the Registrar')],
      dep.cdsl
        ? dated('Tripartite agreement dated ', dep.cdslDate, 'capital.depositoryAgreements.cdslDate', 'Date of the tripartite agreement with CDSL', ` between Central Depository Services (India) Limited, our Company and the Registrar to the ${t.issueWord}.`)
        : [gapRun('capital.depositoryAgreements.cdsl', 'Tripartite agreement with CDSL and the Registrar')],
    ];
    nodes.push({ type: 'list', ordered: true, items: contracts });

    /* Material documents */
    nodes.push(h3('Material Documents'));
    const first = c.nameChanges.length > 0 ? c.nameChanges[0].previousName : c.name;
    const fiscals = f.years.slice(0, 3).map((y) => y.yearEnding);
    const auditor = f.auditorName || 'the Statutory Auditors';
    const documents: Run[][] = [
      [{ text: 'Certified true copies of the Memorandum and Articles of Association of our Company, as amended from time to time.' }],
      dated('Certificate of incorporation dated ', c.dateOfIncorporation || undefined, 'company.dateOfIncorporation', 'Date of incorporation', ` issued by the Registrar of Companies in the name of "${first || c.name}".`),
      ...c.nameChanges.map((n): Run[] => [
        { text: `Fresh certificate of incorporation dated ${longDate(n.date)} issued by the Registrar of Companies consequent upon change of name of our Company from "${n.previousName}" to "${n.newName}".` },
      ]),
      dated('Certified true copy of the resolution passed at the meeting of the Board of Directors of our Company dated ', o.boardResolutionDate, 'offer.boardResolutionDate', 'Date of the board resolution authorising the issue', ` approving the ${t.issueWord} and other related matters.`),
      dated('Certified true copy of the special resolution passed by the shareholders of our Company under Section 62(1)(c) of the Companies Act, 2013 at the general meeting held on ', o.shareholderResolutionDate, 'offer.shareholderResolutionDate', 'Date of the shareholders special resolution', ` approving the ${t.issueWord}.`),
      dated('Resolution of the Board of Directors dated ', o.boardApprovalOfDocumentDate, 'offer.boardApprovalOfDocumentDate', 'Date of the board resolution approving this document', ` taking on record and approving this ${t.documentName}.`),
      f.hasRestatedStatements
        ? dated(`The examination report dated `, o.auditorExaminationReportDate, 'offer.auditorExaminationReportDate', "Date of the auditor's examination report on the Restated Financial Information", ` of ${auditor} on the Restated Financial Information included in this ${t.documentName}.`)
        : [gapRun('financials.hasRestatedStatements', 'The examination report of the Statutory Auditors on the Restated Financial Information', '[TO BE PROVIDED: The examination report of the Statutory Auditors on the Restated Financial Information, once delivered]')],
      f.hasRestatedStatements
        ? dated('The statement of special tax benefits dated ', o.taxBenefitsStatementDate, 'offer.taxBenefitsStatementDate', 'Date of the statement of special tax benefits', ` from ${auditor}, available to our Company and its shareholders, as disclosed in this ${t.documentName}.`)
        : [gapRun('financials.hasRestatedStatements', 'The statement of special tax benefits from the Statutory Auditors', '[TO BE PROVIDED: The statement of special tax benefits from the Statutory Auditors, once delivered]')],
      [{ text: fiscals.length > 0 ? `Copies of the audited financial statements and annual reports of our Company for the Fiscals ${fiscals.join(', ')}.` : 'Copies of the audited financial statements and annual reports of our Company for the last three Fiscals.' }],
      [{ text: `Consents of the Directors, the Promoters, the Company Secretary and Compliance Officer, the Chief Financial Officer, the Statutory Auditors, the Book Running Lead Manager, the Legal Advisor to the ${t.issueWord}, the Registrar to the ${t.issueWord}, the Bankers to our Company, the Banker to the ${t.issueWord}, the Sponsor Bank, the Underwriters and the Market Maker to act in their respective capacities.` }],
      o.expertConsents
        ? [{ text: `Consents of experts under Section 26(5) read with Section 2(38) of the Companies Act, 2013: ${o.expertConsents}` }]
        : [gapRun('offer.expertConsents', 'The expert consents obtained under Section 2(38) of the Companies Act, with their dates and the certificates they cover')],
    ];
    nodes.push({ type: 'list', ordered: true, items: documents });

    if (!c.website) nodes.push(gap('company.website', 'The company website, where the material documents are made available for inspection'));
    return nodes;
  },
};
