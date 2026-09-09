import { describe, it, expect } from 'vitest';
import { money, add, subtract, pct, percentOf, formatIndian, formatAs, toUnit, gt, eq } from './money';
import { getFact, setFact, listPaths, isUsable, extractedProvenance, userProvenance } from './provenance';

describe('money', () => {
  it('does not lose precision where floats would', () => {
    // 0.1 + 0.2 !== 0.3 in float arithmetic. This is the whole reason for Decimal.
    expect(add(money('0.1'), money('0.2'))).toBe('0.3');
    expect(eq(add(money('0.1'), money('0.2')), money('0.3'))).toBe(true);
  });

  it('converts Indian units to canonical rupees', () => {
    expect(money('1', 'lakhs')).toBe('100000');
    expect(money('1', 'crores')).toBe('10000000');
    expect(money('1110.54', 'lakhs')).toBe('111054000');
  });

  it('round-trips through units', () => {
    const amount = money('2500', 'lakhs'); // Rs 25 crore, the SME capital cap
    expect(toUnit(amount, 'crores').toFixed()).toBe('25');
    expect(toUnit(amount, 'lakhs').toFixed()).toBe('2500');
  });

  it('computes percentages exactly', () => {
    // GCP cap: 15% of gross proceeds, capped at Rs 10 crore (R-010)
    const gross = money('50', 'crores');
    expect(pct(gross, 15)).toBe(money('7.5', 'crores'));
    expect(percentOf(money('7.5', 'crores'), gross)!.toFixed()).toBe('15');
  });

  it('returns null for percentage of zero rather than Infinity', () => {
    expect(percentOf(money('100'), money('0'))).toBeNull();
  });

  it('formats in the Indian grouping convention', () => {
    // 2,22,10,824 — not 222,10,824 and not 22,210,824
    expect(formatIndian('22210824', 0)).toBe('2,22,10,824');
    expect(formatIndian('100000', 0)).toBe('1,00,000');
    expect(formatIndian('999', 0)).toBe('999');
    expect(formatIndian('-100000', 0)).toBe('-1,00,000');
  });

  it('renders as a prospectus would', () => {
    expect(formatAs(money('1110.54', 'lakhs'), 'lakhs')).toBe('Rs 1,110.54 Lakhs');
  });

  it('compares without float drift', () => {
    // Post-issue capital cap check, R-001
    expect(gt(money('25.01', 'crores'), money('25', 'crores'))).toBe(true);
    expect(gt(money('24.99', 'crores'), money('25', 'crores'))).toBe(false);
  });
});

describe('fact paths', () => {
  const base = {
    company: { name: 'Om Galaxy Limited', cin: 'U33127MH2008PLC187382' },
    capital: {
      allotments: [
        { date: '2008-10-08', shares: 10000 },
        { date: '2024-06-18', shares: 1000000 },
      ],
    },
  };

  it('reads nested and indexed paths', () => {
    expect(getFact(base, 'company.name')).toBe('Om Galaxy Limited');
    expect(getFact(base, 'capital.allotments[1].shares')).toBe(1000000);
  });

  it('returns undefined for missing paths rather than throwing', () => {
    expect(getFact(base, 'company.website')).toBeUndefined();
    expect(getFact(base, 'capital.allotments[9].shares')).toBeUndefined();
    expect(getFact(base, 'nothing.here.at.all')).toBeUndefined();
  });

  it('sets immutably — the original is untouched', () => {
    const next = setFact(base, 'company.name', 'Renamed Limited');
    expect(getFact(next, 'company.name')).toBe('Renamed Limited');
    expect(getFact(base, 'company.name')).toBe('Om Galaxy Limited');
    // Untouched branches are shared, not deep-cloned
    expect(next.capital).toBe(base.capital);
  });

  it('sets into arrays immutably', () => {
    const next = setFact(base, 'capital.allotments[0].shares', 20000);
    expect(getFact(next, 'capital.allotments[0].shares')).toBe(20000);
    expect(getFact(base, 'capital.allotments[0].shares')).toBe(10000);
    expect(getFact(next, 'capital.allotments[1].shares')).toBe(1000000);
  });

  it('creates intermediate nodes that do not exist yet', () => {
    const next = setFact(base, 'offer.objects[0].amount', '100');
    expect(getFact(next, 'offer.objects[0].amount')).toBe('100');
  });

  it('lists every leaf path', () => {
    expect(listPaths(base)).toEqual([
      'company.name',
      'company.cin',
      'capital.allotments[0].date',
      'capital.allotments[0].shares',
      'capital.allotments[1].date',
      'capital.allotments[1].shares',
    ]);
  });

  it('rejects a malformed path loudly', () => {
    expect(() => getFact(base, 'company.[bad]')).toThrow(/Malformed/);
  });
});

describe('usability gate', () => {
  it('treats absent values as unusable', () => {
    expect(isUsable(null, userProvenance('me'))).toBe(false);
    expect(isUsable('', userProvenance('me'))).toBe(false);
    expect(isUsable(undefined, undefined)).toBe(false);
  });

  it('blocks extracted values until a human confirms them', () => {
    const p = extractedProvenance('doc-1', 31, 0.9);
    expect(isUsable('48.2', p)).toBe(false);
    expect(isUsable('48.2', { ...p, confirmed: true })).toBe(true);
  });

  it('allows user-entered values immediately', () => {
    expect(isUsable('48.2', userProvenance('promoter'))).toBe(true);
  });
});
