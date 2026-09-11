import Decimal from 'decimal.js';
import { operatingProfit } from '../rules/eligibility';
import type { Allotment, FactBase, FinancialYear } from '../facts/schema';
import type { Money } from '../facts/money';

/**
 * The accounting ratios of "Other Financial Information" (section map #24),
 * as required by Item 11 of Part A of Schedule VI: EPS, return on net worth,
 * net asset value per share, EBITDA and its margin, for each of the three
 * years. Every one is derived from figures already in M6 and the allotment
 * history in M2; nothing is asked twice.
 *
 * WEIGHTED AVERAGE SHARES, the EPS denominator, is where the arithmetic is.
 * AS-20: shares issued for cash count from their allotment date, weighted by
 * the fraction of the year they were outstanding; bonus shares are treated
 * as outstanding from the beginning of the earliest period reported. The
 * method here reproduces Maxwell's published counts exactly — 1,00,50,275 /
 * 1,00,07,133 / 1,00,06,775 for Fiscals 2026 to 2024, with a rights issue on
 * March 29 counting three days of 365 and two bonus issues added in full to
 * every earlier year (Maxwell DRHP p.230; the test holds it).
 *
 * Two conventions vary by drafter and are stated beside the table rather
 * than hidden in it: return on net worth is on CLOSING net worth here
 * (Maxwell), where Om Galaxy averages opening and closing; EBITDA margin is
 * on revenue from operations (Maxwell), where Om Galaxy uses total income.
 * The note under the table says which, so a banker who prefers the other can
 * see what to change.
 */

const DAY = 24 * 60 * 60 * 1000;

/** Days from `from` to `to` inclusive, in UTC. */
function daysInclusive(from: string, to: string): number {
  return Math.round((Date.parse(`${to}T00:00:00Z`) - Date.parse(`${from}T00:00:00Z`)) / DAY) + 1;
}

/** The financial year ending March 31 of `yearEnding`: its first and last day. */
export function fiscalBounds(yearEnding: number): { start: string; end: string } {
  return { start: `${yearEnding - 1}-04-01`, end: `${yearEnding}-03-31` };
}

/**
 * Weighted average equity shares for one financial year, restated for every
 * bonus issue up to the date the document is drawn.
 *
 *   before the year        counts in full
 *   within the year        counts for the days from allotment to year end
 *   after the year         counts nothing — except a BONUS issue, which is
 *                          added in full to every earlier year (restated)
 */
export function weightedAverageShares(allotments: Allotment[], yearEnding: number): number {
  const { start, end } = fiscalBounds(yearEnding);
  const yearDays = daysInclusive(start, end);
  let weighted = new Decimal(0);

  for (const a of allotments) {
    const isBonus = a.nature === 'BONUS_ISSUE' || a.consideration === 'BONUS';
    if (isBonus) {
      // Restated: outstanding from the beginning of every period, whether the
      // bonus fell before, within or after this year
      weighted = weighted.plus(a.shares);
    } else if (a.date < start) {
      weighted = weighted.plus(a.shares);
    } else if (a.date <= end) {
      weighted = weighted.plus(new Decimal(a.shares).times(daysInclusive(a.date, end)).dividedBy(yearDays));
    }
  }
  return Number(weighted.toFixed(0, Decimal.ROUND_HALF_UP));
}

/** Shares at the year end, restated for later bonus issues — the NAV denominator. */
export function restatedYearEndShares(allotments: Allotment[], yearEnding: number): number {
  const { end } = fiscalBounds(yearEnding);
  return allotments.reduce((n, a) => {
    const isBonus = a.nature === 'BONUS_ISSUE' || a.consideration === 'BONUS';
    return n + (isBonus || a.date <= end ? a.shares : 0);
  }, 0);
}

export interface YearRatios {
  yearEnding: number;
  weightedShares: number;
  yearEndShares: number;
  /** Rupees, to two places. */
  basicEps: string;
  returnOnNetWorthPercent: string;
  netAssetValuePerShare: string;
  ebitda: Money;
  ebitdaMarginPercent: string;
}

function ratiosFor(y: FinancialYear, allotments: Allotment[]): YearRatios {
  const weighted = weightedAverageShares(allotments, y.yearEnding);
  const yearEnd = restatedYearEndShares(allotments, y.yearEnding);
  const pat = new Decimal(y.profitAfterTax);
  const netWorth = new Decimal(y.netWorth);
  const ebitda = operatingProfit(y);
  const revenue = new Decimal(y.revenue);

  const per = (numerator: Decimal, shares: number) => (shares === 0 ? '-' : numerator.dividedBy(shares).toFixed(2));
  const pct = (numerator: Decimal, denominator: Decimal) => (denominator.isZero() ? '-' : numerator.dividedBy(denominator).times(100).toFixed(2));

  return {
    yearEnding: y.yearEnding,
    weightedShares: weighted,
    yearEndShares: yearEnd,
    basicEps: per(pat, weighted),
    returnOnNetWorthPercent: pct(pat, netWorth),
    netAssetValuePerShare: per(netWorth, yearEnd),
    ebitda,
    ebitdaMarginPercent: pct(new Decimal(ebitda), revenue),
  };
}

/** The three years, most recent first, or null where there are no allotments to weight. */
export function otherFinancialInformation(facts: FactBase): YearRatios[] | null {
  if (facts.capital.allotments.length === 0) return null;
  return facts.financials.years.slice(0, 3).map((y) => ratiosFor(y, facts.capital.allotments));
}
