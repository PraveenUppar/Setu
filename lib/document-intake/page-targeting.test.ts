import { describe, it, expect } from 'vitest';
import { targetPages, targetedText } from './page-targeting';

const pages = [
  'COVER PAGE\nSome company\nDraft Red Herring Prospectus',
  'TABLE OF CONTENTS\nSECTION I ... 1',
  'HISTORY AND CORPORATE MATTERS\nOur Company was incorporated on...',
  'continued incorporation details, certificate number...',
  'OUR MANAGEMENT\nBoard of Directors table follows.',
  'unrelated filler page about something else entirely',
];

describe('targetPages', () => {
  it('finds the page whose heading matches the domain', () => {
    expect(targetPages(pages, 'company')).toContain(2);
  });

  it('pulls in one page of context either side of a hit', () => {
    const result = targetPages(pages, 'company', 1);
    expect(result).toContain(1); // before
    expect(result).toContain(3); // after
  });

  it('matches case-insensitively', () => {
    const lower = pages.map((p) => p.toLowerCase());
    expect(targetPages(lower, 'company')).toContain(2);
  });

  it('returns no pages for a domain with nothing on file', () => {
    expect(targetPages(pages, 'legal')).toEqual([]);
  });

  it('never returns a duplicate page even when context windows overlap', () => {
    const result = targetPages(pages, 'management', 2);
    expect(new Set(result).size).toBe(result.length);
  });

  it('is sorted in document order, not match order', () => {
    const result = targetPages(pages, 'company', 1);
    expect(result).toEqual([...result].sort((a, b) => a - b));
  });
});

describe('targetedText', () => {
  it('joins only the targeted pages, each with a page marker', () => {
    const { pages: matched, text } = targetedText(pages, 'management');
    expect(matched).toContain(4);
    expect(text).toContain('[Page 5]');
    expect(text).toContain('Board of Directors table follows.');
    // The unrelated page at index 0 is outside management's context window
    // (the hit is at index 4); the filler page at index 5 is INSIDE it (one
    // page of trailing context) and correctly included, by design.
    expect(text).not.toContain('COVER PAGE');
  });
});
