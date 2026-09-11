import {
  AlignmentType,
  Bookmark,
  BorderStyle,
  Document,
  Footer,
  Header,
  HeadingLevel,
  HighlightColor,
  LevelFormat,
  PageBreak,
  PageNumber,
  Packer,
  Paragraph,
  ShadingType,
  Table,
  TableCell,
  TableLayoutType,
  TableOfContents,
  TableRow,
  TextRun,
  WidthType,
  type ParagraphChild,
} from 'docx';
import { bookmarkName, gapAnchor, slug } from '../anchors';
import type { FactBase } from '../facts/schema';
import type { DocumentNode, Run } from './nodes';
import { derivedTerms, gapAnchorKeys, runKey, type RenderedSection } from './section';

/**
 * DOCX renderer for the document AST.
 *
 * Consumes the same `RenderedSection[]` as `DocumentView`, so the preview and
 * the deliverable cannot drift — a section that renders in the browser
 * renders here, from the same nodes, with the same gaps in the same places.
 *
 * DOCX is the primary export (D7): merchant bankers redline in Word. Until the
 * banker certifies the document it carries the UNSIGNED DRAFT watermark on
 * every page, which is both required by the problem statement and the honest
 * answer to "are you replacing the intermediary" (D9).
 */

export interface DocxOptions {
  facts: FactBase;
  /**
   * Whether the merchant banker has certified the document. Lifts the
   * watermark. Defaults to false; the S12 review workflow is what will set it.
   */
  certified?: boolean;
  /** Fact-base version, printed on the title page so a redline can be dated. */
  version?: number;
}

/* ------------------------------------------------------------------ */
/* Page geometry                                                       */
/* ------------------------------------------------------------------ */

/** A4 in DXA (twentieths of a point). 1440 = one inch. */
const PAGE = { width: 11906, height: 16838 };
const MARGIN = 1440;
/** The width tables and frames are laid out against. */
const TEXT_WIDTH = PAGE.width - 2 * MARGIN;

const BODY_FONT = 'Times New Roman';
const HEADING_FONT = 'Arial';
/** Half-points. */
const BODY_SIZE = 22;
const TABLE_SIZE = 18;
const SMALL_SIZE = 16;

const DRAFT_NOTICE = 'UNSIGNED DRAFT — NOT FOR FILING';

/* ------------------------------------------------------------------ */
/* Runs                                                                */
/* ------------------------------------------------------------------ */

interface RunContext {
  /** Address prefix of the runs being rendered: section, node, [item]. */
  prefix: number[];
  /** Run address -> fact path, for the first occurrence of each gap only. */
  anchored: Map<string, string>;
}

/**
 * A placeholder is highlighted so it reads as a gap in Word the way it does in
 * the browser, and its first occurrence is bookmarked with the same anchor the
 * gap dashboard uses. One gap, one bookmark — the same rule as the DOM ids.
 */
function toParagraphChildren(runs: Run[], ctx: RunContext): ParagraphChild[] {
  return runs.map((run, i) => {
    if (run.placeholder) {
      const placeholder = new TextRun({
        text: run.text,
        bold: true,
        highlight: HighlightColor.YELLOW,
      });
      const factPath = ctx.anchored.get(runKey(...ctx.prefix, i));
      return factPath
        ? new Bookmark({ id: bookmarkName(gapAnchor(factPath)), children: [placeholder] })
        : placeholder;
    }
    return new TextRun({ text: run.text, bold: run.bold, italics: run.italic });
  });
}

/* ------------------------------------------------------------------ */
/* Tables                                                              */
/* ------------------------------------------------------------------ */

/**
 * Column widths in DXA, summing exactly to the text width.
 *
 * Fixed layout with explicit widths is what stops a wide table running off
 * the page; Word's autofit will happily lay a nine-column shareholding table
 * out past the right margin. Widths are weighted by the longest cell in each
 * column, clamped so a column of two-character codes still gets room for its
 * header and a column of long names cannot starve the rest.
 */
