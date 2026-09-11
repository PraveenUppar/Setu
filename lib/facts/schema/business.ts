import { z } from 'zod';
import { zMoney, zPercent } from './shared';

/**
 * Module M5 — Business Operations.
 *
 * The narrative sections — Our Business, Industry Overview, Risk Factors —
 * are drafted from this at S9 and S10, from `factSlice` only. Until then the
 * figures already do work: the customer concentration rule (CO-009) reads
 * `topCustomers`, and the facilities feed the unit-wise approval tables.
 *
 * Kept to what a promoter can state as fact. Anything that is a judgement
 * about the business belongs in the drafting harness, not in a form.
 */

export const zFacility = z.object({
  name: z.string().optional().describe('e.g. "Unit I", "Chakan facility"'),
  location: z.string(),
  owned: z.boolean().describe('Owned, as opposed to leased'),
  capacity: z.string().optional().describe('Installed capacity with its unit, as stated'),
  capacityUtilisationPercent: zPercent.optional().describe('Utilisation in the last financial year'),
  areaSqFt: z.number().nonnegative().optional(),
});

export const zBusiness = z.object({
  topCustomers: z
    .array(z.object({ name: z.string(), revenueShare: zPercent }))
    .default([])
    .describe('Top customers by share of revenue in the last financial year; drives the concentration risk factor'),
  topSuppliers: z
    .array(z.object({ name: z.string(), purchaseShare: zPercent }))
    .default([]),
  facilities: z.array(zFacility).default([]),
  employeeCount: z.number().int().optional().describe('Permanent employees on the rolls'),
  orderBook: zMoney.optional().describe('Unexecuted order book in rupees, as on a stated date'),
  productLines: z
    .string()
    .optional()
    .describe('Principal products or services, one per line, as the business describes them'),
  exportRevenueShare: zPercent
    .optional()
    .describe('Share of revenue from exports in the last financial year'),
  /**
   * D54, corpus-corroborated at three documents (Maxwell's Gujarat
   * exposure, Shakti Polytarp's Madhya Pradesh exposure, Axiom Gas's
   * Karnataka/Telangana/Maharashtra cluster): where a substantial share of
   * revenue comes from one state or a small group of states, the document
   * names it as a risk factor with the actual share. Two flat fields, not a
   * nested object — the module engine's `Field` has no object type, only
   * scalars and tables, so `primaryMarketDescription` and
   * `primaryMarketRevenueSharePercent` are asked as two ordinary questions.
   * Both optional, not default-false: unlike `exportRevenueShare` (every
   * issuer either exports or does not), this concentration genuinely may
   * not apply at all to a nationally diversified issuer — absence is not
   * the same claim as a stated 0%.
   */
  primaryMarketDescription: z
    .string()
    .optional()
    .describe('The state or states revenue is substantially concentrated in, as the document would name them, e.g. "the State of Maharashtra"'),
  primaryMarketRevenueSharePercent: zPercent
    .optional()
    .describe('Share of total revenue from that state or states in the last financial year'),
});

export type Facility = z.infer<typeof zFacility>;
export type Business = z.infer<typeof zBusiness>;
