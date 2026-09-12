import { mkdirSync, readFileSync, writeFileSync, existsSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import type { Role } from '../review/types';

/**
 * The merchant banker's certification — the one flag every export reads to
 * decide whether to print `UNSIGNED DRAFT — NOT FOR FILING` (D35). One
 * document overall, not per-section, so this is a single versioned record
 * rather than the per-id shape the other S12 stores use — closer to
 * `fact-store.ts`'s single append-only pointer than to
 * `risk-dismissal-store.ts`'s per-archetype one.
 *
 * A revocation (the MB un-certifying after a late change) is a new version
 * with `certified: false`, never a delete — same reversal discipline as a
 * risk dismissal's `dismissed: false` reinstatement.
 */

const root = () => process.env.SETU_DATA_DIR ?? '.data';
const certRoot = () => join(root(), 'certification');
const versionsDir = () => join(certRoot(), 'versions');
const currentFile = () => join(certRoot(), 'current.json');

export interface CertificationRecord {
  version: number;
  certified: boolean;
  certifiedBy: Role | null;
  certifiedAt: string | null;
}

function ensure() {
  mkdirSync(versionsDir(), { recursive: true });
}

export function readCertification(): CertificationRecord {
  ensure();
  if (!existsSync(currentFile())) {
    return { version: 0, certified: false, certifiedBy: null, certifiedAt: null };
  }
  return JSON.parse(readFileSync(currentFile(), 'utf8')) as CertificationRecord;
}

export function listCertificationVersions(): number[] {
  ensure();
  return readdirSync(versionsDir())
    .filter((f) => /^\d+\.json$/.test(f))
    .map((f) => Number(f.replace('.json', '')))
    .sort((a, b) => a - b);
}

export function readCertificationVersion(version: number): CertificationRecord {
  return JSON.parse(readFileSync(join(versionsDir(), `${version}.json`), 'utf8')) as CertificationRecord;
}

function write(certified: boolean, by: Role): CertificationRecord {
  ensure();
  const previousVersions = listCertificationVersions();
  const nextVersion = previousVersions.length === 0 ? 1 : previousVersions[previousVersions.length - 1] + 1;

  const next: CertificationRecord = {
    version: nextVersion,
    certified,
    certifiedBy: by,
    certifiedAt: new Date().toISOString(),
  };

  writeFileSync(join(versionsDir(), `${next.version}.json`), JSON.stringify(next, null, 2));
  writeFileSync(currentFile(), JSON.stringify(next, null, 2));
  return next;
}

export function certify(by: Role): CertificationRecord {
  return write(true, by);
}

export function revokeCertification(by: Role): CertificationRecord {
  return write(false, by);
}