function columnWidths(headers: string[], rows: string[][]): number[] {
  const longest = headers.map((h, c) =>
    Math.max(h.length, ...rows.map((r) => (r[c] ?? '').length)),
  );
  const weights = longest.map((n) => Math.min(Math.max(n, 6), 40));
  const total = weights.reduce((a, b) => a + b, 0);
  const widths = weights.map((w) => Math.floor((w / total) * TEXT_WIDTH));
  widths[widths.length - 1] += TEXT_WIDTH - widths.reduce((a, b) => a + b, 0);
  return widths;
}

const CELL_MARGINS = { top: 40, bottom: 40, left: 80, right: 80 };

function tableNode(node: Extract<DocumentNode, { type: 'table' }>): (Paragraph | Table)[] {
  const widths = columnWidths(node.headers, node.rows);
  const numeric = new Set(node.numericColumns ?? []);
  const align = (c: number) => (numeric.has(c) ? AlignmentType.RIGHT : AlignmentType.LEFT);

  const cell = (text: string, c: number, header: boolean) =>
    new TableCell({
      width: { size: widths[c], type: WidthType.DXA },
      margins: CELL_MARGINS,
      shading: header ? { type: ShadingType.CLEAR, fill: 'EDEDED', color: 'auto' } : undefined,
      children: [
        new Paragraph({
          alignment: align(c),
          spacing: { before: 0, after: 0 },
          children: [new TextRun({ text, bold: header, size: TABLE_SIZE })],
        }),
      ],
    });

  const headerRow = new TableRow({
    tableHeader: true,
    cantSplit: true,
    children: node.headers.map((h, c) => cell(h, c, true)),
  });

  const bodyRows = node.rows.map(
    (row) =>
      new TableRow({
        cantSplit: true,
        // Pad short rows so every row has the full column count; a ragged
        // row makes Word draw a table that looks torn.
        children: node.headers.map((_, c) => cell(row[c] ?? '', c, false)),
      }),
  );

  const out: (Paragraph | Table)[] = [];
  if (node.caption) {
    out.push(
      new Paragraph({
        keepNext: true,
        spacing: { before: 200, after: 80 },
        children: [new TextRun({ text: node.caption, bold: true, size: BODY_SIZE })],
      }),
    );
  }
  out.push(
    new Table({
      width: { size: TEXT_WIDTH, type: WidthType.DXA },
      columnWidths: widths,
      layout: TableLayoutType.FIXED,
      rows: [headerRow, ...bodyRows],
    }),
  );
  for (const note of node.footnotes ?? []) {
    out.push(
      new Paragraph({
        spacing: { before: 60, after: 0 },
        children: [new TextRun({ text: note, size: SMALL_SIZE })],
      }),
    );
  }
  // Space after the table, so the next paragraph does not sit on its border
  out.push(new Paragraph({ spacing: { before: 0, after: 120 }, children: [] }));
  return out;
}

/* ------------------------------------------------------------------ */
/* Nodes                                                               */
/* ------------------------------------------------------------------ */

const HEADING_LEVEL = {
  1: HeadingLevel.HEADING_1,
  2: HeadingLevel.HEADING_2,
  3: HeadingLevel.HEADING_3,
  4: HeadingLevel.HEADING_4,
} as const;

interface NodeContext {
  sectionIndex: number;
  nodeIndex: number;
  anchored: Map<string, string>;
  /** Set for the first node of a section: the section's own bookmark. */
  sectionBookmark?: string;
  /** Each ordered list restarts at 1, which needs its own numbering instance. */
  nextListInstance: () => number;
  /** For a `toc` node, should a section ever emit one. */
  tocEntries: TocEntry[];
}

function withBookmark(children: ParagraphChild[], bookmark?: string): ParagraphChild[] {
  return bookmark ? [new Bookmark({ id: bookmark, children })] : children;
}

