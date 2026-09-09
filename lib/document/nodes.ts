/**
 * The document AST.
 *
 * Every producer — template engine, computed sections, LLM drafting harness —
 * emits `DocumentNode[]`. Two renderers consume it: `renderHtml` for the
 * in-app preview and `renderDocx` for the deliverable.
 *
 * Do NOT generate HTML and DOCX separately. They drift, and reconciling a
 * 280-page document afterwards costs more than the engine did.
 */

/**
 * A missing fact renders INLINE as a placeholder rather than breaking the
 * sentence around it, so the surrounding prose still reads and the reader can
 * see exactly what is needed and where.
 */
export interface Placeholder {
  /** Fact path that was missing, e.g. "company.website". */
  factPath: string;
  /** Plain-English ask shown to the issuer: "Company website URL". */
  ask: string;
}

export interface Run {
  text: string;
  bold?: boolean;
  italic?: boolean;
  /** When set, `text` is the fallback label and this run is a gap. */
  placeholder?: Placeholder;
}

export type DocumentNode =
  | { type: 'heading'; level: 1 | 2 | 3 | 4; text: string; anchor?: string }
  | { type: 'paragraph'; runs: Run[] }
  | { type: 'list'; ordered: boolean; items: Run[][] }
  | {
      type: 'table';
      caption?: string;
      headers: string[];
      rows: string[][];
      /** Right-align numeric columns, by index. */
      numericColumns?: number[];
      /** Rendered as a note beneath the table. */
      footnotes?: string[];
    }
  | { type: 'toc' }
  | { type: 'pageBreak' };

export const text = (value: string): Run[] => [{ text: value }];

export function paragraph(runs: Run[] | string): DocumentNode {
  return { type: 'paragraph', runs: typeof runs === 'string' ? text(runs) : runs };
}

export function heading(level: 1 | 2 | 3 | 4, value: string, anchor?: string): DocumentNode {
  return { type: 'heading', level, text: value, anchor };
}

/** Every placeholder in a node tree — the bridge from document to gap list. */
export function collectPlaceholders(nodes: DocumentNode[]): Placeholder[] {
  const found: Placeholder[] = [];

  const fromRuns = (runs: Run[]) => {
    for (const run of runs) if (run.placeholder) found.push(run.placeholder);
  };

  for (const node of nodes) {
    if (node.type === 'paragraph') fromRuns(node.runs);
    else if (node.type === 'list') node.items.forEach(fromRuns);
  }
  return found;
}

/** Rough page estimate for the progress indicator. Not for pagination. */
export function estimatePages(nodes: DocumentNode[]): number {
  let lines = 0;
  for (const node of nodes) {
    switch (node.type) {
      case 'heading':
        lines += 3;
        break;
      case 'paragraph':
        lines += Math.ceil(node.runs.reduce((n, r) => n + r.text.length, 0) / 95) + 1;
        break;
      case 'list':
        lines += node.items.length + 1;
        break;
      case 'table':
        lines += node.rows.length + 4;
        break;
      case 'pageBreak':
        lines += 46;
        break;
    }
  }
  return Math.max(1, Math.ceil(lines / 46));
}
