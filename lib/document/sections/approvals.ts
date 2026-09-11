import type { Licence, LicenceCategory } from '../../facts/schema';
import { longDate } from '../format';
import type { DocumentNode } from '../nodes';
import { derivedTerms, type RenderContext, type SectionSpec } from '../section';
import { gap, gapRun, h2, h3, h4, nil, para, runs, table } from './helpers';

/**
 * GOVERNMENT AND OTHER APPROVALS — section map #29, 4 to 12 pages.
 * COMPUTED from M8, with the approvals for the issue drawn from M9 and M2
 * and the incorporation details from M1.
 *
 * Order and connecting text from Om Galaxy pp.312-315 and Maxwell
 * pp.249-256, which open with the same two paragraphs and then run:
 * approvals for the issue (corporate approvals, in-principle approval, the
 * depository agreements, the ISIN), incorporation details, tax registrations,
 * then tables of business, labour and environmental approvals — per unit
 * where there is more than one — and finally what has been applied for.
 */

const CATEGORY_HEADING: Record<LicenceCategory, string> = {
  TAX: 'Tax Related Approvals',
  BUSINESS: 'Business Related Approvals',
  LABOUR: 'Labour and Employment Related Approvals',
  ENVIRONMENT: 'Environment Related Approvals',
  INTELLECTUAL_PROPERTY: 'Intellectual Property',
  OTHER: 'Other Approvals',
};

const LICENCE_HEADERS = ['Sr. No.', 'Authorisation granted', 'Issuing authority', 'Registration / licence number', 'Date of issue / renewal', 'Valid up to'];

const licenceRows = (items: Licence[]) =>
  items.map((l, i) => [
    String(i + 1),
    l.name,
    l.authority,
    l.number ?? '-',
    l.issuedOn ? longDate(l.issuedOn) : '-',
    l.validUntil ? longDate(l.validUntil) : 'Valid until cancelled',
  ]);