function renderNode(node: DocumentNode, ctx: NodeContext): (Paragraph | Table | TableOfContents)[] {
  const prefix = [ctx.sectionIndex, ctx.nodeIndex];

  switch (node.type) {
    case 'heading':
      return [
        new Paragraph({
          heading: HEADING_LEVEL[node.level],
          keepNext: true,
          children: withBookmark([new TextRun(node.text)], ctx.sectionBookmark),
        }),
      ];

    case 'paragraph':
      return [
        new Paragraph({
          alignment: AlignmentType.JUSTIFIED,
          spacing: { after: 120 },
          children: withBookmark(
            toParagraphChildren(node.runs, { prefix, anchored: ctx.anchored }),
            ctx.sectionBookmark,
          ),
        }),
      ];

    case 'list': {
      const instance = node.ordered ? ctx.nextListInstance() : 0;
      return node.items.map(
        (item, i) =>
          new Paragraph({
            numbering: { reference: node.ordered ? 'numbers' : 'bullets', level: 0, instance },
            alignment: AlignmentType.JUSTIFIED,
            spacing: { after: 60 },
            children: withBookmark(
              toParagraphChildren(item, { prefix: [...prefix, i], anchored: ctx.anchored }),
              i === 0 ? ctx.sectionBookmark : undefined,
            ),
          }),
      );
    }

    case 'table':
      return tableNode(node);

    case 'toc':
      return [tableOfContents(ctx.tocEntries)];

    case 'pageBreak':
      return [new Paragraph({ children: [new PageBreak()] })];
  }
}

/** The bookmark on a numbered SECTION heading, which the ToC entries link to. */
const groupBookmark = (group: string) => bookmarkName(`sec-group-${slug(group)}`);

interface TocEntry {
  title: string;
  level: number;
  href?: string;
}

/**
 * What the table of contents will list, known before Word paginates.
 *
 * A ToC in Word is a field, and a field is empty until it is computed —
 * Word does that on open (the document asks it to) or on F9, but LibreOffice,
 * Google Docs and a PDF conversion never do, and the reader sees a heading
 * with nothing under it. So the entries are written into the field as cached
 * content: every numbered section and every subsection heading down to level
 * 3, each a link to its bookmark. Page numbers are the one thing this cannot
 * supply, since nothing is paginated until Word lays the document out; they
 * are blank until the field updates, and correct after.
 */
function tocEntries(sections: RenderedSection[]): TocEntry[] {
  const entries: TocEntry[] = [];
  let group: string | undefined;

  for (const section of sections) {
    if (section.group !== group) {
      group = section.group;
      entries.push({ title: group, level: 1, href: groupBookmark(group) });
    }
    section.nodes.forEach((node, n) => {
      if (node.type !== 'heading' || node.level > 3) return;
      entries.push({
        title: node.text,
        level: node.level,
        // The first node carries the section bookmark; deeper headings have none
        href: n === 0 ? bookmarkName(section.anchor) : undefined,
      });
    });
  }
  return entries;
}

function tableOfContents(entries: TocEntry[]) {
  return new TableOfContents('Table of Contents', {
    hyperlink: true,
    headingStyleRange: '1-3',
    cachedEntries: entries,
  });
}

/* ------------------------------------------------------------------ */
/* Front matter, header and footer                                     */
/* ------------------------------------------------------------------ */

function titlePage(
  facts: FactBase,
  terms: ReturnType<typeof derivedTerms>,
  options: DocxOptions,
  entries: TocEntry[],
) {
  const centred = (text: string, size: number, bold = false, before = 0) =>
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before, after: 120 },
      children: [new TextRun({ text, size, bold, font: HEADING_FONT })],
    });

  const issueType = facts.offer.issueType === 'BOOK_BUILT' ? 'Book Built' : 'Fixed Price';
  const version = options.version !== undefined ? ` (fact base version ${options.version})` : '';

  return [
    centred(terms.documentName.toUpperCase(), 28, false, 2400),
    centred(facts.company.name.toUpperCase(), 40, true, 480),
    centred(`${terms.exchangeName} - ${issueType} ${terms.issueWord}`, 22, false, 240),
    centred(
      `Generated ${new Date().toISOString().slice(0, 10)}${version}`,
      SMALL_SIZE,
      false,
      2400,
    ),
    new Paragraph({ children: [new PageBreak()] }),
    new Paragraph({
      spacing: { after: 240 },
      children: [new TextRun({ text: 'TABLE OF CONTENTS', bold: true, size: 26, font: HEADING_FONT })],
    }),
    tableOfContents(entries),
    new Paragraph({ children: [new PageBreak()] }),
  ];
}

