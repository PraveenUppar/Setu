import { describe, it, expect } from 'vitest';
import { renderTemplate, humanisePath } from './template';
import { collectPlaceholders, estimatePages } from './nodes';
import { money } from '../facts/money';
import { extractedProvenance } from '../facts/provenance';
import { vardhman } from '../seed/vardhman';

const ctx = { facts: vardhman };

const runText = (nodes: ReturnType<typeof renderTemplate>) =>
  nodes
    .map((n) =>
      n.type === 'paragraph'
        ? n.runs.map((r) => r.text).join('')
        : n.type === 'heading'
          ? n.text
          : '',
    )
    .join('\n');

describe('template engine', () => {
  it('substitutes facts', () => {
    const out = renderTemplate('Our Company is {{ company.name }}.', ctx);
    expect(runText(out)).toBe('Our Company is Vardhman Precision Components Limited.');
  });

  it('applies money filters in the Indian convention', () => {
    const out = renderTemplate('Expenses of {{ offer.issueExpenses | crores }}.', ctx);
    expect(runText(out)).toBe('Expenses of Rs 1.05 Crores.');
  });

  it('formats dates the way an offer document does', () => {
    const out = renderTemplate('Incorporated on {{ company.dateOfIncorporation | date }}.', ctx);
    expect(runText(out)).toBe('Incorporated on April 12, 2016.');
  });

  it('groups share counts in the Indian convention', () => {
    const out = renderTemplate('{{ capital.paidUpShares | number }} shares.', ctx);
    expect(runText(out)).toBe('1,20,00,000 shares.');
  });

  it('chains filters', () => {
    const out = renderTemplate('{{ company.name | upper }}', ctx);
    expect(runText(out)).toContain('VARDHMAN PRECISION COMPONENTS LIMITED');
  });

  it('throws on an unknown filter rather than emitting something wrong', () => {
    expect(() => renderTemplate('{{ company.name | bogus }}', ctx)).toThrow(/Unknown template filter/);
  });
});

describe('never invent (MM4)', () => {
  it('renders a missing fact as an inline placeholder, not invented text', () => {
    const out = renderTemplate('Our registered website is {{ company.missingField }}.', ctx);
    const rendered = runText(out);

    expect(rendered).toContain('[TO BE PROVIDED:');
    // The sentence around it still reads — the placeholder sits inline
    expect(rendered).toMatch(/^Our registered website is \[TO BE PROVIDED: .*\]\.$/);
  });

  it('raises a gap for every placeholder', () => {
    const out = renderTemplate('{{ company.missingOne }} and {{ company.missingTwo }}', ctx);
    const gaps = collectPlaceholders(out);
    expect(gaps.map((g) => g.factPath)).toEqual(['company.missingOne', 'company.missingTwo']);
  });

  it('treats an extracted but unconfirmed fact as missing', () => {
    const provenance = { 'company.name': extractedProvenance('doc-1', 12, 0.94) };
    const out = renderTemplate('{{ company.name }}', { facts: vardhman, provenance });
    expect(runText(out)).toContain('[TO BE PROVIDED:');

    const confirmed = {
      'company.name': { ...extractedProvenance('doc-1', 12, 0.94), confirmed: true },
    };
    const out2 = renderTemplate('{{ company.name }}', { facts: vardhman, provenance: confirmed });
    expect(runText(out2)).toBe('Vardhman Precision Components Limited');
  });

  it('uses a supplied ask over the derived one', () => {
    const out = renderTemplate('{{ company.gstin }}', {
      facts: vardhman,
      asks: { 'company.gstin': 'GST registration number' },
    });
    expect(runText(out)).toBe('[TO BE PROVIDED: GST registration number]');
  });

  it('derives a readable ask from the path when none is supplied', () => {
    expect(humanisePath('company.registeredOffice')).toBe('Company registered office');
    expect(humanisePath('offer.brlmUnderwritingPercent')).toBe('Offer brlm underwriting percent');
  });
});

describe('conditionals', () => {
  it('includes an if-block when the fact is truthy', () => {
    const out = renderTemplate(
      '{{#if company.isPublicLimited }}The Company is a public limited company.{{/if}}',
      ctx,
    );
    expect(runText(out)).toBe('The Company is a public limited company.');
  });

  it('drops an if-block when the fact is false', () => {
    const out = renderTemplate(
      '{{#if capital.hasOutstandingConvertibles }}There are convertibles.{{/if}}',
      ctx,
    );
    expect(out).toHaveLength(0);
  });

  it('handles unless as the inverse', () => {
    const out = renderTemplate(
      '{{#unless capital.hasPartlyPaidShares }}All equity capital is fully paid up.{{/unless}}',
      ctx,
    );
    expect(runText(out)).toBe('All equity capital is fully paid up.');
  });

  it('branches on array emptiness via .length', () => {
    // Vardhman is a pure fresh issue, so there are no selling shareholders
    const out = renderTemplate(
      '{{#if offer.sellingShareholders.length }}OFS applies.{{/if}}{{#unless offer.sellingShareholders.length }}This Issue is entirely a fresh issue.{{/unless}}',
      ctx,
    );
    expect(runText(out)).toBe('This Issue is entirely a fresh issue.');
  });

  it('spans whole paragraphs', () => {
    const out = renderTemplate(
      `{{#if company.isPublicLimited }}First paragraph.

Second paragraph.{{/if}}`,
      ctx,
    );
    expect(out).toHaveLength(2);
  });

  it('detects an unterminated conditional rather than looping', () => {
    expect(() =>
      renderTemplate('{{#if a}}'.repeat(1) + 'x', { facts: {} }),
    ).not.toThrow();
  });
});

describe('block structure', () => {
  it('parses headings by level', () => {
    const out = renderTemplate('## Terms of the Issue\n\n### Ranking of Equity Shares', ctx);
    expect(out[0]).toMatchObject({ type: 'heading', level: 2, text: 'Terms of the Issue' });
    expect(out[1]).toMatchObject({ type: 'heading', level: 3 });
  });

  it('resolves facts inside headings', () => {
    const out = renderTemplate('## {{ company.name }}', ctx);
    expect(out[0]).toMatchObject({ type: 'heading', text: 'Vardhman Precision Components Limited' });
  });

  it('parses bullet lists', () => {
    const out = renderTemplate('- first item\n- second {{ company.sector }}', ctx);
    expect(out[0].type).toBe('list');
    expect((out[0] as any).items).toHaveLength(2);
  });

  it('splits paragraphs on blank lines and collapses wrapped whitespace', () => {
    const out = renderTemplate('One\nwrapped line.\n\nTwo.', ctx);
    expect(out).toHaveLength(2);
    expect(runText(out)).toBe('One wrapped line.\nTwo.');
  });

  it('estimates pages for the progress indicator', () => {
    const long = Array.from({ length: 60 }, (_, i) => `Paragraph ${i} of body text.`).join('\n\n');
    expect(estimatePages(renderTemplate(long, ctx))).toBeGreaterThan(1);
  });
});
