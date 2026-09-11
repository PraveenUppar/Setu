import { existsSync, readFileSync, rmSync } from 'node:fs';
import { describe, it, expect, afterEach } from 'vitest';
import { createFakeClient } from './client';
import { snapshotResponse } from './snapshot';

describe('createFakeClient', () => {
  it('returns a queued structured response and records the request', async () => {
    const client = createFakeClient({
      structured: [{ raw: '{"name":"Vardhman"}', parsed: { name: 'Vardhman' } }],
    });

    const result = await client.generateStructured({
      systemInstruction: 'Extract company facts. Never invent a value not present in the text.',
      prompt: 'PAGE 4: The company is named Vardhman...',
      schema: { type: 'object', properties: { name: { type: 'string' } } },
    });

    expect(result.parsed).toEqual({ name: 'Vardhman' });
    expect(client.calls.structured).toHaveLength(1);
    expect(client.calls.structured[0].prompt).toContain('Vardhman');
  });

  it('keyed responses answer by prompt regardless of call order', async () => {
    const client = createFakeClient({
      text: {
        'draft risk A': { raw: 'Risk A prose' },
        'draft risk B': { raw: 'Risk B prose' },
      },
    });

    const b = await client.generateText({ systemInstruction: '', prompt: 'draft risk B' });
    const a = await client.generateText({ systemInstruction: '', prompt: 'draft risk A' });

    expect(b.raw).toBe('Risk B prose');
    expect(a.raw).toBe('Risk A prose');
  });

  it('throws rather than silently returning nothing for an unqueued call', async () => {
    const client = createFakeClient({});
    await expect(
      client.generateStructured({ systemInstruction: '', prompt: 'anything', schema: {} }),
    ).rejects.toThrow(/no structured response queued/);
  });
});

describe('snapshotResponse', () => {
  const path = 'fixtures/llm-client-test/tmp.json';

  afterEach(() => {
    rmSync('fixtures/llm-client-test', { recursive: true, force: true });
  });

  it('writes the raw response to fixtures/ so downstream work never re-calls the API', () => {
    snapshotResponse('llm-client-test/tmp.json', { raw: '{"ok":true}' });

    expect(existsSync(path)).toBe(true);
    expect(JSON.parse(readFileSync(path, 'utf8'))).toEqual({ raw: '{"ok":true}' });
  });
});
