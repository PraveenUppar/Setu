import Decimal from 'decimal.js';
import { add, formatIndian, money, multiply, type Money } from '../facts/money';
import type { Allotment, FactBase, PromoterHolding, Shareholder } from '../facts/schema';

/**
 * The capital tables.
 *
 * Everything in the Capital Structure section is DERIVED from two lists the
 * issuer supplies — `capital.allotments` and `capital.shareholders` — plus the
 * per-promoter tranches in `capital.promoterHoldings`. Nothing here is typed
 * by hand, which is the point: the build-up, the shareholding pattern, the
 * promoter contribution and the lock-in ladder all have to agree with each
 * other, and the only way to guarantee that is to compute them from one
 * source.
 *
 * Every rupee and percentage goes through decimal.js. A capitalisation
 * statement that does not tie because of float drift is the worst kind of bug
 * in this project: silent, plausible, and impossible for the reader to locate.
 */

export interface BuildUpRow {
  date: string;
  shares: number;
  faceValue: Money;
  issuePrice: Money | null;
  consideration: string;
  nature: string;
  allottees?: string;
  /** Running total after this allotment — what makes it a build-up. */
  cumulativeShares: number;
  cumulativeCapital: Money;
}

/**
 * The share capital build-up since incorporation.
 *
 * Sorted by date, because an issuer entering rows into a repeater will not
 * enter them in order, and a build-up out of order is not a build-up.
 */
export function buildUp(allotments: Allotment[]): BuildUpRow[] {
  const sorted = [...allotments].sort((a, b) => a.date.localeCompare(b.date));
  let cumulative = 0;

  return sorted.map((a) => {
    cumulative += a.shares;
    return {
      date: a.date,
      shares: a.shares,
      faceValue: a.faceValue,
      issuePrice: a.issuePrice,
      consideration: a.consideration,
      nature: a.nature,
      allottees: a.allottees,
      cumulativeShares: cumulative,
      cumulativeCapital: multiply(a.faceValue, cumulative),
    };
  });
}

export interface ShareholdingRow {
  name: string;
  category: string;
  shares: number;
  /** Of pre-issue capital. */
  preIssuePercent: string;
  /** Of post-issue capital — the same holding, diluted. */
  postIssuePercent: string;
}

/** Percentage of a whole, to two places, as the corpus states them. */
function percent(part: number, whole: number): string {
  if (whole === 0) return '0.00';
  return new Decimal(part).dividedBy(whole).times(100).toFixed(2);
}

/**
 * The shareholding pattern, before and after the issue.
 *
 * Existing holders do not lose shares in a fresh issue; they lose PERCENTAGE.
 * Showing both columns side by side is what makes dilution legible to a
 * promoter who has not been through this before.
 */
export function shareholding(facts: FactBase): ShareholdingRow[] {
  const pre = facts.capital.paidUpShares;
  const post = pre + facts.offer.freshIssueShares;

  return [...facts.capital.shareholders]
    .sort((a, b) => b.shares - a.shares)
    .map((s) => ({
      name: s.name,
      category: s.category,
      shares: s.shares,
      preIssuePercent: percent(s.shares, pre),
      postIssuePercent: percent(s.shares, post),
    }));
}

/** The ten largest holders, which the document states separately. */
export function topShareholders(facts: FactBase, n = 10): ShareholdingRow[] {
  return shareholding(facts).slice(0, n);
}

export interface LockInTranche {
  promoterName: string;
  shares: number;
  acquisitionDate: string;
  costPerShare: Money;
  /** Years from allotment. */
  lockInYears: 1 | 2 | 3;
  /** Which limb of R-009 put it here. */
  basis: string;
}

export interface LockInResult {
  /** 20% of post-issue capital, the Minimum Promoter's Contribution. */
  requiredMpcShares: number;
  /** What the promoters actually hold, across eligible tranches. */
  eligibleShares: number;
  /** Short of the requirement — a blocker if positive. */
  shortfallShares: number;
  tranches: LockInTranche[];
}

/**
 * The lock-in ladder (R-009).
 *
 *   Minimum Promoter's Contribution — 20% of POST-issue capital — 3 years
 *   Excess over MPC, first half                                  — 1 year
 *   Excess over MPC, second half                                 — 2 years
 *
 * Two details that are easy to get wrong and expensive to get wrong:
 *
 *   The 20% is of POST-issue capital, not pre-issue. Computing it on
 *   pre-issue understates the requirement by exactly the dilution, and the
 *   shortfall only appears when the exchange checks.
 *
 *   Some tranches are INELIGIBLE for MPC — bonus shares issued out of
 *   revaluation reserves, and other classes the regulations exclude. They
 *   still lock in, but they cannot count toward the 20%, so a promoter can
 *   hold 25% and still be short.
 *
 * Oldest tranches are locked first. The regulations do not prescribe an order,
 * and taking the oldest is what the corpus documents show — it also leaves the
 * promoter's most recent, most expensive shares free soonest.
 */
