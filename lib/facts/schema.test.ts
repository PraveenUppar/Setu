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

  it('does not force the model to supply fields that have defaults', () => {
    const schema = extractionSchemaFor('company') as any;
    // nameChanges defaults to [] — the model should not be required to invent it
    expect(schema.required).not.toContain('nameChanges');
    expect(schema.required).toContain('name');
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
