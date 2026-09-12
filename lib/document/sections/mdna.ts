import Decimal from 'decimal.js';
import { formatAs } from '../../facts/money';
import type { FactBase } from '../../facts/schema';
import type { RenderContext, SectionSpec } from '../section';

/**
 * MANAGEMENT'S DISCUSSION AND ANALYSIS — section map #26, 10-21pp observed,
 * producer N. Scoped the same way as every narrative section so far: only
 * the opening paragraph stating the revenue and profit trend over the
 * restated years on file, not the full ratio analysis, segment discussion
 * or forward outlook a real MD&A chapter needs.
 *
 * Growth percentages are PRE-COMPUTED here with Decimal, not left for the
 * model to calculate — the same discipline `derivedTerms()` and every risk
 * archetype already follow. A model doing its own arithmetic is exactly the
 * failure mode the traceability gate exists to catch after the fact; better
 * not to ask it to do arithmetic at all.
 */

function percentChange(from: string, to: string): string {
  const base = new Decimal(from);
  if (base.isZero()) return 'not meaningful';
  return new Decimal(to).minus(base).dividedBy(base).times(100).toFixed(2);
}

function mdnaFactSlice(facts: FactBase) {
  const years = facts.financials.years; // most recent first
  const [latest, prior1] = years;
  return {
    companyName: facts.company.name,
    years: years.map((y) => ({
      yearEnding: y.yearEnding,
      revenue: formatAs(y.revenue, 'crores'),
      profitAfterTax: formatAs(y.profitAfterTax, 'crores'),
    })),
    revenueGrowthLatestYoYPercent: prior1 ? percentChange(prior1.revenue, latest.revenue) : undefined,
    profitAfterTaxGrowthLatestYoYPercent: prior1 ? percentChange(prior1.profitAfterTax, latest.profitAfterTax) : undefined,
  };
}

export const mdna: SectionSpec = {
  id: 'financial.mdna',
  partOf: "26. Management's Discussion and Analysis",
  title: "Management's Discussion and Analysis of Financial Condition and Results of Operations",
  producer: 'narrative',
  order: 2760,
  group: 'SECTION - FINANCIAL INFORMATION',
  clause: 'ICDR Schedule VI Part A',
  promptSpec: {
    factSlice: mdnaFactSlice,
    instructions:
      'Draft the opening paragraph of "Management\'s Discussion and Analysis of Financial Condition and ' +
      'Results of Operations" for an Indian SME IPO prospectus. Open by directing the reader to read this ' +
      'discussion together with the sections titled "Risk Factors" and "Our Business" (real prospectuses always ' +
      'open this chapter with such a cross-reference, before any figures). Then state the revenue and profit ' +
      'after tax for each financial year in the factSlice, in reverse chronological order, and describe the ' +
      'year-on-year growth using the pre-computed percentages given — do not calculate a percentage yourself ' +
      'from the absolute figures. Refer to each year as "Fiscal <year>" (e.g. "Fiscal 2026") — the factSlice ' +
      'gives only the year, not a calendar date, and no calendar date (day or month) may appear anywhere in ' +
      'the draft. Close with a sentence noting that the factors affecting these results are discussed in the ' +
      'remainder of this section. Use only the figures given; do not attribute the growth to any cause not ' +
      'stated in the factSlice.',
    wordTarget: 170,
  },
};
