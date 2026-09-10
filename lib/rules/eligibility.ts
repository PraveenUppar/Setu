import Decimal from 'decimal.js';
import { add, formatAs, gte, money, multiply, percentOf, subtract, type Money } from '../facts/money';
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

/**
 * The date the criteria are tested against: the intended filing date where the
 * issuer has one, otherwise today.
 *
 * The exchange look-back windows ("6 complete months", "the last 1 year") run
 * from the application, not from whenever the dashboard happens to be opened.
 * An issuer planning to file in four months needs to know whether the window
 * will still be open THEN.
 */
const asOfIso = (f: FactBase) =>
  f.offer.intendedFilingDate ?? new Date().toISOString().slice(0, 10);

const asOf = (f: FactBase) => new Date(asOfIso(f));

/**
 * Whole months between an ISO date and the assessment date.
 *
 * UTC getters throughout, deliberately. An ISO date string parses to UTC
 * midnight, and reading it back with local getters shifts the day in any
 * timezone west of Greenwich — which would move a regulatory window by a day
 * depending on where the machine happens to be.
 */
function monthsSince(iso: string, from: Date): number {
  const then = new Date(iso);
  return (
    (from.getUTCFullYear() - then.getUTCFullYear()) * 12 +
    (from.getUTCMonth() - then.getUTCMonth()) -
    (from.getUTCDate() < then.getUTCDate() ? 1 : 0)
  );
}

const inWindow = (iso: string | null, months: number, from: Date) =>
  iso !== null && monthsSince(iso, from) < months;

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

/** "September 10, 2026" — the form offer documents use. */
function longDate(iso: string): string {
  const [y, m, d] = iso.split('-').map(Number);
  if (!y || !m || !d) return iso;
  return `${MONTHS[m - 1]} ${d}, ${y}`;
}

/**
 * A number of months on from an ISO date, as an ISO string — when a window
 * clears. Arithmetic on the parts rather than through a Date, for the same
 * timezone reason as `monthsSince`.
 */
