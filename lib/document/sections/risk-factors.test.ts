import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { describe, expect, it, beforeEach, afterEach } from 'vitest';
import { vardhman } from '../../seed/vardhman';
import { withAnswers } from '../../seed/empty';
import { writeNarrative } from '../../store/narrative-store';
import { customerConcentration } from '../../risk';
import { collectPlaceholders, type DocumentNode } from '../nodes';
import { renderSection } from '../section';
import { riskFactors } from './risk-factors';
import { sectionRegistry } from './index';
import { plannedSections } from './planned';

const render = (facts = vardhman) => renderSection(riskFactors, { facts });
const textOf = (nodes: DocumentNode[]) =>
  nodes
    .map((n) => {
      if (n.type === 'paragraph') return n.runs.map((r) => r.text).join('');
      if (n.type === 'heading') return n.text;
      return '';
    })
    .join('\n');
const headingsOf = (nodes: DocumentNode[], level: 3 | 4) =>
  nodes.filter((n): n is Extract<DocumentNode, { type: 'heading' }> => n.type === 'heading' && n.level === level).map((n) => n.text);

describe('Risk Factors — computed selection over lib/risk/archetypes.ts', () => {
  let dir: string;

  beforeEach(() => {
    // Isolate from the real `.data/narratives/` — otherwise these tests
    // would read whatever this machine has actually drafted, same reason
    // `modules.test.ts`'s fact-store block does this for the fact base.
    dir = mkdtempSync(join(tmpdir(), 'setu-narratives-'));
    process.env.SETU_DATA_DIR = dir;
  });

  afterEach(() => {
    delete process.env.SETU_DATA_DIR;
    rmSync(dir, { recursive: true, force: true });
  });

  it('is registered and no longer listed as planned', () => {
    expect(sectionRegistry.some((s) => s.id === 'general.riskFactors')).toBe(true);
    expect(plannedSections['general.riskFactors']).toBeUndefined();
  });

  it('renders the customer concentration risk with the real 61.3% for Vardhman', () => {
    const text = textOf(render());
    expect(text).toContain('61.3');
    expect(text).toContain('Mahindra & Mahindra Limited');
  });

  it('groups risks under category headings in a fixed order, and only for categories that fired', () => {
    const nodes = render();
    const categories = headingsOf(nodes, 3);
    // business, then financial, then legal, then promoter (D49's
    // promoterMajorityControl) — CATEGORY_ORDER's fixed order, for Vardhman
    expect(categories).toEqual([
      'Risks Relating to Our Business and Operations',
      'Risks Relating to Our Financial Condition',
      'Risks Relating to Legal and Regulatory Matters',
      'Risks Relating to Our Promoters and Promoter Group',
    ]);
    // No industry or offer archetype exists yet — must not print an empty heading
    expect(categories).not.toContain('Risks Relating to Our Industry');
    expect(categories).not.toContain('Risks Relating to this Issue and Our Equity Shares');
  });

  it('orders risks within a category by materiality, most material first', () => {
    const nodes = render();
    const titles = headingsOf(nodes, 4);
    // Contingent liabilities (~7.5x threshold) outranks material litigation (~2.8x) — both financial
    const cl = titles.indexOf('Contingent liabilities exceed the materiality threshold');
    const lit = titles.indexOf('Material legal proceedings are pending against the Company');
    expect(cl).toBeGreaterThanOrEqual(0);
    expect(lit).toBeGreaterThan(cl);
  });

  it('always raises the "not yet complete" gap, even for the real issuer', () => {
    const gaps = collectPlaceholders(render());
    expect(gaps.some((g) => g.factPath === 'general.riskFactors.narrative')).toBe(true);
  });

  it('never crashes for a one-fact issuer, and only fires archetypes an unanswered default legitimately supports', () => {
    const sparse = withAnswers({ company: { name: 'Sparse Test Limited' } });
    const nodes = render(sparse);
    expect(nodes.length).toBeGreaterThan(0);
    // Every array-backed archetype needs real data to fire, so all eight stay
    // silent. `keyManInsuranceAbsent` alone fires on an unanswered boolean
    // default — same precedent as EL-037 firing on an unanswered tripartite
    // agreement: an unanswered required yes/no question defaults to the
    // conservative, finding-raising answer everywhere else in this codebase,
    // so a fact-based archetype should not special-case itself as silent.
    expect(headingsOf(nodes, 4)).toEqual(['No key man insurance for Promoters or Key Managerial Personnel']);
    // Still honest about incompleteness even with only that one triggered
    expect(collectPlaceholders(nodes).some((g) => g.factPath === 'general.riskFactors.narrative')).toBe(true);
  });

  it('marks the framing note distinctly (italic), not as ordinary body text', () => {
    const nodes = render();
    const intro = nodes.find((n) => n.type === 'paragraph' && n.runs[0]?.text.includes('MACHINE-GENERATED'));
    expect(intro).toBeDefined();
    expect(intro!.type === 'paragraph' && intro!.runs[0].italic).toBe(true);
  });

  it('renders a drafted paragraph in place of the terse detail() sentence, once one exists (D50)', () => {
    // D51: the factSlice must match EXACTLY what the archetype produces for
    // these facts, or the draft is (correctly) treated as stale/foreign and
    // ignored — see narrative-store.ts's `readNarrative`.
    writeNarrative(
      'risk.customer-concentration',
      'This is the drafted paragraph, standing in for the computed sentence.',
      '{}',
      customerConcentration.factSlice(vardhman),
      'test',
    );
    const text = textOf(render());
    expect(text).toContain('This is the drafted paragraph, standing in for the computed sentence.');
    // The computed detail() sentence is gone, not just supplemented
    expect(text).not.toContain('Our top');
  });

  it('ignores a stored draft whose factSlice does not match this issuer\'s facts (D51)', () => {
    writeNarrative(
      'risk.customer-concentration',
      'A draft that belongs to a different issuer entirely.',
      '{}',
      { topCustomers: [{ name: 'Someone Else', revenueShare: 99 }], companyName: 'Not Vardhman Limited' },
      'test',
    );
    const text = textOf(render());
    expect(text).not.toContain('A draft that belongs to a different issuer entirely.');
    // Falls back to the honest, computed sentence for THIS issuer instead
    expect(text).toContain('Our top 5 customers accounted for 61.3%');
  });

  it('falls back to the computed detail() sentence for every risk with no draft on file', () => {
    // No writeNarrative() call — the store is empty in this test's isolated dir.
    const text = textOf(render());
    expect(text).toContain('Our top 5 customers accounted for 61.3%');
  });
});
