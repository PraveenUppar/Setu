import { describe, it, expect } from 'vitest';
import {
  buildUp,
  capitalConsistency,
  capitalSummary,
  lockIn,
  shareholding,
  topShareholders,
} from './tables';
import { vardhman } from '../seed/vardhman';
import { money } from '../facts/money';
import type { FactBase } from '../facts/schema';

const clone = (mutate: (f: FactBase) => void): FactBase => {
  const f = structuredClone(vardhman) as FactBase;
  mutate(f);
  return f;
};

describe('capital build-up', () => {
  it('accumulates to paid-up capital', () => {
    const rows = buildUp(vardhman.capital.allotments);
    const last = rows[rows.length - 1];
    expect(last.cumulativeShares).toBe(vardhman.capital.paidUpShares);
    expect(last.cumulativeCapital).toBe(money('12', 'crores'));
  });

  it('sorts by date, because a repeater is not filled in order', () => {
    const shuffled = [...vardhman.capital.allotments].reverse();
    const rows = buildUp(shuffled);
    const dates = rows.map((r) => r.date);
    expect(dates).toEqual([...dates].sort());
    // And the running total is still right despite the input order.
    expect(rows[rows.length - 1].cumulativeShares).toBe(vardhman.capital.paidUpShares);
  });

  it('carries the bonus issue through at nil price', () => {
    const bonus = buildUp(vardhman.capital.allotments).find((r) => r.nature === 'BONUS_ISSUE')!;
    expect(bonus.issuePrice).toBeNull();
    expect(bonus.shares).toBe(10800000);
  });
});

describe('shareholding, before and after', () => {
  it('shows the same holding diluted by the issue', () => {
    // Existing holders lose percentage, not shares. Vardhman: 1.2 cr pre,
    // 1.65 cr post, so every holding falls by the same ratio.
    const rows = shareholding(vardhman);
    const rajesh = rows.find((r) => r.name === 'Rajesh Vardhman')!;
    expect(rajesh.shares).toBe(4680000);
    expect(rajesh.preIssuePercent).toBe('39.00');
    expect(rajesh.postIssuePercent).toBe('28.36');
  });

  it('sums to 100% of pre-issue capital', () => {
    const total = shareholding(vardhman).reduce((n, r) => n + Number(r.preIssuePercent), 0);
    expect(total).toBeCloseTo(100, 1);
  });

  it('orders by size, largest first', () => {
    const sizes = shareholding(vardhman).map((r) => r.shares);
    expect(sizes).toEqual([...sizes].sort((a, b) => b - a));
  });

  it('caps the top-ten table at ten', () => {
    expect(topShareholders(vardhman).length).toBeLessThanOrEqual(10);
  });
});

describe('lock-in (R-009)', () => {
  it('computes the MPC on POST-issue capital, not pre-issue', () => {
    // Vardhman: 1,20,00,000 pre + 45,00,000 fresh = 1,65,00,000 post.
    // 20% of post = 33,00,000. Computing on pre would give 24,00,000 and
    // understate the requirement by exactly the dilution.
    const result = lockIn(vardhman);
    expect(result.requiredMpcShares).toBe(3300000);
    expect(result.shortfallShares).toBe(0);
  });

  it('locks exactly the MPC for three years and the rest in two halves', () => {
    const { tranches, requiredMpcShares } = lockIn(vardhman);

    const threeYear = tranches.filter((t) => t.lockInYears === 3).reduce((n, t) => n + t.shares, 0);
    expect(threeYear).toBe(requiredMpcShares);

    const oneYear = tranches.filter((t) => t.lockInYears === 1).reduce((n, t) => n + t.shares, 0);
    const twoYear = tranches.filter((t) => t.lockInYears === 2).reduce((n, t) => n + t.shares, 0);

    // The excess splits 50/50, the first half rounded up.
    const excess = vardhman.capital.promoterHoldings.reduce((n, h) => n + h.shares, 0) - requiredMpcShares;
    expect(oneYear + twoYear).toBe(excess);
    expect(oneYear).toBe(Math.ceil(excess / 2));
  });

  it('accounts for every promoter share exactly once', () => {
    const held = vardhman.capital.promoterHoldings.reduce((n, h) => n + h.shares, 0);
    const locked = lockIn(vardhman).tranches.reduce((n, t) => n + t.shares, 0);
    expect(locked).toBe(held);
  });

  it('locks the oldest tranches into the MPC first', () => {
    const threeYear = lockIn(vardhman).tranches.filter((t) => t.lockInYears === 3);
    // Vardhman's oldest promoter tranches are the 2016 subscriptions.
    expect(threeYear[0].acquisitionDate).toBe('2016-04-12');
  });

  it('excludes ineligible tranches from the MPC but still locks them', () => {
    // A promoter can hold 25% of post-issue capital and still be short, if the
    // holding is bonus shares out of revaluation reserves.
    const f = clone((x) => {
      for (const h of x.capital.promoterHoldings) {
        if (h.natureOfAcquisition === 'BONUS_ISSUE') h.eligibleForMPC = false;
      }
    });
    const result = lockIn(f);

    expect(result.eligibleShares).toBe(780000); // the two 2016 subscriptions
    expect(result.shortfallShares).toBe(3300000 - 780000);

    // Still locked, just not at three years and not counted toward the MPC.
    const total = f.capital.promoterHoldings.reduce((n, h) => n + h.shares, 0);
    expect(result.tranches.reduce((n, t) => n + t.shares, 0)).toBe(total);
  });
});

