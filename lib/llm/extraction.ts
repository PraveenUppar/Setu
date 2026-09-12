import { extractionSchemaFor } from '../facts/schema';
import type { FactBase } from '../facts/schema';
import type { LlmClient, StructuredResponse } from './client';

/**
 * The extraction harness (S7) — same shape as `narrative.ts`'s harness,
 * because the same discipline applies: one system prompt every caller
 * shares, so "never invent" cannot quietly stop being enforced somewhere.
 *
 * D47, the hard way: `extractionSchemaFor()` alone is not enough. The first
 * real call this project made against it invented a CIN, a date and a
 * website to satisfy a schema `required` array — fixed there, but the
 * lesson generalises to the prompt too: say plainly that a missing field
 * should be OMITTED, not guessed, since a model under schema pressure will
 * reach for a plausible value unless told not to in so many words.
 */
const NO_INVENTION_EXTRACTION_PROMPT = `You extract facts from a page of an Indian SME IPO prospectus or a supporting corporate document (certificate of incorporation, board resolution, PAS-3 filing, etc.) into the given JSON schema.

Extract ONLY facts explicitly stated in the document text below. Never invent, infer, guess, or fill in a plausible-sounding value for a fact not present in the text — this includes a CIN, a date, an address, an email, a website or a phone number that is not itself printed in the text. Where the text does not state a field, OMIT that field from your response entirely. A wrong or invented fact in a legal offer document is a statutory liability (Companies Act s.34/35) — omission is always the safer answer than a guess.`;

export interface ExtractionRequest {
  domain: keyof FactBase;
  /** The targeted page text (see `page-targeting.ts`) — never the whole document. */
  pageText: string;
}

export async function extractFacts<T = unknown>(
  client: LlmClient,
  req: ExtractionRequest,
): Promise<StructuredResponse<T>> {
  const schema = extractionSchemaFor(req.domain);
  const prompt = `Extract facts for the "${req.domain}" section of the fact base from the following document pages:\n\n${req.pageText}`;
  return client.generateStructured<T>({ systemInstruction: NO_INVENTION_EXTRACTION_PROMPT, prompt, schema });
}
