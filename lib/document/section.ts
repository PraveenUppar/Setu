import Decimal from 'decimal.js';
import { sectionAnchor } from '../anchors';
import type { FactPath, ProvenanceMap } from '../facts/provenance';
import type { FactBase } from '../facts/schema';
import { collectPlaceholders, type DocumentNode, type Placeholder, type Run } from './nodes';
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
   * The numbered subsection from 07-section-map.md that this spec is part of.
   *
   * The registry's atomic unit is finer than the map's: Issue Procedure is ONE
   * of the 37 numbered subsections and sixteen entries here. Counting registry
   * entries against 37 therefore overstates progress roughly fourfold, which
   * is why the progress indicator counts distinct values of this field
   * instead. Same reasoning as the readiness score in D22 — a number the
   * reader trusts must not flatter.
   */
  partOf: string;

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

/**
 * The regional newspaper must be in the language of the state where the
 * registered office is situated, and the offer document says so explicitly —
 * "Marathi being the regional language of Maharashtra, where our Registered
 * Office is located". Derived rather than asked, since it follows from the
 * address we already have.
 */
const REGIONAL_LANGUAGE: Record<string, string> = {
  'Andhra Pradesh': 'Telugu',
  Assam: 'Assamese',
  Bihar: 'Hindi',
  Chhattisgarh: 'Hindi',
  Delhi: 'Hindi',
  Goa: 'Konkani',
  Gujarat: 'Gujarati',
  Haryana: 'Hindi',
  'Himachal Pradesh': 'Hindi',
  Jharkhand: 'Hindi',
  Karnataka: 'Kannada',
  Kerala: 'Malayalam',
  'Madhya Pradesh': 'Hindi',
  Maharashtra: 'Marathi',
  Odisha: 'Odia',
  Punjab: 'Punjabi',
  Rajasthan: 'Hindi',
  'Tamil Nadu': 'Tamil',
  Telangana: 'Telugu',
  'Uttar Pradesh': 'Hindi',
  Uttarakhand: 'Hindi',
  'West Bengal': 'Bengali',
};

