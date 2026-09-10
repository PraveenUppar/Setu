import type { RepeaterColumn } from './repeater-spec';

/**
 * Spreadsheet paste, parsed.
 *
 * Pure logic, deliberately kept out of the repeater component: it is the
 * highest-risk part of the whole intake — nobody types an allotment history,
 * it arrives from Excel — and a silent misparse corrupts the build-up while
 * producing rows that look entirely plausible. Testing it needs no React and
 * no server action.
 */

/** A blank row shaped by the columns, so every row has every key. */
export const blankRow = (columns: RepeaterColumn[]): Record<string, unknown> =>
  Object.fromEntries(columns.map((c) => [c.key, c.type === 'number' ? undefined : '']));

/**
 * Tab-separated text from a spreadsheet, into rows.
 *
 * Excel and Sheets both put tabs between cells and newlines between rows on
 * the clipboard. A single cell with no tab is an ordinary paste and returns
 * null — otherwise pasting a company name into a text cell would create rows.
 */
export function parsePaste(
  text: string,
  columns: RepeaterColumn[],
): Record<string, unknown>[] | null {
  const lines = text.replace(/\r/g, '').split('\n').filter((l) => l.trim() !== '');
  if (lines.length === 0) return null;
  if (lines.length === 1 && !lines[0].includes('\t')) return null;

  return lines.map((line) => {
    const cells = line.split('\t');
    const row = blankRow(columns);
    // Iterate the COLUMNS, not the cells: a short row must leave the trailing
    // fields empty rather than sliding values leftward into the wrong ones.
    columns.forEach((c, i) => {
      const raw = (cells[i] ?? '').trim();
      if (c.type === 'number') {
        // Spreadsheets export "1,08,00,000". Number() on that is NaN.
        const n = Number(raw.replace(/,/g, ''));
        // An empty numeric cell stays empty. Zero would say "issued at nil
        // value", which is a different statement from "not applicable".
        row[c.key] = raw === '' || Number.isNaN(n) ? undefined : n;
      } else {
        row[c.key] = raw;
      }
    });
    return row;
  });
}

/**
 * Apply a pasted block at a row index, the way a spreadsheet does.
 *
 * Pasting N rows at row i OVERWRITES rows i through i+N-1 and leaves anything
 * beyond intact. Splicing them in instead — keeping every existing row and
 * inserting the new ones — is the obvious implementation and it is wrong: an
 * issuer pasting their full allotment history over a partly typed list gets
 * every row twice, and the cumulative total silently doubles.
 *
 * The running total under the column is what makes that visible, but a
 * mistake the issuer has to notice is worse than one that cannot happen.
 */
export function applyPaste(
  rows: Record<string, unknown>[],
  at: number,
  pasted: Record<string, unknown>[],
): Record<string, unknown>[] {
  return [...rows.slice(0, at), ...pasted, ...rows.slice(at + pasted.length)];
}
