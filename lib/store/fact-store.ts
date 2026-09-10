import { mkdirSync, readFileSync, writeFileSync, existsSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { getFact, setFact, userProvenance, type FactPath, type ProvenanceMap } from '../facts/provenance';
import type { PartialFactBase } from '../facts/schema';

/**
 * The fact base on disk.
 *
 * Local JSON until S7 brings Supabase in with uploads. The shape is chosen so
 * that swap is a change of driver, not of callers: everything goes through
 * `readFactBase` and `writeFacts`.
 *
 * **APPEND-ONLY.** Every write lands as a new numbered version alongside the
 * previous ones, and `current.json` is a pointer to the latest. Nothing is
 * ever overwritten, because "who changed this figure, and when" is a question
 * a merchant banker will ask about a document that carries their signature —
 * and because an offer document is evidence.
 */

/**
 * Paths are resolved per call, not at import.
 *
 * Reading the env var once at module load makes the store impossible to point
 * at a temporary directory from a test without module-cache surgery — and a
 * store nobody can test is a store nobody should trust with the fact base.
 */
const root = () => process.env.SETU_DATA_DIR ?? '.data';
const versionsDir = () => join(root(), 'versions');
const currentFile = () => join(root(), 'current.json');

export interface FactBaseVersion {
  version: number;
  savedAt: string;
  savedBy: string;
  /** The paths this version changed, so a diff needs no comparison pass. */
  changed: FactPath[];
  facts: PartialFactBase;
  provenance: ProvenanceMap;
}

function ensure() {
  mkdirSync(versionsDir(), { recursive: true });
}

/** The empty starting point. An issuer begins with nothing, not with defaults. */
const EMPTY: FactBaseVersion = {
  version: 0,
  savedAt: new Date(0).toISOString(),
  savedBy: 'system',
  changed: [],
  facts: {},
  provenance: {},
};

export function readFactBase(): FactBaseVersion {
  ensure();
  if (!existsSync(currentFile())) return EMPTY;
  try {
    return JSON.parse(readFileSync(currentFile(), 'utf8')) as FactBaseVersion;
  } catch {
    // A corrupt pointer must not lose the history. Fall back to the highest
    // numbered version on disk rather than starting empty.
    const versions = listVersions();
    if (versions.length === 0) return EMPTY;
    return readVersion(versions[versions.length - 1]);
  }
}

export function listVersions(): number[] {
  ensure();
  return readdirSync(versionsDir())
    .filter((f) => /^\d+\.json$/.test(f))
    .map((f) => Number(f.replace('.json', '')))
    .sort((a, b) => a - b);
}

export function readVersion(version: number): FactBaseVersion {
  return JSON.parse(readFileSync(join(versionsDir(), `${version}.json`), 'utf8')) as FactBaseVersion;
}

/**
 * Write one or more facts as a new version.
 *
 * Returns the version written. Writing the same value a field already holds is
 * a no-op — autosave fires on every keystroke pause, and a version per
 * keystroke would bury the real edits.
 */
export function writeFacts(
  updates: Record<FactPath, unknown>,
  savedBy: string,
): FactBaseVersion {
  ensure();
  const previous = readFactBase();

  const changed = Object.entries(updates).filter(
    ([path, value]) => JSON.stringify(getFact(previous.facts, path)) !== JSON.stringify(value),
  );
  if (changed.length === 0) return previous;

  let facts = previous.facts;
  const provenance: ProvenanceMap = { ...previous.provenance };
  for (const [path, value] of changed) {
    facts = setFact(facts, path, value);
    provenance[path] = userProvenance(savedBy);
  }

  const next: FactBaseVersion = {
    version: previous.version + 1,
    savedAt: new Date().toISOString(),
    savedBy,
    changed: changed.map(([path]) => path),
    facts,
    provenance,
  };

  // Version first, pointer second. If the process dies between the two, the
  // history is intact and the pointer recovers on the next read.
  writeFileSync(join(versionsDir(), `${next.version}.json`), JSON.stringify(next, null, 2));
  writeFileSync(currentFile(), JSON.stringify(next, null, 2));
  return next;
}

/** Seed an empty store, so the demo has something to show. Never overwrites. */
export function seedIfEmpty(facts: PartialFactBase, by = 'seed'): FactBaseVersion {
  const current = readFactBase();
  if (current.version > 0) return current;
  return writeFacts(flatten(facts), by);
}

/**
 * Flatten a nested fact object to the top-level domain paths.
 *
 * Deliberately shallow: domains are written whole when seeding, and
 * field-by-field when a person is typing. Flattening all the way down would
 * make a seed produce hundreds of provenance entries claiming a human typed
 * each one.
 */
function flatten(facts: PartialFactBase): Record<FactPath, unknown> {
  return Object.fromEntries(Object.entries(facts));
}
