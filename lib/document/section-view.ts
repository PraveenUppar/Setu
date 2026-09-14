import type { DocumentNode, Run } from './nodes';

/**
 * The client-safe half of `section.ts` (D-design, same reasoning as D70's
 * `lib/rules/index.ts` split): `document-view.tsx` and `document-pager.tsx`
 * are 'use client' and need `RenderedSection`/`gapAnchorKeys`/`runKey`
 * without dragging in `section.ts`'s server-only top-level imports
 * (`readNarrative`, `node:fs`) — importing ANY runtime export from a module
 * pulls in that module's whole import graph, types alone are erased but a
 * real function like `gapAnchorKeys` is not. `section.ts` re-exports these
 * so every existing server-side caller is unaffected.
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

export function flattenSections(sections: RenderedSection[]): DocumentNode[] {
  return sections.flatMap((section) => section.nodes);
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
