import Decimal from 'decimal.js';
import { formatAs, type Money } from '../facts/money';

/**
 * Formatting the computed sections share. Each of these matches how the
 * corpus documents print the thing; none of them is a place to invent.
 */

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

/** "2026-09-04" -> "September 4, 2026", the form offer documents use. */
export function longDate(iso: string | undefined | null): string {
  if (!iso) return '';
  const [y, m, d] = iso.split('-').map(Number);
  if (!y || !m || !d) return iso;
  return `${MONTHS[m - 1]} ${d}, ${y}`;
}

/** "Fiscal 2026", the way the summary tables head their year columns. */
export const fiscal = (yearEnding: number) => `Fiscal ${yearEnding}`;

/** "March 31, 2026", for balance-sheet-date columns. */
export const yearEnd = (yearEnding: number) => `March 31, ${yearEnding}`;

/**
 * Whole years between a date of birth and a date. The board table prints
 * "Age: 64 years". UTC getters, for the same reason as the rules: an ISO
 * date read with local getters shifts a day west of Greenwich.
 */
export function ageOn(dateOfBirth: string | undefined, asOf: Date = new Date()): number | undefined {
  if (!dateOfBirth) return undefined;
  const [y, m, d] = dateOfBirth.split('-').map(Number);
  if (!y || !m || !d) return undefined;
  let age = asOf.getUTCFullYear() - y;
  const beforeBirthday =
    asOf.getUTCMonth() + 1 < m || (asOf.getUTCMonth() + 1 === m && asOf.getUTCDate() < d);
  if (beforeBirthday) age -= 1;
  return age;
}

/** Rupees as "1,110.54" in lakhs, no unit label — for a table whose header says "(Rs in Lakhs)". */
export function lakhs(amount: Money | null | undefined): string {
  if (amount === null || amount === undefined) return '-';
  return formatAs(amount, 'lakhs').replace(/^Rs /, '').replace(/ Lakhs$/, '');
}

/** Sum of money strings, exact. */
export function sum(amounts: (Money | null | undefined)[]): Money {
  return amounts
    .reduce((s, a) => (a === null || a === undefined ? s : s.plus(a)), new Decimal(0))
    .toFixed();
}

/** A ratio to two places, "0.47"; "-" where the denominator is zero. */
export function ratio(numerator: Money, denominator: Money): string {
  const d = new Decimal(denominator);
  if (d.isZero()) return '-';
  return new Decimal(numerator).dividedBy(d).toFixed(2);
}

/** "ENUM_VALUE" -> "enum value", for a category printed in a cell. */
export const humanise = (value: string) => value.replace(/_/g, ' ').toLowerCase();

/** "Rs 5" -> the face value as offer documents write it in prose. */
export const rupees = (amount: Money) => `Rs ${new Decimal(amount).toFixed(new Decimal(amount).isInteger() ? 0 : 2)}`;
