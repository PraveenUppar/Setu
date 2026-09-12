import { readNarrative } from '../../store/narrative-store';
import type { FactBase } from '../../facts/schema';
import type { DocumentNode } from '../nodes';
import type { RenderContext, SectionSpec } from '../section';
import { gap, h2, para } from './helpers';

/**
 * INDUSTRY OVERVIEW — section map #14, the last of S9's two originally-
 * blocked sections (D54's note). Deliberately NOT unblocked with a new
 * intake question the way Basis for Issue Price was: a real Industry
 * Overview chapter states market size, growth rate and competitive
 * dynamics from a COMMISSIONED report (CRISIL, CARE, D&B or equivalent) —
 * TODO.md's own out-of-scope list says so, and inventing a question asking
 * an SME issuer to self-report an addressable-market figure would be asking
 * them to state something they typically do not know and cannot honestly
 * answer without commissioning exactly that report. MM4 (never invent)
 * applies to what we ASK for, not only what we draft.
 *
 * What this section legitimately can draft, from facts already on file
 * (`company.sector`, `company.businessDescription`, `business.productLines`,
 * `business.primaryMarketDescription`): a short, plainly-scoped paragraph
 * naming the sector the issuer operates in and what it makes, in the same
 * restrained register `Our Business` already uses (D51) — no market size,
 * no growth rate, no competitive claim the factSlice cannot support.
 *
 * The standing gap is not a byproduct of missing facts, the way every other
 * gap in this document is — it is permanent by design, exactly matching the
 * TODO.md checklist's own framing ("marked 'draft — to be replaced by
 * commissioned report'"). It stays even once every other fact here is
 * filled in, because no fact this app collects can ever satisfy it.
 */

function industryFactSlice(facts: FactBase) {
  return {
    companyName: facts.company.name,
    sector: facts.company.sector,
    businessDescription: facts.company.businessDescription,
    productLines: facts.business.productLines ?? null,
    primaryMarketDescription: facts.business.primaryMarketDescription ?? null,
  };
}

export const industryOverview: SectionSpec = {
  id: 'aboutCompany.industryOverview',
  partOf: '14. Industry Overview',
  title: 'Industry Overview',
  producer: 'computed',
  // 2300, immediately before Our Business (2350) — real prospectuses open the
  // "About the Company" chapter with Industry Overview. Placing it anywhere
  // else in the order breaks the group into two non-contiguous runs, which
  // the DOCX renderer reads as a second "SECTION - ABOUT THE COMPANY" page
  // break (`body()` in docx.ts opens a new Heading 1 on every group CHANGE
  // between consecutive sections, not once per unique group name) — caught
  // by docx.test.ts's heading-count assertion, not by inspection.
  order: 2300,
  group: 'SECTION - ABOUT THE COMPANY',
  clause: 'ICDR Schedule VI Part A',
  compute: ({ facts }: RenderContext): DocumentNode[] => {
    const nodes: DocumentNode[] = [
      h2('Industry Overview'),
      {
        type: 'paragraph',
        runs: [
          {
            text:
              'This section is a PRELIMINARY DRAFT, scoped to the facts on file for this issuer. A real Industry ' +
              'Overview chapter — market size, growth rate, competitive landscape and demand drivers — is normally ' +
              'sourced from a commissioned report (for example CRISIL, CARE or D&B) and MUST replace this draft ' +
              'before the document is filed.',
            italic: true,
          },
        ],
      },
    ];

    const slice = industryFactSlice(facts);
    const drafted = readNarrative(industryOverview.id, slice);
    nodes.push(
      para(
        drafted?.text ??
          `${facts.company.name} operates in the ${facts.company.sector} sector. ${facts.company.businessDescription}`,
      ),
    );

    nodes.push(
      gap(
        'aboutCompany.industryOverview.commissionedReport',
        'A commissioned industry report (market size, growth rate, competitive landscape and demand drivers) to replace this preliminary draft',
      ),
    );

    return nodes;
  },
};