/** Words and figures that vary by issuer, injected into every template as `terms`. */
export function derivedTerms(facts: FactBase) {
  const documentName = {
    DRHP: 'Draft Red Herring Prospectus',
    RHP: 'Red Herring Prospectus',
    PROSPECTUS: 'Prospectus',
  }[facts.offer.documentStage];

  const issueWord = facts.offer.terminology === 'ISSUE' ? 'Issue' : 'Offer';

  const offeredShares =
    facts.offer.freshIssueShares +
    facts.offer.sellingShareholders.reduce((sum, s) => sum + s.sharesOffered, 0);
  const postIssueShares = facts.capital.paidUpShares + facts.offer.freshIssueShares;

  /**
   * Rule 19(2)(b) SCRR read with Reg 252 requires the issue to be at least 25%
   * of post-issue paid-up capital (R-023). Corpus documents leave this blank as
   * "[dot]%" because it is only fixed at pricing — we can compute it from the
   * intended issue, which is more useful to the issuer than a blank.
   */
  const issuePercent = new Decimal(offeredShares).dividedBy(postIssueShares).times(100);

  /**
   * R-001: which limb of Reg 229 the issuer qualifies under depends on
   * post-issue paid-up capital. 229(1) up to Rs 10 crore, 229(2) above that and
   * up to Rs 25 crore. Held-out verification against Century Business Media
   * caught this — it cites 229(1) where Om Galaxy and Maxwell cite 229(2), and
   * a hardcoded template would have stated the wrong regulation for any issuer
   * under Rs 10 crore.
   */
  const postIssueCapital = new Decimal(facts.capital.faceValue).times(postIssueShares);
  const TEN_CRORE = new Decimal(100000000);
  const eligibilityRegulation = postIssueCapital.greaterThan(TEN_CRORE)
    ? 'Regulation 229(2)'
    : 'Regulation 229(1)';

  const state = facts.company.registeredOffice.state;
  const regionalLanguage = REGIONAL_LANGUAGE[state] ?? 'the regional language';

  /**
   * Net issue IS deterministic: the issue less the market maker reservation.
   *
   * The QIB / NII / Individual SHARE COUNTS ARE NOT, and must not be computed.
   * Tested against Om Galaxy's published table and no rule reproduces it. Its
   * net issue of 1,10,83,200 splits as QIB 55,37,600 / NII 16,64,000 /
   * Individual 38,81,600 — that is 49.96% / 15.01% / 35.02%, with QIB sitting
   * 2.5 lots BELOW an exact 50% and Individual 1.5 lots above. Ceiling,
   * flooring and rounding to the lot were each tried and each missed.
   *
   * The figures are a discretionary judgement made by the merchant banker at
   * pricing, within the "not more than 50%" and "not less than 15% / 35%"
   * bounds of R-024. Deriving them would produce numbers that look right and
   * are wrong, in an allotment table. The percentages are stated; the counts
   * are a gap for the banker to supply.
   */
  const marketMakerShares = facts.offer.marketMakerReservationShares ?? 0;
  const netIssueShares = facts.offer.freshIssueShares - marketMakerShares;

  const percentOfIssue = (n: number) =>
    facts.offer.freshIssueShares === 0
      ? '0.00'
      : new Decimal(n).dividedBy(facts.offer.freshIssueShares).times(100).toFixed(2);

  return {
    documentName,
    issueWord,

    marketMakerShares,
    netIssueShares,
    /** Minimum bid is two lots (R-006), alongside the Rs 2,00,000 floor. */
    minimumBidShares: facts.offer.lotSize * 2,
    marketMakerPercentOfIssue: percentOfIssue(marketMakerShares),
    netIssuePercentOfPostIssueCapital: new Decimal(netIssueShares)
      .dividedBy(facts.capital.paidUpShares + facts.offer.freshIssueShares)
      .times(100)
      .toFixed(2),
    issueWordLower: issueWord.toLowerCase(),
    exchangeName: facts.offer.exchange === 'BSE_SME' ? 'BSE SME' : 'NSE Emerge',
    isBSE: facts.offer.exchange === 'BSE_SME',
    /**
     * Lender NOCs are only relevant where there are secured borrowings, so the
     * subsection is conditional rather than always printed. Read off the most
     * recent financial year.
     */
    hasSecuredBorrowings:
      facts.financials.years.length > 0 &&
      new Decimal(facts.financials.years[0].totalBorrowings).greaterThan(0),
    exchangeLongName:
      facts.offer.exchange === 'BSE_SME'
        ? 'the SME Platform of BSE Limited'
        : 'the Emerge Platform of National Stock Exchange of India Limited',
    designatedStockExchange:
      facts.offer.exchange === 'BSE_SME'
        ? 'BSE Limited'
        : 'National Stock Exchange of India Limited',
    depositoryShort: facts.offer.exchange === 'BSE_SME' ? 'BSE' : 'NSE',

    registeredOfficeState: state,
    regionalLanguage,
    /**
     * In Hindi-speaking states the parenthetical "Hindi being the regional
     * language of Bihar" reads oddly straight after naming a Hindi national
     * daily, and real documents drop it — Century Business Media (Patna) names
     * its regional paper without the gloss, where Om Galaxy (Maharashtra) and
     * Maxwell (Gujarat) both include it.
     */
    regionalLanguageIsHindi: regionalLanguage === 'Hindi',

    offeredShares,
    postIssueShares,
    postIssueCapital: postIssueCapital.toFixed(),
    issuePercentOfPostIssueCapital: issuePercent.toFixed(2),
    meetsMinimumIssuePercent: issuePercent.greaterThanOrEqualTo(25),
    eligibilityRegulation,
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

/**
 * One section's output, with the identity it needs to be linked TO.
 *
 * The flat `DocumentNode[]` is what the renderers consume, but a finding that
 * says "this holds up Issue Structure" has to be able to point somewhere, and
 * once the tree is flattened there is nothing left to point at. Keeping the
 * section boundary is what makes the gap list navigable rather than a list of
 * complaints about a document the reader then has to search by hand.
 */
export interface SectionRef {
  id: string;
  title: string;
  group: string;
  /** The numbered subsection from the section map this belongs to. */
  partOf: string;
  /** DOM id now, DOCX bookmark later. */
  anchor: string;
}

export interface RenderedSection extends SectionRef {
  nodes: DocumentNode[];
}

/** Render an ordered set of sections, keeping the section boundaries. */
export function renderSections(specs: SectionSpec[], ctx: RenderContext): RenderedSection[] {
  return specs
    .slice()
    .sort((a, b) => a.order - b.order)
    .map((spec) => ({
      id: spec.id,
      title: spec.title,
      group: spec.group,
      partOf: spec.partOf,
      anchor: sectionAnchor(spec.id),
      nodes: renderSection(spec, ctx),
    }))
    /**
     * A section switched off by `appliesIf` produces nothing, and must not
     * appear in the outline either — a "Holds up" link that scrolls nowhere is
     * worse than plain text, because the reader assumes they missed it.
     */
    .filter((section) => section.nodes.length > 0);
}

/** Render an ordered set of sections into one document. */
export function renderDocument(specs: SectionSpec[], ctx: RenderContext): DocumentNode[] {
  return flattenSections(renderSections(specs, ctx));
}

export function flattenSections(sections: RenderedSection[]): DocumentNode[] {
  return sections.flatMap((section) => section.nodes);
}

/** A placeholder together with every section that renders it. */
export interface Gap extends Placeholder {
  /** In document order. The first is where the gap's anchor sits. */
  sections: SectionRef[];
}

/**
 * Every gap in the document, deduplicated by fact path.
 *
 * One missing fact can surface in several sections — the registrar's address
 * appears in Definitions, General Information and Terms of the Issue — and it
 * is one thing to provide, so it is one finding that names all of them.
 */
export function collectGaps(sections: RenderedSection[]): Gap[] {
  const byPath = new Map<string, Gap>();

  for (const section of sections) {
    const ref: SectionRef = {
      id: section.id,
      title: section.title,
      group: section.group,
      partOf: section.partOf,
      anchor: section.anchor,
    };
    for (const placeholder of collectPlaceholders(section.nodes)) {
      const existing = byPath.get(placeholder.factPath);
      if (!existing) {
        byPath.set(placeholder.factPath, { ...placeholder, sections: [ref] });
      } else if (!existing.sections.some((s) => s.id === ref.id)) {
        existing.sections.push(ref);
      }
    }
  }
  return [...byPath.values()];
}

/**
 * Address of a single run within a rendered document: section, node, then the
 * list item where there is one, then the run.
 *
 * The renderer and `gapAnchorKeys` must agree on this exactly, which is why
 * neither builds the string itself.
 */
export const runKey = (...parts: number[]): string => parts.join('.');

/**
 * Which run carries each gap's anchor: the FIRST occurrence of that fact path
 * in the document.
 *
 * A gap repeated in nine places must still have exactly one id, or the
 * document emits duplicate DOM ids and the browser jumps to whichever it
 * happens to find first.
 */
export function gapAnchorKeys(sections: RenderedSection[]): Map<string, string> {
  const anchored = new Map<string, string>();
  const seen = new Set<string>();

  const scan = (runs: Run[], prefix: number[]) => {
    runs.forEach((run, r) => {
      const path = run.placeholder?.factPath;
      if (!path || seen.has(path)) return;
      seen.add(path);
      anchored.set(runKey(...prefix, r), path);
    });
  };

  sections.forEach((section, s) =>
    section.nodes.forEach((node, n) => {
      if (node.type === 'paragraph') scan(node.runs, [s, n]);
      else if (node.type === 'list') node.items.forEach((item, i) => scan(item, [s, n, i]));
    }),
  );
  return anchored;
}
