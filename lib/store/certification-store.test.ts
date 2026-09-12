import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { readCertification, certify, revokeCertification, listCertificationVersions } from './certification-store';

describe('the certification store', () => {
  let dir: string;

  beforeEach(() => {
    dir = mkdtempSync(join(tmpdir(), 'setu-certification-store-'));
    process.env.SETU_DATA_DIR = dir;
  });

  afterEach(() => {
    delete process.env.SETU_DATA_DIR;
    rmSync(dir, { recursive: true, force: true });
  });

  it('defaults to not certified', () => {
    const record = readCertification();
    expect(record.certified).toBe(false);
    expect(record.certifiedBy).toBeNull();
    expect(record.version).toBe(0);
  });

  it('certifying records who and when', () => {
    const record = certify('MERCHANT_BANKER');
    expect(record.certified).toBe(true);
    expect(record.certifiedBy).toBe('MERCHANT_BANKER');
    expect(record.certifiedAt).toBeTruthy();
    expect(readCertification().certified).toBe(true);
  });

  it('revoking is a new version, not a deletion of the certification history', () => {
    certify('MERCHANT_BANKER');
    revokeCertification('MERCHANT_BANKER');

    expect(readCertification().certified).toBe(false);
    expect(listCertificationVersions()).toEqual([1, 2]);
  });
});
