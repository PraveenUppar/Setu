import { describe, it, expect } from 'vitest';
import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';

/**
 * Guards the paired extraction dataset (S0).
 *
 * The fixtures are built by a script from gitignored PDFs, so nothing else
 * would notice if a rebuild silently dropped a document or matched the table
 * of contents instead of the section. Both failures already happened once
 * while building it — see fixtures/corpus/README.md.
 */

const ROOT = 'fixtures/corpus';

interface Half {
  pages: [number, number];
  chars: number;
}
interface Row {
  company: string;
  totalPages: number;
  truth: Half | null;
  input: Half | null;
}

const manifest: Row[] = JSON.parse(readFileSync(join(ROOT, 'manifest.json'), 'utf8'));

describe('the paired extraction dataset', () => {
  it('covers every prospectus in the corpus', () => {
    expect(manifest).toHaveLength(7);
  });

  it('has both halves for every document', () => {
    // A document with only one half is not a pair, and a pair is the whole
    // point — it is what makes the ground truth free.
    const incomplete = manifest.filter((r) => !r.truth || !r.input).map((r) => r.company);
    expect(incomplete).toEqual([]);
  });

  it('writes a file for every manifest row', () => {
    for (const row of manifest) {
      expect(existsSync(join(ROOT, 'truth', `${row.company}.txt`))).toBe(true);
      expect(existsSync(join(ROOT, 'input', `${row.company}.txt`))).toBe(true);
    }
  });

  it('captures a plausible slice rather than the whole document', () => {
    // Photonics originally matched a mixed-case mention on page 6 and took 265
    // pages. A section that is most of the document is a failed match, not a
    // long section.
    for (const row of manifest) {
      for (const half of [row.truth!, row.input!]) {
        const span = half.pages[1] - half.pages[0];
        expect(span).toBeGreaterThan(3);
        expect(span).toBeLessThan(row.totalPages * 0.4);
      }
    }
  });

  it('starts each half at the right section', () => {
    for (const row of manifest) {
      const truth = readFileSync(join(ROOT, 'truth', `${row.company}.txt`), 'utf8');
      expect(truth.slice(0, 400)).toMatch(/CAPITAL STRUCTURE/);

      // The financial half opens either at the section heading or at the
      // auditor's examination report, which is the more reliable of the two.
      const input = readFileSync(join(ROOT, 'input', `${row.company}.txt`), 'utf8');
      expect(input.slice(0, 600)).toMatch(/FINANCIAL|examination report/i);
    }
  });

  it('carries the tables the ground truth depends on', () => {
    // The Capital Structure half is only useful as truth if it still contains
    // the build-up and the shareholding pattern.
    for (const row of manifest) {
      const truth = readFileSync(join(ROOT, 'truth', `${row.company}.txt`), 'utf8');
      // BOTH spellings occur: 4 of 7 documents write "Authorized" where the
      // regulations write "Authorised". Any extraction pattern over these
      // tables has to accept either.
      expect(truth, row.company).toMatch(/Authori[sz]ed Share Capital/i);
      expect(truth, row.company).toMatch(/face value/i);
    }
  });
});
