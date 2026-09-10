import { gapAnchor } from '../anchors';
import { collectGaps, type RenderedSection, type SectionRef } from '../document/section';
import type { FactBase } from '../facts/schema';
import { consistencyRules } from './consistency';
import { eligibilityRules } from './eligibility';
import {
  bySeverity,
  evaluate,
  summarise,
  type Finding,
  type FindingLink,
  type Rule,
} from './types';

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
 *
 * These findings link to the placeholder itself rather than to the top of the
 * section holding it. The gap already renders highlighted in the document; the
 * link is what makes it findable without reading 23 pages to reach it.
 */
export function completenessFindings(sections: RenderedSection[]): Finding[] {
  return collectGaps(sections).map((gap) => ({
    ruleId: `CM-${gap.factPath}`,
    clause: 'ICDR Schedule VI Part A',
    title: gap.ask,
    severity: 'major',
    category: 'completeness',
    detail: `This is required for the document and has not been provided yet. It currently renders as a highlighted placeholder in ${gap.sections.length === 1 ? '1 section' : `${gap.sections.length} sections`}.`,
    blocks: gap.sections.map((s) => s.title),
    // The first occurrence carries the gap's own anchor; later ones can only
    // be reached at section granularity, since one gap has one id.
    links: gap.sections.map((section, i) => ({
      label: section.title,
      anchor: i === 0 ? gapAnchor(gap.factPath) : section.anchor,
    })),
    fix: { module: '-', factPath: gap.factPath },
  }));
}

/** "SECTION - OTHER REGULATORY AND STATUTORY DISCLOSURES" -> the bare title. */
const groupTitle = (group: string) => group.replace(/^SECTION\b[^-]*-\s*/i, '').trim();

/**
 * Resolve each finding's `blocks` titles against what the document actually
 * contains.
 *
 * Rules name sections that mostly do not exist yet — 13 of 37 are built — so
 * this is a partial match by design, and a title that resolves to nothing
 * stays a label. A rule naming a whole numbered section rather than a
 * subsection ("Issue Procedure", "Other Regulatory and Statutory Disclosures")
 * lands on the first subsection under it, which is where a reader following
 * the link would start anyway.
 */
export function linkFindings(findings: Finding[], sections: SectionRef[]): Finding[] {
  const byTitle = new Map<string, SectionRef>();
  const byGroup = new Map<string, SectionRef>();

  for (const section of sections) {
    const title = section.title.toLowerCase();
    if (!byTitle.has(title)) byTitle.set(title, section);
    const group = groupTitle(section.group).toLowerCase();
    if (!byGroup.has(group)) byGroup.set(group, section);
  }

  return findings.map((finding) => {
    if (!finding.blocks || finding.links) return finding;
    const links: FindingLink[] = finding.blocks.map((label) => {
      const key = label.toLowerCase();
      const target = byTitle.get(key) ?? byGroup.get(key);
      return target ? { label, anchor: target.anchor } : { label };
    });
    return { ...finding, links };
  });
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
  sections: RenderedSection[] = [],
): { findings: Finding[]; summary: ReturnType<typeof summarise> } {
  const ruleFindings = evaluate(allRules, facts);
  const gaps = completenessFindings(sections);
  const findings = linkFindings(bySeverity([...ruleFindings, ...gaps]), sections);

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
