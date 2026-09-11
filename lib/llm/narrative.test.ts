import { describe, it, expect } from 'vitest';
import { createFakeClient } from './client';
import { draftNarrative, untraceableNumbers } from './narrative';

describe('draftNarrative', () => {
  it('sends only the factSlice and the instructions, never a wider fact base', async () => {
    const client = createFakeClient({ text: [{ raw: 'Drafted prose.' }] });
    const factSlice = { topCustomers: [{ name: 'Acme', revenueShare: 61.3 }] };

    const result = await draftNarrative(client, {
      factSlice,
      instructions: 'Expand this into a full paragraph.',
    });

    expect(result.raw).toBe('Drafted prose.');
    expect(client.calls.text).toHaveLength(1);
    const [call] = client.calls.text;
    expect(call.prompt).toContain('Expand this into a full paragraph.');
    expect(call.prompt).toContain('"revenueShare": 61.3');
    expect(call.systemInstruction).toMatch(/never invent/i);
  });

  it('includes the word target when given, and omits it when not', async () => {
    const client = createFakeClient({ text: [{ raw: 'x' }, { raw: 'y' }] });

    await draftNarrative(client, { factSlice: {}, instructions: 'Write it.', wordTarget: 150 });
    expect(client.calls.text[0].prompt).toContain('about 150 words');

    await draftNarrative(client, { factSlice: {}, instructions: 'Write it.' });
    expect(client.calls.text[1].prompt).not.toContain('words');
  });
});

describe('untraceableNumbers', () => {
  it('finds nothing wrong when every number in the draft is in the factSlice', () => {
    const factSlice = { revenueShare: 61.3, customerCount: 5 };
    const draft = 'Our top 5 customers accounted for 61.3% of revenue.';
    expect(untraceableNumbers(draft, factSlice)).toEqual([]);
  });

  it('catches a fabricated number the factSlice does not contain', () => {
    const factSlice = { revenueShare: 61.3 };
    const draft = 'Our top 5 customers accounted for 61.3% of revenue, up from 45% last year.';
    expect(untraceableNumbers(draft, factSlice)).toContain('45');
  });

  it('matches a comma-grouped figure against its bare form in the factSlice', () => {
    const factSlice = { totalBorrowings: '8600000' };
    const draft = 'Our total borrowings stood at 8,600,000 rupees.';
    expect(untraceableNumbers(draft, factSlice)).toEqual([]);
  });

  // D51: both regressions below are real bugs a live batch run caught —
  // false "fabrication" flags on drafts that were actually faithful.
  it('does not glue a sentence-ending period onto the preceding whole number', () => {
    const factSlice = { contingentLiabilityItems: [{ amountLatest: '1600000' }] };
    const draft = 'Letters of credit outstanding amounted to Rs 1600000. This exposes us to risk.';
    expect(untraceableNumbers(draft, factSlice)).toEqual([]);
  });

  it('treats "8.40" and "8.4" as the same traced value', () => {
    const factSlice = { exportRevenueShare: 8.4 };
    const draft = 'Exports accounted for 8.40% of our revenue.';
    expect(untraceableNumbers(draft, factSlice)).toEqual([]);
  });

  it('still catches a genuinely different decimal value', () => {
    const factSlice = { exportRevenueShare: 8.4 };
    const draft = 'Exports accounted for 9.40% of our revenue.';
    expect(untraceableNumbers(draft, factSlice)).toEqual(['9.40']);
  });
});
