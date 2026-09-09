import type { FactPath, ProvenanceMap } from '../facts/provenance';
import type { FactBase } from '../facts/schema';
import type { DocumentNode } from './nodes';
import { renderTemplate } from './template';

/**
 * A section is DATA, not code (MM2). One engine renders the registry.
 *
 * The atomic unit is the SUBSECTION, not the numbered top-level SECTION.
 * Across five real prospectuses the subsection list and its order are
 * essentially identical, while the grouping into numbered sections is a
 * merchant-banker presentation choice that varies document to document.
 * See 07-section-map.md, Finding 1.
 */

export type Producer = 'template' | 'computed' | 'narrative' | 'external';

export interface RenderContext {
  facts: FactBase;
  provenance?: ProvenanceMap;
}

export interface SectionSpec {
  /** Stable id, e.g. "general.forwardLookingStatements". */
  id: string;
  title: string;

  /**
   * How this subsection is produced. Getting this wrong is the most expensive
   * mistake available — drafting Offer Procedure with an LLM would yield 30
   * pages of plausible, uncitable, legally defective text.
   */
  producer: Producer;

  /** Order within the document. Sparse so subsections can be inserted later. */
  order: number;

  /** Which numbered SECTION this subsection is presented under. */
  group: string;

  /**
   * Book-built vs fixed price, exchange, sector. Keep branch points even where
   * only one branch is built, so the other can be added without restructuring.
   */
  appliesIf?: (facts: FactBase) => boolean;

  /** Missing ones render as placeholders and raise gaps — one check, both outputs. */
  requiredFacts?: FactPath[];

  /** Better wording for "[TO BE PROVIDED: ...]", keyed by fact path. */
  asks?: Record<FactPath, string>;

  /** Citation from 05-rule-sources.md, or the Schedule VI paragraph. */
  clause?: string;

  /** Where the template text came from, so it can be re-verified. */
  extractedFrom?: string[];

  /** Exactly one of the following, matching `producer`. */
  template?: string;
  compute?: (ctx: RenderContext) => DocumentNode[];
  externalNote?: string;
}

/** Words that vary by document stage and house style, injected into every template. */
export function derivedTerms(facts: FactBase) {
  const documentName = {
    DRHP: 'Draft Red Herring Prospectus',
    RHP: 'Red Herring Prospectus',
    PROSPECTUS: 'Prospectus',
  }[facts.offer.documentStage];

  const issueWord = facts.offer.terminology === 'ISSUE' ? 'Issue' : 'Offer';

  return {
    documentName,
    issueWord,
    issueWordLower: issueWord.toLowerCase(),
    exchangeName: facts.offer.exchange === 'BSE_SME' ? 'BSE SME' : 'NSE Emerge',
    exchangeLongName:
      facts.offer.exchange === 'BSE_SME'
        ? 'the SME Platform of BSE Limited'
        : 'the Emerge Platform of National Stock Exchange of India Limited',
  };
}

export function renderSection(spec: SectionSpec, ctx: RenderContext): DocumentNode[] {
  if (spec.appliesIf && !spec.appliesIf(ctx.facts)) return [];

  switch (spec.producer) {
    case 'template': {
      if (!spec.template) throw new Error(`Section "${spec.id}" is a template but has none`);
      return renderTemplate(spec.template, {
        // `terms` is a computed overlay the templates can read alongside facts
        facts: { ...ctx.facts, terms: derivedTerms(ctx.facts) },
        provenance: ctx.provenance,
        asks: spec.asks,
      });
    }

    case 'computed': {
      if (!spec.compute) throw new Error(`Section "${spec.id}" is computed but has no compute()`);
      return spec.compute(ctx);
    }

    case 'narrative':
      // S9. Until the drafting harness exists, show the gap rather than nothing.
      return [
        {
          type: 'paragraph',
          runs: [
            {
              text: `[TO BE DRAFTED: ${spec.title}]`,
              placeholder: { factPath: spec.id, ask: `${spec.title} narrative` },
            },
          ],
        },
      ];

    case 'external':
      return [
        { type: 'heading', level: 3, text: spec.title },
        {
          type: 'paragraph',
          runs: [
            {
              text: `[TO BE PROVIDED: ${spec.externalNote ?? spec.title}]`,
              placeholder: {
                factPath: spec.id,
                ask: spec.externalNote ?? spec.title,
              },
            },
          ],
        },
      ];
  }
}

/** Render an ordered set of sections into one document. */
export function renderDocument(specs: SectionSpec[], ctx: RenderContext): DocumentNode[] {
  return specs
    .slice()
    .sort((a, b) => a.order - b.order)
    .flatMap((spec) => renderSection(spec, ctx));
}
