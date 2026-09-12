import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { describe, expect, it, beforeEach, afterEach } from 'vitest';
import { vardhman } from '../../seed/vardhman';
import { writeNarrative } from '../../store/narrative-store';
import { collectPlaceholders, type DocumentNode } from '../nodes';
import { renderSection } from '../section';
import { objectsOfTheIssue } from './objects-of-the-issue';
import type { FactBase } from '../../facts/schema';

const render = (facts = vardhman) => renderSection(objectsOfTheIssue, { facts });

function variant(mutate: (f: FactBase) => void): FactBase {
  const f = structuredClone(vardhman) as FactBase;
  mutate(f);
  return f;
}

describe('Objects of the Issue — D68, restructured to a real numbered list from the S9 register-and-structure audit', () => {
  let dir: string;

  beforeEach(() => {
    dir = mkdtempSync(join(tmpdir(), 'setu-objects-of-the-issue-'));
    process.env.SETU_DATA_DIR = dir;
  });

  afterEach(() => {
    delete process.env.SETU_DATA_DIR;
    rmSync(dir, { recursive: true, force: true });
  });

  it('renders the objects as a real ordered list node, not prose', () => {
    const nodes = render();
    const list = nodes.find((n): n is Extract<DocumentNode, { type: 'list' }> => n.type === 'list');
    expect(list).toBeDefined();
    expect(list!.ordered).toBe(true);
    expect(list!.items).toHaveLength(vardhman.offer.objects.length);
  });

  it('each list item names the object and its amount', () => {
    const nodes = render();
    const list = nodes.find((n): n is Extract<DocumentNode, { type: 'list' }> => n.type === 'list')!;
    const texts = list.items.map((i) => i[0].text);
    expect(texts.some((t) => t.includes('Rs 12.00 Crores'))).toBe(true);
    expect(texts.some((t) => t.includes('Rs 6.00 Crores'))).toBe(true);
  });

  it('falls back to the honest computed framing sentence with no draft on file', () => {
    const nodes = render();
    const intro = nodes.find((n) => n.type === 'paragraph' && n.runs[0]?.text.includes('propose that the Net Proceeds'));
    expect(intro).toBeDefined();
  });

  it('renders a drafted framing sentence in place of the computed fallback, once one exists', () => {
    const total = vardhman.offer.objects.reduce((s, o) => s + Number(o.amount), 0);
    writeNarrative(
      'particulars.objectsOfTheIssue',
      'This is the drafted framing sentence, standing in for the computed one.',
      '{}',
      {
        companyName: vardhman.company.name,
        objectCount: vardhman.offer.objects.length,
        totalAmount: `Rs ${(total / 1e7).toFixed(2)} Crores`,
      },
      'test',
    );
    const text = render()
      .map((n) => (n.type === 'paragraph' ? n.runs.map((r) => r.text).join('') : ''))
      .join('\n');
    expect(text).toContain('This is the drafted framing sentence, standing in for the computed one.');
  });

  it('states the correct total after the list', () => {
    const nodes = render();
    const closing = nodes.find((n) => n.type === 'paragraph' && n.runs[0]?.text.includes('aggregate to'));
    expect(closing).toBeDefined();
    expect((closing as Extract<DocumentNode, { type: 'paragraph' }>).runs[0].text).toContain('Rs 21.00 Crores');
  });

  it('gaps the whole section when no object is on file', () => {
    const f = variant((x) => {
      x.offer.objects = [];
    });
    const gaps = collectPlaceholders(render(f));
    expect(gaps.some((g) => g.factPath === 'offer.objects')).toBe(true);
  });
});