export function lockIn(facts: FactBase): LockInResult {
  const postIssueShares = facts.capital.paidUpShares + facts.offer.freshIssueShares;
  const requiredMpcShares = Math.ceil(postIssueShares * 0.2);

  const eligible = [...facts.capital.promoterHoldings]
    .filter((h) => h.eligibleForMPC)
    .sort((a, b) => a.acquisitionDate.localeCompare(b.acquisitionDate));

  const ineligible = facts.capital.promoterHoldings.filter((h) => !h.eligibleForMPC);
  const eligibleShares = eligible.reduce((n, h) => n + h.shares, 0);

  const tranches: LockInTranche[] = [];
  let remainingMpc = requiredMpcShares;

  /** A tranche may be split between two lock-in periods, so it is consumed. */
  const push = (h: PromoterHolding, shares: number, years: 1 | 2 | 3, basis: string) => {
    if (shares > 0) {
      tranches.push({
        promoterName: h.promoterName,
        shares,
        acquisitionDate: h.acquisitionDate,
        costPerShare: h.costPerShare,
        lockInYears: years,
        basis,
      });
    }
  };

  // First pass: fill the Minimum Promoter's Contribution at three years.
  const excess: { holding: PromoterHolding; shares: number }[] = [];
  for (const h of eligible) {
    const toMpc = Math.min(h.shares, remainingMpc);
    push(h, toMpc, 3, "Minimum Promoter's Contribution — 20% of post-issue capital");
    remainingMpc -= toMpc;
    if (h.shares > toMpc) excess.push({ holding: h, shares: h.shares - toMpc });
  }

  // Everything above MPC, including the ineligible tranches, releases in two
  // halves: the first at one year, the second at two.
  for (const h of ineligible) excess.push({ holding: h, shares: h.shares });

  const excessTotal = excess.reduce((n, e) => n + e.shares, 0);
  const firstHalf = Math.ceil(excessTotal / 2);
  let remainingFirstHalf = firstHalf;

  for (const e of excess) {
    const atOneYear = Math.min(e.shares, remainingFirstHalf);
    push(e.holding, atOneYear, 1, 'Promoter holding in excess of MPC — first 50%');
    remainingFirstHalf -= atOneYear;
    push(e.holding, e.shares - atOneYear, 2, 'Promoter holding in excess of MPC — remaining 50%');
  }

  return {
    requiredMpcShares,
    eligibleShares,
    shortfallShares: Math.max(0, requiredMpcShares - eligibleShares),
    tranches,
  };
}

export interface CapitalSummary {
  authorisedShares: number;
  authorisedCapital: Money;
  preIssueShares: number;
  preIssueCapital: Money;
  freshIssueShares: number;
  postIssueShares: number;
  postIssueCapital: Money;
}

/** The share capital table that opens the Capital Structure section. */
export function capitalSummary(facts: FactBase): CapitalSummary {
  const post = facts.capital.paidUpShares + facts.offer.freshIssueShares;
  return {
    authorisedShares: facts.capital.authorisedShares,
    authorisedCapital: facts.capital.authorisedCapital,
    preIssueShares: facts.capital.paidUpShares,
    preIssueCapital: multiply(facts.capital.faceValue, facts.capital.paidUpShares),
    freshIssueShares: facts.offer.freshIssueShares,
    postIssueShares: post,
    postIssueCapital: multiply(facts.capital.faceValue, post),
  };
}

export interface ConsistencyIssue {
  message: string;
  /** What the reader should look at to fix it. */
  detail: string;
}

/**
 * The two checks that must hold before any of these tables mean anything.
 *
 * They run live as the issuer types, not in week nine of merchant-banker
 * review. CO-001 and CO-002 in the rule registry report the same facts to the
 * gap dashboard; this is the same arithmetic, surfaced inside the form.
 */
export function capitalConsistency(facts: FactBase): ConsistencyIssue[] {
  const issues: ConsistencyIssue[] = [];

  const allotted = facts.capital.allotments.reduce((n, a) => n + a.shares, 0);
  if (facts.capital.allotments.length > 0 && allotted !== facts.capital.paidUpShares) {
    const diff = allotted - facts.capital.paidUpShares;
    issues.push({
      message: 'The allotment history does not tie to paid-up capital.',
      detail:
        `Allotments total ${formatIndian(String(allotted), 0)} shares; paid-up capital is ` +
        `${formatIndian(String(facts.capital.paidUpShares), 0)} shares — a difference of ` +
        `${formatIndian(String(Math.abs(diff)), 0)}. Every allotment since incorporation has to be listed, ` +
        'including bonus issues and conversions.',
    });
  }

  const held = facts.capital.shareholders.reduce((n, s) => n + s.shares, 0);
  if (facts.capital.shareholders.length > 0 && held !== facts.capital.paidUpShares) {
    const pct = percent(held, facts.capital.paidUpShares);
    issues.push({
      message: `The shareholding register covers ${pct}% of paid-up capital, not 100%.`,
      detail:
        `The register lists ${formatIndian(String(held), 0)} shares against paid-up capital of ` +
        `${formatIndian(String(facts.capital.paidUpShares), 0)}. Small residual holders are often the ones ` +
        'missing — the register has to account for every share.',
    });
  }

  return issues;
}

/** Shares as the document prints them: Indian grouping, no decimals. */
export const shares = (n: number): string => formatIndian(String(n), 0);

/** Rupees at a stated face value, for a table cell. */
export const capitalAt = (faceValue: Money, count: number): Money => multiply(faceValue, count);

export { add, money };
export type { Allotment, Shareholder, PromoterHolding };
