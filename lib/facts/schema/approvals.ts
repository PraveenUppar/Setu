import { z } from 'zod';
import { zDate } from './shared';

/**
 * Module M8 — Approvals and Licences.
 *
 * "Government and Other Approvals" (section map #29) is COMPUTED from this.
 * Both primary sources open with the same two paragraphs, list the approvals
 * for the issue (board and shareholder resolutions, in-principle approval,
 * the depository agreements, the ISIN — all facts held elsewhere), then the
 * incorporation certificates (M1), the tax registrations, and tables of
 * business, labour and environmental approvals, per unit where the company
 * has several (Om Galaxy pp.312-315, Maxwell pp.249-256).
 *
 * The tables share their columns: authorisation granted, issuing authority,
 * registration or licence number, date of issue, valid up to.
 */

export const zLicenceCategory = z.enum([
  'TAX',
  'BUSINESS',
  'LABOUR',
  'ENVIRONMENT',
  'INTELLECTUAL_PROPERTY',
  'OTHER',
]);

export const zLicenceStatus = z.enum(['OBTAINED', 'APPLIED', 'RENEWAL_APPLIED']);

export const zLicence = z.object({
  name: z.string().describe('The authorisation granted, e.g. "Factory Licence under the Factories Act, 1948"'),
  authority: z.string().describe('Issuing authority'),
  number: z.string().optional().describe('Registration, reference or licence number'),
  issuedOn: zDate.optional().describe('Date of issue or last renewal'),
  validUntil: zDate.nullable().describe('Expiry date; null where valid until cancelled'),
  category: zLicenceCategory.default('BUSINESS'),
  unit: z
    .string()
    .optional()
    .describe('The manufacturing unit or premises this applies to, where the company has more than one'),
  /**
   * A licence applied for but not yet granted, or expired with renewal
   * pending, is disclosed under "approvals applied for" rather than silently
   * listed as held. The exchange checks.
   */
  status: zLicenceStatus.default('OBTAINED'),
});

export const zApprovals = z.object({
  licences: z.array(zLicence).default([]),

  /** The tax registrations are stated by number in the section. */
  pan: z.string().optional().describe('Permanent Account Number of the company'),
  tan: z.string().optional().describe('Tax Deduction and Collection Account Number'),
  gstin: z.string().optional().describe('GST registration number of the principal place of business'),

  /**
   * "Approvals required but not yet obtained" is a standing negative in the
   * ordinary case. Where the company must obtain something for its proposed
   * business — a new unit's consent to establish, say — the document lists it.
   */
  approvalsRequiredNotObtained: z
    .string()
    .nullable()
    .default(null)
    .describe('Approvals required for the present or proposed business that have not been applied for; null if none'),
});

export type Licence = z.infer<typeof zLicence>;
export type LicenceCategory = z.infer<typeof zLicenceCategory>;
export type Approvals = z.infer<typeof zApprovals>;
