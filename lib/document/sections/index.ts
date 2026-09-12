import type { SectionSpec } from '../section';
import { generalSections } from './general';
import { conventionsSections } from './conventions';
import { capitalStructure } from './capital-structure';
import { definitions } from './definitions';
import { issueRelatedSections } from './issue-procedure';
import { issueStructure } from './issue-structure';
import { regulatorySections } from './regulatory-disclosures';
import { termsOfIssue } from './terms-of-issue';
import { management } from './management';
import { promoters } from './promoters';
import { groupCompanies } from './group-companies';
import { litigation } from './litigation';
import { approvals } from './approvals';
import { capitalisationStatement, indebtedness } from './indebtedness';
import { otherFinancial } from './other-financial';
import { materialContracts } from './material-contracts';
import { articlesOfAssociation } from './articles-of-association';
import { riskFactors } from './risk-factors';
import { history } from './history';
import { ourBusiness } from './our-business';
import { objectsOfTheIssue } from './objects-of-the-issue';
import { basisForIssuePrice } from './basis-for-issue-price';
import { industryOverview } from './industry-overview';
import { mdna } from './mdna';
import {
  contingentLiabilities,
  relatedPartyTransactions,
  summaryOfFinancialInformation,
  theIssue,
} from './introduction';

/**
 * The section registry.
 *
 * Order numbers are sparse (100, 200, 300...) so subsections can be inserted
 * without renumbering. The full map of 37 subsections with measured page
 * ranges and producer classes is in .claude/context/07-section-map.md.
 *
 * Wave 1 (templates) is complete. Wave 2 (computed) landed with S8: the
 * sections built from the M3-M10 modules — The Issue, the contingent
 * liability and RPT summaries, Our Management, Our Promoters, Our Group
 * Companies, the Capitalisation Statement, Financial Indebtedness,
 * Outstanding Litigation and Government Approvals. Summary of Financial
 * Information is external (the auditor's).
 */
export const sectionRegistry: SectionSpec[] = [
  definitions,
  ...generalSections,
  riskFactors,
  ...conventionsSections,
  theIssue,
  summaryOfFinancialInformation,
  contingentLiabilities,
  relatedPartyTransactions,
  capitalStructure,
  objectsOfTheIssue,
  basisForIssuePrice,
  industryOverview,
  ourBusiness,
  history,
  management,
  promoters,
  groupCompanies,
  otherFinancial,
  capitalisationStatement,
  mdna,
  indebtedness,
  litigation,
  approvals,
  ...regulatorySections,
  termsOfIssue,
  issueStructure,
  ...issueRelatedSections,
  materialContracts,
  articlesOfAssociation,
];

export function sectionsByGroup(specs: SectionSpec[] = sectionRegistry) {
  const groups = new Map<string, SectionSpec[]>();
  for (const spec of specs.slice().sort((a, b) => a.order - b.order)) {
    const list = groups.get(spec.group) ?? [];
    list.push(spec);
    groups.set(spec.group, list);
  }
  return groups;
}
