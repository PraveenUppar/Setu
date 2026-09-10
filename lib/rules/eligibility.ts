import Decimal from 'decimal.js';
import { add, formatAs, gte, money, multiply, subtract, type Money } from '../facts/money';
import type { FactBase, FinancialYear } from '../facts/schema';
import type { Rule } from './types';

/**
 * ELIGIBILITY RULES — can this issuer list on the SME platform at all?
 *
 * Every threshold here traces to a row in 05-rule-sources.md. Rules resting on
 * PROPOSAL-ONLY entries are NOT written: R-007 (minimum issue size) and R-012
 * (post-listing migration compliance) are still unverified against the
 * notified text, so no rule cites them. That is deliberate — a rule built on a
 * proposal is a rule that ships a number SEBI may never have enacted.
 */

const CRORE = (n: string | number) => money(n, 'crores');

/** Operating profit = PBT + finance costs + depreciation - other income (R-002). */
export function operatingProfit(y: FinancialYear): Money {
  return subtract(add(y.profitBeforeTax, y.financeCosts, y.depreciationAndAmortisation), y.otherIncome);
}

/** Free cash flow to equity, the NSE Emerge test (N-04). */
export function freeCashFlowToEquity(y: FinancialYear): Money {
  return subtract(
    add(
      subtract(y.cashFlowFromOperations, y.netPurchaseOfFixedAssets),
      y.proceedsFromIssuanceOfCapital,
      y.netBorrowings,
    ),
    y.interestPaidNetOfTax,
  );
}

const postIssueCapital = (f: FactBase) =>
  multiply(f.capital.faceValue, f.capital.paidUpShares + f.offer.freshIssueShares);

const grossProceeds = (f: FactBase) =>
  f.offer.capPrice ? multiply(f.offer.capPrice, f.offer.freshIssueShares) : null;

/** "2 of the 3 preceding financial years" — the three most recent on file. */
const recentThree = (f: FactBase) => f.financials.years.slice(0, 3);

