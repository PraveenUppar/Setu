import { describe, expect, it } from 'vitest';
import { money } from '../facts/money';
import type { Allotment } from '../facts/schema';
import { vardhman } from '../seed/vardhman';
import { otherFinancialInformation, restatedYearEndShares, weightedAverageShares } from './ratios';

/**
 * Ground truth: Maxwell Engineering DRHP, "Other Financial Information"
 * p.230, which prints its weighted share counts alongside the EPS. Its
 * capital history (p.183) is four allotments: 10,000 on incorporation, a
 * 270:1 bonus on February 23, 2025, a rights issue of 43,500 on March 29,
 * 2025, and a 53:20 bonus on April 26, 2025.
 *
 * Published weighted average, "post bonus with retrospective effect":
 *   Fiscal 2026  1,00,50,275
 *   Fiscal 2025  1,00,07,133
 *   Fiscal 2024  1,00,06,775
 */
const maxwell: Allotment[] = [
  { date: '2015-06-01', shares: 10000, faceValue: money('10'), issuePrice: money('10'), consideration: 'CASH', nature: 'SUBSCRIPTION_TO_MOA' },
  { date: '2025-02-23', shares: 2700000, faceValue: money('10'), issuePrice: null, consideration: 'BONUS', nature: 'BONUS_ISSUE' },
  { date: '2025-03-29', shares: 43500, faceValue: money('10'), issuePrice: money('115'), consideration: 'CASH', nature: 'RIGHTS_ISSUE' },
  { date: '2025-04-26', shares: 7296775, faceValue: money('10'), issuePrice: null, consideration: 'BONUS', nature: 'BONUS_ISSUE' },
];

describe('weighted average shares (AS-20, bonus restated)', () => {
  it("reproduces Maxwell's published counts for all three years", () => {
    expect(weightedAverageShares(maxwell, 2026)).toBe(10050275);
    expect(weightedAverageShares(maxwell, 2025)).toBe(10007133);
    expect(weightedAverageShares(maxwell, 2024)).toBe(10006775);
  });

  it('weights a cash allotment by the days it was outstanding, inclusive', () => {
    // March 29 to March 31 is three days of 365: 43,500 x 3 / 365 = 357.5
    const rightsOnly: Allotment[] = [maxwell[2]];
    expect(weightedAverageShares(rightsOnly, 2025)).toBe(358);
    // The year before it was issued, it counts nothing
    expect(weightedAverageShares(rightsOnly, 2024)).toBe(0);
  });

  it('treats the year-end count the same way for the NAV denominator', () => {
    expect(restatedYearEndShares(maxwell, 2026)).toBe(10050275);
    expect(restatedYearEndShares(maxwell, 2025)).toBe(10050275);
    // Fiscal 2024: 10,000 plus both later bonuses in full
    expect(restatedYearEndShares(maxwell, 2024)).toBe(10006775);
  });

  it('handles a leap year by its own length', () => {
    // Fiscal 2024 (April 2023 - March 2024) has 366 days
    const one: Allotment[] = [{ ...maxwell[2], date: '2024-03-31' }];
    expect(weightedAverageShares(one, 2024)).toBe(Math.round(43500 / 366));
  });
});

describe('the ratios for the demo issuer', () => {
  it('computes EPS, RoNW, NAV, EBITDA and margin from figures already held', () => {
    const rows = otherFinancialInformation(vardhman)!;
    expect(rows.map((r) => r.yearEnding)).toEqual([2026, 2025, 2024]);
    // 12,00,000 pre-bonus shares plus the 1,08,00,000 bonus, restated to every year
    expect(rows.map((r) => r.weightedShares)).toEqual([12000000, 12000000, 12000000]);
    // PAT 3.60 / 2.55 / 1.10 crore over 1.20 crore shares
    expect(rows.map((r) => r.basicEps)).toEqual(['3.00', '2.13', '0.92']);
    // PAT over closing net worth 19.40 / 14.20 / 9.80
    expect(rows.map((r) => r.returnOnNetWorthPercent)).toEqual(['18.56', '17.96', '11.22']);
    // Net worth over restated year-end shares
    expect(rows.map((r) => r.netAssetValuePerShare)).toEqual(['16.17', '11.83', '8.17']);
    // EBITDA is the R-002 operating profit; margin on revenue from operations
    expect(rows.map((r) => r.ebitda)).toEqual([money('6.40', 'crores'), money('4.76', 'crores'), money('2.62', 'crores')]);
    expect(rows.map((r) => r.ebitdaMarginPercent)).toEqual(['13.28', '12.05', '9.32']);
  });

  it('is null with no allotment history to weight, rather than dividing by nothing', () => {
    expect(otherFinancialInformation({ ...vardhman, capital: { ...vardhman.capital, allotments: [] } })).toBeNull();
  });
});
