import { describe, expect, it } from 'vitest';
import { money } from '../facts/money';
import type { FactBase } from '../facts/schema';
import { vardhman } from '../seed/vardhman';
import { litigationFor, materialCreditorThreshold, materialityThreshold } from './materiality';

const cr = (v: string) => money(v, 'crores');

describe('the litigation materiality threshold', () => {
  it('is the lowest of the three limbs, with the arithmetic both corpus documents show', () => {
    const t = materialityThreshold(vardhman)!;
    // 2% of Rs 48.20 cr turnover
    expect(t.turnoverLimb).toBe(cr('0.964'));
    // 2% of Rs 19.40 cr net worth
    expect(t.netWorthLimb).toBe(cr('0.388'));
    // 5% of the average absolute PAT: (3.60 + 2.55 + 1.10) / 3 = 2.41666..., x 5%
    expect(Number(t.patLimb)).toBeCloseTo(1208333.33, 0);
    expect(t.basis).toBe('profitAfterTax');
    expect(t.threshold).toBe(t.patLimb);
  });

  it('disregards the sign of a loss year, as Maxwell says it must', () => {
    const withLoss: FactBase = {
      ...vardhman,
      financials: {
        ...vardhman.financials,
        years: vardhman.financials.years.map((y, i) =>
          i === 2 ? { ...y, profitAfterTax: cr('-1.10') } : y,
        ),
      },
    };
    // Same average as before: the loss counts as 1.10, not -1.10
    expect(materialityThreshold(withLoss)!.patLimb).toBe(materialityThreshold(vardhman)!.patLimb);
  });

  it('drops the net worth limb where net worth is negative', () => {
    const negative: FactBase = {
      ...vardhman,
      financials: {
        ...vardhman.financials,
        years: vardhman.financials.years.map((y, i) => (i === 0 ? { ...y, netWorth: cr('-2') } : y)),
      },
    };
    const t = materialityThreshold(negative)!;
    expect(t.netWorthLimb).toBeNull();
    expect(t.basis).toBe('profitAfterTax');
  });

  it('is null with no financials, rather than zero', () => {
    expect(materialityThreshold({ ...vardhman, financials: { ...vardhman.financials, years: [] } })).toBeNull();
  });
});

describe('the material creditor threshold', () => {
  it('is the policy percentage of the latest trade payables', () => {
    // 5% of Rs 6.80 cr
    expect(materialCreditorThreshold(vardhman)).toBe(cr('0.34'));
  });
  it('is null where the policy or the payables are missing', () => {
    expect(
      materialCreditorThreshold({ ...vardhman, legal: { ...vardhman.legal, materialCreditorThresholdPercent: undefined } }),
    ).toBeNull();
  });
});

describe('litigation grouped the way the section prints it', () => {
  it('consolidates tax matters into a count and a total, and lists the rest', () => {
    const l = litigationFor(vardhman, 'COMPANY');
    expect(l.indirectTax).toEqual({ count: 1, amount: cr('0.34') });
    expect(l.directTax).toEqual({ count: 0, amount: '0' });
    expect(l.statutoryRegulatory).toHaveLength(1);
    expect(l.otherMaterialBy).toHaveLength(1);
    expect(l.otherMaterialAgainst).toHaveLength(0);
    expect(l.criminalAgainst).toHaveLength(0);
  });

  it('keeps the parties apart', () => {
    const l = litigationFor(vardhman, 'PROMOTER');
    expect(l.indirectTax.count + l.statutoryRegulatory.length + l.otherMaterialBy.length).toBe(0);
  });
});
