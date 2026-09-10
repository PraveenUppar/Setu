import { getFact } from '../facts/provenance';
import type { ProvenanceMap } from '../facts/provenance';
import { isUsable } from '../facts/provenance';
import { formatAs, formatIndian, type MoneyUnit } from '../facts/money';
import type { DocumentNode, Run } from './nodes';

/**
 * Template engine for boilerplate sections.
 *
 * Templates are DATA, not code (MM2) — extracted from real prospectuses by
 * diffing the same section across several documents, so that a compliance
 * person can edit them without touching TypeScript.
 *
 * Syntax, deliberately small:
 *
 *   {{ company.name }}                  substitute a fact
 *   {{ offer.issueExpenses | crores }}  substitute with a filter
 *   {{#if capital.hasConvertibles }}    conditional block
 *   {{/if}}
 *   {{#unless offer.sellingShareholders.length }} ... {{/unless}}
 *   ## Heading text                     heading (## = level 2, ### = level 3)
 *
 * Blank lines separate paragraphs.
 *
 * A fact that is missing — or extracted but not yet human-confirmed — becomes
 * an INLINE placeholder run and a gap. It never becomes invented text (MM4).
 */

export interface TemplateContext {
  facts: unknown;
  provenance?: ProvenanceMap;
  /** Better wording for the "[TO BE PROVIDED: ...]" ask, keyed by fact path. */
  asks?: Record<string, string>;
}

type Filter = (value: unknown) => string;

const MONEY_UNITS: MoneyUnit[] = ['rupees', 'thousands', 'lakhs', 'crores'];

const FILTERS: Record<string, Filter> = {
  upper: (v) => String(v).toUpperCase(),
  lower: (v) => String(v).toLowerCase(),
  /** Share counts and other integers, in the Indian grouping convention. */
  number: (v) => formatIndian(String(v), 0),
  /** "2026-09-04" -> "September 4, 2026", the form offer documents use. */
  date: (v) => {
    const [y, m, d] = String(v).split('-').map(Number);
    if (!y || !m || !d) return String(v);
    const months = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December',
    ];
    return `${months[m - 1]} ${d}, ${y}`;
  },
};

for (const unit of MONEY_UNITS) {
  FILTERS[unit] = (v) => formatAs(String(v), unit);
}

/** "company.registeredOffice" -> "Company registered office" */
export function humanisePath(path: string): string {
  const leaf = path.split('.').slice(-2).join(' ');
  const spaced = leaf
    .replace(/\[\d+\]/g, '')
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/[._]/g, ' ')
    .toLowerCase()
    .trim();
  return spaced.charAt(0).toUpperCase() + spaced.slice(1);
}

/**
 * Resolve one `{{ ... }}` expression to a run: either the formatted value, or
 * a placeholder when the fact is absent or unconfirmed.
 */
function resolveExpression(expression: string, ctx: TemplateContext): Run {
  const [rawPath, ...filterNames] = expression.split('|').map((s) => s.trim());

  // `.length` is the only pseudo-property, used for "does this array have items"
  const isLength = rawPath.endsWith('.length');
  const path = isLength ? rawPath.slice(0, -'.length'.length) : rawPath;

  const value = getFact(ctx.facts, path);
  const resolved = isLength ? (Array.isArray(value) ? value.length : 0) : value;

  if (!isLength && !isUsable(resolved, ctx.provenance?.[path])) {
    const ask = ctx.asks?.[path] ?? humanisePath(path);
    return { text: `[TO BE PROVIDED: ${ask}]`, placeholder: { factPath: path, ask } };
  }

  let out = String(resolved);
  for (const name of filterNames) {
    const filter = FILTERS[name];
    if (!filter) throw new Error(`Unknown template filter "${name}" in "${expression}"`);
    out = filter(out);
  }
  return { text: out };
}

/** Truthiness for `{{#if}}`, matching the usability gate. */
function isTruthy(path: string, ctx: TemplateContext): boolean {
  const isLength = path.endsWith('.length');
  const realPath = isLength ? path.slice(0, -'.length'.length) : path;
  const value = getFact(ctx.facts, realPath);

  if (isLength) return Array.isArray(value) && value.length > 0;
  if (Array.isArray(value)) return value.length > 0;
  if (typeof value === 'boolean') return value;
  return isUsable(value, ctx.provenance?.[realPath]);
}

