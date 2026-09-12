import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { appendAudit, readAuditLog } from './audit-log';

describe('the audit log', () => {
  let dir: string;

  beforeEach(() => {
    dir = mkdtempSync(join(tmpdir(), 'setu-audit-log-'));
    process.env.SETU_DATA_DIR = dir;
  });

  afterEach(() => {
    delete process.env.SETU_DATA_DIR;
    rmSync(dir, { recursive: true, force: true });
  });

  it('is empty until something is logged', () => {
    expect(readAuditLog()).toEqual([]);
  });

  it('appends without overwriting, and stamps an id and a timestamp', () => {
    const first = appendAudit({ actor: 'CFO', action: 'section-status', detail: 'A -> B' });
    const second = appendAudit({ actor: 'MERCHANT_BANKER', action: 'certify' });

    expect(first.id).not.toBe(second.id);
    expect(first.at).toBeTruthy();

    const log = readAuditLog();
    expect(log).toHaveLength(2);
  });

  it('reads newest first', () => {
    appendAudit({ actor: 'PROMOTER', action: 'comment', detail: 'first' });
    appendAudit({ actor: 'PROMOTER', action: 'comment', detail: 'second' });

    const log = readAuditLog();
    expect(log[0].detail).toBe('second');
    expect(log[1].detail).toBe('first');
  });
});
