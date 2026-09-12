import { mkdirSync, readFileSync, writeFileSync, existsSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

/**
 * Risk dismissal record — S10's "dismiss-with-reason, logged" gate
 * (TODO.md's S10 checklist).
 *
 * A triggered archetype is a machine SELECTION, not yet a certified
 * disclosure — the reviewing merchant banker may determine a flagged risk
 * genuinely does not apply to this issuer (a false positive against the
 * archetype's trigger, or one already covered elsewhere) and exclude it from
 * the printed section. That decision, and why, is exactly the shape D9's
 * review model exists for: the MB's job moves from writing to reviewing, and
 * a reviewing decision with no reason attached is not one a diligence file
 * can rely on later — same reasoning MM4 (never invent) applies in reverse to
 * never silently DELETE either.
 *
 * Same append-only, versioned-per-id shape as `narrative-store.ts`, for the
 * same reason: "who excluded this risk, and when, and why" matters for a
 * document carrying a signature. Keyed by archetype id alone — one seeded
 * org, no real auth yet (D-none, the same limitation `narrative-store.ts`
 * already states and accepts for the same reason).
 */

const root = () => process.env.SETU_DATA_DIR ?? '.data';
const dismissalsRoot = () => join(root(), 'risk-dismissals');

/** Filesystem-safe: archetype ids are lowercase-dash today, but this matches narrative-store's discipline in case that ever changes. */
function safeId(id: string): string {
  return id.replace(/[^a-zA-Z0-9_.-]/g, '_');
}
const idDir = (id: string) => join(dismissalsRoot(), safeId(id));
const versionsDir = (id: string) => join(idDir(id), 'versions');
const currentFile = (id: string) => join(idDir(id), 'current.json');

export interface RiskDismissal {
  /** The risk archetype id, e.g. "customer-concentration" — not the store key `risk.<id>` narrative-store uses. */
  id: string;
  version: number;
  /** False means "reinstated" — a real state, not the absence of a record, so a reversal is itself logged. */
  dismissed: boolean;
  reason: string;
  dismissedBy: string;
  dismissedAt: string;
}

function ensure(id: string) {
  mkdirSync(versionsDir(id), { recursive: true });
}

/** The current dismissal state for `id`, or null if it has never been touched. */
export function readDismissal(id: string): RiskDismissal | null {
  ensure(id);
  if (!existsSync(currentFile(id))) return null;
  return JSON.parse(readFileSync(currentFile(id), 'utf8')) as RiskDismissal;
}

export function listDismissalVersions(id: string): number[] {
  ensure(id);
  return readdirSync(versionsDir(id))
    .filter((f) => /^\d+\.json$/.test(f))
    .map((f) => Number(f.replace('.json', '')))
    .sort((a, b) => a - b);
}

export function readDismissalVersion(id: string, version: number): RiskDismissal {
  return JSON.parse(readFileSync(join(versionsDir(id), `${version}.json`), 'utf8')) as RiskDismissal;
}

/** Every archetype id with a dismissal record on file, dismissed or reinstated — for the review page and the audit trail. */
export function listDismissalIds(): string[] {
  if (!existsSync(dismissalsRoot())) return [];
  return readdirSync(dismissalsRoot());
}

/** Record a dismissal or a reinstatement (`dismissed: false`) as the next version. Never overwrites the history. */
export function writeDismissal(id: string, dismissed: boolean, reason: string, dismissedBy: string): RiskDismissal {
  ensure(id);
  const previousVersions = listDismissalVersions(id);
  const nextVersion = previousVersions.length === 0 ? 1 : previousVersions[previousVersions.length - 1] + 1;

  const next: RiskDismissal = {
    id,
    version: nextVersion,
    dismissed,
    reason,
    dismissedBy,
    dismissedAt: new Date().toISOString(),
  };

  writeFileSync(join(versionsDir(id), `${next.version}.json`), JSON.stringify(next, null, 2));
  writeFileSync(currentFile(id), JSON.stringify(next, null, 2));
  return next;
}