function monthsOn(iso: string, months: number): string {
  const [y, m, d] = iso.split('-').map(Number);
  const total = (y * 12 + (m - 1)) + months;
  const year = Math.floor(total / 12);
  const month = (total % 12) + 1;
  // Clamp for the short months: 31 August plus six months is 28 February.
  const lastDay = new Date(Date.UTC(year, month, 0)).getUTCDate();
  const day = Math.min(d, lastDay);
  return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

/**
 * When the first FULL financial year of existence ends, for a company that
 * came into being on `iso` (R-026, Reg 229(4)).
 *
 * "One full financial year" means a completed 1 April to 31 March, NOT twelve
 * months from conversion — the difference is up to a year of waiting, in
 * either direction. A company converted in February 2026 existed for seven
 * weeks of FY 2025-26, so its first full year is FY 2026-27, ending
 * 31 March 2027. Converting one day into a financial year is the lucky case
 * and is handled explicitly rather than by rounding.
 */
export function firstFullFinancialYearEnd(iso: string): string {
  const [year, month, day] = iso.split('-').map(Number);
  const startsThisYear = month === 4 && day === 1;
  const firstFullYearStarts = startsThisYear ? year : month >= 4 ? year + 1 : year;
  return `${firstFullYearStarts + 1}-03-31`;
}

/**
 * Net tangible assets: total assets less total liabilities, intangibles and
 * deferred IPO expenses (E-05). The deferral is excluded on the same reasoning
 * as in net worth — it is a cost of this issue, not an asset of the business.
 */
export function netTangibleAssets(y: FinancialYear): Money {
  return subtract(subtract(subtract(y.totalAssets, y.totalLiabilities), y.intangibleAssets), y.deferredIpoExpenses);
}

const grossProceeds = (f: FactBase) =>
  f.offer.capPrice ? multiply(f.offer.capPrice, f.offer.freshIssueShares) : null;

/** "2 of the 3 preceding financial years" — the three most recent on file. */
const recentThree = (f: FactBase) => f.financials.years.slice(0, 3);

/** Reads in a sentence: "on conversion from an LLP", not "from a llp". */
const FIRM_NAME: Record<string, string> = {
  PROPRIETORSHIP: 'a proprietorship',
  PARTNERSHIP: 'a partnership firm',
  LLP: 'an LLP',
};

/**
 * Name changes inside E-09's one-year window, excluding the mandatory
 * conversion to a public limited company.
 *
 * The conversion changes the name but not the activity the name indicates, so
 * it satisfies R-030's revenue test by definition. Excluding it here is what
 * stops EL-025 demanding a revenue split from every issuer who converted
 * shortly before filing — which is nearly all of them.
 */
function nameChangesInWindow(f: FactBase) {
  const from = asOf(f);
  const recent = f.company.nameChanges.filter((c) => inWindow(c.date, 12, from));
  return {
    conversions: recent.filter((c) => c.date === f.company.conversionToPublicDate),
    genuine: recent.filter((c) => c.date !== f.company.conversionToPublicDate),
  };
}

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

  /* ================================================================== */
  /* Exchange criteria — E-05 to E-18 (BSE SME), N-05 to N-11 (NSE)     */
  /*                                                                    */
  /* These sit ON TOP of SEBI's requirements, stated under Reg 229(3),  */
  /* and they differ materially between the platforms. Every rule below */
  /* is exchange-switched; several test the same fact under different   */
  /* windows or against different parties, which is why they are        */
  /* separate rules rather than one shared check.                       */
  /*                                                                    */
  /* Deliberately NOT written:                                          */
  /*   E-07 (promoter shares in demat) — the same requirement as        */
  /*        Reg 230(1)(d), already checked by EL-014. Two findings for  */
  /*        one defect teaches the reader the list is padded.           */
  /*   N-05 (no promoter loan repayment from proceeds) — the same       */
  /*        requirement as Reg 230(1)(h), already checked by EL-015.    */
  /*   E-14 (board composition compliant with the Companies Act) — no   */
  /*        citation row exists for the composition thresholds, and     */
  /*        SME-listed entities are exempted from parts of LODR, so the */
  /*        applicable test is genuinely unsettled. Rule zero: no       */
  /*        citation, no rule. Recorded as O-11 in 05-rule-sources.md.  */
  /* ================================================================== */

  {
    id: 'EL-022',
    clause: 'R-029 (BSE SME revised entry norms, January 2024); E-05',
    title: 'Net tangible assets must be at least Rs 3 crore',
    severity: 'blocker',
    category: 'eligibility',
    /**
     * Needs the balance sheet, so it is not a pre-check question — a promoter
     * answering from memory on day one does not have intangibles and deferred
     * IPO expenses to hand.
     */
    appliesTo: (f) => f.offer.exchange === 'BSE_SME' && f.financials.years.length > 0,
    check: (f) => {
      const years = recentThree(f);
      const nta = years.map((y) => ({ year: y.yearEnding, value: netTangibleAssets(y) }));
      const latest = nta[0];
      if (gte(latest.value, CRORE(3))) return null;
      const shortfall = subtract(CRORE(3), latest.value);
      return {
        detail:
          `Net tangible assets are ${formatAs(latest.value, 'crores')} for FY${latest.year}, against the Rs 3.00 Crores BSE SME requires — a shortfall of ${formatAs(shortfall, 'crores')}.\n` +
          nta.map((x) => `  FY${x.year}: ${formatAs(x.value, 'crores')}`).join('\n') +
          '\nNet tangible assets are total assets less total liabilities, intangible assets and deferred IPO expenses, taken from the latest audited results and disclosed as a three-year table.\n' +
          'The Rs 3 crore floor comes from the January 2024 revision of the BSE SME entry norms. The earlier norms required only positive net tangible assets, so an older document stating that is a different vintage, not a softer rule.',
        blocks: ['Eligibility for the Issue', 'Summary of Financial Information'],
        fix: { module: 'M6', factPath: 'financials.years' },
      };
    },
  },
  {
    id: 'EL-023',
    clause: 'E-06 (BSE SME functional website criterion)',
    title: 'The company must have a functional website',
    severity: 'major',
    category: 'eligibility',
    appliesTo: (f) => f.offer.exchange === 'BSE_SME',
    check: (f) => {
      const url = f.company.website.trim();
      if (/^https?:\/\/\S+\.\S+/.test(url)) return null;
      return {
        detail:
          (url === ''
            ? 'No company website is recorded. '
            : `"${url}" is not a usable website address. `) +
          'BSE SME requires a functional website as an eligibility criterion.\n' +
          'Note that this check can only confirm an address is stated and well formed. Whether the site is actually reachable and current is for the merchant banker to verify — the exchange does look.',
        blocks: ['General Information', 'Our Business'],
        fix: { module: 'M1', factPath: 'company.website' },
      };
    },
  },
  {
    id: 'EL-024',
    preCheck: true,
    clause: 'E-08 (BSE SME promoter control criterion)',
    title: 'No change in promoters with significant control in the preceding year',
    severity: 'blocker',
    category: 'eligibility',
    appliesTo: (f) => f.offer.exchange === 'BSE_SME',
    check: (f) =>
      f.promoters.controlChangedInPastYear
        ? {
            detail:
              'The promoters holding significant control changed within the year preceding the application. BSE SME requires no such change in that period.\n' +
              'There is no fix other than time — the application waits until a full year has passed since the change.',
            blocks: ['Eligibility for the Issue', 'Capital Structure'],
            fix: {
              module: 'M3',
              factPath: 'promoters.controlChangedInPastYear',
              action: 'No fix — the application waits a year from the change',
            },
          }
        : null,
  },
  {
    id: 'EL-025',
    preCheck: true,
    clause: 'R-030 (BSE SME listing criteria, per ICDR Reg 5(1)(e)); E-09',
    title: 'A change of name in the last year needs 50% of revenue from the new activity',
    /**
     * A name change inside the year is NOT a bar (R-030, closing O-12). It
     * triggers a revenue test: at least 50% of the preceding full financial
     * year's restated, consolidated revenue must come from the activity the
     * new name indicates.
     *
     * One corpus document states it as a flat bar. That is a banker's
     * shorthand for a test their issuer did not have to take, not the rule,
     * and the rule no longer repeats it.
     */
    severity: 'blocker',
    category: 'eligibility',
    appliesTo: (f) => f.offer.exchange === 'BSE_SME',
    check: (f) => {
      const genuine = nameChangesInWindow(f).genuine;
      if (genuine.length === 0) return null;

      const share = f.company.revenueShareFromNewNameActivity;
      // The revenue test is satisfied, so only S2's stricter reading remains.
      if (share !== null && new Decimal(share).greaterThanOrEqualTo(50)) return null;

      const listed = genuine
        .map((c) => {
          // The pre-check knows the date but not the names, so the from/to
          // clause is printed only where both are actually known.
          const names =
            c.previousName && c.newName ? `: "${c.previousName}" became "${c.newName}"` : '';
          return `  ${longDate(c.date)}${names}${c.reason ? ` (${c.reason})` : ''}`;
        })
        .join('\n');

      return {
        detail:
          `${genuine.length} change${genuine.length > 1 ? 's' : ''} of name ${genuine.length > 1 ? 'fall' : 'falls'} within the year preceding the application:\n` +
          listed +
          '\n\nWhere that happens, at least 50% of the preceding full financial year\'s revenue, restated and consolidated, must have been earned from the activity the new name indicates.\n' +
          (share === null
            ? '  Revenue from the new activity: NOT YET COMPUTED. The figure decides whether the issue can proceed, so it has to be worked out from the restated revenue before filing.\n'
            : `  Revenue from the new activity: ${share}%, against the 50% required — short by ${new Decimal(50).minus(share).toFixed(2)} percentage points.\n`) +
          `\nThe alternative is time: the requirement lapses once the change is a year old, on ${longDate(monthsOn(genuine[0].date, 12))}.\n` +
          'Note that the private-to-public conversion does not count here. It changes the name but not the activity the name indicates, so it passes this test by definition.',
        blocks: ['Eligibility for the Issue', 'Our History and Corporate Structure'],
        fix: { module: 'M1', factPath: 'company.revenueShareFromNewNameActivity' },
      };
    },
  },

  /* ---------------------------------------------------------------- */
  /* Insolvency and standing — both exchanges                          */
  /* ---------------------------------------------------------------- */
  {
    id: 'EL-026',
    preCheck: true,
    clause: 'E-11 (BSE SME) / N-06 (NSE Emerge)',
    title: 'The company must not be referred to the NCLT under the IBC',
    severity: 'blocker',
    category: 'eligibility',
    check: (f) =>
      f.legal.referredToNCLT
        ? {
            detail:
              'The company has been referred to the National Company Law Tribunal under the Insolvency and Bankruptcy Code. Both exchanges treat this as disqualifying.',
            blocks: ['The entire filing'],
            fix: { module: 'M7', factPath: 'legal.referredToNCLT' },
          }
        : null,
  },
  {
    id: 'EL-027',
    preCheck: true,
    clause: 'E-12 (BSE SME) / N-07 (NSE Emerge)',
    title: 'No admitted winding-up petition and no liquidator appointed',
    severity: 'blocker',
    category: 'eligibility',
    check: (f) =>
      f.legal.windingUpPetitionAdmitted
        ? {
            detail:
              'A winding-up petition against the company has been admitted by the NCLT or a competent court, or a liquidator has been appointed. Both exchanges treat this as disqualifying.',
            blocks: ['The entire filing'],
            fix: { module: 'M7', factPath: 'legal.windingUpPetitionAdmitted' },
          }
        : null,
  },
  {
    id: 'EL-028',
    preCheck: true,
    clause: 'E-17 (BSE SME) / N-06 (NSE Emerge)',
    title: 'The company must not have been referred to BIFR',
    severity: 'blocker',
    category: 'eligibility',
    check: (f) =>
      f.legal.referredToBIFR
        ? {
            detail:
              'The company has been referred to the Board for Industrial and Financial Reconstruction. Both exchanges treat this as disqualifying.',
            blocks: ['The entire filing'],
            fix: { module: 'M7', factPath: 'legal.referredToBIFR' },
          }
        : null,
  },
  {
    id: 'EL-029',
    preCheck: true,
    clause: 'N-06 (NSE Emerge) / E-17 (BSE SME, per S9)',
    title: 'No IBC proceedings against the promoting companies',
    severity: 'blocker',
    category: 'eligibility',
    /**
     * Was NSE-only, corrected 2026-09-10. The first pass read one BSE document,
     * which asks only about the issuer, and concluded the promoting-company
     * limb was NSE's alone. S9 states it at BSE in the same breath as BIFR:
     * "no proceedings have been admitted under Insolvency and Bankruptcy Code
     * against the issuer and Promoting companies".
     */
    check: (f) =>
      f.legal.ibcProceedingsAgainstPromotingCompanies
        ? {
            detail:
              'Insolvency proceedings have been admitted against a company promoting the issuer. Both exchanges extend the IBC test beyond the issuer itself to the promoting companies.',
            blocks: ['The entire filing'],
            fix: { module: 'M7', factPath: 'legal.ibcProceedingsAgainstPromotingCompanies' },
          }
        : null,
  },
  {
    id: 'EL-030',
    clause: 'E-13 (BSE SME regulatory action criterion)',
    title: 'No material regulatory action: 3 years for the company, 1 year for promoters',
    severity: 'major',
    category: 'eligibility',
    appliesTo: (f) => f.offer.exchange === 'BSE_SME',
    check: (f) => {
      const from = asOf(f);
      const company = f.legal.regulatoryActionAgainstCompanySince;
      const promoters = f.legal.regulatoryActionAgainstPromotersSince;
      /**
       * The one-year limb reaches group companies as well as promoters. The
       * first pass read it as promoters only; S2, S9 and S8 all write
       * "promoter, Group Companies, companies promoted by the promoter".
       */
      const group = f.legal.regulatoryActionAgainstGroupCompaniesSince;
      const hits: string[] = [];
      if (inWindow(company, 36, from)) {
        hits.push(`  Company:         ${longDate(company!)} — ${monthsSince(company!, from)} months ago, inside the 3-year window`);
      }
      if (inWindow(promoters, 12, from)) {
        hits.push(`  Promoters:       ${longDate(promoters!)} — ${monthsSince(promoters!, from)} months ago, inside the 1-year window`);
      }
      if (inWindow(group, 12, from)) {
        hits.push(`  Group companies: ${longDate(group!)} — ${monthsSince(group!, from)} months ago, inside the 1-year window`);
      }
      if (hits.length === 0) return null;
      return {
        detail:
          'BSE SME requires no material regulatory or disciplinary action by a stock exchange or regulator — three years back for the company, one year back for the promoters, group companies and companies promoted by the promoters:\n' +
          hits.join('\n') +
          '\nWhether the action is MATERIAL is the exchange\'s judgement, not something this check can make, which is why this is flagged rather than treated as disqualifying. Put the facts in front of the merchant banker before filing.',
        blocks: ['Eligibility for the Issue', 'Outstanding Litigation and Material Developments'],
        fix: { module: 'M7', factPath: 'legal.regulatoryActionAgainstCompanySince' },
      };
    },
  },
  {
    id: 'EL-031',
    clause: 'N-09 (NSE Emerge regulatory action criterion)',
    title: 'No regulatory action against promoters, promoting or group companies',
    severity: 'major',
    category: 'eligibility',
    /**
     * NSE's version differs from BSE's in both subject and window: it reaches
     * promoting and group companies, and states NO look-back period at all.
     * Applying BSE's three years here would invent a limit the source does not
     * contain, so this reports whatever is declared and says the window is
     * unstated.
     */
    appliesTo: (f) => f.offer.exchange === 'NSE_EMERGE',
    check: (f) => {
      const promoters = f.legal.regulatoryActionAgainstPromotersSince;
      const group = f.legal.regulatoryActionAgainstGroupCompaniesSince;
      const hits: string[] = [];
      if (promoters) hits.push(`  Promoters:                    ${longDate(promoters)}`);
      if (group) hits.push(`  Promoting or group companies: ${longDate(group)}`);
      if (hits.length === 0) return null;
      return {
        detail:
          'NSE Emerge requires no regulatory or disciplinary action by an exchange or regulator against the promoters, promoting companies or group companies:\n' +
          hits.join('\n') +
          '\nThe criterion states no look-back period, so every declared action is reported here rather than filtered by date. BSE SME, by contrast, applies one year to promoters and does not reach group companies at all.',
        blocks: ['Eligibility for the Issue', 'Outstanding Litigation and Material Developments'],
        fix: { module: 'M7', factPath: 'legal.regulatoryActionAgainstPromotersSince' },
      };
    },
  },
  {
    id: 'EL-032',
    preCheck: true,
    clause: 'N-10 (NSE Emerge) / E-19 (BSE SME, per S2 and S9)',
    title: 'No trading suspension against promoters or promoted companies',
    severity: 'blocker',
    category: 'eligibility',
    /**
     * Was NSE-only, corrected 2026-09-10. Both BSE documents state it — S2 in
     * its second criteria list, S9 at item (j) — so scoping it to NSE meant a
     * BSE issuer with a suspended promoter company would have been told
     * nothing at all.
     */
    check: (f) =>
      f.legal.tradingSuspendedForPromoterCompanies
        ? {
            detail:
              'A nationwide stock exchange has suspended trading against a promoter or a company promoted by the promoters. Both exchanges treat this as disqualifying.',
            blocks: ['The entire filing'],
            fix: { module: 'M7', factPath: 'legal.tradingSuspendedForPromoterCompanies' },
          }
        : null,
  },
  {
    id: 'EL-033',
    preCheck: true,
    clause: 'E-16 (BSE SME) / N-11 (NSE Emerge)',
    title: 'Promoters and directors must not be associated with a delisted company',
    severity: 'blocker',
    category: 'eligibility',
    /**
     * Independent directors are carved out at BOTH exchanges (R-031, closing
     * O-14). Two of four corpus documents omit the carve-out; the rulebook has
     * it, so the omission is drafting shorthand rather than a stricter venue.
     *
     * The fact is defined to exclude independent directorships already, so the
     * rule does not have to subtract them from an answer it cannot see.
     */
    check: (f) =>
      f.promoters.anyAssociatedWithDelistedCompany
        ? {
            detail:
              'A promoter, executive director or non-executive non-independent director is a promoter or director of a company that was compulsorily delisted, or suspended from trading for non-compliance. Both exchanges treat this as disqualifying.\n' +
              'An INDEPENDENT directorship in such a company does not count — the criterion reads "other than independent directors" — so if that is the only connection, it is not a finding.',
            blocks: ['The entire filing'],
            fix: { module: 'M3', factPath: 'promoters.anyAssociatedWithDelistedCompany' },
          }
        : null,
  },
  {
    id: 'EL-034',
    preCheck: true,
    clause: 'E-18 (BSE SME debt default criterion)',
    title: 'No pending defaults to debenture, bond or fixed deposit holders',
    severity: 'blocker',
    category: 'eligibility',
    appliesTo: (f) => f.offer.exchange === 'BSE_SME',
    check: (f) =>
      f.legal.pendingDebtSecurityDefaults
        ? {
            detail:
              'There is a pending default on payment of interest or principal to debenture, bond or fixed deposit holders. BSE SME treats this as disqualifying while it stands.',
            blocks: ['The entire filing', 'Financial Indebtedness'],
            fix: { module: 'M7', factPath: 'legal.pendingDebtSecurityDefaults' },
          }
        : null,
  },

  /* ---------------------------------------------------------------- */
  /* The six-month rule — different SUBJECT at each exchange           */
  /* ---------------------------------------------------------------- */
  {
    id: 'EL-035',
    preCheck: true,
    clause: 'E-10 (BSE SME six-month rule — the issuer)',
    title: 'The exchange must not have rejected the application in the last 6 months',
    severity: 'blocker',
    category: 'eligibility',
    appliesTo: (f) => f.offer.exchange === 'BSE_SME',
    check: (f) => {
      const from = asOf(f);
      const rejected = f.offer.exchangeApplicationRejectedSince;
      if (!inWindow(rejected, 6, from)) return null;
      const months = monthsSince(rejected!, from);
      return {
        detail:
          `The exchange rejected this company's listing application on ${longDate(rejected!)}, ${months} complete month${months === 1 ? '' : 's'} ago. BSE SME requires six complete months to have passed.\n` +
          `The window clears on ${longDate(monthsOn(rejected!, 6))}.\n` +
          'This one is about the COMPANY. NSE Emerge asks a different six-month question, about the merchant banker.',
        blocks: ['The entire filing'],
        fix: {
          module: 'M9',
          factPath: 'offer.exchangeApplicationRejectedSince',
          action: 'No fix — the application waits out the six months',
        },
      };
    },
  },
  {
    id: 'EL-036',
    clause: 'N-08 (NSE Emerge six-month rule — the merchant banker)',
    title: 'No draft returned to this merchant banker by the exchange in 6 months',
    severity: 'blocker',
    category: 'eligibility',
    /**
     * NSE only, and deliberately NOT a pre-check question: it is about the
     * merchant bankers involved in the issue, and at pre-check time there is
     * no merchant banker to ask about. Its BSE counterpart, E-10, asks about
     * the company and so can be answered on day one — the same six months,
     * two different parties, two different points in the process.
     */
    appliesTo: (f) => f.offer.exchange === 'NSE_EMERGE',
    check: (f) => {
      const from = asOf(f);
      const returned = f.offer.brlmDraftReturnedSince;
      if (!inWindow(returned, 6, from)) return null;
      const months = monthsSince(returned!, from);
      return {
        detail:
          `${f.offer.bookRunningLeadManager ?? 'The merchant banker'} had an IPO draft offer document returned by the exchange on ${longDate(returned!)}, ${months} complete month${months === 1 ? '' : 's'} ago. NSE Emerge requires that none of the merchant bankers involved has had a draft returned in the past six months.\n` +
          `The window clears on ${longDate(monthsOn(returned!, 6))}.\n` +
          'Unlike the BSE rule, this attaches to the BANKER, not to your company — appointing a merchant banker with a clear record resolves it immediately.',
        blocks: ['The entire filing'],
        fix: {
          module: 'M9',
          factPath: 'offer.brlmDraftReturnedSince',
          action: 'Appoint a merchant banker with no returned draft in the window',
        },
      };
    },
  },

  /* ---------------------------------------------------------------- */
  /* Depository arrangements                                           */
  /* ---------------------------------------------------------------- */
  {
    id: 'EL-037',
    clause: 'R-021 (ICDR Reg 230(1)(b)); E-15 (BSE SME tripartite agreements)',
    title: 'Tripartite agreements with the depositories and the registrar',
    severity: 'blocker',
    category: 'eligibility',
    check: (f) => {
      const { nsdl, cdsl } = f.capital.depositoryAgreements;
      const missing = [!nsdl && 'NSDL', !cdsl && 'CDSL'].filter(Boolean) as string[];
      const noRegistrar = !f.offer.registrarToIssue;

      /**
       * Two requirements at different levels, so the same facts fail for
       * different reasons: Reg 230(1)(b) needs AN agreement for
       * dematerialisation, and BSE's E-15 needs tripartite agreements with
       * BOTH depositories plus the registrar.
       */
      const failsRegulation = missing.length === 2;
      const failsExchange = f.offer.exchange === 'BSE_SME' && (missing.length > 0 || noRegistrar);
      if (!failsRegulation && !failsExchange) return null;

      const lines = [
        ...missing.map((d) => `  No tripartite agreement with ${d}.`),
        ...(noRegistrar ? ['  No registrar to the issue is appointed.'] : []),
      ];

      return {
        detail:
          (failsRegulation
            ? 'Regulation 230(1)(b) requires an agreement with the depositories for dematerialisation of the securities already issued and proposed to be issued.\n'
            : 'BSE SME requires tripartite agreements with BOTH depositories and the registrar. NSE Emerge does not state the second depository, so the same facts would pass there.\n') +
          lines.join('\n') +
          '\nEach agreement is between the company, the depository and the registrar, so the registrar has to be appointed first.',
        blocks: ['Capital Structure', 'General Information'],
        fix: { module: 'M2', factPath: 'capital.depositoryAgreements' },
      };
    },
  },

  /* ---------------------------------------------------------------- */
  /* Added 2026-09-10, after corroborating the criteria against S8,    */
  /* S9 and S10. The first three came from criteria that were missing  */
  /* or mis-scoped; the last from two regulations nobody had read.     */
  /* ---------------------------------------------------------------- */
  {
    id: 'EL-039',
    clause: 'R-029 (BSE SME revised entry norms, January 2024); E-05',
    title: 'Not more than half the net tangible assets may be monetary assets',
    severity: 'blocker',
    category: 'eligibility',
    /**
     * The second limb of R-029. Rs 3 crore of net tangible assets does not
     * count if most of it is cash — the criterion is about the productive
     * asset base, and an issuer holding the threshold in the bank has not
     * met it.
     *
     * Silent where the split has not been supplied: this is not a completeness
     * rule, and the section that discloses net tangible assets raises the gap
     * for the missing figure.
     */
    appliesTo: (f) =>
      f.offer.exchange === 'BSE_SME' &&
      f.financials.years.length > 0 &&
      f.financials.years[0].monetaryAssets !== null,
    check: (f) => {
      const latest = f.financials.years[0];
      const monetary = latest.monetaryAssets!;
      const nta = netTangibleAssets(latest);
      const half = new Decimal(nta).dividedBy(2);
      if (new Decimal(monetary).lessThanOrEqualTo(half)) return null;

      const share = percentOf(monetary, nta);
      return {
        detail:
          `Monetary assets are ${formatAs(monetary, 'crores')} against net tangible assets of ${formatAs(nta, 'crores')}` +
          (share ? ` — ${share.toFixed(2)}% of them` : '') +
          '. BSE SME allows not more than 50%.\n' +
          `  Monetary assets:      ${formatAs(monetary, 'crores').padStart(20)}\n` +
          `  Maximum permitted:    ${formatAs(half.toFixed(), 'crores').padStart(20)}\n` +
          `  Net tangible assets:  ${formatAs(nta, 'crores').padStart(20)}\n` +
          'Monetary assets are cash, bank balances and current investments. Meeting the Rs 3 crore floor with cash does not satisfy the criterion — the exchange is asking about the productive asset base.',
        blocks: ['Eligibility for the Issue', 'Summary of Financial Information'],
        fix: { module: 'M6', factPath: 'financials.years' },
      };
    },
  },
  {
    id: 'EL-040',
    preCheck: true,
    clause: 'R-026 (ICDR Reg 229(4))',
    title: 'A company converted from a firm needs one full financial year of existence',
    severity: 'blocker',
    category: 'eligibility',
    /**
     * A regulation, so it binds at both venues. Common SME path: a family
     * partnership or LLP incorporates specifically in order to list, and the
     * business is old while the company is weeks old.
     */
    appliesTo: (f) => f.company.convertedFromFirmType !== 'NONE',
    check: (f) => {
      const converted = f.company.conversionFromFirmDate;
      if (!converted) {
        return {
          detail:
            `The company converted from ${FIRM_NAME[f.company.convertedFromFirmType]}, but the date of conversion is not recorded. Regulation 229(4) requires the company to have existed for at least one full financial year before the draft offer document is filed, so the date decides whether it may file at all.`,
          blocks: ['Eligibility for the Issue'],
          fix: { module: 'M1', factPath: 'company.conversionFromFirmDate' },
        };
      }

      const firstFullYearEnds = firstFullFinancialYearEnd(converted);
      if (asOfIso(f) > firstFullYearEnds) return null;

      return {
        detail:
          `The company came into existence on ${longDate(converted)}, on conversion from ${FIRM_NAME[f.company.convertedFromFirmType]}.\n` +
          `Regulation 229(4) requires at least one FULL financial year of existence as a company before the draft offer document is filed. The first full financial year ends on ${longDate(firstFullYearEnds)}, so filing cannot happen before then.\n` +
          'Note this is a completed 1 April to 31 March year, not twelve months from conversion. The restated financials prepared after conversion must also follow Schedule III of the Companies Act.',
        blocks: ['Eligibility for the Issue', 'Financial Information'],
        fix: {
          module: 'M1',
          factPath: 'company.conversionFromFirmDate',
          action: 'No fix — the filing waits for the first full financial year to end',
        },
      };
    },
  },
  {
    id: 'EL-041',
    preCheck: true,
    clause: 'R-027 (ICDR Reg 229(5))',
    title: 'A majority change of promoter starts a one-year wait before filing',
    severity: 'blocker',
    category: 'eligibility',
    check: (f) => {
      const changed = f.promoters.majorityPromoterChangeDate;
      const from = asOf(f);
      if (!inWindow(changed, 12, from)) return null;
      return {
        detail:
          `Promoters changed completely, or new promoters acquired more than 50% of the shareholding, on ${longDate(changed!)} — ${monthsSince(changed!, from)} months before the intended filing.\n` +
          `Regulation 229(5) allows the draft offer document to be filed only after one year from the date of the final change, so the earliest filing date is ${longDate(monthsOn(changed!, 12))}.\n` +
          'This is a regulation rather than an exchange criterion, so switching platforms does not avoid it.',
        blocks: ['The entire filing', 'Capital Structure'],
        fix: {
          module: 'M3',
          factPath: 'promoters.majorityPromoterChangeDate',
          action: 'No fix — the filing waits a year from the change',
        },
      };
    },
  },
  {
    id: 'EL-042',
    preCheck: true,
    clause: 'E-20 (BSE SME) / S8 item 12 (NSE Emerge)',
    title: 'No outstanding SEBI action against a director in the past five years',
    severity: 'major',
    category: 'eligibility',
    /**
     * Stated at both exchanges and missed entirely on the first pass — S2 item
     * 8, S9 item (s), S8 item 12 all carry it. Major rather than blocker
     * because, like E-13, whether an action is outstanding and material is the
     * exchange's judgement on facts a checkbox cannot carry.
     */
    check: (f) => {
      const since = f.legal.sebiActionAgainstDirectorsSince;
      const from = asOf(f);
      if (!inWindow(since, 60, from)) return null;
      return {
        detail:
          `Action was initiated by SEBI against a director on ${longDate(since!)}, ${monthsSince(since!, from)} months before the intended filing.\n` +
          'Both exchanges ask that the directors are not associated with the securities market in any manner and that no action initiated by the Board in the past five years is outstanding.\n' +
          `The five-year window closes on ${longDate(monthsOn(since!, 60))}. Whether the action is still OUTSTANDING is the question the exchange will ask — a concluded matter is not the same as a pending one, and this check cannot tell them apart.`,
        blocks: ['Eligibility for the Issue', 'Our Management'],
        fix: { module: 'M7', factPath: 'legal.sebiActionAgainstDirectorsSince' },
      };
    },
  },
  {
    id: 'EL-044',
    clause: 'R-028 (Companies Act 2013 s.149(1) and s.149(4); LODR Reg 15(2)(b)); E-14',
    title: 'The board must satisfy the Companies Act composition requirements',
    severity: 'blocker',
    category: 'eligibility',
    /**
     * E-14 says only "compliant with the Companies Act, 2013", which is why it
     * went unruled: the criterion states no threshold of its own.
     *
     * R-028 supplies them. The load-bearing part is LODR Reg 15(2)(b), which
     * EXEMPTS SME-listed entities from Reg 17 to 27 — so the board is tested
     * against the Companies Act alone, not against LODR's listed-company
     * board requirements. Without that exemption an SME issuer appears to be
     * held to a much heavier standard, which is the confusion that stalled
     * this rule.
     *
     * Not written: the woman-director requirement. Rule 3 triggers at Rs 100
     * crore paid-up capital, four times the Rs 25 crore SME ceiling, so that
     * limb cannot bind through capital; the Rs 300 crore turnover limb could
     * in principle, but an issuer at that turnover is far outside SME
     * territory, and the fact base carries no director gender.
     */
    appliesTo: (f) => f.management.directors.length > 0,
    check: (f) => {
      const directors = f.management.directors;
      const independent = directors.filter((d) => d.isIndependent);
      const problems: string[] = [];

      // s.149(1): a public company needs at least three directors.
      if (directors.length < 3) {
        problems.push(
          `  Directors: ${directors.length}. Section 149(1) requires at least 3 for a public company.`,
        );
      }

      /**
       * s.149(4) with Rule 4: at least one third independent, where post-issue
       * paid-up capital reaches Rs 10 crore or turnover reaches Rs 100 crore.
       * Post-issue capital is the right measure — the test bites on the
       * company that lists, not the one that filed.
       */
      const capital = postIssueCapital(f);
      const turnover = f.financials.years[0]?.revenue ?? '0';
      const byCapital = gte(capital, CRORE(10));
      const byTurnover = gte(turnover, CRORE(100));

      if (byCapital || byTurnover) {
        const required = Math.ceil(directors.length / 3);
        if (independent.length < required) {
          const trigger = byCapital
            ? `post-issue paid-up capital of ${formatAs(capital, 'crores')} is at or above Rs 10.00 Crores`
            : `turnover of ${formatAs(turnover, 'crores')} is at or above Rs 100.00 Crores`;
          problems.push(
            `  Independent directors: ${independent.length} of ${directors.length}. Section 149(4) requires at least one third — ${required} here — because ${trigger}.`,
          );
        }
      }

      if (problems.length === 0) return null;
      return {
        detail:
          'The board does not meet the Companies Act composition requirements the exchange tests at in-principle approval:\n' +
          problems.join('\n') +
          '\nNote that SME-listed entities are exempt from LODR Regulations 17 to 27 by Regulation 15(2)(b), so the Companies Act is the whole test here — the heavier listed-company board requirements do not apply.',
        blocks: ['Eligibility for the Issue', 'Our Management'],
        fix: { module: 'M4', factPath: 'management.directors', action: 'Appoint the directors needed' },
      };
    },
  },
];
