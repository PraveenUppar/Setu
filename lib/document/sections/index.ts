import type { SectionSpec } from '../section';
import { generalSections } from './general';
import { issueRelatedSections } from './issue-procedure';
import { issueStructure } from './issue-structure';
import { regulatorySections } from './regulatory-disclosures';

/**
 * The section registry.
 *
 * Order numbers are sparse (100, 200, 300...) so subsections can be inserted
 * without renumbering. The full map of 37 subsections with measured page
 * ranges and producer classes is in .claude/context/07-section-map.md.
 *
 * Wave 1 (templates, ~140pp, 32% of the document) is being built first
 * because it needs almost no input and no LLM. Priority order by measured
 * size: Issue Procedure (36pp), Main Provisions of AoA (38pp), Definitions
 * (17pp), Other Regulatory and Statutory Disclosures (17pp).
 */
export const sectionRegistry: SectionSpec[] = [
  ...generalSections,
  ...regulatorySections,
  issueStructure,
  ...issueRelatedSections,
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
