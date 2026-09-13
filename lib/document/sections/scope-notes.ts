import type { SectionSpec } from '../section';

/**
 * Three numbered subsections this app will never draft, made visible rather
 * than left silently absent from the registry.
 *
 * All three are `producer: 'external'` — the exact mechanism
 * `summaryOfFinancialInformation` (#6, `introduction.ts`) already uses:
 * `renderSection()`'s `external` case prints a heading and a highlighted
 * `[TO BE PROVIDED: <externalNote>]` placeholder that is also a real
 * gap-dashboard finding, from one check (MM4). Nothing new to build in the
 * engine; these are three new specs.
 *
 * Each `externalNote` states both WHY the app doesn't draft it and WHO
 * supplies it — a first-time issuer reading the gap should know exactly who
 * to ask, the same standard every other gap's `ask` text is held to.
 */

export const taxBenefits: SectionSpec = {
  id: 'particulars.taxBenefits',
  partOf: '13. Statement of Special / Possible Tax Benefits',
  title: 'Statement of Special Tax Benefits',
  producer: 'external',
  order: 2250,
  group: 'SECTION - PARTICULARS OF THE OFFER',
  clause: 'ICDR Schedule VI Part A',
  externalNote:
    'The Statement of Special Tax Benefits available to the Company and its shareholders under applicable direct and indirect tax laws — a formal opinion addressed to the Board and the Book Running Lead Manager, obtained from the Company\'s Statutory Auditor or tax advisor. This is a CA opinion this app does not produce.',
};

export const keyIndustryRegulations: SectionSpec = {
  id: 'aboutCompany.keyRegulations',
  partOf: '16. Key Industry Regulations and Policies',
  title: 'Key Industry Regulations and Policies',
  producer: 'external',
  order: 2400,
  group: 'SECTION - ABOUT THE COMPANY',
  clause: 'ICDR Schedule VI Part A',
  externalNote:
    'The regulatory and policy framework applicable to the Company\'s specific sector, confirmed by Legal Counsel against the Company\'s actual business — a sector-specific legal position this app cannot draft from the fact base alone. (The generic company-law and labour-law core that applies to every Indian company regardless of sector is boilerplate and could be built later without this dependency; it is left out of scope here too, for now, rather than drafting half a section.)',
};

export const restatedFinancialInformation: SectionSpec = {
  id: 'financial.restatedFinancialInformation',
  partOf: '23. Restated Financial Information',
  title: 'Restated Financial Information',
  producer: 'external',
  order: 2730,
  group: 'SECTION - FINANCIAL INFORMATION',
  clause: 'ICDR Schedule VI Part A',
  externalNote:
    'The Restated Financial Information for the last three financial years (and any stub period), prepared and signed by the Company\'s peer-reviewed Statutory Auditor in accordance with the SEBI ICDR Regulations and the ICAI Guidance Note on Reports in Company Prospectuses, annexed separately with its own pagination. The auditor\'s deliverable, not the app\'s.',
};
