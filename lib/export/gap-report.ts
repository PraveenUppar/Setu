import ExcelJS from 'exceljs';
import type { ProvenanceMap } from '../facts/provenance';
import type { FactBase } from '../facts/schema';
import { moduleRegistry } from '../modules';
import type { Finding, ReadinessSummary } from '../rules';
import { collectGaps, type RenderedSection } from '../document/section';

/**
 * The gap report — the findings as a workbook the banker can sort and
 * filter, and hand back with a column of their own.
 *
 * Three sheets:
 *
 *   Findings      every rule that fired and every completeness gap, with the
 *                 clause, the arithmetic in the detail, what it holds up and
 *                 where it is fixed. This is the dashboard, in Excel, because
 *                 the merchant banker's diligence tracker IS a spreadsheet and
 *                 a list they cannot paste into it is a list they retype.
 *   Placeholders  every [TO BE PROVIDED] in the document and the sections
 *                 carrying it — one row per fact, since one fact missing in
 *                 nine sections is one thing to supply.
 *   Provenance    every fact on file with who supplied it and when. The
 *                 answer to "who changed this figure" without opening the app.
 *
 * "Where to fix" is resolved from the module registry by fact path, so a
 * gap names the module and the question, not a path.
 */

export interface GapReportInput {
  facts: FactBase;
  provenance: ProvenanceMap;
  version: number;
  findings: Finding[];
  summary: ReadinessSummary;
  sections: RenderedSection[];
  /** Fact-base version and generation date go on the cover of every sheet. */
  generatedAt?: Date;
}

/** The module and question that answer a fact path, by longest prefix match. */
export function whereToFix(factPath: string): { module: string; question: string } | null {
  let best: { module: string; question: string; length: number } | null = null;
  for (const m of moduleRegistry) {
    for (const f of m.fields) {
      if (factPath === f.path || factPath.startsWith(`${f.path}.`) || factPath.startsWith(`${f.path}[`)) {
        if (!best || f.path.length > best.length) best = { module: m.id, question: f.label, length: f.path.length };
      }
    }
  }
  return best ? { module: best.module, question: best.question } : null;
}

const HEADER_FILL: ExcelJS.Fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFEDEDED' } };

function styleHeader(sheet: ExcelJS.Worksheet, row: number) {
  const header = sheet.getRow(row);
  header.font = { bold: true };
  header.fill = HEADER_FILL;
  header.alignment = { vertical: 'top', wrapText: true };
}

function wrapAll(sheet: ExcelJS.Worksheet, fromRow: number) {
  sheet.eachRow((row, n) => {
    if (n >= fromRow) row.alignment = { vertical: 'top', wrapText: true };
  });
}

