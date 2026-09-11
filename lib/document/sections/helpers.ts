import type { DocumentNode, Run } from '../nodes';

/**
 * Node constructors the computed sections share.
 *
 * A computed section is a function from facts to nodes, and most of what it
 * emits is headings, short connecting sentences and tables. The one rule
 * that matters is in `gap`: a missing fact is a highlighted placeholder AND
 * a finding, never an empty cell or a guessed value (MM4).
 */

export const h2 = (text: string): DocumentNode => ({ type: 'heading', level: 2, text });
export const h3 = (text: string): DocumentNode => ({ type: 'heading', level: 3, text });
export const h4 = (text: string): DocumentNode => ({ type: 'heading', level: 4, text });

export const para = (text: string): DocumentNode => ({ type: 'paragraph', runs: [{ text }] });

export const runs = (parts: Run[]): DocumentNode => ({ type: 'paragraph', runs: parts });

export const bullets = (items: string[]): DocumentNode => ({
  type: 'list',
  ordered: false,
  items: items.map((text) => [{ text }]),
});

/** A gap: highlighted in the document, a finding on the dashboard, from one node. */
export const gap = (factPath: string, ask: string, label = `[TO BE PROVIDED: ${ask}]`): DocumentNode => ({
  type: 'paragraph',
  runs: [{ text: label, placeholder: { factPath, ask } }],
});

/** A gap run, to sit inside a sentence. */
export const gapRun = (factPath: string, ask: string, label = `[TO BE PROVIDED: ${ask}]`): Run => ({
  text: label,
  placeholder: { factPath, ask },
});

export function table(
  headers: string[],
  rows: string[][],
  options: { caption?: string; numericColumns?: number[]; footnotes?: string[] } = {},
): DocumentNode {
  return { type: 'table', headers, rows, ...options };
}

/** "Nil" as the corpus prints an empty heading. */
export const nil = (): DocumentNode => para('Nil');
