import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { readStatus, writeStatus, listStatusVersions, readStatusVersion } from './section-status-store';

describe('the section status store', () => {
  let dir: string;

  beforeEach(() => {
    dir = mkdtempSync(join(tmpdir(), 'setu-section-status-store-'));
    process.env.SETU_DATA_DIR = dir;
  });

  afterEach(() => {
    delete process.env.SETU_DATA_DIR;
    rmSync(dir, { recursive: true, force: true });
  });

  it('defaults to Draft for a section never touched', () => {
    const status = readStatus('general.forwardLookingStatements');
    expect(status.status).toBe('DRAFT');
    expect(status.version).toBe(0);
  });

  it('records who moved a section forward, as a new version', () => {
    const record = writeStatus('aboutCompany.ourBusiness', 'READY_FOR_REVIEW', 'PROMOTER');
    expect(record.version).toBe(1);
    expect(readStatus('aboutCompany.ourBusiness').status).toBe('READY_FOR_REVIEW');
  });

  it('moving backward is a new version, not an overwrite of the history', () => {
    writeStatus('aboutCompany.ourBusiness', 'REVIEWED', 'MERCHANT_BANKER');
    writeStatus('aboutCompany.ourBusiness', 'DRAFT', 'CFO');

    expect(readStatus('aboutCompany.ourBusiness').status).toBe('DRAFT');
    expect(listStatusVersions('aboutCompany.ourBusiness')).toEqual([1, 2]);
    expect(readStatusVersion('aboutCompany.ourBusiness', 1).status).toBe('REVIEWED');
  });

  it('keeps different sections apart', () => {
    writeStatus('general.forwardLookingStatements', 'LOCKED', 'MERCHANT_BANKER');
    expect(readStatus('aboutCompany.ourBusiness').status).toBe('DRAFT');
  });
});
