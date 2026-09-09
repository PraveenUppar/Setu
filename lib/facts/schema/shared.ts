import { z } from 'zod';

/**
 * Shared schema pieces.
 *
 * These Zod schemas are the single source of truth, used five ways (MM3):
 * client validation, server validation, Claude's extraction tool schema
 * (via `z.toJSONSchema`), fact-base parsing, and inferred TypeScript types.
 *
 * Every field carries `.describe()` — that text becomes the field's guidance
 * in the extraction schema, so it is instruction to the model, not a comment.
 */

/** Canonical money: a decimal string in rupees. See lib/facts/money.ts. */
export const zMoney = z
  .string()
  .regex(/^-?\d+(\.\d+)?$/, 'Must be a decimal amount in rupees, as a string');

/** ISO date, YYYY-MM-DD. */
export const zDate = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Must be a date as YYYY-MM-DD');

/** Whole shares. Counts are integers and safe as numbers; amounts are not. */
export const zShares = z.number().int().nonnegative();

/** A percentage, 0..100. */
export const zPercent = z.number().min(0).max(100);

export const zCIN = z
  .string()
  .regex(/^[LUu]\d{5}[A-Za-z]{2}\d{4}[A-Za-z]{3}\d{6}$/, 'Must be a valid 21-character CIN');

export const zPAN = z.string().regex(/^[A-Z]{5}\d{4}[A-Z]$/, 'Must be a valid PAN');

export const zDIN = z.string().regex(/^\d{8}$/, 'Must be an 8-digit DIN');

export const zAddress = z.object({
  line1: z.string(),
  line2: z.string().optional(),
  city: z.string(),
  state: z.string(),
  pincode: z.string().regex(/^\d{6}$/),
  country: z.string().default('India'),
});

/** Which SME platform the issue is on. Switches eligibility rules and boilerplate. */
export const zExchange = z.enum(['BSE_SME', 'NSE_EMERGE']);

/** D15: book-built first; fixed price is a later branch on ~5 sections. */
export const zIssueType = z.enum(['BOOK_BUILT', 'FIXED_PRICE']);

/**
 * Sector drives the Key Regulations and Policies boilerplate and the
 * approvals checklist, both of which are switched wholesale.
 */
export const zSector = z.enum([
  'MANUFACTURING',
  'ENGINEERING',
  'IT_SERVICES',
  'TRADING',
  'TEXTILES',
  'CHEMICALS',
  'PHARMA',
  'AGRO',
  'CONSTRUCTION',
  'SERVICES',
  'OTHER',
]);

export type Exchange = z.infer<typeof zExchange>;
export type IssueType = z.infer<typeof zIssueType>;
export type Sector = z.infer<typeof zSector>;
export type Address = z.infer<typeof zAddress>;
