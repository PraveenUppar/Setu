import type { FactBase } from '../facts/schema';

/**
 * Two-pass extraction, pass one: find the pages worth sending to the model at
 * all (02-architecture.md's "API cost discipline" — read the text layer
 * locally to find relevant pages, send only those, ~4x). Plain keyword
 * matching over headings a real prospectus or supporting document uses for
 * this domain — cheap, no API call, and good enough to narrow 300 pages to a
 * handful. Wrong in the direction of including a page, never of dropping one
 * silently: `contextPages` pulls in a page either side of a hit, since a
 * heading and the table beneath it often split across a page boundary.
 *
 * Deliberately approximate for a first pass, same as the risk archetype
 * registry's first slice (D44) — corpus-grounded headings can replace
 * guessed ones as real documents get run through this.
 */
const DOMAIN_KEYWORDS: Record<keyof FactBase, string[]> = {
  company: ['CERTIFICATE OF INCORPORATION', 'CORPORATE IDENTITY NUMBER', 'REGISTERED OFFICE', 'HISTORY AND CORPORATE'],
  capital: ['CAPITAL STRUCTURE', 'SHARE CAPITAL', 'ALLOTMENT', 'SHAREHOLDING PATTERN'],
  promoters: ['OUR PROMOTERS', 'PROMOTER GROUP'],
  management: ['OUR MANAGEMENT', 'BOARD OF DIRECTORS', 'KEY MANAGERIAL PERSONNEL'],
  business: ['OUR BUSINESS', 'MANUFACTURING FACILIT', 'PRINCIPAL PRODUCTS'],
  financials: ['RESTATED', 'FINANCIAL STATEMENTS', 'BALANCE SHEET', 'STATEMENT OF PROFIT AND LOSS'],
  legal: ['OUTSTANDING LITIGATION', 'LEGAL PROCEEDINGS', 'MATERIAL DEVELOPMENTS'],
  approvals: ['GOVERNMENT AND OTHER APPROVALS', 'STATUTORY AND OTHER APPROVALS', 'LICENCES'],
  offer: ['OBJECTS OF THE ISSUE', 'OBJECTS OF THE OFFER', 'TERMS OF THE ISSUE'],
  groupCompanies: ['GROUP COMPANIES', 'RELATED PARTY TRANSACTIONS'],
};

/** Which pages (0-indexed) look relevant to `domain`, with one page of context either side of a hit. */
export function targetPages(pageTexts: string[], domain: keyof FactBase, contextPages = 1): number[] {
  const keywords = DOMAIN_KEYWORDS[domain];
  const matched = new Set<number>();

  pageTexts.forEach((text, i) => {
    const upper = text.toUpperCase();
    if (keywords.some((k) => upper.includes(k))) {
      for (let p = Math.max(0, i - contextPages); p <= Math.min(pageTexts.length - 1, i + contextPages); p++) {
        matched.add(p);
      }
    }
  });

  return [...matched].sort((a, b) => a - b);
}

/** The targeted pages, joined with a page marker — what actually goes in the extraction prompt. */
export function targetedText(pageTexts: string[], domain: keyof FactBase): { pages: number[]; text: string } {
  const pages = targetPages(pageTexts, domain);
  const text = pages.map((p) => `[Page ${p + 1}]\n${pageTexts[p]}`).join('\n\n');
  return { pages, text };
}
