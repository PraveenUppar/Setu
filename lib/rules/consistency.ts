import Decimal from 'decimal.js';
import { add, eq, formatAs, formatIndian, multiply, subtract } from '../facts/money';
import type { FactBase } from '../facts/schema';
import type { Rule } from './types';

/**
 * CONSISTENCY RULES — do the numbers agree with each other?
 *
 * These are the ones that earn the product its keep. Each catches in seconds
 * something that currently surfaces in week nine of merchant-banker review,
 * costs a round trip of emails, and delays the filing.
 *
 * They cite the arithmetic rather than a regulation, because that is what they
 * are: a cap table that does not add up is not a breach of any particular
 * clause, it is simply wrong, and the exchange will send it back.
 */

const shares = (n: number) => n.toLocaleString('en-IN');

export const consistencyRules: Rule[] = [
  {
    id: 'CO-001',
    clause: 'Arithmetic — capital build-up',
    title: 'Allotment history must sum to pre-issue paid-up shares',
    severity: 'blocker',
    category: 'consistency',
    appliesTo: (f) => f.capital.allotments.length > 0,
    check: (f) => {
      const total = f.capital.allotments.reduce((s, a) => s + a.shares, 0);
      if (total === f.capital.paidUpShares) return null;
      const diff = f.capital.paidUpShares - total;
      return {
        detail:
          'The capital build-up history does not reconcile with paid-up capital.\n' +
          `  Sum of ${f.capital.allotments.length} allotments: ${shares(total)} shares\n` +
          `  Stated pre-issue paid-up:      ${shares(f.capital.paidUpShares)} shares\n` +
          `  ${diff > 0 ? 'Short by' : 'Over by'}: ${shares(Math.abs(diff))} shares\n` +
          'Every allotment since incorporation must appear, including bonus issues and conversions. The exchange reconciles this against your PAS-3 filings.',
        blocks: ['Capital Structure', 'Issue Structure'],
        fix: { module: 'M2', factPath: 'capital.allotments' },
      };
    },
  },
  {
    id: 'CO-002',
    clause: 'Arithmetic — shareholding register',
    title: 'Shareholding register must sum to pre-issue paid-up shares',
    severity: 'blocker',
    category: 'consistency',
    appliesTo: (f) => f.capital.shareholders.length > 0,
    check: (f) => {
      const total = f.capital.shareholders.reduce((s, x) => s + x.shares, 0);
      if (total === f.capital.paidUpShares) return null;
      const pct = new Decimal(total).dividedBy(f.capital.paidUpShares).times(100);
      return {
        detail:
          `The shareholding register accounts for ${pct.toFixed(2)}% of paid-up capital, not 100%.\n` +
          `  Sum of ${f.capital.shareholders.length} holdings: ${shares(total)} shares\n` +
          `  Pre-issue paid-up:       ${shares(f.capital.paidUpShares)} shares\n` +
          `  Unaccounted:             ${shares(Math.abs(f.capital.paidUpShares - total))} shares`,
        blocks: ['Capital Structure'],
        fix: { module: 'M2', factPath: 'capital.shareholders' },
      };
    },
  },
  {
    id: 'CO-003',
    clause: 'Arithmetic — paid-up capital',
    title: 'Paid-up capital must equal shares times face value',
    severity: 'blocker',
    category: 'consistency',
    check: (f) => {
      const computed = multiply(f.capital.faceValue, f.capital.paidUpShares);
      if (eq(computed, f.capital.paidUpCapital)) return null;
      return {
        detail:
          'Paid-up capital does not equal shares times face value.\n' +
          `  ${shares(f.capital.paidUpShares)} shares x Rs ${f.capital.faceValue} = ${formatAs(computed, 'lakhs')}\n` +
          `  Stated paid-up capital:  ${formatAs(f.capital.paidUpCapital, 'lakhs')}`,
        blocks: ['Capital Structure'],
        fix: { module: 'M2', factPath: 'capital.paidUpCapital' },
      };
    },
  },
  {
    id: 'CO-004',
    clause: 'Arithmetic — promoter holdings',
    title: 'Promoter tranches must reconcile with the shareholding register',
    severity: 'major',
    category: 'consistency',
    appliesTo: (f) => f.capital.promoterHoldings.length > 0,
    check: (f) => {
      const fromTranches = f.capital.promoterHoldings.reduce((s, h) => s + h.shares, 0);
      const fromRegister = f.capital.shareholders
        .filter((s) => s.category === 'PROMOTER')
        .reduce((s, x) => s + x.shares, 0);
      if (fromTranches === fromRegister) return null;
      return {
        detail:
          'Per-promoter acquisition tranches do not add up to the promoter holding in the register.\n' +
          `  Sum of ${f.capital.promoterHoldings.length} tranches: ${shares(fromTranches)} shares\n` +
          `  Register, promoters:      ${shares(fromRegister)} shares\n` +
          'The tranches drive the lock-in table, so a mismatch here produces a lock-in schedule that does not tie to the cap table.',
        blocks: ['Capital Structure', 'Lock-in'],
        fix: { module: 'M2', factPath: 'capital.promoterHoldings' },
      };
    },
  },
  {
    id: 'CO-005',
    clause: 'Arithmetic — objects of the issue',
    title: 'Objects plus issue expenses must equal the issue size',
    severity: 'blocker',
    category: 'consistency',
    appliesTo: (f) => f.offer.objects.length > 0 && f.offer.capPrice !== null,
    check: (f) => {
      const objects = add(...f.offer.objects.map((o) => o.amount));
      const applied = add(objects, f.offer.issueExpenses);
      const issueSize = multiply(f.offer.capPrice!, f.offer.freshIssueShares);
      if (eq(applied, issueSize)) return null;
      const diff = subtract(issueSize, applied);
      const over = new Decimal(diff).isNegative();
      return {
        detail:
          'The objects of the issue do not reconcile with the issue size.\n' +
          `  Objects listed:   ${formatAs(objects, 'crores').padStart(20)}\n` +
          `  Issue expenses:   ${formatAs(f.offer.issueExpenses, 'crores').padStart(20)}\n` +
          `  Total applied:    ${formatAs(applied, 'crores').padStart(20)}\n` +
          `  Issue size:       ${formatAs(issueSize, 'crores').padStart(20)}\n` +
          `  ${over ? 'Over-allocated by' : 'Unaccounted'}: ${formatAs(new Decimal(diff).abs().toFixed(), 'crores')}\n` +
          'Every rupee raised must be allocated to a stated object or to issue expenses.',
        blocks: ['Objects of the Issue', 'Basis for Issue Price'],
        fix: { module: 'M9', factPath: 'offer.objects' },
      };
    },
  },
  {
    id: 'CO-006',
    clause: 'Arithmetic — net tangible assets',
    title: 'Net tangible assets must reconcile with net worth',
    severity: 'major',
    category: 'consistency',
    appliesTo: (f) => f.financials.years.length > 0,
    check: (f) => {
      const mismatched = f.financials.years.filter((y) => {
        const nta = subtract(
          subtract(subtract(y.totalAssets, y.totalLiabilities), y.intangibleAssets),
          y.deferredIpoExpenses,
        );
        return !eq(nta, y.netWorth);
      });
      if (mismatched.length === 0) return null;
      return {
        detail:
          `Net tangible assets do not tie to net worth in ${mismatched.length} year${mismatched.length > 1 ? 's' : ''}.\n` +
          mismatched
            .map((y) => {
              const nta = subtract(
                subtract(subtract(y.totalAssets, y.totalLiabilities), y.intangibleAssets),
                y.deferredIpoExpenses,
              );
              return (
                `  FY${y.yearEnding}: assets ${formatAs(y.totalAssets, 'crores')} less liabilities ${formatAs(y.totalLiabilities, 'crores')} ` +
                `less intangibles ${formatAs(y.intangibleAssets, 'crores')} less deferred IPO expenses ${formatAs(y.deferredIpoExpenses, 'crores')} ` +
                `= ${formatAs(nta, 'crores')}, but net worth is stated as ${formatAs(y.netWorth, 'crores')}`
              );
            })
            .join('\n'),
        blocks: ['Summary of Financial Information', 'Eligibility for the Issue'],
        fix: { module: 'M6', factPath: 'financials.years' },
      };
    },
  },
  {
    id: 'CO-007',
    clause: 'Arithmetic — lot size',
    title: 'The market maker reservation must be a whole number of lots',
    severity: 'major',
    category: 'consistency',
    appliesTo: (f) =>
      f.offer.marketMakerReservationShares !== undefined && f.offer.lotSize > 0,
    check: (f) => {
      const mm = f.offer.marketMakerReservationShares!;
      const remainder = mm % f.offer.lotSize;
      if (remainder === 0) return null;
      return {
        detail:
          `The market maker reservation of ${shares(mm)} shares is not a whole number of lots.\n` +
          `  Bid Lot:   ${shares(f.offer.lotSize)} shares\n` +
          `  Remainder: ${shares(remainder)} shares\n` +
          `Nearest whole lots: ${shares(Math.floor(mm / f.offer.lotSize) * f.offer.lotSize)} or ${shares(Math.ceil(mm / f.offer.lotSize) * f.offer.lotSize)}.`,
        blocks: ['Issue Structure'],
        fix: { module: 'M9', factPath: 'offer.marketMakerReservationShares' },
      };
    },
  },
  {
    id: 'CO-008',
    clause: 'Arithmetic — price band',
    title: 'The floor price must not exceed the cap price',
    severity: 'blocker',
    category: 'consistency',
    appliesTo: (f) => f.offer.floorPrice !== null && f.offer.capPrice !== null,
    check: (f) => {
      const floor = new Decimal(f.offer.floorPrice!);
      const cap = new Decimal(f.offer.capPrice!);
      if (floor.lessThanOrEqualTo(cap)) return null;
      return {
        detail:
          `The Floor Price of Rs ${f.offer.floorPrice} is above the Cap Price of Rs ${f.offer.capPrice}. The price band runs from the floor upwards.`,
        blocks: ['Terms of the Issue', 'Basis for Issue Price'],
        fix: { module: 'M9', factPath: 'offer.floorPrice' },
      };
    },
  },
  {
    id: 'CO-009',
    clause: 'Arithmetic — face value',
    title: 'The floor price must be at least the face value',
    severity: 'blocker',
    category: 'consistency',
    appliesTo: (f) => f.offer.floorPrice !== null,
    check: (f) => {
      const floor = new Decimal(f.offer.floorPrice!);
      const face = new Decimal(f.capital.faceValue);
      if (floor.greaterThanOrEqualTo(face)) return null;
      return {
        detail:
          `The Floor Price of Rs ${f.offer.floorPrice} is below the face value of Rs ${f.capital.faceValue}. Equity shares cannot be issued at a discount to face value.`,
        blocks: ['Terms of the Issue', 'Basis for Issue Price'],
        fix: { module: 'M9', factPath: 'offer.floorPrice' },
      };
    },
  },
  {
    id: 'CO-010',
    clause: 'Arithmetic — authorised capital',
    title: 'Post-issue capital must not exceed authorised capital',
    severity: 'blocker',
    category: 'consistency',
    check: (f) => {
      const postShares = f.capital.paidUpShares + f.offer.freshIssueShares;
      if (postShares <= f.capital.authorisedShares) return null;
      return {
        detail:
          'Post-issue shares would exceed the authorised share capital.\n' +
          `  Pre-issue:   ${shares(f.capital.paidUpShares)} shares\n` +
          `  Fresh issue: ${shares(f.offer.freshIssueShares)} shares\n` +
          `  Post-issue:  ${shares(postShares)} shares\n` +
          `  Authorised:  ${shares(f.capital.authorisedShares)} shares\n` +
          `Increase authorised capital by at least ${shares(postShares - f.capital.authorisedShares)} shares, which needs a shareholder resolution and an MOA amendment.`,
        blocks: ['Capital Structure', 'Issue Structure'],
        fix: { module: 'M2', factPath: 'capital.authorisedShares' },
      };
    },
  },
  {
    id: 'CO-011',
    clause: 'Arithmetic — customer concentration',
    title: 'Customer revenue shares must not exceed 100%',
    severity: 'major',
    category: 'consistency',
    appliesTo: (f) => f.business.topCustomers.length > 0,
    check: (f) => {
      const total = f.business.topCustomers.reduce((s, c) => s + c.revenueShare, 0);
      if (total <= 100) return null;
      return {
        detail:
          `Listed customers account for ${total.toFixed(1)}% of revenue, which is more than all of it.\n` +
          f.business.topCustomers.map((c) => `  ${c.name}: ${c.revenueShare}%`).join('\n'),
        blocks: ['Our Business', 'Risk Factors'],
        fix: { module: 'M5', factPath: 'business.topCustomers' },
      };
    },
  },
  {
    id: 'CO-012',
    clause: 'Arithmetic — bonus issue',
    title: 'A bonus issue cannot carry an issue price',
    severity: 'minor',
    category: 'consistency',
    appliesTo: (f) => f.capital.allotments.some((a) => a.nature === 'BONUS_ISSUE'),
    check: (f) => {
      const priced = f.capital.allotments.filter(
        (a) => a.nature === 'BONUS_ISSUE' && a.issuePrice !== null,
      );
      if (priced.length === 0) return null;
      return {
        detail:
          `${priced.length} bonus allotment${priced.length > 1 ? 's carry' : ' carries'} an issue price:\n` +
          priced.map((a) => `  ${a.date}: ${shares(a.shares)} shares at Rs ${a.issuePrice}`).join('\n') +
          '\nBonus shares are issued out of reserves for no consideration, so the issue price should be blank.',
        blocks: ['Capital Structure'],
        fix: { module: 'M2', factPath: 'capital.allotments' },
      };
    },
  },
];
