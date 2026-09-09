/**
 * Provenance lives BESIDE the facts, not wrapped around them.
 *
 * The obvious design is to make every field a `Fact<T> = { value, source, ... }`.
 * That is wrong here, for a concrete reason: the same Zod schemas drive form
 * validation AND Claude's extraction tool schema. If every field were a
 * provenance wrapper, we would be asking the model to invent its own
 * provenance. We want plain values back, and we attach provenance ourselves
 * from what we know about the call.
 *
 * So: `facts` holds plain, schema-shaped values. `provenance` is a flat map
 * keyed by FactPath. See D18.
 */

/**
 * Dotted path into the fact base, with numeric segments for array members:
 *   "company.name"
 *   "capital.allotments[2].issuePrice"
 */
export type FactPath = string;

export type FactSource =
  /** Typed by a human into the wizard. */
  | 'user'
  /** Read out of an uploaded document and confirmed by a human. */
  | 'extracted'
  /** Derived by our own code from other facts. */
  | 'computed';

export interface Provenance {
  source: FactSource;
  /** Where in which document, for `extracted`. Drives the click-to-source UI. */
  ref?: { documentId: string; page: number };
  /** Which facts this was derived from, for `computed`. */
  derivedFrom?: FactPath[];
  /** Model confidence for `extracted`, 0..1. Low values get flagged for review. */
  confidence?: number;
  /**
   * Extracted values are not trusted until a human confirms them against the
   * source page. Unconfirmed facts must never reach the document.
   */
  confirmed?: boolean;
  updatedAt: string;
  updatedBy: string;
}

export type ProvenanceMap = Record<FactPath, Provenance>;

export function userProvenance(by: string): Provenance {
  return { source: 'user', updatedAt: new Date().toISOString(), updatedBy: by };
}

export function extractedProvenance(
  documentId: string,
  page: number,
  confidence?: number,
): Provenance {
  return {
    source: 'extracted',
    ref: { documentId, page },
    confidence,
    confirmed: false,
    updatedAt: new Date().toISOString(),
    updatedBy: 'extraction',
  };
}

export function computedProvenance(derivedFrom: FactPath[]): Provenance {
  return {
    source: 'computed',
    derivedFrom,
    updatedAt: new Date().toISOString(),
    updatedBy: 'system',
  };
}

/**
 * A fact is usable in the document only if it is present AND — when it came
 * from a document — a human has confirmed it. Everything else renders as a
 * [TO BE PROVIDED] placeholder and raises a gap.
 */
export function isUsable(value: unknown, p: Provenance | undefined): boolean {
  if (value === null || value === undefined || value === '') return false;
  if (!p) return true; // plain seed data with no provenance recorded yet
  if (p.source === 'extracted' && !p.confirmed) return false;
  return true;
}

/* ------------------------------------------------------------------ */
/* Path access                                                         */
/* ------------------------------------------------------------------ */

type Segment = { key: string } | { index: number };

function parsePath(path: FactPath): Segment[] {
  const segments: Segment[] = [];
  for (const part of path.split('.')) {
    const match = part.match(/^([^[\]]+)((\[\d+\])*)$/);
    if (!match) throw new Error(`Malformed fact path segment: "${part}" in "${path}"`);
    segments.push({ key: match[1] });
    for (const idx of match[2].matchAll(/\[(\d+)\]/g)) {
      segments.push({ index: Number(idx[1]) });
    }
  }
  return segments;
}

export function getFact<T = unknown>(root: unknown, path: FactPath): T | undefined {
  let current: unknown = root;
  for (const segment of parsePath(path)) {
    if (current === null || current === undefined) return undefined;
    current =
      'key' in segment
        ? (current as Record<string, unknown>)[segment.key]
        : (current as unknown[])[segment.index];
  }
  return current as T | undefined;
}

/**
 * Immutable set — returns a new root, leaving the original untouched. The fact
 * base is versioned and append-only, so nothing may be mutated in place.
 */
export function setFact<R>(root: R, path: FactPath, value: unknown): R {
  const segments = parsePath(path);

  function assign(node: unknown, depth: number): unknown {
    const segment = segments[depth];
    const last = depth === segments.length - 1;

    if ('key' in segment) {
      const obj = { ...((node as Record<string, unknown>) ?? {}) };
      obj[segment.key] = last ? value : assign(obj[segment.key], depth + 1);
      return obj;
    }

    const arr = [...((node as unknown[]) ?? [])];
    arr[segment.index] = last ? value : assign(arr[segment.index], depth + 1);
    return arr;
  }

  return assign(root, 0) as R;
}

/** Every leaf path present in an object. Used to diff versions and find gaps. */
export function listPaths(root: unknown, prefix = ''): FactPath[] {
  if (root === null || typeof root !== 'object') return prefix ? [prefix] : [];

  if (Array.isArray(root)) {
    return root.flatMap((item, i) => listPaths(item, `${prefix}[${i}]`));
  }

  return Object.entries(root).flatMap(([key, value]) =>
    listPaths(value, prefix ? `${prefix}.${key}` : key),
  );
}
