import { collectPlaceholders, type DocumentNode } from '../document/nodes';
import type { FactBase } from '../facts/schema';
import { consistencyRules } from './consistency';
import { eligibilityRules } from './eligibility';
import { bySeverity, evaluate, summarise, type Finding, type Rule } from './types';

export * from './types';
export { eligibilityRules } from './eligibility';
export { consistencyRules, } from './consistency';
export { operatingProfit, freeCashFlowToEquity } from './eligibility';

/**
 * The rule registry.
 *
 * Eligibility answers "can this issuer list at all", and runs standalone as
 * the pre-check before anyone signs up. Consistency answers "do the numbers
 * agree", and runs on every fact write.
 *
 * Completeness is NOT written by hand. Each section spec declares
 * `requiredFacts`, a missing one renders a placeholder AND raises a gap from
 * the same check, and `completenessFindings` below turns those placeholders
 * into findings. If you find yourself writing a completeness rule, the
 * section's `requiredFacts` is probably what needs fixing instead.
 */
export const allRules: Rule[] = [...eligibilityRules, ...consistencyRules];

/**
 * Rules for the standalone pre-check: the ones a promoter can answer on day
 * one, before engaging a merchant banker or drafting anything.
 */
export const preCheckRules: Rule[] = eligibilityRules.filter((r) => r.preCheck);

/**
 * Turn document placeholders into completeness findings, so the dashboard
 * shows one list rather than making the reader consult two.
 */
export function completenessFindings(nodes: DocumentNode[]): Finding[] {
  const seen = new Set<string>();
  const findings: Finding[] = [];

  for (const p of collectPlaceholders(nodes)) {
    if (seen.has(p.factPath)) continue;
    seen.add(p.factPath);
    findings.push({
      ruleId: `CM-${p.factPath}`,
      clause: 'ICDR Schedule VI Part A',
      title: p.ask,
      severity: 'major',
      category: 'completeness',
      detail: `This is required for the document and has not been provided yet. It currently renders as a highlighted placeholder.`,
      fix: { module: '-', factPath: p.factPath },
    });
  }
  return findings;
}

/**
 * Everything wrong with this issuer, most severe first.
 *
 * The summary counts COMPLETENESS findings alongside rule findings. Reporting
 * a rules-only score beside a longer findings list reads as a contradiction —
 * "100 / 100 ready" above three outstanding items tells the issuer something
 * false, and the number is the first thing they look at.
 */
export function assess(
  facts: FactBase,
  nodes: DocumentNode[] = [],
): { findings: Finding[]; summary: ReturnType<typeof summarise> } {
  const ruleFindings = evaluate(allRules, facts);
  const gaps = completenessFindings(nodes);
  const findings = bySeverity([...ruleFindings, ...gaps]);

  const base = summarise(allRules, facts);

  // Each outstanding gap is one more thing to resolve, so it counts in the
  // denominator as well as the numerator.
  const total = base.passed + findings.length;
  const score =
    base.blockers > 0
      ? Math.min(Math.round((base.passed / total) * 100), 49)
      : total === 0
        ? 100
        : Math.round((base.passed / total) * 100);

  return {
    findings,
    summary: {
      ...base,
      major: base.major + gaps.filter((g) => g.severity === 'major').length,
      minor: base.minor + gaps.filter((g) => g.severity === 'minor').length,
      score,
    },
  };
}
