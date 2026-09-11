import { z } from 'zod';
import { zCompany } from './company';
import { zCapital } from './capital';
import { zFinancials } from './financials';
import { zOffer } from './offer';
import { zPromoters } from './promoters';
import { zManagement } from './management';
import { zBusiness } from './business';
import { zLegal } from './legal';
import { zApprovals } from './approvals';
import { zGroupCompanies } from './group-companies';

export * from './shared';
export * from './company';
export * from './capital';
export * from './financials';
export * from './offer';
export * from './promoters';
export * from './management';
export * from './business';
export * from './legal';
export * from './approvals';
export * from './group-companies';

/* ------------------------------------------------------------------ */
/* The composite                                                       */
/* ------------------------------------------------------------------ */

/**
 * The Issuer Fact Base — one canonical object per issuer.
 *
 * Values are PLAIN, matching these schemas exactly. Provenance lives beside
 * it in a ProvenanceMap keyed by FactPath (see provenance.ts, D18), because
 * these same schemas generate Claude's extraction tool schema and we want
 * plain values back from the model, not self-reported provenance.
 *
 * Every domain is `.partial()`-friendly in practice: a fact base is filled in
 * progressively, so parse with `zFactBase.partial()` or per-domain during
 * intake, and with the full schema only when checking completeness.
 */
export const zFactBase = z.object({
  company: zCompany,
  capital: zCapital,
  promoters: zPromoters,
  management: zManagement,
  business: zBusiness,
  financials: zFinancials,
  legal: zLegal,
  approvals: zApprovals,
  offer: zOffer,
  groupCompanies: zGroupCompanies,
});

export type FactBase = z.infer<typeof zFactBase>;

/** A partially filled fact base, which is what exists for most of the process. */
export type PartialFactBase = {
  [K in keyof FactBase]?: Partial<FactBase[K]>;
};

type JsonSchema = Record<string, unknown>;

/**
 * Claude's strict tool use requires `additionalProperties: false` on every
 * object node. Zod 4 emits it in `output` mode but NOT in `input` mode, and
 * we want input mode: it keeps fields that have defaults out of `required`,
 * so the model is not forced to invent values it could not find.
 *
 * So: generate with input semantics, then close every object ourselves.
 */
function closeObjects(node: unknown): unknown {
  if (Array.isArray(node)) return node.map(closeObjects);
  if (node === null || typeof node !== 'object') return node;

  const out: JsonSchema = {};
  for (const [key, value] of Object.entries(node as JsonSchema)) {
    out[key] = closeObjects(value);
  }
  if (out.type === 'object' && out.additionalProperties === undefined) {
    out.additionalProperties = false;
  }
  return out;
}

/**
 * Claude's extraction tool schema for one domain, from the same definition
 * that validates the form. This is MM3 — one schema, five uses.
 *
 * `.describe()` text on each field becomes the field description the model
 * reads, so those strings are instructions, not comments.
 */
export function extractionSchemaFor(domain: keyof FactBase): JsonSchema {
  const generated = z.toJSONSchema(zFactBase.shape[domain], { io: 'input' });
  return closeObjects(generated) as JsonSchema;
}
