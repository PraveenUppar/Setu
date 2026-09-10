/**
 * Reverse the corpus into a paired extraction dataset (S0).
 *
 * Every prospectus already contains both halves of an extraction test:
 *
 *   INPUT — the restated financial information, which is what an extractor
 *           reads: dense, tabular, and laid out differently by every auditor.
 *   TRUTH — the Capital Structure section, whose share-capital build-up,
 *           shareholding pattern and lock-in tables are the CORRECT answer,
 *           already reconciled and signed off by a merchant banker.
 *
 * That makes a free, human-verified, paired dataset — the expensive part of
 * building an extractor, sitting inside documents we already have. S7 grades
 * itself against these; S5's computed capital tables can be diffed against
 * them too.
 *
 * The PDFs are gitignored (88MB). The extracted text is not: it is a few
 * hundred KB of public filing text, and a fixture nobody can read is a fixture
 * nobody will check.
 *
 * Usage:  node scripts/build-corpus-fixtures.mjs [--txt <dir>]
 *
 * Expects the plain-text extractions produced by:
 *   pdftotext corpus/prospectus/<file>.pdf <txt>/<company>.txt
 *
 * pdftotext separates pages with a form feed, which is what gives us physical
 * page numbers. ToC page numbers are NOT physical pages and must never be
 * trusted for this (see the handoff gotchas).
 */

import { readFileSync, writeFileSync, mkdirSync, existsSync, readdirSync } from 'node:fs';
import { join, basename } from 'node:path';

const OUT = 'fixtures/corpus';

const args = process.argv.slice(2);
const txtDir = args.includes('--txt') ? args[args.indexOf('--txt') + 1] : null;

if (!txtDir || !existsSync(txtDir)) {
  console.error('Pass --txt <dir> holding one .txt per prospectus.');
  console.error('Build it with: pdftotext corpus/prospectus/<f>.pdf <dir>/<company>.txt');
  process.exit(1);
}

/**
 * Section starts, as they appear as a HEADING on its own page rather than as a
 * cross-reference in running text. Both spellings of the financial section are
 * needed: "RESTATED FINANCIAL INFORMATION" and "FINANCIAL INFORMATION OF THE
 * COMPANY" both occur in the corpus.
 */
const SECTIONS = {
  truth: {
    starts: [
      // Case-SENSITIVE: prospectus section headings are set in capitals, and
      // matching case-insensitively lands on cross-references in body text.
      // The "SECTION V -" prefix is part of the heading in some documents and
      // absent in others, hence optional.
      /^(SECTION [IVX]+ ?[-–—:.] ?)?CAPITAL STRUCTURE\s*$/m,
    ],
    // Whichever of these comes first ends it.
    ends: [/^(SECTION [IVX]+ ?[-–—:.] ?)?(THE )?OBJECTS OF THE (ISSUE|OFFER)\s*$/m],
  },
  input: {
    starts: [
      /^(SECTION [IVX]+ ?[-–—:.] ?)?RESTATED (CONSOLIDATED |STANDALONE )?FINANCIAL (INFORMATION|STATEMENTS)/m,
      /^(SECTION [IVX]+ ?[-–—:.] ?)?FINANCIAL (INFORMATION OF THE COMPANY|STATEMENTS)\s*$/m,
      /**
       * The restated financials always open with the auditor's examination
       * report, and it is the most reliable marker in the corpus — every
       * document has one, where the section HEADING varies by drafter. Anchored
       * near the line start so the consents paragraph, which mentions the same
       * report in running text, does not match.
       */
      /^.{0,25}examination report.{0,70}restated financial/im,
    ],
    ends: [
      /^(SECTION [IVX]+ ?[-–—:.] ?)?OTHER FINANCIAL INFORMATION\s*$/m,
      /^MANAGEMENT.S DISCUSSION AND ANALYSIS/m,
      /^(STATEMENT OF )?FINANCIAL INDEBTEDNESS\s*$/m,
      /^CAPITALISATION STATEMENT\s*$/m,
    ],
  },
};

/** The page index where a heading first appears alone, searching from `after`. */
function findPage(pages, patterns, after = 0) {
  for (let i = after; i < pages.length; i++) {
    for (const re of patterns) {
      if (re.test(pages[i])) return i;
    }
  }
  return -1;
}

/**
 * A heading also appears in the table of contents, so the FIRST match is
 * usually the ToC. Take the first match that is followed by substantial body
 * text on the same page — a ToC entry sits in a list of other entries.
 */
function findSectionStart(pages, patterns) {
  let from = 0;
  for (let guard = 0; guard < 10; guard++) {
    const i = findPage(pages, patterns, from);
    if (i === -1) return -1;
    const looksLikeToc = (pages[i].match(/\.{4,}|\s\d{2,3}\s*$/gm) ?? []).length > 4;
    if (!looksLikeToc) return i;
    from = i + 1;
  }
  return -1;
}

function slice(pages, section) {
  const start = findSectionStart(pages, section.starts);
  if (start === -1) return null;
  const end = findPage(pages, section.ends, start + 1);
  return {
    start,
    end: end === -1 ? pages.length : end,
    text: pages.slice(start, end === -1 ? pages.length : end).join('\f'),
  };
}

mkdirSync(join(OUT, 'input'), { recursive: true });
mkdirSync(join(OUT, 'truth'), { recursive: true });

const manifest = [];

for (const file of readdirSync(txtDir).filter((f) => f.endsWith('.txt'))) {
  const company = basename(file, '.txt');
  const pages = readFileSync(join(txtDir, file), 'utf8').split('\f');

  const truth = slice(pages, SECTIONS.truth);
  const input = slice(pages, SECTIONS.input);

  const row = {
    company,
    totalPages: pages.length,
    truth: truth && { pages: [truth.start + 1, truth.end], chars: truth.text.length },
    input: input && { pages: [input.start + 1, input.end], chars: input.text.length },
  };
  manifest.push(row);

  if (truth) writeFileSync(join(OUT, 'truth', `${company}.txt`), truth.text);
  if (input) writeFileSync(join(OUT, 'input', `${company}.txt`), input.text);

  const say = (label, s) =>
    s
      ? `${label} pp.${s.start + 1}-${s.end} (${Math.round(s.text.length / 1000)}kb)`
      : `${label} NOT FOUND`;
  console.log(`${company.padEnd(24)} ${say('truth', truth)}   ${say('input', input)}`);
}

writeFileSync(join(OUT, 'manifest.json'), JSON.stringify(manifest, null, 2) + '\n');
console.log(`\n${manifest.length} documents -> ${OUT}`);
