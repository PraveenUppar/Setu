import { z } from 'zod';
import { zAddress, zCIN, zDate, zPercent, zSector } from './shared';

/** Module M1 — Company & History. The simplest module; no repeaters beyond name changes. */

export const zNameChange = z.object({
  previousName: z.string().describe('The name the company held before this change'),
  newName: z.string().describe('The name adopted'),
  date: zDate.describe('Date of the fresh certificate of incorporation'),
  reason: z.string().optional().describe('Why the name was changed, if stated'),
});

export const zCompany = z.object({
  name: z.string().describe('Current full legal name, including "Limited"'),
  cin: zCIN.describe('21-character Corporate Identity Number'),

  dateOfIncorporation: zDate.describe('Date on the original certificate of incorporation'),
  incorporatedUnder: z
    .enum(['COMPANIES_ACT_1956', 'COMPANIES_ACT_2013'])
    .describe('Which Companies Act the company was originally incorporated under'),

  /**
   * A private limited company must convert to public before filing.
   * Typically 45-60 days, so it is flagged early in the eligibility pre-check.
   */
  isPublicLimited: z.boolean().describe('Whether the company is already a public limited company'),
  conversionToPublicDate: zDate
    .optional()
    .describe('Date of the fresh certificate of incorporation on conversion to public limited'),

  nameChanges: z
    .array(zNameChange)
    .default([])
    .describe('Every name change since incorporation, oldest first'),

  /**
   * E-09, S9's formulation: where the name changed within the last year, at
   * least 50% of the preceding full year's restated revenue must come from the
   * activity the new name indicates. Null where no name change is in the
   * window, or where the figure has not been computed yet.
   */
  revenueShareFromNewNameActivity: zPercent
    .nullable()
    .default(null)
    .describe(
      'Percentage of the preceding full financial year restated revenue earned from the activity indicated by the new name',
    ),

  /**
   * R-026 (Reg 229(4)): an issuer converted from a proprietorship, partnership
   * firm or LLP must have existed as a company for at least one full financial
   * year before filing. A very common SME path, and easy to miss because the
   * company looks new while the business is old.
   */
  convertedFromFirmType: z
    .enum(['NONE', 'PROPRIETORSHIP', 'PARTNERSHIP', 'LLP'])
    .default('NONE')
    .describe('What the business was before it became a company, if anything'),
  conversionFromFirmDate: zDate
    .nullable()
    .default(null)
    .describe('Date the company came into existence on conversion from the firm'),

  registeredOffice: zAddress,
  corporateOffice: zAddress.optional().describe('Omit if the same as the registered office'),

  /** BSE SME requires a functional website (E-06). */
  website: z.string().describe('Company website URL'),
  email: z.string().describe('Company contact email'),
  telephone: z.string(),

  companySecretary: z
    .object({
      name: z.string(),
      email: z.string(),
      telephone: z.string(),
    })
    .describe('Company Secretary and Compliance Officer'),

  sector: zSector.describe('Primary sector, which selects the regulatory boilerplate'),
  businessDescription: z.string().describe('One or two sentences on what the company does'),
});

export type Company = z.infer<typeof zCompany>;
export type NameChange = z.infer<typeof zNameChange>;
