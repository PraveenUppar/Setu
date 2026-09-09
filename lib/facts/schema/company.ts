import { z } from 'zod';
import { zAddress, zCIN, zDate, zSector } from './shared';

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
