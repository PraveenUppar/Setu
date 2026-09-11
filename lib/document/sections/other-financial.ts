import { otherFinancialInformation } from '../../financials/ratios';
import { fiscal, lakhs } from '../format';
import type { DocumentNode } from '../nodes';
import { derivedTerms, type RenderContext, type SectionSpec } from '../section';
import { gap, h2, para, table } from './helpers';

/**
 * OTHER FINANCIAL INFORMATION — section map #24, 1 page. COMPUTED from M6
 * and the M2 allotment history.
 *
 * The accounting ratios Item 11 of Part A of Schedule VI requires, with
 * the formula for each stated in the notes, as both primary sources do
 * (Om Galaxy p.264, Maxwell p.230). Where the two drafters differ — return
 * on net worth on average versus closing net worth, EBITDA margin on total
 * income versus revenue — the note says which convention this table uses.
 * See lib/financials/ratios.ts for the arithmetic and its ground truth.
 */
export const otherFinancial: SectionSpec = {
  id: 'financial.otherFinancialInformation',
  partOf: '24. Other Financial Information',
  title: 'Other Financial Information',
  producer: 'computed',
  order: 2740,
  group: 'SECTION - FINANCIAL INFORMATION',
  clause: 'ICDR Schedule VI Part A, Item 11',
  extractedFrom: [
    'bookbuilt__manufacturing__om-galaxy__bse-sme__2026-09__rhp.pdf p.264',
    'bookbuilt__engineering__maxwell-engineering__nse-emerge__2026-08__drhp.pdf p.230',
  ],
  compute: ({ facts }: RenderContext): DocumentNode[] => {
    const t = derivedTerms(facts);
    const nodes: DocumentNode[] = [h2('Other Financial Information')];

    if (facts.financials.years.length === 0) {
      nodes.push(gap('financials.years', 'The financial figures for the three years, from which the accounting ratios are computed'));
      return nodes;
    }
    const rows = otherFinancialInformation(facts);
    if (!rows) {
      nodes.push(gap('capital.allotments', 'The allotment history, from which the weighted average number of Equity Shares for earnings per share is computed'));
      return nodes;
    }

    nodes.push(
      para(
        `The accounting ratios derived from the Restated Financial Information of our Company, as required under Item 11 of Part A of Schedule VI of the SEBI ICDR Regulations, are set out below:`,
      ),
      table(
        ['Particulars', ...rows.map((r) => fiscal(r.yearEnding))],
        [
          ['Basic and diluted earnings per Equity Share (Rs) (1)', ...rows.map((r) => r.basicEps)],
          ['Return on Net Worth (%) (2)', ...rows.map((r) => r.returnOnNetWorthPercent)],
          ['Net Asset Value per Equity Share (Rs) (3)', ...rows.map((r) => r.netAssetValuePerShare)],
          ['EBITDA (Rs in Lakhs) (4)', ...rows.map((r) => lakhs(r.ebitda))],
          ['EBITDA Margin (%) (5)', ...rows.map((r) => r.ebitdaMarginPercent)],
          ['Weighted average number of Equity Shares (restated for bonus issues)', ...rows.map((r) => r.weightedShares.toLocaleString('en-IN'))],
          ['Equity Shares outstanding at the year end (restated for bonus issues)', ...rows.map((r) => r.yearEndShares.toLocaleString('en-IN'))],
        ],
        {
          numericColumns: rows.map((_, i) => i + 1),
          footnotes: [
            '(1) Basic earnings per share = Restated profit after tax attributable to equity shareholders / weighted average number of Equity Shares outstanding during the year. The weighted average is the number of Equity Shares outstanding at the beginning of the year adjusted for shares issued during the year multiplied by the time-weighting factor, with bonus shares treated as outstanding from the beginning of the earliest period reported, in accordance with Accounting Standard 20. Our Company has no potential Equity Shares, so basic and diluted earnings per share are the same.',
            '(2) Return on Net Worth (%) = Restated profit after tax attributable to equity shareholders / net worth at the end of the year x 100.',
            '(3) Net Asset Value per Equity Share = Restated net worth at the end of the year / number of Equity Shares outstanding at the end of the year, restated for bonus issues.',
            '(4) EBITDA = Restated profit before tax + finance costs + depreciation and amortisation - other income.',
            '(5) EBITDA Margin (%) = EBITDA / revenue from operations x 100.',
            'Net worth is the aggregate of paid-up equity share capital and all reserves created out of profits and the securities premium account, after deducting accumulated losses and deferred expenditure not written off, in accordance with Regulation 2(1)(hh) of the SEBI ICDR Regulations.',
          ],
        },
      ),
      para(
        `In accordance with the SEBI ICDR Regulations, the audited financial statements of our Company for the financial years ended ${rows.map((r) => `March 31, ${r.yearEnding}`).join(', ')} are available on our website at ${facts.company.website || '[company website]'}. The audited financial statements do not constitute part of this ${t.documentName}, and should not be considered as part of the information that any investor should consider when subscribing for the Equity Shares.`,
      ),
    );
    if (!facts.company.website) nodes.push(gap('company.website', 'The company website, where the audited financial statements are made available'));
    return nodes;
  },
};