/**
 * The running header: company and document name, and until the banker
 * certifies, the UNSIGNED DRAFT notice beside it.
 *
 * There is deliberately no page watermark (D35). A text frame painted over
 * the body and made table rows unreadable; a WordArt watermark behind the
 * text worked but was judged unnecessary. The notice in the header is what
 * carries the draft state now, on every page, without touching the body.
 */
function header(facts: FactBase, terms: ReturnType<typeof derivedTerms>, certified: boolean) {
  return new Header({
    children: [
      new Paragraph({
        alignment: AlignmentType.RIGHT,
        border: { bottom: { style: BorderStyle.SINGLE, size: 4, color: 'BFBFBF', space: 4 } },
        children: [
          new TextRun({ text: `${facts.company.name} - ${terms.documentName}`, size: SMALL_SIZE, color: '595959' }),
          ...(certified
            ? []
            : [new TextRun({ text: `    ${DRAFT_NOTICE}`, size: SMALL_SIZE, bold: true, color: 'C00000' })]),
        ],
      }),
    ],
  });
}

function footer() {
  return new Footer({
    children: [
      new Paragraph({
        alignment: AlignmentType.CENTER,
        border: { top: { style: BorderStyle.SINGLE, size: 4, color: 'BFBFBF', space: 4 } },
        children: [
          new TextRun({
            children: ['Page ', PageNumber.CURRENT, ' of ', PageNumber.TOTAL_PAGES],
            size: SMALL_SIZE,
            color: '595959',
          }),
        ],
      }),
    ],
  });
}

/* ------------------------------------------------------------------ */
/* The document                                                        */
/* ------------------------------------------------------------------ */

/**
 * Body: the sections in order, grouped under their numbered SECTION headings.
 *
 * The group heading is presentation over the subsection list (07-section-map,
 * Finding 1) and the HTML preview does not print it — the app has its own
 * outline. In Word there is nothing else to carry the top level of the
 * table of contents, so each change of group opens a new page with a
 * Heading 1. The subsections beneath are what the section map counts.
 */
function body(sections: RenderedSection[], entries: TocEntry[]) {
  const anchored = gapAnchorKeys(sections);
  let listInstance = 0;
  const nextListInstance = () => ++listInstance;

  const out: (Paragraph | Table | TableOfContents)[] = [];
  let group: string | undefined;

  sections.forEach((section, s) => {
    if (section.group !== group) {
      group = section.group;
      out.push(
        new Paragraph({
          heading: HeadingLevel.HEADING_1,
          pageBreakBefore: out.length > 0,
          keepNext: true,
          children: [new Bookmark({ id: groupBookmark(group), children: [new TextRun(group)] })],
        }),
      );
    }

    const sectionBookmark = bookmarkName(section.anchor);
    section.nodes.forEach((node, n) => {
      out.push(
        ...renderNode(node, {
          sectionIndex: s,
          nodeIndex: n,
          anchored,
          sectionBookmark: n === 0 ? sectionBookmark : undefined,
          nextListInstance,
          tocEntries: entries,
        }),
      );
    });
  });

  return out;
}

/**
 * Heading styles are overridden rather than left to Word's defaults, which
 * are blue Calibri. The built-in style ids are kept so the ToC field and the
 * navigation pane still recognise them as headings.
 */
