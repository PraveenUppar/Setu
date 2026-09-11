import type { LlmClient, LlmResponse } from './client';

/**
 * The drafting harness (S9) — one harness, many callers, per
 * 02-architecture.md's "Drafting harness" section:
 *
 *   - Model sees ONLY `factSlice` for the thing being drafted, never the
 *     whole fact base
 *   - No-invention system prompt; a gap in the facts is written around, never
 *     filled with something plausible
 *   - Forced fact citation per claim, checkable afterwards (`untraceableNumbers`)
 *   - Regenerate, keep prior versions (`lib/store/narrative-store.ts`)
 *
 * Every caller — a risk factor's full paragraph, eventually a whole narrative
 * section like Our Business — goes through this one function. A second,
 * differently-worded prompt path is how "no invention" quietly stops being
 * enforced in one caller and not another.
 */

const NO_INVENTION_SYSTEM_PROMPT = `You draft prose for an Indian SME IPO prospectus (a Draft Red Herring Prospectus or similar offer document).

You may state ONLY facts present in the JSON factSlice you are given below. Never invent a number, a name, a date, a percentage or a claim that is not directly supported by the factSlice — not even a plausible-sounding one, and not even to make a sentence read more smoothly. Where the factSlice does not contain enough to fully explain something, write around the gap rather than filling it with an unsupported detail.

Write in the first person plural, in the register of an Indian offer document: "our Company", "our Promoters", "our Board", "we", "us". Do NOT use the company's own name as a substitute for "our Company" partway through, even where the factSlice states it for identification — offer documents use the company's own name only when first introducing it, never as a stylistic variation later in the same section. Factual and unembellished — no marketing language, no superlatives the factSlice does not itself support. Plain prose, no headings, no bullet points, no markdown.`;

export interface NarrativeRequest {
  /** All the model may reference. Never the whole fact base. */
  factSlice: object;
  /** What to write, in plain language — the ask, not the facts. */
  instructions: string;
  wordTarget?: number;
}

export async function draftNarrative(client: LlmClient, req: NarrativeRequest): Promise<LlmResponse> {
  const prompt = [
    req.instructions,
    req.wordTarget ? `Target length: about ${req.wordTarget} words.` : null,
    '',
    'factSlice (the ONLY facts you may state):',
    JSON.stringify(req.factSlice, null, 2),
  ]
    .filter((line) => line !== null)
    .join('\n');

  return client.generateText({ systemInstruction: NO_INVENTION_SYSTEM_PROMPT, prompt });
}

/**
 * The traceability gate (02-architecture.md): "take 20 generated sentences
 * at random; every one must trace to a fact-base entry. Any that doesn't is
 * the bug that matters most."
 *
 * A full semantic check needs a human or a second model call; this is the
 * cheap, sharp, MECHANICAL subset of it — every number the draft states
 * (a percentage, a rupee figure, a share count, a year) must appear
 * somewhere in the factSlice's own JSON. Numbers are where fabrication is
 * most dangerous (a wrong percentage reads as confidently as a right one)
 * and the only claim type a substring check can verify without a model
 * grading its own homework. Prose fabrication style ("substantial",
 * "significant") still needs a human read — this gate does not replace one.
 *
 * D51: the first real batch run against nine drafts caught two bugs in this
 * function, not in the model — proof the gate needs the same "run it for
 * real before trusting it" discipline as everything else that talks to a
 * model (D47). A naive `\.?\d*` regex swallowed a sentence-ending period
 * onto a whole number ("...Rs 1600000. Our..." matched as "1600000." —
 * unmatchable, since the factSlice holds "1600000" with no trailing dot).
 * A plain substring check failed "8.40" against a factSlice holding `8.4` —
 * the same value, a different decimal rendering. Both are fixed by parsing
 * every number to a float and comparing values, not substrings, and by
 * requiring at least one digit after a decimal point before including it in
 * the match at all.
 */
function extractNumbers(text: string): number[] {
  const matches = text.match(/\d[\d,]*(\.\d+)?/g) ?? [];
  return matches.map((m) => parseFloat(m.replace(/,/g, '')));
}

export function untraceableNumbers(draftText: string, factSlice: object): string[] {
  const factNumbers = new Set(extractNumbers(JSON.stringify(factSlice)));
  const draftMatches = draftText.match(/\d[\d,]*(\.\d+)?/g) ?? [];
  return draftMatches.filter((n) => !factNumbers.has(parseFloat(n.replace(/,/g, ''))));
}