describe('capital summary', () => {
  it('derives post-issue capital from the fresh issue', () => {
    const s = capitalSummary(vardhman);
    expect(s.preIssueShares).toBe(12000000);
    expect(s.postIssueShares).toBe(16500000);
    expect(s.postIssueCapital).toBe(money('16.5', 'crores'));
    expect(s.preIssueCapital).toBe(money('12', 'crores'));
  });
});

describe('live consistency', () => {
  it('passes on the seed, whose arithmetic ties', () => {
    expect(capitalConsistency(vardhman)).toEqual([]);
  });

  it('catches a shareholding register that does not reach 100%', () => {
    // The S5 gate: break it to 99.4% and the error fires immediately.
    const f = clone((x) => {
      x.capital.shareholders[4].shares = 1128000; // was 12,00,000
    });
    const issues = capitalConsistency(f);
    expect(issues).toHaveLength(1);
    expect(issues[0].message).toContain('99.40%');
    expect(issues[0].detail).toContain('every share');
  });

  it('catches an allotment history that does not tie to paid-up capital', () => {
    const f = clone((x) => {
      x.capital.allotments[0].shares = 5000; // was 10,000
    });
    const issues = capitalConsistency(f);
    expect(issues[0].message).toContain('does not tie to paid-up capital');
    expect(issues[0].detail).toContain('difference of 5,000');
  });

  it('stays silent while the lists are still empty', () => {
    // A half-filled form must not shout at the issuer for not having finished.
    const f = clone((x) => {
      x.capital.allotments = [];
      x.capital.shareholders = [];
    });
    expect(capitalConsistency(f)).toEqual([]);
  });
});

/**
 * The S5 gate: run an S0 ground-truth pair.
 *
 * These figures are Om Galaxy's PUBLISHED build-up table, from
 * `fixtures/corpus/truth/om-galaxy.txt` — a real capital history, reconciled
 * by a merchant banker and filed with the exchange. If our computation
 * reproduces it exactly, the arithmetic is right in a way no synthetic fixture
 * can demonstrate.
 *
 * The figures are written out here rather than parsed from the fixture at
 * runtime: the extracted columns are interleaved, and a parser failing would
 * produce a test that fails for the wrong reason and teaches nothing.
 */
describe('ground truth — Om Galaxy published capital build-up', () => {
  const faceValue = money('100');
  const published = [
    { date: '2008-10-08', shares: 10000, cumulative: 10000, capital: '1000000' },
    { date: '2009-03-31', shares: 10000, cumulative: 20000, capital: '2000000' },
    { date: '2010-03-31', shares: 30000, cumulative: 50000, capital: '5000000' },
    { date: '2011-03-31', shares: 26000, cumulative: 76000, capital: '7600000' },
    { date: '2012-03-31', shares: 34000, cumulative: 110000, capital: '11000000' },
    { date: '2013-03-31', shares: 32000, cumulative: 142000, capital: '14200000' },
  ];

  const allotments = published.map((p) => ({
    date: p.date,
    shares: p.shares,
    faceValue,
    issuePrice: faceValue,
    consideration: 'CASH' as const,
    nature: 'FURTHER_ALLOTMENT' as const,
  }));

  it('reproduces the published cumulative share count row for row', () => {
    const rows = buildUp(allotments);
    expect(rows.map((r) => r.cumulativeShares)).toEqual(published.map((p) => p.cumulative));
  });

  it('reproduces the published cumulative paid-up capital row for row', () => {
    const rows = buildUp(allotments);
    expect(rows.map((r) => r.cumulativeCapital)).toEqual(published.map((p) => p.capital));
  });

  it('reproduces it from rows entered out of order', () => {
    // A repeater is not filled chronologically, and the published table is.
    const shuffled = [allotments[3], allotments[0], allotments[5], allotments[1], allotments[4], allotments[2]];
    expect(buildUp(shuffled).map((r) => r.cumulativeShares)).toEqual(
      published.map((p) => p.cumulative),
    );
  });
});
