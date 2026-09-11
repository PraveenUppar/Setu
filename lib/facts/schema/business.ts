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
});

export type Facility = z.infer<typeof zFacility>;
export type Business = z.infer<typeof zBusiness>;