/**
 * Strip conditional blocks that do not apply. Runs before paragraph splitting
 * so a conditional may span whole paragraphs.
 */
function applyConditionals(template: string, ctx: TemplateContext): string {
  const block = /\{\{#(if|unless)\s+([^}]+?)\s*\}\}([\s\S]*?)\{\{\/\1\}\}/;

  let out = template;
  let guard = 0;
  while (block.test(out)) {
    if (++guard > 200) throw new Error('Template conditional nesting too deep or unterminated');
    out = out.replace(block, (_m, kind: string, path: string, body: string) => {
      const truthy = isTruthy(path.trim(), ctx);
      return (kind === 'if') === truthy ? body : '';
    });
  }
  return out;
}

/**
 * Split a block on `**bold**` FIRST, before expression substitution. Order
 * matters: splitting on `{{ }}` first would leave orphaned `**` markers on
 * either side of a substitution, so `**{{ company.name }}**` would render its
 * asterisks literally.
 *
 * Offer documents use bold for the lead-in to a clause ("For Individual
 * Bidders.") and for emphasised warnings, and the DOCX renderer needs the
 * distinction too.
 */
function splitBold(block: string): { text: string; bold: boolean }[] {
  const segments: { text: string; bold: boolean }[] = [];
  const pattern = /\*\*([\s\S]+?)\*\*/g;
  let cursor = 0;
  let match: RegExpExecArray | null;

  while ((match = pattern.exec(block)) !== null) {
    if (match.index > cursor) {
      segments.push({ text: block.slice(cursor, match.index), bold: false });
    }
    segments.push({ text: match[1], bold: true });
    cursor = match.index + match[0].length;
  }
  if (cursor < block.length) segments.push({ text: block.slice(cursor), bold: false });
  return segments;
}

/** Only set the flag when true, so ordinary runs stay a bare { text }. */
const withBold = (text: string, bold: boolean): Run => (bold ? { text, bold: true } : { text });

/** Split one block of text into runs, resolving every expression. */
function toRuns(block: string, ctx: TemplateContext): Run[] {
  const runs: Run[] = [];
  const pattern = /\{\{\s*([^}]+?)\s*\}\}/g;

  for (const segment of splitBold(block)) {
    let cursor = 0;
    let match: RegExpExecArray | null;
    pattern.lastIndex = 0;

    while ((match = pattern.exec(segment.text)) !== null) {
      if (match.index > cursor) {
        runs.push(withBold(segment.text.slice(cursor, match.index), segment.bold));
      }
      const resolved = resolveExpression(match[1], ctx);
      // A placeholder keeps its own styling; a resolved value inherits bold
      runs.push(resolved.placeholder || !segment.bold ? resolved : { ...resolved, bold: true });
      cursor = match.index + match[0].length;
    }
    if (cursor < segment.text.length) {
      runs.push(withBold(segment.text.slice(cursor), segment.bold));
    }
  }

  // Collapse whitespace introduced by line wrapping in the template source,
  // but keep placeholder runs separate so they stay individually addressable.
  return runs
    .map((run) => (run.placeholder ? run : { ...run, text: run.text.replace(/\s+/g, ' ') }))
    .filter((run) => run.text !== '');
}

/** Render a template string into document nodes. */
export function renderTemplate(template: string, ctx: TemplateContext): DocumentNode[] {
  const resolved = applyConditionals(template, ctx);

  return resolved
    .split(/\n\s*\n/)
    .map((block) => block.trim())
    .filter((block) => block.length > 0)
    .map((block): DocumentNode => {
      // [\s\S] rather than the `s` flag, which needs an es2018 target
      const headingMatch = block.match(/^(#{2,4})\s+([\s\S]*)$/);
      if (headingMatch) {
        const level = headingMatch[1].length as 2 | 3 | 4;
        const runs = toRuns(headingMatch[2].trim(), ctx);
        return { type: 'heading', level, text: runs.map((r) => r.text).join('') };
      }

      const bullets = block.split('\n').every((line) => /^\s*-\s+/.test(line));
      if (bullets) {
        return {
          type: 'list',
          ordered: false,
          items: block
            .split('\n')
            .map((line) => toRuns(line.replace(/^\s*-\s+/, ''), ctx)),
        };
      }

      return { type: 'paragraph', runs: toRuns(block, ctx) };
    });
}
