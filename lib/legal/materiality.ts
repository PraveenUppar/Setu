import Decimal from 'decimal.js';
import { type Money } from '../facts/money';
import type { FactBase, Litigation, LitigationCategory, LitigationParty } from '../facts/schema';

/**
 * The litigation materiality threshold, computed.
 *
 * Both primary sources state the same test and both show the arithmetic:
 * a proceeding is material where the amount involved exceeds the LOWER of
 *
 *   (i)   2% of turnover for the most recent financial year
 *   (ii)  2% of net worth at the end of the most recent financial period,
 *         unless net worth is negative
 *   (iii) 5% of the average of the ABSOLUTE profit or loss after tax for
 *         the last three financial years
 *
 * (Om Galaxy p.306: "equal to or in excess of Rs 83.18 Lakhs"; Maxwell p.244:
 * "Rs 40.33 lakhs being the lowest of the above criteria"). It follows from
 * M6, so it is derived rather than asked — a threshold typed by hand that
 * disagrees with the financials it cites is exactly the inconsistency the
 * exchange looks for. The policy DATE is asked; the number is not.
 *
 * Absolute values: "calculated by disregarding the sign", as Maxwell says,
 * so a loss year does not lower the average.
 */
export interface MaterialityThreshold {
  turnoverLimb: Money;
  netWorthLimb: Money | null;
  patLimb: Money;
  threshold: Money;
  /** Which limb was lowest, for the sentence that says so. */
  basis: 'turnover' | 'netWorth' | 'profitAfterTax';
}

export function materialityThreshold(facts: FactBase): MaterialityThreshold | null {
  const years = facts.financials.years;
  if (years.length === 0) return null;
  const latest = years[0];

  const turnoverLimb = new Decimal(latest.revenue).times('0.02');
  const netWorth = new Decimal(latest.netWorth);
  const netWorthLimb = netWorth.isNegative() ? null : netWorth.times('0.02');

  const recent = years.slice(0, 3);
  const averageAbsPat = recent
    .reduce((s, y) => s.plus(new Decimal(y.profitAfterTax).abs()), new Decimal(0))
    .dividedBy(recent.length);
  const patLimb = averageAbsPat.times('0.05');

  const candidates: { value: Decimal; basis: MaterialityThreshold['basis'] }[] = [
    { value: turnoverLimb, basis: 'turnover' },
    ...(netWorthLimb ? [{ value: netWorthLimb, basis: 'netWorth' as const }] : []),
    { value: patLimb, basis: 'profitAfterTax' },
  ];
  const lowest = candidates.reduce((a, b) => (b.value.lessThan(a.value) ? b : a));

  return {
    turnoverLimb: turnoverLimb.toFixed(),
    netWorthLimb: netWorthLimb ? netWorthLimb.toFixed() : null,
    patLimb: patLimb.toFixed(),
    threshold: lowest.value.toFixed(),
    basis: lowest.basis,
  };
}

/** The material creditor threshold in rupees, from the policy percentage and trade payables. */
export function materialCreditorThreshold(facts: FactBase): Money | null {
  const pct = facts.legal.materialCreditorThresholdPercent;
  const payables = facts.financials.years[0]?.tradePayables;
  if (pct === undefined || !payables) return null;
  return new Decimal(payables).times(pct).dividedBy(100).toFixed();
}

/**
 * The proceedings involving one party, grouped the way the section lists
 * them. Tax matters are consolidated: counted and summed, never listed.
 */
export interface PartyLitigation {
  party: LitigationParty;
  criminalAgainst: Litigation[];
  criminalBy: Litigation[];
  statutoryRegulatory: Litigation[];
  sebiDisciplinary: Litigation[];
  directTax: { count: number; amount: Money };
  indirectTax: { count: number; amount: Money };
  otherMaterialAgainst: Litigation[];
  otherMaterialBy: Litigation[];
}

const consolidate = (items: Litigation[]) => ({
  count: items.length,
  amount: items
    .reduce((s, l) => (l.amount === null ? s : s.plus(l.amount)), new Decimal(0))
    .toFixed(),
});

export function litigationFor(facts: FactBase, party: LitigationParty): PartyLitigation {
  const all = facts.legal.litigation.filter((l) => l.party === party);
  const of = (category: LitigationCategory, direction?: 'AGAINST' | 'BY') =>
    all.filter((l) => l.category === category && (direction === undefined || l.direction === direction));

  return {
    party,
    criminalAgainst: of('CRIMINAL', 'AGAINST'),
    criminalBy: of('CRIMINAL', 'BY'),
    statutoryRegulatory: of('STATUTORY_REGULATORY'),
    sebiDisciplinary: of('SEBI_DISCIPLINARY'),
    directTax: consolidate(of('DIRECT_TAX')),
    indirectTax: consolidate(of('INDIRECT_TAX')),
    otherMaterialAgainst: of('OTHER_MATERIAL', 'AGAINST'),
    otherMaterialBy: of('OTHER_MATERIAL', 'BY'),
  };
}
