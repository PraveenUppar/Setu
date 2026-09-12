import { describe, it, expect } from 'vitest';
import { createFakeClient } from './client';
import { extractFacts } from './extraction';

describe('extractFacts', () => {
  it('builds the tool schema from extractionSchemaFor and never marks anything required', async () => {
    const client = createFakeClient({
      structured: [{ raw: '{"name":"Vardhman Precision Components Limited"}', parsed: { name: 'X' } }],
    });

    const result = await extractFacts(client, {
      domain: 'company',
      pageText: 'The company is named Vardhman Precision Components Limited.',
    });

    expect(result.parsed).toEqual({ name: 'X' });
    expect(client.calls.structured).toHaveLength(1);
    const call = client.calls.structured[0];
    expect(call.schema.required).toEqual([]); // D47: never required, at any nesting level
    expect(call.prompt).toContain('Vardhman Precision Components Limited');
    expect(call.systemInstruction).toMatch(/never invent/i);
    expect(call.systemInstruction).toMatch(/omit/i);
  });

  it('sends only the targeted page text, not a wider document', async () => {
    const client = createFakeClient({ structured: [{ raw: '{}', parsed: {} }] });
    await extractFacts(client, { domain: 'management', pageText: '[Page 5]\nBoard of Directors...' });
    expect(client.calls.structured[0].prompt).toContain('[Page 5]');
    expect(client.calls.structured[0].prompt).toContain('"management"');
  });
});