const HEADING_STYLES = [
  { id: 'Heading1', name: 'Heading 1', size: 28, before: 0, after: 240, caps: true },
  { id: 'Heading2', name: 'Heading 2', size: 26, before: 360, after: 160, caps: true },
  { id: 'Heading3', name: 'Heading 3', size: 23, before: 240, after: 120, caps: false },
  { id: 'Heading4', name: 'Heading 4', size: 22, before: 200, after: 100, caps: false },
].map((h) => ({
  id: h.id,
  name: h.name,
  basedOn: 'Normal',
  next: 'Normal',
  quickFormat: true,
  run: { font: HEADING_FONT, bold: true, size: h.size, color: '000000', allCaps: h.caps },
  paragraph: { spacing: { before: h.before, after: h.after }, keepNext: true, outlineLevel: Number(h.id.slice(-1)) - 1 },
}));

/**
 * The table of contents styles, one per level. Word's built-in names ("toc 1")
 * are used so the field applies them when it regenerates, and the cached
 * entries reference the same ids, so the ToC looks the same before and after
 * the update: numbered sections in bold, subsections indented beneath.
 */
const TOC_STYLES = [
  { id: 'TOC1', name: 'toc 1', indent: 0, bold: true, before: 120 },
  { id: 'TOC2', name: 'toc 2', indent: 240, bold: false, before: 0 },
  { id: 'TOC3', name: 'toc 3', indent: 480, bold: false, before: 0 },
].map((t) => ({
  id: t.id,
  name: t.name,
  basedOn: 'Normal',
  next: 'Normal',
  run: { size: BODY_SIZE, bold: t.bold },
  paragraph: { indent: { left: t.indent }, spacing: { before: t.before, after: 40 } },
}));

export function buildDocument(sections: RenderedSection[], options: DocxOptions): Document {
  const { facts } = options;
  const terms = derivedTerms(facts);
  const certified = options.certified ?? false;
  const entries = tocEntries(sections);

  return new Document({
    title: `${terms.documentName} - ${facts.company.name}`,
    creator: 'Setu',
    description: certified ? undefined : DRAFT_NOTICE,
    // Word asks to update fields on open, which is what fills the ToC in
    features: { updateFields: true },
    styles: {
      default: {
        document: { run: { font: BODY_FONT, size: BODY_SIZE } },
      },
      paragraphStyles: [...HEADING_STYLES, ...TOC_STYLES],
    },
    numbering: {
      config: [
        {
          reference: 'bullets',
          levels: [
            {
              level: 0,
              format: LevelFormat.BULLET,
              text: '•',
              alignment: AlignmentType.LEFT,
              style: { paragraph: { indent: { left: 720, hanging: 360 } } },
            },
          ],
        },
        {
          reference: 'numbers',
          levels: [
            {
              level: 0,
              format: LevelFormat.DECIMAL,
              text: '%1.',
              alignment: AlignmentType.LEFT,
              style: { paragraph: { indent: { left: 720, hanging: 360 } } },
            },
          ],
        },
      ],
    },
    sections: [
      {
        properties: {
          page: {
            size: { width: PAGE.width, height: PAGE.height },
            margin: { top: MARGIN, bottom: MARGIN, left: MARGIN, right: MARGIN },
          },
        },
        headers: { default: header(facts, terms, certified) },
        footers: { default: footer() },
        children: [...titlePage(facts, terms, options, entries), ...body(sections, entries)],
      },
    ],
  });
}

/** The deliverable, as bytes. */
export async function renderDocx(sections: RenderedSection[], options: DocxOptions): Promise<Buffer> {
  return Packer.toBuffer(buildDocument(sections, options));
}

/** "vardhman-industries-limited-drhp-v3-unsigned-draft.docx" */
export function docxFilename(facts: FactBase, options: Pick<DocxOptions, 'certified' | 'version'>): string {
  // An issuer who has not typed their name yet still gets a file with one
  const company =
    facts.company.name
      .replace(/[^A-Za-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .toLowerCase() || 'issuer';
  const stage = facts.offer.documentStage.toLowerCase();
  const version = options.version !== undefined ? `-v${options.version}` : '';
  const state = options.certified ? '' : '-unsigned-draft';
  return `${company}-${stage}${version}${state}.docx`;
}
