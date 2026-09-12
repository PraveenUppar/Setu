import { mkdirSync, readFileSync, writeFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import type { Role } from '../review/types';

/**
 * The append-only audit log — S12's "who did what, when" gate.
 *
 * One growing JSON array, never truncated or rewritten in place, unlike the
 * per-id versioned stores elsewhere (`risk-dismissal-store.ts`,
 * `narrative-store.ts`): there is no natural "id" an audit entry replaces —
 * every entry is its own event, forever. Every review-workflow action
 * (`app/review/actions.ts`) appends here after its own store write, and the
 * D58 risk-dismissal action does too, so this is genuinely "every action",
 * not just the four stores S12 introduced.
 */

const root = () => process.env.SETU_DATA_DIR ?? '.data';
const logFile = () => join(root(), 'audit-log.json');

export interface AuditEntry {
  id: string;
  at: string;
  actor: Role;
  action: string;
  detail?: string;
}

function ensure() {
  mkdirSync(root(), { recursive: true });
}

function readAll(): AuditEntry[] {
  ensure();
  if (!existsSync(logFile())) return [];
  return JSON.parse(readFileSync(logFile(), 'utf8')) as AuditEntry[];
}

export function appendAudit(entry: { actor: Role; action: string; detail?: string }): AuditEntry {
  ensure();
  const entries = readAll();
  const next: AuditEntry = {
    id: `a${entries.length + 1}`,
    at: new Date().toISOString(),
    ...entry,
  };
  entries.push(next);
  writeFileSync(logFile(), JSON.stringify(entries, null, 2));
  return next;
}

/** Newest first — an audit log is read backwards, from "what just happened". */
export function readAuditLog(): AuditEntry[] {
  return readAll().slice().reverse();
}