export async function buildGapReport(input: GapReportInput): Promise<Buffer> {
  const { facts, findings, summary, sections } = input;
  const generated = (input.generatedAt ?? new Date()).toISOString().slice(0, 10);
  const wb = new ExcelJS.Workbook();
  wb.creator = 'Setu';
  wb.created = input.generatedAt ?? new Date();

  const cover = (sheet: ExcelJS.Worksheet, title: string) => {
    sheet.addRow([title]).font = { bold: true, size: 14 };
    sheet.addRow([`${facts.company.name || '[Company name not yet provided]'} - fact base version ${input.version} - generated ${generated}`]);
    sheet.addRow([]);
  };

  /* ---------------------------------------------------------------- */
  /* Findings                                                          */
  /* ---------------------------------------------------------------- */
  const f = wb.addWorksheet('Findings');
  cover(f, 'Findings');
  f.addRow([
    `Readiness ${summary.score} / 100`,
    `${summary.blockers} blocker${summary.blockers === 1 ? '' : 's'}`,
    `${summary.major} major`,
    `${summary.minor} minor`,
    `${summary.passed} checks passed`,
    `${summary.notApplicable} not applicable`,
  ]);
  f.addRow([]);
  const findingsHeader = f.addRow(['#', 'Severity', 'Category', 'Rule', 'Finding', 'Clause', 'Detail', 'Holds up', 'Fix in module', 'Question', 'Fact path', 'Banker notes']);
  styleHeader(f, findingsHeader.number);
  findings.forEach((x, i) => {
    const where = x.fix?.factPath ? whereToFix(x.fix.factPath) : null;
    f.addRow([
      i + 1,
      x.severity,
      x.category,
      x.ruleId,
      x.title,
      x.clause,
      x.detail,
      (x.blocks ?? []).join('; '),
      where?.module ?? (x.fix?.module && x.fix.module !== '-' ? x.fix.module : ''),
      where?.question ?? x.fix?.action ?? '',
      x.fix?.factPath ?? '',
      '',
    ]);
  });
  f.columns = [
    { width: 5 }, { width: 10 }, { width: 13 }, { width: 22 }, { width: 44 }, { width: 28 },
    { width: 70 }, { width: 40 }, { width: 12 }, { width: 40 }, { width: 34 }, { width: 30 },
  ];
  wrapAll(f, findingsHeader.number);
  f.views = [{ state: 'frozen', ySplit: findingsHeader.number }];
  f.autoFilter = { from: { row: findingsHeader.number, column: 1 }, to: { row: findingsHeader.number + findings.length, column: 12 } };

  /* ---------------------------------------------------------------- */
  /* Placeholders                                                      */
  /* ---------------------------------------------------------------- */
  const p = wb.addWorksheet('Placeholders');
  cover(p, 'Placeholders in the document');
  const gaps = collectGaps(sections);
  const gapsHeader = p.addRow(['#', 'What is needed', 'Fact path', 'Appears in', 'Sections', 'Fix in module', 'Question', 'Banker notes']);
  styleHeader(p, gapsHeader.number);
  gaps.forEach((g, i) => {
    const where = whereToFix(g.factPath);
    p.addRow([i + 1, g.ask, g.factPath, g.sections.length, g.sections.map((s) => s.title).join('; '), where?.module ?? '', where?.question ?? '', '']);
  });
  p.columns = [{ width: 5 }, { width: 70 }, { width: 36 }, { width: 10 }, { width: 50 }, { width: 12 }, { width: 40 }, { width: 30 }];
  wrapAll(p, gapsHeader.number);
  p.views = [{ state: 'frozen', ySplit: gapsHeader.number }];
  p.autoFilter = { from: { row: gapsHeader.number, column: 1 }, to: { row: gapsHeader.number + gaps.length, column: 8 } };

  /* ---------------------------------------------------------------- */
  /* Provenance                                                        */
  /* ---------------------------------------------------------------- */
  const v = wb.addWorksheet('Provenance');
  cover(v, 'Provenance - who supplied each fact, and when');
  const entries = Object.entries(input.provenance).sort(([a], [b]) => a.localeCompare(b));
  if (entries.length === 0) {
    v.addRow(['No provenance on file. The demo issuer is a seed; a real issuer records every answer as it is saved.']);
  } else {
    const provHeader = v.addRow(['Fact path', 'Source', 'Supplied by', 'When', 'Confirmed', 'Document', 'Page', 'Derived from', 'Confidence']);
    styleHeader(v, provHeader.number);
    for (const [path, prov] of entries) {
      v.addRow([
        path,
        prov.source,
        prov.updatedBy,
        prov.updatedAt,
        prov.source === 'extracted' ? (prov.confirmed ? 'yes' : 'NO') : '',
        prov.ref?.documentId ?? '',
        prov.ref?.page ?? '',
        (prov.derivedFrom ?? []).join('; '),
        prov.confidence ?? '',
      ]);
    }
    v.views = [{ state: 'frozen', ySplit: provHeader.number }];
    v.autoFilter = { from: { row: provHeader.number, column: 1 }, to: { row: provHeader.number + entries.length, column: 9 } };
  }
  v.columns = [{ width: 44 }, { width: 11 }, { width: 14 }, { width: 22 }, { width: 10 }, { width: 24 }, { width: 6 }, { width: 40 }, { width: 10 }];
  wrapAll(v, 4);

  return Buffer.from(await wb.xlsx.writeBuffer());
}

/** "vardhman-precision-components-limited-gap-report-v3.xlsx" */
export function gapReportFilename(facts: FactBase, version: number): string {
  const company = (facts.company.name || 'issuer')
    .replace(/[^A-Za-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .toLowerCase();
  return `${company}-gap-report-v${version}.xlsx`;
}
