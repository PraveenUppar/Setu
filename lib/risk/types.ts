import type { FactBase } from '../facts/schema';

/**
 * The risk archetype engine (S10).
 *
 * Same shape as the rule engine (`lib/rules/types.ts`) for the same reason:
 * plain TypeScript predicates in a registry, never prompts. What differs is
 * the output — a rule reports a defect to fix; an archetype identifies a risk
 * SELECTION, and the prose that describes it is written once the drafting
 * harness exists (D43). Until then `detail()` is what the reader sees.
 *
 * Deviates from 02-architecture.md's original sketch in one place:
 * `fallbackTemplate: string` there becomes `detail: (facts) => string` here.
 * A static template cannot "show the arithmetic" the way `Rule.check`'s
 * `detail` already does (customer concentration's real 61.3%, not a
 * placeholder) — same reasoning as D18 rejecting the obvious `Fact<T>`
 * wrapper. See D44.
 */

export type RiskCategory = 'business' | 'financial' | 'legal' | 'promoter' | 'industry' | 'offer';

export interface RiskArchetype {
  id: string;
  category: RiskCategory;
  /** Short label, shown as the finding's headline. */
  title: string;

  /** Whether this issuer's facts raise the risk at all. */
  trigger: (facts: FactBase) => boolean;

  /**
   * How material the risk is, for sorting within the selected set. Only
   * called where `trigger` is true. Units vary by archetype — a percentage,
   * a multiple, a rupee figure — because risks are ranked within themselves,
   * never compared across archetypes on one absolute scale.
   */
  materiality: (facts: FactBase) => number;

  /**
   * "Why this fired," with the issuer's own numbers. Shown today, in place of
   * drafted prose; feeds the LLM as grounding once S10's harness writes the
   * bespoke paragraph. Only called where `trigger` is true.
   */
  detail: (facts: FactBase) => string;

  /**
   * All the LLM may reference when it drafts this risk's prose (S10). Never
   * the whole fact base — same constraint as S9's narrative sections. Only
   * called where `trigger` is true.
   */
  factSlice: (facts: FactBase) => object;
}

/** One archetype that fired, with its metadata resolved — what the dashboard and the harness both consume. */
export interface TriggeredRisk {
  id: string;
  category: RiskCategory;
  title: string;
  materiality: number;
  detail: string;
  factSlice: object;
}

/** Every archetype that fires for this issuer, most material first. */
export function selectRisks(archetypes: RiskArchetype[], facts: FactBase): TriggeredRisk[] {
  return archetypes
    .filter((a) => a.trigger(facts))
    .map((a) => ({
      id: a.id,
      category: a.category,
      title: a.title,
      materiality: a.materiality(facts),
      detail: a.detail(facts),
      factSlice: a.factSlice(facts),
    }))
    .sort((a, b) => b.materiality - a.materiality);
}
