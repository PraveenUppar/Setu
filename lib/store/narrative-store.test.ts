import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { readNarrative, writeNarrative, listNarrativeVersions, readNarrativeVersion } from './narrative-store';

describe('the narrative store', () => {
  let dir: string;

  beforeEach(() => {
    dir = mkdtempSync(join(tmpdir(), 'setu-narrative-store-'));
    process.env.SETU_DATA_DIR = dir;
  });

  afterEach(() => {
    delete process.env.SETU_DATA_DIR;
    rmSync(dir, { recursive: true, force: true });
  });

  it('returns null for an id with no draft yet', () => {
    expect(readNarrative('risk.customer-concentration', { a: 1 })).toBeNull();
  });

  it('round-trips a draft when the current factSlice matches the one it was drafted from', () => {
    writeNarrative('risk.customer-concentration', 'Drafted text.', '{"raw":true}', { a: 1 }, 'tester');
    const draft = readNarrative('risk.customer-concentration', { a: 1 });
    expect(draft?.text).toBe('Drafted text.');
    expect(draft?.raw).toBe('{"raw":true}');
    expect(draft?.factSlice).toEqual({ a: 1 });
    expect(draft?.version).toBe(1);
  });

  // D51: found by a real test failure, not designed up front — a draft
  // generated for one issuer's facts was being served to a different
  // issuer entirely, because nothing checked whether the facts still
  // matched. This is the guard, and the case it exists to stop.
  it('refuses a stored draft whose factSlice no longer matches — the leak this exists to prevent', () => {
    writeNarrative('risk.key-man-insurance-absent', 'Drafted for Vardhman.', '', { companyName: 'Vardhman Precision Components Limited', hasKeyManInsurance: false }, 'tester');
    const draftForADifferentIssuer = readNarrative('risk.key-man-insurance-absent', {
      companyName: 'Some Other Company Limited',
      hasKeyManInsurance: false,
    });
    expect(draftForADifferentIssuer).toBeNull();
  });

  it('refuses a stored draft once the SAME issuer\'s facts have changed', () => {
    writeNarrative('risk.export-revenue-dependency', 'Drafted at 8.4%.', '', { exportRevenueShare: 8.4 }, 'tester');
    expect(readNarrative('risk.export-revenue-dependency', { exportRevenueShare: 9.1 })).toBeNull();
    // Still readable against the exact facts it was drafted from
    expect(readNarrative('risk.export-revenue-dependency', { exportRevenueShare: 8.4 })?.text).toBe('Drafted at 8.4%.');
  });

  it('appends a new version rather than overwriting on regeneration', () => {
    writeNarrative('risk.customer-concentration', 'First draft.', '', {}, 'tester');
    writeNarrative('risk.customer-concentration', 'Second draft.', '', {}, 'tester');

    expect(readNarrative('risk.customer-concentration', {})?.text).toBe('Second draft.');
    expect(listNarrativeVersions('risk.customer-concentration')).toEqual([1, 2]);
    expect(readNarrativeVersion('risk.customer-concentration', 1).text).toBe('First draft.');
  });

  it('keeps drafts for different ids apart', () => {
    writeNarrative('risk.customer-concentration', 'Customer draft.', '', {}, 'tester');
    writeNarrative('risk.leased-facilities', 'Facilities draft.', '', {}, 'tester');

    expect(readNarrative('risk.customer-concentration', {})?.text).toBe('Customer draft.');
    expect(readNarrative('risk.leased-facilities', {})?.text).toBe('Facilities draft.');
  });

  it('is safe for an id containing dots, matching a section id shape', () => {
    writeNarrative('aboutCompany.ourBusiness', 'Business narrative.', '', {}, 'tester');
    expect(readNarrative('aboutCompany.ourBusiness', {})?.text).toBe('Business narrative.');
  });
});
