import { describe, it, expect } from 'vitest';
import { applyPaste, parsePaste } from './paste';
import { ALLOTMENT_COLUMNS, SHAREHOLDER_COLUMNS } from './m2-capital';

/**
 * Paste-from-spreadsheet is the highest-risk part of the repeater.
 *
 * Nobody types an allotment history — it exists in Excel, and the paste is the
 * fastest path from there to here. It is also the place where a silent
 * misparse would corrupt the build-up without anyone noticing, since the rows
 * would look plausible and the cumulative total would simply be wrong.
 */
describe('pasting from a spreadsheet', () => {
  it('turns tab-separated rows into records', () => {
    const rows = parsePaste(
      [
        '2016-04-12\t10000\t10\t10\tCASH\tSUBSCRIPTION_TO_MOA\tPromoters',
        '2017-08-22\t240000\t10\t10\tCASH\tFURTHER_ALLOTMENT\tPromoters',
      ].join('\n'),
      ALLOTMENT_COLUMNS,
    )!;

    expect(rows).toHaveLength(2);
    expect(rows[0].date).toBe('2016-04-12');
    expect(rows[0].shares).toBe(10000);
    expect(rows[1].nature).toBe('FURTHER_ALLOTMENT');
  });

  it('strips the grouping separators a spreadsheet exports', () => {
    // Excel copies "1,08,00,000", and Number() on that is NaN.
    const rows = parsePaste('2024-06-20\t1,08,00,000\t10\t\tBONUS\tBONUS_ISSUE\tAll', ALLOTMENT_COLUMNS)!;
    expect(rows[0].shares).toBe(10800000);
  });

  it('leaves a number cell empty rather than making it zero', () => {
    // A bonus issue has no issue price. Zero would say "issued at nil value",
    // which is a different statement from "not applicable".
    const rows = parsePaste('2024-06-20\t100\t10\t\tBONUS\tBONUS_ISSUE\tAll', ALLOTMENT_COLUMNS)!;
    expect(rows[0].issuePrice).toBeUndefined();
    expect(rows[0].shares).toBe(100);
  });

  it('ignores an ordinary single-cell paste', () => {
    // Otherwise pasting a company name into a text cell would create rows.
    expect(parsePaste('Kirti Investments Private Limited', SHAREHOLDER_COLUMNS)).toBeNull();
    expect(parsePaste('', SHAREHOLDER_COLUMNS)).toBeNull();
  });

  it('treats a single row WITH tabs as a grid paste', () => {
    const rows = parsePaste('Rajesh Vardhman\tPROMOTER\t4680000', SHAREHOLDER_COLUMNS)!;
    expect(rows).toHaveLength(1);
    expect(rows[0].shares).toBe(4680000);
  });

  it('survives Windows line endings and trailing blank lines', () => {
    const rows = parsePaste(
      'Rajesh Vardhman\tPROMOTER\t4680000\r\nSunita Vardhman\tPROMOTER\t3120000\r\n\r\n',
      SHAREHOLDER_COLUMNS,
    )!;
    expect(rows).toHaveLength(2);
    expect(rows[1].name).toBe('Sunita Vardhman');
  });

  it('pads a short row rather than shifting the columns', () => {
    // A spreadsheet range that stops before the last column must not slide
    // values leftward into the wrong fields.
    const rows = parsePaste('Anil Vardhman\tPROMOTER_GROUP', SHAREHOLDER_COLUMNS)!;
    expect(rows[0].name).toBe('Anil Vardhman');
    expect(rows[0].category).toBe('PROMOTER_GROUP');
    expect(rows[0].shares).toBeUndefined();
  });

  it('gives every row every column, so no cell is missing a key', () => {
    const rows = parsePaste('Rajesh\tPROMOTER\t100', SHAREHOLDER_COLUMNS)!;
    for (const c of SHAREHOLDER_COLUMNS) expect(Object.keys(rows[0])).toContain(c.key);
  });
});

describe('applying a paste to existing rows', () => {
  const row = (name: string) => ({ name, category: 'PROMOTER', shares: 1 });

  it('overwrites from the pasted row, as a spreadsheet does', () => {
    // The bug browser verification caught: splicing instead of overwriting
    // gave an issuer who pasted their full history over a partly typed list
    // every row twice, and doubled the cumulative total.
    const existing = [row('a'), row('b'), row('c')];
    const pasted = [row('X'), row('Y')];
    const result = applyPaste(existing, 0, pasted);

    expect(result.map((r) => r.name)).toEqual(['X', 'Y', 'c']);
  });

  it('extends the list when the paste runs past the end', () => {
    const existing = [row('a')];
    const pasted = [row('X'), row('Y'), row('Z')];
    expect(applyPaste(existing, 0, pasted).map((r) => r.name)).toEqual(['X', 'Y', 'Z']);
  });

  it('keeps the rows before the paste point', () => {
    const existing = [row('a'), row('b'), row('c'), row('d')];
    const result = applyPaste(existing, 2, [row('X')]);
    expect(result.map((r) => r.name)).toEqual(['a', 'b', 'X', 'd']);
  });

  it('appends cleanly when pasting into a trailing blank row', () => {
    // The ordinary case: five real rows and the blank scaffolding row at the
    // end, paste into the blank one.
    const existing = [row('a'), { name: '', category: '', shares: undefined }];
    const result = applyPaste(existing, 1, [row('X'), row('Y')]);
    expect(result.map((r) => r.name)).toEqual(['a', 'X', 'Y']);
  });
});
