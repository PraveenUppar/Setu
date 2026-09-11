import { mkdirSync, readFileSync, writeFileSync, existsSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

/**
 * Drafted narrative prose on disk, one append-only version history PER id —
 * same shape as `fact-store.ts`, same reason: "who drafted this paragraph,
 * and when" is a question a merchant banker asks about a document carrying
 * their signature, same as a figure. An id is a risk archetype
 * (`risk.customer-concentration`) or eventually a whole narrative section
 * (`aboutCompany.ourBusiness`) — whatever `draftNarrative()` was asked to
 * write prose for.
 *
 * `renderSection()` and `risk-factors.ts`'s `compute()` are both synchronous;
 * an LLM call cannot happen inline at render time. A draft is generated
 * ahead of time by an explicit action, LANDS HERE, and rendering reads
 * whatever is here — present or not — exactly the way `renderTemplate`
 * reads the fact base: usable, or a gap.
 */

const root = () => process.env.SETU_DATA_DIR ?? '.data';
const narrativesRoot = () => join(root(), 'narratives');

/** Filesystem-safe: ids may contain dots (`aboutCompany.ourBusiness`) or dashes (`customer-concentration`). */
function safeId(id: string): string {
  return id.replace(/[^a-zA-Z0-9_.-]/g, '_');
}
const idDir = (id: string) => join(narrativesRoot(), safeId(id));
const versionsDir = (id: string) => join(idDir(id), 'versions');
const currentFile = (id: string) => join(idDir(id), 'current.json');

export interface NarrativeVersion {
  id: string;
  version: number;
  savedAt: string;
  savedBy: string;
  /** The drafted prose, ready to render. */
  text: string;
  /** The model's untouched output, in case `text` is ever post-processed from it later. */
  raw: string;
  /** What the model was allowed to see, kept alongside the draft it produced from it. */
  factSlice: object;
}

function ensure(id: string) {
  mkdirSync(versionsDir(id), { recursive: true });
}

/**
 * The draft for `id`, but ONLY if it was drafted from EXACTLY the facts
 * being rendered right now.
 *
 * D51 caught the reason the hard way: `general.riskFactors.narrative` and
 * `keyManInsuranceAbsent` fire on almost every issuer (D48's default-false
 * boolean), so a draft written for Vardhman was being served, unchanged, to
 * a completely different — even fact-free — issuer under test, because the
 * store was keyed by archetype id ALONE. One seeded org today (no real
 * auth), but the id-only key was already flagged as a limitation in D50
 * before it produced a real leak, and it did, one test run later. The fix
 * is not a per-issuer key — this app still has no issuer identity to key by
 * — it is to never trust a draft whose `factSlice` does not match what is
 * being asked right now. Wrong facts, or no facts at all: read as if
 * nothing has been drafted, same as never having called `writeNarrative` —
 * never a stale, mismatched, or another issuer's paragraph.
 */
export function readNarrative(id: string, currentFactSlice: object): NarrativeVersion | null {
  const stored = readStored(id);
  if (!stored) return null;
  return JSON.stringify(stored.factSlice) === JSON.stringify(currentFactSlice) ? stored : null;
}

function readStored(id: string): NarrativeVersion | null {
  ensure(id);
  if (!existsSync(currentFile(id))) return null;
  try {
    return JSON.parse(readFileSync(currentFile(id), 'utf8')) as NarrativeVersion;
  } catch {
    const versions = listNarrativeVersions(id);
    if (versions.length === 0) return null;
    return readNarrativeVersion(id, versions[versions.length - 1]);
  }
}

export function listNarrativeVersions(id: string): number[] {
  ensure(id);
  return readdirSync(versionsDir(id))
    .filter((f) => /^\d+\.json$/.test(f))
    .map((f) => Number(f.replace('.json', '')))
    .sort((a, b) => a - b);
}

export function readNarrativeVersion(id: string, version: number): NarrativeVersion {
  return JSON.parse(readFileSync(join(versionsDir(id), `${version}.json`), 'utf8')) as NarrativeVersion;
}

/** Write a new draft as the next version. Regenerating keeps every prior draft, never overwrites one. */
export function writeNarrative(
  id: string,
  text: string,
  raw: string,
  factSlice: object,
  savedBy: string,
): NarrativeVersion {
  ensure(id);
  const previousVersions = listNarrativeVersions(id);
  const nextVersion = previousVersions.length === 0 ? 1 : previousVersions[previousVersions.length - 1] + 1;

  const next: NarrativeVersion = {
    id,
    version: nextVersion,
    savedAt: new Date().toISOString(),
    savedBy,
    text,
    raw,
    factSlice,
  };

  writeFileSync(join(versionsDir(id), `${next.version}.json`), JSON.stringify(next, null, 2));
  writeFileSync(currentFile(id), JSON.stringify(next, null, 2));
  return next;
}
