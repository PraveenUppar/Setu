import { sectionRegistry } from '../document/sections';
import { m1Company } from './m1-company';
import { m2Capital } from './m2-capital';
import { moduleProgress, type Module, type ModuleProgress, type PartialFactBase } from './types';
import { getFact, type FactPath } from '../facts/provenance';

export * from './types';
export { m1Company } from './m1-company';
export { m2Capital, ALLOTMENT_COLUMNS, SHAREHOLDER_COLUMNS, PROMOTER_HOLDING_COLUMNS } from './m2-capital';
export type { RepeaterColumn } from './repeater-spec';

/**
 * The module registry.
 *
 * Ten modules are planned (02-architecture.md); M1 and M2 are built. The rest
 * are content against the same engine, in the order the dependency graph
 * allows: M1 gates M2, and M2 feeds the capital tables that most of the
 * computed sections read.
 */
export const moduleRegistry: Module[] = [m1Company, m2Capital];

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
 * A section that is not built yet resolves to nothing and is dropped, for the
 * same reason a "Holds up" link to an unbuilt section stays plain text (D22):
 * promising the reader a place their answer appears, when it does not appear
 * anywhere yet, is worse than saying less.
 */
export function feedsIntoTitles(ids: string[]): string[] {
  const titles = new Map(sectionRegistry.map((s) => [s.id, s.title]));
  return [...new Set(ids.map((id) => titles.get(id)).filter((t): t is string => Boolean(t)))];
}
