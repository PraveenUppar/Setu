import { describe, it, expect } from 'vitest';
import { runPreCheck, toFactBase, type PreCheckInput } from './precheck';
import { preCheckRules, allRules, evaluate } from './index';
import { money } from '../facts/money';
import { vardhman } from '../seed/vardhman';

const cr = (v: string | number) => money(v, 'crores');

/** Vardhman's own figures, as a promoter would type them into the pre-check. */
const vardhmanInput: PreCheckInput = {
  exchange: 'BSE_SME',
  isPublicLimited: true,
  dateOfIncorporation: '2016-04-12',
  faceValue: money('10'),
  paidUpShares: 12000000,
  authorisedShares: 20000000,
  intendedFreshIssueShares: 4500000,
  years: [
    { yearEnding: 2026, profitBeforeTax: cr('4.85'), financeCosts: cr('0.78'), depreciationAndAmortisation: cr('1.12'), otherIncome: cr('0.35'), netWorth: cr('19.40'), totalBorrowings: cr('8.60'), shareholdersEquity: cr('19.40') },
    { yearEnding: 2025, profitBeforeTax: cr('3.42'), financeCosts: cr('0.64'), depreciationAndAmortisation: cr('0.98'), otherIncome: cr('0.28'), netWorth: cr('14.20'), totalBorrowings: cr('7.20'), shareholdersEquity: cr('14.20') },
    { yearEnding: 2024, profitBeforeTax: cr('1.48'), financeCosts: cr('0.52'), depreciationAndAmortisation: cr('0.81'), otherIncome: cr('0.19'), netWorth: cr('9.80'), totalBorrowings: cr('6.10'), shareholdersEquity: cr('9.80') },
  ],
  anyDebarredBySebi: false,
  anyWilfulDefaulterOrFraudulentBorrower: false,
  anyFugitiveEconomicOffender: false,
  hasOutstandingConvertibles: false,
  hasPartlyPaidShares: false,
};

const withInput = (o: Partial<PreCheckInput>): PreCheckInput => ({ ...vardhmanInput, ...o });

describe('pre-check scope', () => {
  it('runs only rules a promoter can answer on day one', () => {
    expect(preCheckRules.length).toBe(13);
    expect(preCheckRules.every((r) => r.preCheck)).toBe(true);
  });

  it('excludes rules that need a banker or a drafted document', () => {
    const ids = preCheckRules.map((r) => r.id);
    // Underwriting share, market maker, objects of the issue, OFS caps —
    // real requirements, but asking them before anyone has engaged a banker
    // turns a ten-minute check into an interrogation.
    for (const excluded of ['EL-015', 'EL-016', 'EL-017', 'EL-018', 'EL-019', 'EL-020', 'EL-021']) {
      expect(ids).not.toContain(excluded);
    }
  });

  it('uses the same rule objects as the full assessment', () => {
    // A pre-check that diverged would tell people they are eligible and be
    // wrong. Identity, not a copy.
    for (const r of preCheckRules) expect(allRules).toContain(r);
  });
});

describe('the fact base it builds', () => {
  it('leaves unasked areas empty rather than plausibly defaulted', () => {
    const f = toFactBase(vardhmanInput);
    expect(f.capital.allotments).toHaveLength(0);
    expect(f.capital.shareholders).toHaveLength(0);
    expect(f.offer.objects).toHaveLength(0);
  });

  it('keeps consistency rules silent on data never collected', () => {
    // CO-001 and CO-002 reconcile allotments and the register against paid-up
    // capital. We never asked for either, so they must not report a mismatch.
    const f = toFactBase(vardhmanInput);
    const fired = evaluate(allRules, f).map((x) => x.ruleId);
    expect(fired).not.toContain('CO-001');
    expect(fired).not.toContain('CO-002');
  });

  it('derives paid-up and authorised capital from face value', () => {
    const f = toFactBase(vardhmanInput);
    expect(f.capital.paidUpCapital).toBe(cr('12'));
    expect(f.capital.authorisedCapital).toBe(cr('20'));
  });
});

