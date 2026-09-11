import { describe, it, expect } from 'vitest';
import { extractionSchemaFor, zFactBase } from './schema/index';

/**
 * MM3 — one Zod definition drives validation AND Claude's extraction schema.
 * If these two ever diverge, the model is being asked for a shape the
 * validator will reject, so this is the test that keeps them honest.
 */
describe('one schema, five uses', () => {
  it('generates a strict-tool-use-compatible extraction schema', () => {
    const schema = extractionSchemaFor('company') as any;

    expect(schema.type).toBe('object');
    // Claude strict tool use requires this on every object node
    expect(schema.additionalProperties).toBe(false);
    expect(schema.properties.registeredOffice.additionalProperties).toBe(false);
    expect(schema.properties.companySecretary.additionalProperties).toBe(false);
  });

  it('carries .describe() text through as model-facing field guidance', () => {
    const schema = extractionSchemaFor('company') as any;
    expect(schema.properties.name.description).toMatch(/legal name/i);
    expect(schema.properties.cin.description).toMatch(/Corporate Identity Number/i);
  });

  it('never marks a field required, even one required for a complete fact base', () => {
    // D47: a real Gemini call proved this the hard way. `cin`, `dateOfIncorporation`
    // and `isPublicLimited` have no Zod default (the FORM must not accept a blank),
    // so `io: 'input'` alone leaves them in `required` — and asked to extract from a
    // sentence naming only the company, with an explicit "omit, don't invent"
    // instruction, the model fabricated a CIN, a date and a website rather than
    // violate `required`. "Required for a usable fact base" is `isUsable()`'s job,
    // downstream of extraction — never the tool schema's.
    const schema = extractionSchemaFor('company') as any;
    expect(schema.required).toEqual([]);
    expect(schema.properties.registeredOffice.required).toEqual([]);
    expect(schema.properties.companySecretary.required).toEqual([]);
  });

  it('validates against the same definition it generated from', () => {
    const incomplete = zFactBase.shape.company.safeParse({ name: 'Om Galaxy Limited' });
    expect(incomplete.success).toBe(false);
  });

  it('rejects a malformed CIN', () => {
    const result = zFactBase.shape.company.safeParse({ name: 'X', cin: 'NOT-A-CIN' });
    expect(result.success).toBe(false);
  });

  it('covers every domain without throwing', () => {
    for (const domain of Object.keys(zFactBase.shape) as (keyof typeof zFactBase.shape)[]) {
      expect(() => extractionSchemaFor(domain)).not.toThrow();
    }
  });
});
