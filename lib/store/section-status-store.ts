import { mkdirSync, readFileSync, writeFileSync, existsSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import type { Role, SectionStatus } from '../review/types';

/**
 * Section review status — Draft -> Ready for Review -> Reviewed -> Locked.
 *
 * Same append-only, versioned-per-id shape as `risk-dismissal-store.ts`: a
 * section moving backward (a reviewer reopening a "Reviewed" section to
 * Draft after a fact changed under it) is itself a real, logged event, not
 * an overwrite of the fact that it was once marked Reviewed.
 */

const root = () => process.env.SETU_DATA_DIR ?? '.data';
const statusesRoot = () => join(root(), 'section-status');

function safeId(id: string): string {
  return id.replace(/[^a-zA-Z0-9_.-]/g, '_');
}
const idDir = (id: string) => join(statusesRoot(), safeId(id));
const versionsDir = (id: string) => join(idDir(id), 'versions');
const currentFile = (id: string) => join(idDir(id), 'current.json');

export interface SectionStatusRecord {
  sectionId: string;
  version: number;
  status: SectionStatus;
  changedBy: Role;
  changedAt: string;
}

function ensure(id: string) {
  mkdirSync(versionsDir(id), { recursive: true });
}

/** Every section defaults to Draft until someone touches it — no record is not a gap, it's the starting state. */
export function readStatus(sectionId: string): SectionStatusRecord {
  ensure(sectionId);
  if (!existsSync(currentFile(sectionId))) {
    return { sectionId, version: 0, status: 'DRAFT', changedBy: 'PROMOTER', changedAt: '' };
  }
  return JSON.parse(readFileSync(currentFile(sectionId), 'utf8')) as SectionStatusRecord;
}

export function listStatusVersions(sectionId: string): number[] {
  ensure(sectionId);
  return readdirSync(versionsDir(sectionId))
    .filter((f) => /^\d+\.json$/.test(f))
    .map((f) => Number(f.replace('.json', '')))
    .sort((a, b) => a - b);
}

export function readStatusVersion(sectionId: string, version: number): SectionStatusRecord {
  return JSON.parse(readFileSync(join(versionsDir(sectionId), `${version}.json`), 'utf8')) as SectionStatusRecord;
}

export function writeStatus(sectionId: string, status: SectionStatus, changedBy: Role): SectionStatusRecord {
  ensure(sectionId);
  const previousVersions = listStatusVersions(sectionId);
  const nextVersion = previousVersions.length === 0 ? 1 : previousVersions[previousVersions.length - 1] + 1;

  const next: SectionStatusRecord = {
    sectionId,
    version: nextVersion,
    status,
    changedBy,
    changedAt: new Date().toISOString(),
  };

  writeFileSync(join(versionsDir(sectionId), `${next.version}.json`), JSON.stringify(next, null, 2));
  writeFileSync(currentFile(sectionId), JSON.stringify(next, null, 2));
  return next;
}
