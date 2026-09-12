import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { readDismissal, writeDismissal, listDismissalVersions, readDismissalVersion, listDismissalIds } from './risk-dismissal-store';

describe('the risk dismissal store', () => {
  let dir: string;

  beforeEach(() => {
    dir = mkdtempSync(join(tmpdir(), 'setu-risk-dismissal-store-'));
    process.env.SETU_DATA_DIR = dir;
  });

  afterEach(() => {
    delete process.env.SETU_DATA_DIR;
    rmSync(dir, { recursive: true, force: true });
  });

  it('returns null for an id never touched', () => {
    expect(readDismissal('customer-concentration')).toBeNull();
  });

  it('records a dismissal with its reason and who made it', () => {
    const record = writeDismissal('supplier-concentration', true, 'The 55% figure is a single large one-off order, not a recurring dependency.', 'reviewer@example.com');
    expect(record.dismissed).toBe(true);
    expect(record.reason).toContain('single large one-off order');
    expect(record.version).toBe(1);

    const read = readDismissal('supplier-concentration');
    expect(read?.dismissed).toBe(true);
    expect(read?.dismissedBy).toBe('reviewer@example.com');
  });

  it('a reinstatement is a new version, not a deletion of the dismissal history', () => {
    writeDismissal('leased-facilities', true, 'Excluded in error.', 'reviewer@example.com');
    writeDismissal('leased-facilities', false, 'Reinstated — the exclusion reason did not hold up on a second look.', 'reviewer@example.com');

    expect(readDismissal('leased-facilities')?.dismissed).toBe(false);
    expect(listDismissalVersions('leased-facilities')).toEqual([1, 2]);
    expect(readDismissalVersion('leased-facilities', 1).dismissed).toBe(true);
  });

  it('keeps dismissals for different ids apart', () => {
    writeDismissal('customer-concentration', true, 'Reason A.', 'a@example.com');
    writeDismissal('leased-facilities', true, 'Reason B.', 'b@example.com');

    expect(readDismissal('customer-concentration')?.reason).toBe('Reason A.');
    expect(readDismissal('leased-facilities')?.reason).toBe('Reason B.');
  });

  it('lists every id with a dismissal record on file', () => {
    expect(listDismissalIds()).toEqual([]);
    writeDismissal('customer-concentration', true, 'Reason.', 'a@example.com');
    writeDismissal('leased-facilities', false, 'Never actually dismissed, just reviewed.', 'a@example.com');
    expect(listDismissalIds().sort()).toEqual(['customer-concentration', 'leased-facilities']);
  });
});
