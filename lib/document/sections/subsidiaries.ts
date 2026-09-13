import type { DocumentNode } from '../nodes';
import { derivedTerms, type RenderContext, type SectionSpec } from '../section';
import { gap, h2, para, table } from './helpers';

/**
 * OUR SUBSIDIARIES, ASSOCIATES AND JOINT VENTURES — section map #18, present
 * in all five ToC-mapped documents but only Photonics Watertech actually has
 * one; the other four simply state there are none.
 *
 * Legally distinct from "Our Group Companies" (#21, `group-companies.ts`):
 * a subsidiary/associate/JV is an entity the ISSUER controls or holds a
 * stake in (Companies Act s.2(6)/s.2(87)), where a group company is a
 * promoter-group entity regardless of the issuer's own control — the two
 * facts do not overlap and an issuer can have either, both, or neither.
 *
 * Unlike #13/#16/#23, nothing external blocks this — "none" is a complete,
 * honest, computable answer for the SME-majority case, which is exactly why
 * this is a real `producer: 'computed'` section rather than an explained gap.
 */
export const subsidiaries: SectionSpec = {
  id: 'aboutCompany.subsidiaries',
  partOf: '18. Our Subsidiaries, Associates and Joint Ventures',
  title: 'Our Subsidiaries, Associates and Joint Ventures',
  producer: 'computed',
  order: 2470,
  group: 'SECTION - ABOUT THE COMPANY',
  clause: 'Companies Act s.2(6), s.2(87); ICDR Schedule VI Part A',
  compute: ({ facts }: RenderContext): DocumentNode[] => {
    const t = derivedTerms(facts);
    const rows = facts.groupCompanies.subsidiaries;

    if (rows.length === 0) {
      return [
        h2('Our Subsidiaries, Associates and Joint Ventures'),
        para(`As on the date of this ${t.documentName}, our Company does not have any subsidiaries, associates or joint ventures.`),
      ];
    }

    const nodes: DocumentNode[] = [
      h2('Our Subsidiaries, Associates and Joint Ventures'),
      para(`As on the date of this ${t.documentName}, our Company has the following subsidiaries, associates and joint ventures:`),
      table(
        ['Name', 'CIN', 'Relationship', 'Shareholding (%)', 'Nature of business'],
        rows.map((r) => [
          r.name,
          r.cin ?? '[TO BE PROVIDED]',
          r.relationship.charAt(0) + r.relationship.slice(1).toLowerCase().replace('_', ' '),
          r.shareholdingPercent !== undefined ? r.shareholdingPercent.toFixed(2) : '[TO BE PROVIDED]',
          r.natureOfBusiness ?? '[TO BE PROVIDED]',
        ]),
        { numericColumns: [3] },
      ),
    ];
    // A gap in a table cell cannot report itself; the paragraph beside it can (group-companies.ts's pattern).
    for (const r of rows) {
      if (!r.cin) nodes.push(gap('groupCompanies.subsidiaries', `CIN of ${r.name}`));
      if (r.shareholdingPercent === undefined) nodes.push(gap('groupCompanies.subsidiaries', `Shareholding percentage held in ${r.name}`));
      if (!r.natureOfBusiness) nodes.push(gap('groupCompanies.subsidiaries', `Nature of business of ${r.name}`));
    }
    return nodes;
  },
};
