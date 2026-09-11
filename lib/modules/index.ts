import { sectionRegistry } from '../document/sections';
import { plannedSections } from '../document/sections/planned';
import { m1Company } from './m1-company';
import { m2Capital } from './m2-capital';
import { m3Promoters } from './m3-promoters';
import { m4Management } from './m4-management';
import { m5Business } from './m5-business';
import { m6Financials } from './m6-financials';
import { m7Legal } from './m7-legal';
import { m8Approvals } from './m8-approvals';
import { m9Offer } from './m9-offer';
import { m10GroupCompanies } from './m10-group-companies';
import { moduleProgress, type Module, type ModuleProgress, type PartialFactBase } from './types';
import { getFact, type FactPath } from '../facts/provenance';

export * from './types';
export { m1Company } from './m1-company';
export { m2Capital, ALLOTMENT_COLUMNS, SHAREHOLDER_COLUMNS, PROMOTER_HOLDING_COLUMNS } from './m2-capital';
export { m3Promoters } from './m3-promoters';
export { m4Management } from './m4-management';
export { m5Business } from './m5-business';
export { m6Financials } from './m6-financials';
export { m7Legal } from './m7-legal';
export { m8Approvals } from './m8-approvals';
export { m9Offer } from './m9-offer';
export { m10GroupCompanies } from './m10-group-companies';
export type { RepeaterColumn } from './repeater-spec';

/**
 * The module registry — all ten, against one engine.
 *
 * Order is the order the dependency graph allows and the order a first-time
 * issuer should meet them: the company, its capital, its people, its
 * business, its numbers, its legal position, its licences, the issue itself,
 * and the group around it. Each module's `dependsOn` gates it on the list.
 */
export const moduleRegistry: Module[] = [
  m1Company,
  m2Capital,
  m3Promoters,
  m4Management,
  m5Business,
  m6Financials,
  m7Legal,
  m8Approvals,
  m9Offer,
  m10GroupCompanies,
];

export function findModule(id: string): Module | undefined {
  return moduleRegistry.find((m) => m.id.toLowerCase() === id.toLowerCase());
}

/** Progress across every module, for the intake list. */
export function allProgress(facts: PartialFactBase): ModuleProgress[] {
  const read = (path: FactPath) => getFact(facts, path);
  const completed = new Set<string>();

  // Two passes: a module's unlocked state depends on the completion of the
  // modules before it, so completion is settled first.
  for (const m of moduleRegistry) {
    const p = moduleProgress(m, facts, read, completed);
    if (p.answered === p.applicable && p.withIssues === 0) completed.add(m.id);
  }

  return moduleRegistry.map((m) => moduleProgress(m, facts, read, completed));
}

/**
 * Resolve a field's `feedsInto` ids to the section titles a person recognises.
 *
 * A built section resolves to its title. A PLANNED section — in the map, not
 * yet in the registry — resolves to its title marked "not yet drafted", so the
 * form neither promises a place that does not exist (D22) nor hides where the
 * answer is going. An id that is neither is dropped; a test asserts no field
 * carries one.
 */
export function feedsIntoTitles(ids: string[]): string[] {
  const built = new Map(sectionRegistry.map((s) => [s.id, s.title]));
  const titles = ids.map((id) => {
    const title = built.get(id);
    if (title) return title;
    const planned = plannedSections[id];
    return planned ? `${planned} (not yet drafted)` : undefined;
  });
  return [...new Set(titles.filter((t): t is string => Boolean(t)))];
}