export const approvals: SectionSpec = {
  id: 'legal.approvals',
  partOf: '29. Government and Other Approvals',
  title: 'Government and Other Approvals',
  producer: 'computed',
  order: 2820,
  group: 'SECTION - LEGAL AND OTHER INFORMATION',
  clause: 'ICDR Schedule VI Part A, para 10(B)',
  extractedFrom: [
    'bookbuilt__manufacturing__om-galaxy__bse-sme__2026-09__rhp.pdf pp.312-315',
    'bookbuilt__engineering__maxwell-engineering__nse-emerge__2026-08__drhp.pdf pp.249-256',
  ],
  compute: ({ facts }: RenderContext): DocumentNode[] => {
    const t = derivedTerms(facts);
    const a = facts.approvals;
    const o = facts.offer;
    const nodes: DocumentNode[] = [h2('Government and Other Approvals')];

    nodes.push(
      para(
        `Our Company has received the necessary consents, licences, permissions and approvals from the Central and State Governments and other governmental agencies, regulatory authorities and certification bodies required for carrying on and continuing our business activities and to undertake the ${t.issueWord}. In view of the approvals listed below, we can undertake this ${t.issueWord} and our current business activities, and no further major approvals from any governmental or regulatory authority or any other entity are required to be undertaken in respect of the ${t.issueWord} or to continue our business activities. It must be distinctly understood that, in granting these approvals, the Government of India and other authorities do not take any responsibility for the financial soundness of our Company or for the correctness of any of the statements made or opinions expressed in this behalf. Unless otherwise stated, these approvals are all valid as on the date of this ${t.documentName}.`,
      ),
      para(
        'The main objects clause of the Memorandum of Association of our Company and the objects incidental to the main objects enable our Company to carry out its activities. The following are the details of the licences, permissions and approvals obtained by our Company under various Central and State laws for carrying out its business.',
      ),
    );

    /* Approvals in relation to the issue */
    nodes.push(h3(`Approvals in relation to the ${t.issueWord}`), h4('Corporate Approvals'));
    nodes.push({
      type: 'list',
      ordered: true,
      items: [
        [
          { text: 'Our Board has, pursuant to a resolution passed at its meeting held on ' },
          o.boardResolutionDate ? { text: longDate(o.boardResolutionDate) } : gapRun('offer.boardResolutionDate', 'Date of the board resolution authorising the issue'),
          { text: `, authorised the ${t.issueWord}, subject to the approval of the shareholders of our Company under Section 62(1)(c) of the Companies Act, 2013.` },
        ],
        [
          { text: 'Our shareholders have, pursuant to a special resolution dated ' },
          o.shareholderResolutionDate ? { text: longDate(o.shareholderResolutionDate) } : gapRun('offer.shareholderResolutionDate', 'Date of the shareholders special resolution under Section 62(1)(c)'),
          { text: ` under Section 62(1)(c) of the Companies Act, 2013, authorised the ${t.issueWord}.` },
        ],
        [
          { text: `Our Board has approved this ${t.documentName} pursuant to its resolution dated ` },
          o.boardApprovalOfDocumentDate ? { text: longDate(o.boardApprovalOfDocumentDate) } : gapRun('offer.boardApprovalOfDocumentDate', 'Date of the board resolution approving this offer document'),
          { text: '.' },
        ],
      ],
    });

    nodes.push(h4('In-Principle Approval'));
    if (o.documentStage === 'DRHP' && !o.inPrincipleApprovalDate) {
      nodes.push(
        runs([
          { text: `Our Company will apply for in-principle approval from ${t.exchangeLongName} for using its name in this ${t.issueWord} document and for listing of the Equity Shares issued pursuant to the ${t.issueWord}. ` },
          gapRun('offer.inPrincipleApprovalDate', 'Date of the exchange in-principle approval letter, once received', '[Date of in-principle approval to follow]'),
        ]),
      );
    } else {
      nodes.push(
        runs([
          { text: `Our Company has received in-principle listing approval from ${t.exchangeLongName} dated ` },
          o.inPrincipleApprovalDate ? { text: longDate(o.inPrincipleApprovalDate) } : gapRun('offer.inPrincipleApprovalDate', 'Date of the exchange in-principle approval letter'),
          { text: ` for using its name in this ${t.issueWord} document for listing of the Equity Shares issued pursuant to the ${t.issueWord}.` },
        ]),
      );
    }

    nodes.push(h4('Agreements with the Depositories'));
    const dep = facts.capital.depositoryAgreements;
    const registrar = o.registrarToIssue;
    const depositoryLine = (name: string, executed: boolean, date: string | undefined, path: string) =>
      executed
        ? runs([
            { text: `Our Company has entered into a tripartite agreement dated ` },
            date ? { text: longDate(date) } : gapRun(path, `Date of the tripartite agreement with ${name}`),
            { text: ` with ${name} and the Registrar to the ${t.issueWord}` },
            registrar ? { text: `, ${registrar},` } : gapRun('offer.registrarToIssue', 'Registrar to the Issue'),
            { text: ' for the dematerialisation of its Equity Shares.' },
          ])
        : gap(path.replace(/Date$/, ''), `Tripartite agreement with ${name} and the Registrar for dematerialisation of the Equity Shares`);
    nodes.push(
      depositoryLine('National Securities Depository Limited', dep.nsdl, dep.nsdlDate, 'capital.depositoryAgreements.nsdlDate'),
      depositoryLine('Central Depository Services (India) Limited', dep.cdsl, dep.cdslDate, 'capital.depositoryAgreements.cdslDate'),
      runs([
        { text: "The International Securities Identification Number of our Company's Equity Shares is " },
        o.isin ? { text: o.isin } : gapRun('offer.isin', 'ISIN of the Equity Shares'),
        { text: '.' },
      ]),
    );

    /* Incorporation details, from M1 */
    nodes.push(h3('Incorporation Details of our Company'));
    const c = facts.company;
    const first = c.nameChanges.length > 0 ? c.nameChanges[0].previousName : c.name;
    const incorporation: DocumentNode[] = [
      runs([
        { text: 'Certificate of incorporation dated ' },
        c.dateOfIncorporation ? { text: longDate(c.dateOfIncorporation) } : gapRun('company.dateOfIncorporation', 'Date of incorporation'),
        { text: ` issued by the Registrar of Companies in the name of "${first || c.name}".` },
      ]),
      ...c.nameChanges.map((n) =>
        para(`Fresh certificate of incorporation dated ${longDate(n.date)} issued by the Registrar of Companies consequent upon change of name from "${n.previousName}" to "${n.newName}".`),
      ),
    ];
    nodes.push({ type: 'list', ordered: false, items: incorporation.map((n) => (n.type === 'paragraph' ? n.runs : [])) });

    /* Tax registrations */
    nodes.push(h3('Tax Related Approvals'));
    nodes.push({
      type: 'list',
      ordered: false,
      items: [
        [{ text: 'Permanent Account Number issued by the Income Tax Department under the Income Tax Act, 1961: ' }, a.pan ? { text: a.pan } : gapRun('approvals.pan', 'Permanent Account Number of the company')],
        [{ text: 'Tax Deduction and Collection Account Number issued by the Income Tax Department: ' }, a.tan ? { text: a.tan } : gapRun('approvals.tan', 'TAN of the company')],
        [{ text: 'Goods and Services Tax registration under the Goods and Services Tax Act, 2017: ' }, a.gstin ? { text: a.gstin } : gapRun('approvals.gstin', 'GST registration number')],
      ],
    });
    const taxLicences = a.licences.filter((l) => l.category === 'TAX' && l.status === 'OBTAINED');
    if (taxLicences.length > 0) nodes.push(table(LICENCE_HEADERS, licenceRows(taxLicences), { numericColumns: [0] }));

    /* Business, labour, environment, IP, other — per unit where unit-specific */
    const obtained = a.licences.filter((l) => l.status === 'OBTAINED' && l.category !== 'TAX');
    if (a.licences.length === 0) {
      nodes.push(h3('Approvals in relation to our Business'), gap('approvals.licences', 'Every licence, registration and consent the business holds, with number, date of issue and expiry'));
    } else {
      nodes.push(h3('Approvals in relation to our Business'));
      for (const category of ['BUSINESS', 'LABOUR', 'ENVIRONMENT', 'INTELLECTUAL_PROPERTY', 'OTHER'] as LicenceCategory[]) {
        const items = obtained.filter((l) => l.category === category);
        if (items.length === 0) continue;
        nodes.push(h4(CATEGORY_HEADING[category]));
        const general = items.filter((l) => !l.unit);
        if (general.length > 0) nodes.push(table(LICENCE_HEADERS, licenceRows(general), { numericColumns: [0] }));
        const units = [...new Set(items.filter((l) => l.unit).map((l) => l.unit!))];
        for (const unit of units) {
          nodes.push(para(unit), table(LICENCE_HEADERS, licenceRows(items.filter((l) => l.unit === unit)), { numericColumns: [0] }));
        }
      }
    }

    /* Applied for and pending */
    nodes.push(h3('Approvals applied for but not yet received'));
    const pending = a.licences.filter((l) => l.status !== 'OBTAINED');
    if (pending.length === 0) {
      nodes.push(nil());
    } else {
      nodes.push(
        table(
          ['Sr. No.', 'Authorisation', 'Authority', 'Application / reference', 'Applied on', 'Status'],
          pending.map((l, i) => [
            String(i + 1),
            l.name,
            l.authority,
            l.number ?? '-',
            l.issuedOn ? longDate(l.issuedOn) : '-',
            l.status === 'APPLIED' ? 'Application pending' : 'Expired; renewal applied for',
          ]),
          { numericColumns: [0] },
        ),
      );
    }

    nodes.push(h3('Approvals required but not yet applied for'));
    nodes.push(
      a.approvalsRequiredNotObtained
        ? para(a.approvalsRequiredNotObtained)
        : para(`Except as disclosed above, there are no approvals required by our Company for its present or proposed business activities that have not been obtained or applied for as on the date of this ${t.documentName}.`),
    );

    return nodes;
  },
};
