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

  /**
   * D59 — the "why this was flagged" gate (TODO.md's S10 checklist). What
   * corpus evidence justifies this archetype existing at all, in one
   * reader-facing sentence — the same fact every archetype's own file comment
   * already states in prose (D44 onward), promoted to a real field so the
   * review page can show it without a human reading the source file. Not a
   * SEBI clause (a risk factor is a disclosure judgement, not a regulatory
   * requirement — there is no `Rule.clause` equivalent here), so this states
   * corpus corroboration instead: which documents carry the same theme.
   */
  groundedIn: string;

  /**
   * D59: which intake module(s) the trigger and factSlice actually read, so
   * a reviewer questioning why a risk fired knows where to go verify or
   * correct the underlying fact — the same "where to fix" a rule's `Finding`
   * already gives (`lib/rules/types.ts`'s `fix.module`), extended to risks.
   * Module ids only ('M5'), not fact paths — an archetype often reads several
   * fields from one module, and a reviewer navigates by module first.
   */
  sourceModules: string[];
}

/** One archetype that fired, with its metadata resolved — what the dashboard and the harness both consume. */
export interface TriggeredRisk {
  id: string;
  category: RiskCategory;
  title: string;
  materiality: number;
  detail: string;
  factSlice: object;
  groundedIn: string;
  sourceModules: string[];
  /** 1-based position in the materiality-sorted list this risk was selected into — D59, review-page-only, never printed in the document itself. */
  materialityRank: number;
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
      groundedIn: a.groundedIn,
      sourceModules: a.sourceModules,
      materialityRank: 0, // resolved below, once the full set is sorted
    }))
    .sort((a, b) => b.materiality - a.materiality)
    .map((risk, i) => ({ ...risk, materialityRank: i + 1 }));
}
