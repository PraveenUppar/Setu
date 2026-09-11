import { GoogleGenAI } from '@google/genai';

/**
 * The one place any Setu code talks to an LLM.
 *
 * D43: Gemini free tier, not Claude, and not paid — a hobby-project decision.
 * `LlmClient` is the seam that decision sits behind: extraction (S7),
 * narrative (S9) and risk prose (S10) all call this interface, never the SDK
 * directly, so a provider change stays a change of driver, not of callers —
 * same reasoning as `lib/store/fact-store.ts` keeping Supabase swappable.
 *
 * It is also what makes D14 possible to enforce ("no test calls the API"):
 * `createFakeClient` implements the same interface from canned responses, so
 * everything downstream — page targeting, the review UI, the traceability
 * gate — is testable without a network call or a quota spend.
 */

export const GEMINI_MODEL = 'gemini-3.5-flash-lite';

export interface StructuredRequest {
  /** The no-invention rule and any per-call framing. Never the fact data itself. */
  systemInstruction: string;
  /** The fact slice / page text this specific call may see. */
  prompt: string;
  /** JSON Schema, e.g. from `extractionSchemaFor()`. */
  schema: Record<string, unknown>;
}

export interface TextRequest {
  systemInstruction: string;
  prompt: string;
}

export interface LlmResponse {
  /** The exact text the model returned, before any parsing — what D14 snapshots. */
  raw: string;
}

export interface StructuredResponse<T> extends LlmResponse {
  parsed: T;
}

export interface LlmClient {
  generateStructured<T = unknown>(req: StructuredRequest): Promise<StructuredResponse<T>>;
  generateText(req: TextRequest): Promise<LlmResponse>;
}

/**
 * `responseSchema` takes a plain JSON Schema object as of SDK 1.9+ (routed
 * internally to `responseJsonSchema`), so `z.toJSONSchema()`'s output can be
 * passed straight through — unlike Claude's strict tool use, which needed
 * `closeObjects()`'s `additionalProperties: false` pass (D19, superseded by
 * D43). Not yet verified against a real call; treat as provisional until one
 * is snapshotted.
 */
export function createGeminiClient(apiKey: string | undefined = process.env.GEMINI_API_KEY): LlmClient {
  if (!apiKey) {
    throw new Error(
      'GEMINI_API_KEY is not set. Get a free key at https://aistudio.google.com/apikey and put it in .env.local.',
    );
  }
  const ai = new GoogleGenAI({ apiKey });

  return {
    async generateStructured<T>({ systemInstruction, prompt, schema }: StructuredRequest) {
      const response = await ai.models.generateContent({
        model: GEMINI_MODEL,
        contents: prompt,
        config: {
          systemInstruction,
          responseMimeType: 'application/json',
          responseSchema: schema,
        },
      });
      const raw = response.text ?? '';
      return { raw, parsed: JSON.parse(raw) as T };
    },

    async generateText({ systemInstruction, prompt }: TextRequest) {
      const response = await ai.models.generateContent({
        model: GEMINI_MODEL,
        contents: prompt,
        config: { systemInstruction },
      });
      return { raw: response.text ?? '' };
    },
  };
}

/**
 * A client backed by canned responses instead of the network. Tests take a
 * queue (or a keyed map, for calls made out of order) and assert on what was
 * asked as much as what came back — D14's "no test calls the API", made
 * mechanical rather than a rule someone has to remember.
 */
export function createFakeClient(responses: {
  structured?: Array<StructuredResponse<unknown>> | Record<string, StructuredResponse<unknown>>;
  text?: Array<LlmResponse> | Record<string, LlmResponse>;
}): LlmClient & { calls: { structured: StructuredRequest[]; text: TextRequest[] } } {
  const calls = { structured: [] as StructuredRequest[], text: [] as TextRequest[] };
  const structuredQueue = Array.isArray(responses.structured) ? [...responses.structured] : undefined;
  const textQueue = Array.isArray(responses.text) ? [...responses.text] : undefined;

  return {
    calls,
    async generateStructured<T>(req: StructuredRequest) {
      calls.structured.push(req);
      const byPrompt = !Array.isArray(responses.structured) ? responses.structured?.[req.prompt] : undefined;
      const next = byPrompt ?? structuredQueue?.shift();
      if (!next) throw new Error(`createFakeClient: no structured response queued for prompt "${req.prompt}"`);
      return next as StructuredResponse<T>;
    },
    async generateText(req: TextRequest) {
      calls.text.push(req);
      const byPrompt = !Array.isArray(responses.text) ? responses.text?.[req.prompt] : undefined;
      const next = byPrompt ?? textQueue?.shift();
      if (!next) throw new Error(`createFakeClient: no text response queued for prompt "${req.prompt}"`);
      return next;
    },
  };
}
