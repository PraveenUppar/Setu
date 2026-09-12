import { consistencyRules } from './consistency';
import { eligibilityRules } from './eligibility';
import { type Rule } from './types';

export * from './types';
export { eligibilityRules } from './eligibility';
export { consistencyRules, } from './consistency';
export { operatingProfit, freeCashFlowToEquity } from './eligibility';

/**
 * D70 — this file must stay safe for a CLIENT component to import
 * (`app/eligibility/page.tsx`, the standalone pre-check). It must never
 * import `lib/document/section.ts` or anything that reaches it — that
 * module pulls in `lib/store/narrative-store.ts`'s `node:fs` usage, which a
 * browser bundle cannot include at all. `completenessFindings`,
 * `linkFindings` and `assess` all need the rendered document, so they live
 * in `./document-assess`, a server-only sibling — see that file's own
 * comment for the exact bug this split fixes.
 *
 * The rule registry.
 *
 * Eligibility answers "can this issuer list at all", and runs standalone as
 * the pre-check before anyone signs up. Consistency answers "do the numbers
 * agree", and runs on every fact write.
 *
 * Completeness is NOT written by hand. Each section spec declares
 * `requiredFacts`, a missing one renders a placeholder AND raises a gap from
 * the same check, and `completenessFindings` (in `./document-assess`) turns
 * those placeholders into findings. If you find yourself writing a
 * completeness rule, the section's `requiredFacts` is probably what needs
 * fixing instead.
 */
export const allRules: Rule[] = [...eligibilityRules, ...consistencyRules];

/**
 * Rules for the standalone pre-check: the ones a promoter can answer on day
 * one, before engaging a merchant banker or drafting anything.
 */
export const preCheckRules: Rule[] = eligibilityRules.filter((r) => r.preCheck);
