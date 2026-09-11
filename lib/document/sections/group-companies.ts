import type { DocumentNode } from '../nodes';
import { longDate } from '../format';
import { derivedTerms, type RenderContext, type SectionSpec } from '../section';
import { gap, h2, para, table } from './helpers';

/**
 * OUR GROUP COMPANIES — section map #21, 1 page. COMPUTED from M10.
 *
 * Both primary sources state the identification policy — a board resolution
 * date, the RPT limb, and a threshold against a base — and then either list
 * the companies or say there are none (Om Galaxy p.261, Maxwell p.227;
 * neither has any). The per-company disclosure format below follows the
 * table columns the ICDR requires rather than a corpus example, since no
 * document in the corpus has a group company to show one.
 */
export const groupCompanies: SectionSpec = {
  id: 'aboutCompany.groupCompanies',
  partOf: '21. Our Group Company / Companies',
  title: 'Our Group Companies',
  producer: 'computed',
  order: 2650,
  group: 'SECTION - ABOUT THE COMPANY',
  clause: 'ICDR Reg 2(1)(t); ICDR Schedule VI Part A',
  extractedFrom: [
    'bookbuilt__manufacturing__om-galaxy__bse-sme__2026-09__rhp.pdf p.261',
    'bookbuilt__engineering__maxwell-engineering__nse-emerge__2026-08__drhp.pdf p.227',
  ],
  compute: ({ facts }: RenderContext): DocumentNode[] => {
    const t = derivedTerms(facts);
    const g = facts.groupCompanies;
    const nodes: DocumentNode[] = [h2('Our Group Companies')];

    nodes.push(
      para(
        'In terms of Regulation 2(1)(t) of the SEBI ICDR Regulations, "group companies" includes (i) the companies, other than our Promoters and Subsidiaries, with which there were related party transactions as disclosed in the Restated Financial Information; and (ii) such other companies as are considered material by our Board pursuant to the materiality policy.',
      ),
    );

    if (!g.materialityResolutionDate || g.materialityThresholdPercent === undefined || !g.materialityBase) {
      if (!g.materialityResolutionDate) nodes.push(gap('groupCompanies.materialityResolutionDate', 'Date of the board resolution adopting the group company materiality policy'));
      if (g.materialityThresholdPercent === undefined || !g.materialityBase) nodes.push(gap('groupCompanies.materialityThresholdPercent', 'The materiality threshold for group companies, and whether it is measured against profit after tax or revenue'));
    } else {
      const base =
        g.materialityBase === 'PROFIT_AFTER_TAX'
          ? 'the profit after tax of our Company as per the latest Restated Financial Information'
          : 'the total revenue of our Company as per the latest audited financial statements';
      nodes.push(
        para(
          `Pursuant to a resolution of our Board dated ${longDate(g.materialityResolutionDate)}, for the purpose of disclosure in relation to group companies in connection with the ${t.issueWord}, a company shall be considered material and disclosed as a group company if (a) our Company has had related party transactions with it as disclosed in the Restated Financial Information; or (b) it forms part of the Promoter Group of our Company in terms of Regulation 2(1)(pp) of the SEBI ICDR Regulations and our Company has entered into one or more transactions with it in the most recent financial year and stub period which, individually or in the aggregate, exceed ${g.materialityThresholdPercent}% of ${base}.`,
        ),
      );
    }

    if (g.companies.length === 0) {
      nodes.push(
        para(
          `Accordingly, pursuant to the said resolution and the materiality policy adopted, there are no Group Companies of our Company as on the date of this ${t.documentName}.`,
        ),
      );
      return nodes;
    }

    nodes.push(
      para(`Accordingly, the following are the Group Companies of our Company as on the date of this ${t.documentName}:`),
      table(
        ['Sr. No.', 'Name', 'CIN', 'Nature of business', 'Registered office', 'Nature of relationship'],
        g.companies.map((c, i) => [
          String(i + 1),
          c.name,
          c.cin ?? '[TO BE PROVIDED]',
          c.natureOfBusiness ?? '[TO BE PROVIDED]',
          c.registeredOffice ?? '[TO BE PROVIDED]',
          c.relationship,
        ]),
        { numericColumns: [0] },
      ),
    );
    // A gap in a table cell cannot report itself; the paragraph beside it can
    for (const c of g.companies) {
      if (!c.cin) nodes.push(gap('groupCompanies.companies', `CIN of ${c.name}`));
      if (!c.natureOfBusiness) nodes.push(gap('groupCompanies.companies', `Nature of business of ${c.name}`));
      if (!c.registeredOffice) nodes.push(gap('groupCompanies.companies', `Registered office of ${c.name}`));
    }

    const listed = g.companies.filter((c) => c.isListed);
    nodes.push(
      listed.length === 0
        ? para('None of our Group Companies is listed on any stock exchange.')
        : para(`The following Group Companies are listed: ${listed.map((c) => c.name).join(', ')}.`),
    );
    const issued = g.companies.filter((c) => c.publicOrRightsIssueInLastThreeYears);
    nodes.push(
      issued.length === 0
        ? para('None of our Group Companies has made any public or rights issue of securities in the three years preceding the date of this ' + t.documentName + '.')
        : para(`The following Group Companies have made a public or rights issue in the last three years: ${issued.map((c) => c.name).join(', ')}.`),
    );
    return nodes;
  },
};
