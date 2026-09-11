/**
 * Column specs for the repeater, kept separate from the component.
 *
 * A module spec is data and lives on the server; the repeater is a client
 * component. Defining the columns here lets a module declare its tables
 * without the module registry importing React, and lets the page hand plain
 * data across the boundary — the same split that FieldView makes for ordinary
 * fields.
 */
export interface RepeaterColumn {
  key: string;
  label: string;
  /**
   * What the cell holds, and therefore what the parser stores:
   *
   *   text     a string
   *   number   a JS number — share counts, percentages, years. Empty stays
   *            undefined, never zero.
   *   money    a DECIMAL STRING in rupees, the fact base's Money type. Typing
   *            "10" stores "10", not 10 — a number here fails the zMoney
   *            schema and, worse, would have floats doing rupee arithmetic.
   *   date     an ISO date string
   *   select   one of `options`, stored as its value
   *   boolean  true or false, shown as a Yes/No select. Empty is undefined.
   *   list     a string[] — other directorships, committee members — typed
   *            and pasted as one cell, separated by semicolons.
   */
  type: 'text' | 'number' | 'money' | 'date' | 'select' | 'boolean' | 'list';
  options?: { value: string; label: string }[];
  /** Show a running total under this column. */
  total?: boolean;
  width?: string;
  placeholder?: string;
}

/** The separator a `list` cell uses in both directions. */
export const LIST_SEPARATOR = ';';

/** Turn a typed or pasted cell into the value the fact base stores. */
export function parseCell(column: RepeaterColumn, raw: string): unknown {
  const trimmed = raw.trim();
  switch (column.type) {
    case 'number': {
      // Spreadsheets export "1,08,00,000". Number() on that is NaN.
      const n = Number(trimmed.replace(/,/g, ''));
      // An empty numeric cell stays empty. Zero would say "issued at nil
      // value", which is a different statement from "not applicable".
      return trimmed === '' || Number.isNaN(n) ? undefined : n;
    }
    case 'money': {
      const cleaned = trimmed.replace(/[,\s]/g, '').replace(/^Rs\.?/i, '');
      if (cleaned === '') return undefined;
      // Keep it a string; only reject what could never be an amount
      return /^-?\d+(\.\d+)?$/.test(cleaned) ? cleaned : trimmed;
    }
    case 'boolean': {
      if (trimmed === '') return undefined;
      if (/^(true|yes|y|1)$/i.test(trimmed)) return true;
      if (/^(false|no|n|0)$/i.test(trimmed)) return false;
      return undefined;
    }
    case 'list':
      return trimmed === ''
        ? []
        : trimmed
            .split(LIST_SEPARATOR)
            .map((s) => s.trim())
            .filter((s) => s !== '');
    default:
      // An empty text or date cell is absent, not "". An optional DIN left
      // blank must not fail the DIN pattern as a wrong answer.
      return trimmed === '' ? undefined : trimmed;
  }
}

/** The reverse: a stored value as the text shown in the cell. */
export function formatCell(column: RepeaterColumn, value: unknown): string {
  if (value === undefined || value === null) return '';
  if (column.type === 'list') return Array.isArray(value) ? value.join(`${LIST_SEPARATOR} `) : String(value);
  if (column.type === 'boolean') return value === true ? 'true' : value === false ? 'false' : '';
  return String(value);
}
