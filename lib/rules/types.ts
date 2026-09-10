import type { FactPath } from '../facts/provenance';
import type { FactBase } from '../facts/schema';

/**
 * The rule engine.
 *
 * Plain TypeScript predicates in a registry. NEVER prompts — a rule an LLM
 * evaluates is not a rule, it is a suggestion: non-deterministic, uncitable
 * and untestable.
 *
 * Every rule carries a citation into `.claude/context/05-rule-sources.md`.
 * A rule without one does not get written (see the `rule-authoring` skill).
 */

export type Severity =
  /** Cannot file until resolved. The document is legally defective without it. */
  | 'blocker'
  /** Will draw an exchange query. A merchant banker would not certify. */
  | 'major'
  /** Should fix. Does not stop the process. */
  | 'minor';

export type Category =
  /** Can this issuer list on the SME platform at all? */
  | 'eligibility'
  /** Is a mandatory disclosure item missing? */
  | 'completeness'
  /** Do the numbers agree with each other? */
  | 'consistency';

/** Where the issuer goes to fix it. */
export interface Fix {
  /** Intake module, e.g. "M2". */
  module: string;
  /** The specific field, so the UI can jump straight to it. */
  factPath?: FactPath;
  /** Where the fix happens if it is not a form field — "Convert to public limited". */
  action?: string;
}

/**
 * What a rule returns when it fires. The rule's own metadata (id, clause,
 * severity) is merged in by the engine, so a check cannot accidentally report
 * a different clause than the one it is registered under.
 */
export interface CheckResult {
  /**
   * The specifics, with the actual numbers. A first-time issuer needs to see
   * WHY, not be told THAT — show the arithmetic.
   */
  detail: string;
  /** What this holds up: section titles, or a page estimate. */
  blocks?: string[];
  fix?: Fix;
}

export interface Rule {
  id: string;
  /** Row id in 05-rule-sources.md, or a statute reference. */
  clause: string;
  /** Short statement of the requirement, shown as the finding's headline. */
  title: string;
  severity: Severity;
  category: Category;

  /**
   * Whether the rule governs this issuer at all. Skipping it makes the
   * dashboard untrustworthy — a rule firing on an issuer it does not govern
   * teaches the reader to ignore the list.
   *
   * This is also the NOT APPLICABLE / MISSING distinction: a rule that does
   * not apply is silent, not a passing tick and not a gap.
   */
  appliesTo?: (facts: FactBase) => boolean;

  /**
   * D16: SEBI's SME amendments bind on the DRHP filing date, so an issue filed
   * before notification runs under the old regime for its whole life. Shakti
   * Polytarp states 50 allottees where three other 2026 documents state 200.
   *
   * D17 scopes the current build to present-day filings, so these are unset
   * and every rule is treated as current. They exist so the pack can carry
   * more than one vintage without re-auditing every rule later.
   */
  effectiveFrom?: string;
  effectiveTo?: string;

  /**
   * Whether a promoter can answer this from facts they hold on day one,
   * without a merchant banker, an auditor or a drafted document.
   *
   * The standalone pre-check runs only these. Rules about underwriting shares,
   * market maker appointments or the objects of the issue are real eligibility
   * requirements, but asking them before someone has engaged a banker turns a
   * ten-minute check into an interrogation they abandon.
   */
  preCheck?: boolean;

  check: (facts: FactBase) => CheckResult | null;
}

/** A rule that fired, with its metadata attached. */
export interface Finding extends CheckResult {
  ruleId: string;
  clause: string;
  title: string;
  severity: Severity;
  category: Category;
}

export interface EvaluationOptions {
  /**
   * The date the rules are assessed against. Defaults to now. Present so a
   * historical assessment stays explicable once the pack carries vintages.
   */
  asOf?: string;
}

function isInForce(rule: Rule, asOf: string): boolean {
  if (rule.effectiveFrom && asOf < rule.effectiveFrom) return false;
  if (rule.effectiveTo && asOf > rule.effectiveTo) return false;
  return true;
}

/** Run a rule set against a fact base. */
export function evaluate(
  rules: Rule[],
  facts: FactBase,
  options: EvaluationOptions = {},
): Finding[] {
  const asOf = options.asOf ?? new Date().toISOString().slice(0, 10);

  const findings: Finding[] = [];
  for (const rule of rules) {
    if (!isInForce(rule, asOf)) continue;
    if (rule.appliesTo && !rule.appliesTo(facts)) continue;

    const result = rule.check(facts);
    if (!result) continue;

    findings.push({
      ...result,
      ruleId: rule.id,
      clause: rule.clause,
      title: rule.title,
      severity: rule.severity,
      category: rule.category,
    });
  }
  return findings;
}

const SEVERITY_ORDER: Record<Severity, number> = { blocker: 0, major: 1, minor: 2 };

export function bySeverity(findings: Finding[]): Finding[] {
  return findings
    .slice()
    .sort(
      (a, b) =>
        SEVERITY_ORDER[a.severity] - SEVERITY_ORDER[b.severity] ||
        a.ruleId.localeCompare(b.ruleId),
    );
}

export interface ReadinessSummary {
  blockers: number;
  major: number;
  minor: number;
  /** Rules that governed this issuer and did not fire. */
  passed: number;
  /** Rules that did not govern this issuer at all. Not a pass, not a gap. */
  notApplicable: number;
  /** 0-100. Blockers weigh heaviest; a single blocker caps the score. */
  score: number;
}

export function summarise(
  rules: Rule[],
  facts: FactBase,
  options: EvaluationOptions = {},
): ReadinessSummary {
  const asOf = options.asOf ?? new Date().toISOString().slice(0, 10);
  const inForce = rules.filter((r) => isInForce(r, asOf));
  const applicable = inForce.filter((r) => !r.appliesTo || r.appliesTo(facts));
  const findings = evaluate(rules, facts, options);

  const blockers = findings.filter((f) => f.severity === 'blocker').length;
  const major = findings.filter((f) => f.severity === 'major').length;
  const minor = findings.filter((f) => f.severity === 'minor').length;

  /**
   * A single blocker means the issue cannot be filed, so the score is capped
   * below the point where the number could read as "nearly there". An issuer
   * seeing 88/100 with an unresolved blocker has been told something false.
   */
  const clean = applicable.length - findings.length;
  const base = applicable.length === 0 ? 100 : Math.round((clean / applicable.length) * 100);
  const score = blockers > 0 ? Math.min(base, 49) : base;

  return {
    blockers,
    major,
    minor,
    passed: clean,
    notApplicable: inForce.length - applicable.length,
    score,
  };
}