export const eligibilityRules: Rule[] = [
  /* ---------------------------------------------------------------- */
  /* Corporate status                                                  */
  /* ---------------------------------------------------------------- */
  {
    id: 'EL-001',
    preCheck: true,
    clause: 'Companies Act 2013, s.23; ICDR Chapter IX',
    title: 'The issuer must be a public limited company',
    severity: 'blocker',
    category: 'eligibility',
    check: (f) =>
      f.company.isPublicLimited
        ? null
        : {
            detail:
              'Your company is still a private limited company. Only a public limited company may make a public issue. Conversion typically takes 45 to 60 days, so start it early — it gates everything else.',
            blocks: ['The entire filing'],
            fix: { module: 'M1', factPath: 'company.isPublicLimited', action: 'Convert to public limited' },
          },
  },

  /* ---------------------------------------------------------------- */
  /* Capital                                                           */
  /* ---------------------------------------------------------------- */
  {
    id: 'EL-002',
    preCheck: true,
    clause: 'R-001 (ICDR Reg 229(1), 229(2))',
    title: 'Post-issue paid-up capital must not exceed Rs 25 crore',
    severity: 'blocker',
    category: 'eligibility',
    check: (f) => {
      const post = postIssueCapital(f);
      if (gte(CRORE(25), post)) return null;
      return {
        detail:
          `Post-issue paid-up capital works out at ${formatAs(post, 'crores')}, above the Rs 25 crore ceiling for the SME platform.\n` +
          `  Pre-issue:  ${f.capital.paidUpShares.toLocaleString('en-IN')} shares\n` +
          `  Fresh issue: ${f.offer.freshIssueShares.toLocaleString('en-IN')} shares\n` +
          `  Face value:  Rs ${f.capital.faceValue}\n` +
          'Reduce the fresh issue, or list on the main board instead.',
        blocks: ['Eligibility for the Issue', 'Issue Structure'],
        fix: { module: 'M9', factPath: 'offer.freshIssueShares' },
      };
    },
  },
  {
    id: 'EL-003',
    preCheck: true,
    clause: 'R-023 (Rule 19(2)(b) SCRR with ICDR Reg 252)',
    title: 'The issue must be at least 25% of post-issue paid-up capital',
    severity: 'blocker',
    category: 'eligibility',
    check: (f) => {
      const postShares = f.capital.paidUpShares + f.offer.freshIssueShares;
      const offered =
        f.offer.freshIssueShares +
        f.offer.sellingShareholders.reduce((s, x) => s + x.sharesOffered, 0);
      const pct = new Decimal(offered).dividedBy(postShares).times(100);
      if (pct.greaterThanOrEqualTo(25)) return null;
      return {
        detail:
          `The issue is ${pct.toFixed(2)}% of post-issue capital, below the 25% floor.\n` +
          `  Offered:    ${offered.toLocaleString('en-IN')} shares\n` +
          `  Post-issue: ${postShares.toLocaleString('en-IN')} shares\n` +
          `Increase the issue to at least ${Math.ceil(postShares * 0.25).toLocaleString('en-IN')} shares.`,
        blocks: ['Issue Structure', 'Issue Procedure'],
        fix: { module: 'M9', factPath: 'offer.freshIssueShares' },
      };
    },
  },

  /* ---------------------------------------------------------------- */
  /* Financial track record                                            */
  /* ---------------------------------------------------------------- */
  {
    id: 'EL-004',
    preCheck: true,
    clause: 'R-002 (ICDR Chapter IX; corroborated on both exchanges)',
    title: 'Operating profit of at least Rs 1 crore in 2 of the 3 preceding years',
    severity: 'blocker',
    category: 'eligibility',
    appliesTo: (f) => f.financials.years.length > 0,
    check: (f) => {
      const years = recentThree(f);
      const profits = years.map((y) => ({ year: y.yearEnding, op: operatingProfit(y) }));
      const qualifying = profits.filter((p) => gte(p.op, CRORE(1)));
      if (qualifying.length >= 2) return null;
      return {
        detail:
          `Only ${qualifying.length} of the last ${years.length} years reach Rs 1 crore of operating profit; two are required.\n` +
          profits
            .map(
              (p) =>
                `  FY${p.year}: ${formatAs(p.op, 'crores').padStart(18)}  ${gte(p.op, CRORE(1)) ? 'qualifies' : 'below threshold'}`,
            )
            .join('\n') +
          '\nOperating profit is profit before tax plus finance costs plus depreciation, less other income.',
        blocks: ['Eligibility for the Issue'],
        fix: { module: 'M6', factPath: 'financials.years' },
      };
    },
  },
  {
    id: 'EL-005',
    preCheck: true,
    clause: 'E-02 / N-02 (exchange track record criteria)',
    title: 'The company must have a track record of at least three years',
    severity: 'blocker',
    category: 'eligibility',
    check: (f) => {
      const incorporated = new Date(f.company.dateOfIncorporation);
      const years = (Date.now() - incorporated.getTime()) / (365.25 * 24 * 3600 * 1000);
      if (years >= 3) return null;
      return {
        detail:
          `The company was incorporated on ${f.company.dateOfIncorporation}, which is ${years.toFixed(1)} years ago. Both exchanges require a track record of at least three years.`,
        blocks: ['Eligibility for the Issue'],
        fix: { module: 'M1', factPath: 'company.dateOfIncorporation', action: 'No fix — the issue must wait' },
      };
    },
  },
  {
    id: 'EL-006',
    preCheck: true,
    clause: 'E-01 (BSE SME net worth criterion)',
    title: 'Net worth of at least Rs 1 crore in 2 of the 3 preceding years',
    severity: 'blocker',
    category: 'eligibility',
    // BSE states this explicitly; NSE discloses net worth without a stated floor.
    appliesTo: (f) => f.offer.exchange === 'BSE_SME' && f.financials.years.length > 0,
    check: (f) => {
      const years = recentThree(f);
      const qualifying = years.filter((y) => gte(y.netWorth, CRORE(1)));
      if (qualifying.length >= 2) return null;
      return {
        detail:
          `Only ${qualifying.length} of the last ${years.length} years reach Rs 1 crore of net worth; BSE SME requires two.\n` +
          years.map((y) => `  FY${y.yearEnding}: ${formatAs(y.netWorth, 'crores')}`).join('\n'),
        blocks: ['Eligibility for the Issue'],
        fix: { module: 'M6', factPath: 'financials.years' },
      };
    },
  },
  {
    id: 'EL-007',
    preCheck: true,
    clause: 'E-04 (BSE SME leverage criterion)',
    title: 'Debt to equity must not exceed 3:1',
    severity: 'blocker',
    category: 'eligibility',
    appliesTo: (f) => f.offer.exchange === 'BSE_SME' && f.financials.years.length > 0,
    check: (f) => {
      const y = f.financials.years[0];
      const equity = new Decimal(y.shareholdersEquity);
      if (equity.isZero()) {
        return {
          detail: 'Shareholders equity is nil for the most recent year, so the leverage ratio cannot be computed.',
          fix: { module: 'M6', factPath: 'financials.years' },
        };
      }
      const ratio = new Decimal(y.totalBorrowings).dividedBy(equity);
      if (ratio.lessThanOrEqualTo(3)) return null;
      return {
        detail:
          `Debt to equity is ${ratio.toFixed(2)}:1 for FY${y.yearEnding}, above the 3:1 ceiling BSE SME applies.\n` +
          `  Total borrowings:    ${formatAs(y.totalBorrowings, 'crores')}\n` +
          `  Shareholders equity: ${formatAs(y.shareholdersEquity, 'crores')}`,
        blocks: ['Eligibility for the Issue'],
        fix: { module: 'M6', factPath: 'financials.years' },
      };
    },
  },
  {
    id: 'EL-008',
    preCheck: true,
    clause: 'N-04 (NSE Emerge free cash flow criterion)',
    title: 'Positive free cash flow to equity in 2 of the 3 preceding years',
    severity: 'blocker',
    category: 'eligibility',
    // NSE Emerge only. BSE SME does not impose this.
    appliesTo: (f) => f.offer.exchange === 'NSE_EMERGE' && f.financials.years.length > 0,
    check: (f) => {
      const years = recentThree(f);
      const flows = years.map((y) => ({ year: y.yearEnding, fcfe: freeCashFlowToEquity(y) }));
      const positive = flows.filter((x) => new Decimal(x.fcfe).greaterThan(0));
      if (positive.length >= 2) return null;
      return {
        detail:
          `Only ${positive.length} of the last ${years.length} years show positive free cash flow to equity; NSE Emerge requires two.\n` +
          flows.map((x) => `  FY${x.year}: ${formatAs(x.fcfe, 'crores')}`).join('\n'),
        blocks: ['Eligibility for the Issue'],
        fix: { module: 'M6', factPath: 'financials.years' },
      };
    },
  },

  /* ---------------------------------------------------------------- */
  /* Reg 228 - general ineligibility                                   */
  /* ---------------------------------------------------------------- */
  {
    id: 'EL-009',
    preCheck: true,
    clause: 'R-020 (ICDR Reg 228(a))',
    title: 'No promoter or director may be debarred from the capital markets',
    severity: 'blocker',
    category: 'eligibility',
    check: (f) =>
      f.promoters.anyDebarredBySebi
        ? {
            detail:
              'A promoter, promoter group member or director is debarred from accessing the capital markets by SEBI. Regulation 228(a) makes the issuer ineligible while that stands.',
            blocks: ['The entire filing'],
            fix: { module: 'M3', factPath: 'promoters.anyDebarredBySebi' },
          }
        : null,
  },
  {
    id: 'EL-010',
    preCheck: true,
    clause: 'R-020 (ICDR Reg 228(c))',
    title: 'No promoter or director may be a wilful defaulter or fraudulent borrower',
    severity: 'blocker',
    category: 'eligibility',
    check: (f) =>
      f.promoters.anyWilfulDefaulterOrFraudulentBorrower
        ? {
            detail:
              'The issuer, a promoter or a director is classified as a wilful defaulter or fraudulent borrower. Regulation 228(c) makes the issuer ineligible.',
            blocks: ['The entire filing'],
            fix: { module: 'M3', factPath: 'promoters.anyWilfulDefaulterOrFraudulentBorrower' },
          }
        : null,
  },
  {
    id: 'EL-011',
    preCheck: true,
    clause: 'R-020 (ICDR Reg 228(d))',
    title: 'No promoter or director may be a fugitive economic offender',
    severity: 'blocker',
    category: 'eligibility',
    check: (f) =>
      f.promoters.anyFugitiveEconomicOffender
        ? {
            detail:
              'A promoter or director is declared a fugitive economic offender under Section 12 of the Fugitive Economic Offenders Act, 2018. Regulation 228(d) makes the issuer ineligible.',
            blocks: ['The entire filing'],
            fix: { module: 'M3', factPath: 'promoters.anyFugitiveEconomicOffender' },
          }
        : null,
  },
  {
    id: 'EL-012',
    preCheck: true,
    clause: 'R-020 (ICDR Reg 228(e))',
    title: 'No outstanding convertible securities may remain',
    severity: 'blocker',
    category: 'eligibility',
    check: (f) =>
      f.capital.hasOutstandingConvertibles
        ? {
            detail:
              'There are outstanding convertible securities, or other rights entitling a person to receive equity shares. Regulation 228(e) makes the issuer ineligible until they are converted or extinguished.\n' +
              'This has a long lead time — resolving it can take months, so deal with it before anything else in the timetable.',
            blocks: ['The entire filing', 'Capital Structure'],
            fix: { module: 'M2', factPath: 'capital.hasOutstandingConvertibles' },
          }
        : null,
  },

  /* ---------------------------------------------------------------- */
  /* Reg 230(1) - general conditions                                   */
  /* ---------------------------------------------------------------- */
  {
    id: 'EL-013',
    preCheck: true,
    clause: 'R-021 (ICDR Reg 230(1)(c))',
    title: 'All existing equity share capital must be fully paid up',
    severity: 'blocker',
    category: 'eligibility',
    check: (f) =>
      f.capital.hasPartlyPaidShares
        ? {
            detail:
              'Partly paid-up equity shares are outstanding. Regulation 230(1)(c) requires all present equity share capital to be fully paid up before the issue.',
            blocks: ['Capital Structure', 'Eligibility for the Issue'],
            fix: { module: 'M2', factPath: 'capital.hasPartlyPaidShares' },
          }
        : null,
  },
  {
    id: 'EL-014',
    clause: 'R-021 (ICDR Reg 230(1)(d))',
    title: 'Promoter and promoter group holdings must be in dematerialised form',
    severity: 'blocker',
    category: 'eligibility',
    check: (f) => {
      const physical = f.capital.shareholders.filter(
        (s) => !s.isDematerialised && (s.category === 'PROMOTER' || s.category === 'PROMOTER_GROUP'),
      );
      if (physical.length === 0) return null;
      return {
        detail:
          `${physical.length} promoter or promoter group holding${physical.length > 1 ? 's are' : ' is'} still in physical form: ${physical.map((s) => s.name).join(', ')}.\n` +
          'Regulation 230(1)(d) requires them to be dematerialised before the issue.',
        blocks: ['Capital Structure'],
        fix: { module: 'M2', factPath: 'capital.shareholders' },
      };
    },
  },
  {
    id: 'EL-015',
    clause: 'R-011 (ICDR Reg 230(1)(h))',
    title: 'Issue proceeds may not repay promoter or related party loans',
    severity: 'blocker',
    category: 'eligibility',
    check: (f) => {
      const offending = f.offer.objects.filter((o) => o.involvesPromoterLoanRepayment);
      if (offending.length === 0) return null;
      return {
        detail:
          `${offending.length} object${offending.length > 1 ? 's' : ''} of the issue would repay loans from a promoter, promoter group member or related party:\n` +
          offending.map((o) => `  ${o.description} — ${formatAs(o.amount, 'crores')}`).join('\n') +
          '\nRegulation 230(1)(h) prohibits this, directly or indirectly.',
        blocks: ['Objects of the Issue'],
        fix: { module: 'M9', factPath: 'offer.objects' },
      };
    },
  },
  {
    id: 'EL-016',
    clause: 'R-022 (ICDR Reg 230(1)(e); Schedule VI Part A para 9(C)(1))',
    title: 'Firm arrangements for 75% of the stated means of finance',
    severity: 'major',
    category: 'eligibility',
    // Only bites where an object is a project. An issuer funding entirely from
    // net proceeds and internal accruals is exempt, and says so.
    appliesTo: (f) => f.offer.objects.some((o) => o.isProject),
    check: (f) => {
      if (f.offer.firmFinanceConfirmed) return null;
      const projects = f.offer.objects.filter((o) => o.isProject);
      return {
        detail:
          `${projects.length} object${projects.length > 1 ? 's are' : ' is'} a project, so Regulation 230(1)(e) requires firm arrangements of finance through verifiable means for 75% of the stated means of finance, excluding the issue proceeds and existing internal accruals:\n` +
          projects.map((o) => `  ${o.description} — ${formatAs(o.amount, 'crores')}`).join('\n') +
          '\nConfirm the arrangements are in place, or record the exemption where the object is funded entirely from net proceeds and internal accruals.',
        blocks: ['Objects of the Issue'],
        fix: { module: 'M9', factPath: 'offer.firmFinanceConfirmed' },
      };
    },
  },

  /* ---------------------------------------------------------------- */
  /* Issue structure                                                   */
  /* ---------------------------------------------------------------- */
  {
    id: 'EL-017',
    clause: 'R-010 (GCP cap)',
    title: 'General corporate purposes capped at 15% of gross proceeds or Rs 10 crore',
    severity: 'blocker',
    category: 'eligibility',
    appliesTo: (f) => f.offer.objects.some((o) => o.isGeneralCorporatePurposes),
    check: (f) => {
      const gross = grossProceeds(f);
      if (!gross) return null;
      const gcp = add(
        ...f.offer.objects.filter((o) => o.isGeneralCorporatePurposes).map((o) => o.amount),
      );
      const fifteenPct = new Decimal(gross).times(15).dividedBy(100);
      const ceiling = Decimal.min(fifteenPct, new Decimal(CRORE(10)));
      if (new Decimal(gcp).lessThanOrEqualTo(ceiling)) return null;
      return {
        detail:
          `General corporate purposes is ${formatAs(gcp, 'crores')}, above the cap of ${formatAs(ceiling.toFixed(), 'crores')}.\n` +
          `  15% of gross proceeds: ${formatAs(fifteenPct.toFixed(), 'crores')}\n` +
          '  Absolute ceiling:      Rs 10.00 Crores\n' +
          'The lower of the two applies. Note that issue expenses are NOT counted as general corporate purposes.',
        blocks: ['Objects of the Issue'],
        fix: { module: 'M9', factPath: 'offer.objects' },
      };
    },
  },
  {
    id: 'EL-018',
    clause: 'R-008 (ICDR Reg 230(1)(f))',
    title: 'Offer for sale may not exceed 20% of the total issue size',
    severity: 'blocker',
    category: 'eligibility',
    appliesTo: (f) => f.offer.sellingShareholders.length > 0,
    check: (f) => {
      const ofsShares = f.offer.sellingShareholders.reduce((s, x) => s + x.sharesOffered, 0);
      const total = f.offer.freshIssueShares + ofsShares;
      const pct = new Decimal(ofsShares).dividedBy(total).times(100);
      if (pct.lessThanOrEqualTo(20)) return null;
      return {
        detail:
          `The offer for sale is ${pct.toFixed(2)}% of the total issue, above the 20% cap.\n` +
          `  OFS shares:   ${ofsShares.toLocaleString('en-IN')}\n` +
          `  Total issue:  ${total.toLocaleString('en-IN')}\n` +
          `Reduce the offer for sale to at most ${Math.floor(total * 0.2).toLocaleString('en-IN')} shares.`,
        blocks: ['Issue Structure', 'The Issue'],
        fix: { module: 'M9', factPath: 'offer.sellingShareholders' },
      };
    },
  },
  {
    id: 'EL-019',
    clause: 'R-008 (ICDR Reg 230(1)(g))',
    title: 'A selling shareholder may offer at most 50% of their pre-issue holding',
    severity: 'blocker',
    category: 'eligibility',
    appliesTo: (f) => f.offer.sellingShareholders.length > 0,
    check: (f) => {
      const breaches = f.offer.sellingShareholders
        .map((s) => ({
          name: s.name,
          pct: new Decimal(s.sharesOffered).dividedBy(s.preIssueShares).times(100),
          offered: s.sharesOffered,
          held: s.preIssueShares,
        }))
        .filter((s) => s.pct.greaterThan(50));
      if (breaches.length === 0) return null;
      return {
        detail:
          `${breaches.length} selling shareholder${breaches.length > 1 ? 's exceed' : ' exceeds'} the 50% cap on their own pre-issue holding, on a fully diluted basis:\n` +
          breaches
            .map(
              (s) =>
                `  ${s.name}: offering ${s.offered.toLocaleString('en-IN')} of ${s.held.toLocaleString('en-IN')} shares (${s.pct.toFixed(2)}%)`,
            )
            .join('\n'),
        blocks: ['Issue Structure', 'Capital Structure'],
        fix: { module: 'M9', factPath: 'offer.sellingShareholders' },
      };
    },
  },
  {
    id: 'EL-020',
    clause: 'R-003 (ICDR Reg 260)',
    title: 'The BRLM must underwrite at least 15% of the issue on its own account',
    severity: 'major',
    category: 'eligibility',
    check: (f) =>
      f.offer.brlmUnderwritingPercent >= 15
        ? null
        : {
            detail:
              `The Book Running Lead Manager is underwriting ${f.offer.brlmUnderwritingPercent}% of the issue. Regulation 260 requires the issue to be 100% underwritten with the BRLM taking at least 15% on its own account.`,
            blocks: ['Other Regulatory and Statutory Disclosures'],
            fix: { module: 'M9', factPath: 'offer.brlmUnderwritingPercent' },
          },
  },
  {
    id: 'EL-021',
    clause: 'R-004 (ICDR Reg 261(1))',
    title: 'Market making must be arranged for at least three years',
    severity: 'major',
    category: 'eligibility',
    check: (f) => {
      if (!f.offer.marketMakerName) {
        return {
          detail:
            'No market maker is named. Regulation 261(1) requires compulsory market making for a minimum of three years from the date of listing, arranged before filing.',
          blocks: ['Issue Structure', 'General Information'],
          fix: { module: 'M9', factPath: 'offer.marketMakerName' },
        };
      }
      if (f.offer.marketMakingYears >= 3) return null;
      return {
        detail:
          `Market making is arranged for ${f.offer.marketMakingYears} year${f.offer.marketMakingYears === 1 ? '' : 's'}. Regulation 261(1) requires a minimum of three years from the date of listing.`,
        blocks: ['Issue Structure'],
        fix: { module: 'M9', factPath: 'offer.marketMakingYears' },
      };
    },
  },
];
