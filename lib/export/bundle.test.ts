import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { assemble } from './bundle';
import { certify } from '../store/certification-store';

/**
 * S12: `assemble()` is the one place every export route reads `certified`
 * from (`app/export/docx/route.ts`, `pdf/route.ts`, `buildVault`). This
 * confirms it actually reflects the certification store rather than the
 * hardcoded `false` it used to be — a full DOCX render isn't needed to prove
 * that wiring; `docx.test.ts` already covers what the flag does once it
 * reaches `renderDocx`.
 */
describe('assemble()', () => {
  let dir: string;

  beforeEach(() => {
    dir = mkdtempSync(join(tmpdir(), 'setu-bundle-'));
    process.env.SETU_DATA_DIR = dir;
  });

  afterEach(() => {
    delete process.env.SETU_DATA_DIR;
    rmSync(dir, { recursive: true, force: true });
  });

  it('is not certified by default', () => {
    expect(assemble().certified).toBe(false);
  });

  it('reflects a real certification', () => {
    certify('MERCHANT_BANKER');
    expect(assemble().certified).toBe(true);
  });
});