describe('verdicts', () => {
  it('passes a clean issuer', () => {
    const r = runPreCheck(vardhmanInput);
    expect(r.eligible).toBe(true);
    expect(r.findings).toHaveLength(0);
    expect(r.postIssueCapital).toBe(cr('16.5'));
  });

  it('agrees with the full engine on the same company', () => {
    // The pre-check must not be more optimistic than the real assessment.
    const preCheckFindings = runPreCheck(vardhmanInput).findings.map((f) => f.ruleId);
    const fullFindings = evaluate(allRules, vardhman).map((f) => f.ruleId);
    for (const id of preCheckFindings) expect(fullFindings).toContain(id);
  });

  it('fails a private limited company, and says how long conversion takes', () => {
    const r = runPreCheck(withInput({ isPublicLimited: false }));
    expect(r.eligible).toBe(false);
    expect(r.findings[0].ruleId).toBe('EL-001');
    expect(r.findings[0].detail).toContain('45 to 60 days');
  });

  it('fails an issuer whose post-issue capital exceeds Rs 25 crore', () => {
    const r = runPreCheck(withInput({ intendedFreshIssueShares: 20000000, authorisedShares: 40000000 }));
    expect(r.eligible).toBe(false);
    expect(r.findings.map((f) => f.ruleId)).toContain('EL-002');
  });

  it('fails an issuer short of the operating profit test', () => {
    const thin = vardhmanInput.years.map((y, i) =>
      i === 0 ? y : { ...y, profitBeforeTax: cr('0.1'), financeCosts: cr('0'), depreciationAndAmortisation: cr('0') },
    );
    const r = runPreCheck(withInput({ years: thin }));
    expect(r.eligible).toBe(false);
    expect(r.findings.map((f) => f.ruleId)).toContain('EL-004');
  });

  it('applies the exchange-specific tests', () => {
    // Leveraged beyond 3:1 fails on BSE and not on NSE
    const levered = vardhmanInput.years.map((y, i) =>
      i === 0 ? { ...y, totalBorrowings: cr('80') } : y,
    );
    expect(runPreCheck(withInput({ years: levered })).findings.map((f) => f.ruleId)).toContain('EL-007');
    expect(
      runPreCheck(withInput({ years: levered, exchange: 'NSE_EMERGE' })).findings.map((f) => f.ruleId),
    ).not.toContain('EL-007');
  });

  it('runs the NSE free cash flow test when cash flow is supplied', () => {
    const withCashFlow = vardhmanInput.years.map((y) => ({
      ...y,
      cashFlowFromOperations: cr('0.1'),
      netPurchaseOfFixedAssets: cr('9'),
      netBorrowings: cr('0'),
      interestPaidNetOfTax: cr('0.5'),
    }));
    const r = runPreCheck(withInput({ exchange: 'NSE_EMERGE', years: withCashFlow }));
    expect(r.findings.map((f) => f.ruleId)).toContain('EL-008');
  });

  it('reports every blocker at once, not just the first', () => {
    // An issuer with three problems should learn all three now, not discover
    // them one at a time over three rounds.
    const r = runPreCheck(
      withInput({
        isPublicLimited: false,
        hasOutstandingConvertibles: true,
        hasPartlyPaidShares: true,
      }),
    );
    const ids = r.findings.map((f) => f.ruleId);
    expect(ids).toContain('EL-001');
    expect(ids).toContain('EL-012');
    expect(ids).toContain('EL-013');
    expect(r.summary.blockers).toBeGreaterThanOrEqual(3);
  });
});

describe('timeline estimate', () => {
  it('is longer for a company that still has to convert', () => {
    const clean = runPreCheck(vardhmanInput).estimatedMonths;
    const unconverted = runPreCheck(withInput({ isPublicLimited: false })).estimatedMonths;
    expect(unconverted).toBeGreaterThan(clean);
  });

  it('does not promise a short timeline while blockers stand', () => {
    const r = runPreCheck(withInput({ hasOutstandingConvertibles: true }));
    expect(r.estimatedMonths).toBeGreaterThan(runPreCheck(vardhmanInput).estimatedMonths);
  });
});
