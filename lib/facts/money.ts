import Decimal from 'decimal.js';

/**
 * Money is stored as a decimal string in RUPEES, never a JS number.
 *
 * Floats silently corrupt rupee figures — 0.1 + 0.2 = 0.30000000000000004 —
 * which surfaces much later as a capitalisation statement that does not tie,
 * with no clue where it went wrong. Strings survive JSON round-trips exactly.
 *
 * Share counts are integers and safe as numbers. Prices, amounts and
 * percentages are not.
 */
export type Money = string;

/** Indian units. Offer documents almost always tabulate in lakhs. */
export type MoneyUnit = 'rupees' | 'thousands' | 'lakhs' | 'crores';

const MULTIPLIER: Record<MoneyUnit, string> = {
  rupees: '1',
  thousands: '1000',
  lakhs: '100000',
  crores: '10000000',
};

Decimal.set({ precision: 30, rounding: Decimal.ROUND_HALF_UP });

/** Parse a value expressed in `unit` into canonical rupees. */
export function money(value: string | number, unit: MoneyUnit = 'rupees'): Money {
  return new Decimal(value).times(MULTIPLIER[unit]).toFixed();
}

/** Convert canonical rupees out to `unit`, for display or table rendering. */
export function toUnit(amount: Money, unit: MoneyUnit): Decimal {
  return new Decimal(amount).dividedBy(MULTIPLIER[unit]);
}

export const ZERO: Money = '0';

export function add(...amounts: Money[]): Money {
  return amounts.reduce((sum, a) => sum.plus(a), new Decimal(0)).toFixed();
}

export function subtract(a: Money, b: Money): Money {
  return new Decimal(a).minus(b).toFixed();
}

export function multiply(amount: Money, factor: string | number): Money {
  return new Decimal(amount).times(factor).toFixed();
}

/** `amount` as a percentage of `total`. Returns null when total is zero. */
export function percentOf(amount: Money, total: Money): Decimal | null {
  const t = new Decimal(total);
  if (t.isZero()) return null;
  return new Decimal(amount).dividedBy(t).times(100);
}

/** `percent` percent of `amount` — e.g. pct('1000', 15) is 150. */
export function pct(amount: Money, percent: string | number): Money {
  return new Decimal(amount).times(percent).dividedBy(100).toFixed();
}

export function compare(a: Money, b: Money): -1 | 0 | 1 {
  return new Decimal(a).comparedTo(b) as -1 | 0 | 1;
}

export const gt = (a: Money, b: Money) => compare(a, b) === 1;
export const gte = (a: Money, b: Money) => compare(a, b) >= 0;
export const lt = (a: Money, b: Money) => compare(a, b) === -1;
export const lte = (a: Money, b: Money) => compare(a, b) <= 0;
export const eq = (a: Money, b: Money) => compare(a, b) === 0;

/**
 * Format for display in the Indian convention: 2,22,10,824 rather than
 * 222,10,824. Offer documents use this grouping throughout.
 */
export function formatIndian(amount: Money, decimals = 2): string {
  const d = new Decimal(amount);
  const negative = d.isNegative();
  const [whole, fraction] = d.abs().toFixed(decimals).split('.');

  // Last three digits group normally; everything above groups in pairs.
  const last3 = whole.slice(-3);
  const rest = whole.slice(0, -3);
  const grouped = rest
    ? rest.replace(/\B(?=(\d{2})+(?!\d))/g, ',') + ',' + last3
    : last3;

  const out = fraction ? `${grouped}.${fraction}` : grouped;
  return negative ? `-${out}` : out;
}

/** Render as a prospectus would: "Rs 1,110.54 Lakhs". */
export function formatAs(amount: Money, unit: MoneyUnit, decimals = 2): string {
  const label = { rupees: '', thousands: 'Thousands', lakhs: 'Lakhs', crores: 'Crores' }[unit];
  const value = formatIndian(toUnit(amount, unit).toFixed(decimals), decimals);
  return label ? `Rs ${value} ${label}` : `Rs ${value}`;
}
