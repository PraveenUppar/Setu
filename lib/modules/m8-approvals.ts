import { z } from 'zod';
import { zDate, zLicence } from '../facts/schema';
import type { Module } from './types';
import type { RepeaterColumn } from './repeater-spec';

/**
 * M8 — Approvals and Licences.
 *
 * The Company Secretary's module. Ninety minutes, one repeater, and the
 * highest ratio of table rows to questions of any module: a manufacturer has
 * fifteen to thirty registrations across tax, labour, environment and the
 * sector, and the document lists every one with its number, date and expiry.
 *
 * "Government and Other Approvals" is computed from this and from facts
 * held elsewhere — the board and shareholder resolutions (M9), the
 * in-principle approval (M9), the depository agreements (M2, asked here
 * because this is where a CS will look for them), the incorporation
 * certificates (M1).
 */

const APPROVALS = 'legal.approvals';

export const LICENCE_COLUMNS: RepeaterColumn[] = [
  { key: 'name', label: 'Authorisation granted', type: 'text', width: '22rem' },
  {
    key: 'category',
    label: 'Category',
    type: 'select',
    width: '11rem',
    options: [
      { value: 'TAX', label: 'Tax' },
      { value: 'BUSINESS', label: 'Business' },
      { value: 'LABOUR', label: 'Labour and employment' },
      { value: 'ENVIRONMENT', label: 'Environment' },
      { value: 'INTELLECTUAL_PROPERTY', label: 'Intellectual property' },
      { value: 'OTHER', label: 'Other' },
    ],
  },
  { key: 'unit', label: 'Unit (if unit-specific)', type: 'text', width: '10rem' },
  { key: 'authority', label: 'Issuing authority', type: 'text', width: '16rem' },
  { key: 'number', label: 'Registration / licence no.', type: 'text', width: '12rem' },
  { key: 'issuedOn', label: 'Date of issue / renewal', type: 'date', width: '9rem' },
  { key: 'validUntil', label: 'Valid up to', type: 'date', width: '9rem', placeholder: 'Blank if perpetual' },
  {
    key: 'status',
    label: 'Status',
    type: 'select',
    width: '10rem',
    options: [
      { value: 'OBTAINED', label: 'Obtained' },
      { value: 'APPLIED', label: 'Applied for' },
      { value: 'RENEWAL_APPLIED', label: 'Expired, renewal applied' },
    ],
  },
];

export const m8Approvals: Module = {
  id: 'M8',
  title: 'Approvals and Licences',
  estimatedMinutes: 90,
  assignableTo: 'CS',
  dependsOn: ['M1', 'M5'],
  requestsDocuments: [
    'Every registration certificate and licence, with the latest renewal',
    'PAN, TAN and GST registration certificates',
    'The tripartite agreements with NSDL and CDSL',
    'Pending applications and their acknowledgements',
  ],
  purpose:
    'Every licence, registration and consent the business runs on, with numbers and expiry dates, and the approvals for the issue itself. The approvals section is built from this.',
  fields: [
    {
      path: 'approvals.pan',
      label: 'Permanent Account Number of the company',
      type: 'text',
      schema: z.string().regex(/^[A-Z]{5}\d{4}[A-Z]$/, 'Must be a valid PAN'),
      placeholder: 'AAECV1234C',
      helpText:
        'Stated by number under "Tax Related Approvals". The fourth character of a company’s PAN is "C".',
      feedsInto: [APPROVALS],
    },
    {
      path: 'approvals.tan',
      label: 'Tax Deduction and Collection Account Number',
      type: 'text',
      schema: z.string().regex(/^[A-Z]{4}\d{5}[A-Z]$/, 'Must be a valid TAN'),
      placeholder: 'PNEV04471B',
      helpText: 'Stated by number alongside the PAN under "Tax Related Approvals". Required for every company that deducts tax at source, which is every employer.',
      feedsInto: [APPROVALS],
    },
    {
      path: 'approvals.gstin',
      label: 'GST registration number',
      type: 'text',
      schema: z.string().length(15, 'A GSTIN is 15 characters'),
      placeholder: '27AAECV1234C1ZP',
      helpText:
        'The GSTIN of the principal place of business. Where the company is registered in more than one state, list the others in the licences table under Tax.',
      feedsInto: [APPROVALS],
    },
    {
      path: 'approvals.licences',
      label: 'Licences, registrations and consents',
      type: 'table',
      schema: z.array(zLicence),
      columns: LICENCE_COLUMNS,
      helpText:
        'Every authorisation the business holds or has applied for, one row each. The document groups them by category and, for business and environmental approvals, by unit — use the unit names from the business module. Mark expired licences whose renewal is pending, and applications not yet granted, by status: the section lists those separately as "applied for", which is what the exchange expects to see rather than an expiry date in the past under "obtained". Factory licence, consent to operate, fire NOC, shops and establishments, EPF, ESI, professional tax, IEC, Udyam, trade marks — a manufacturer typically has fifteen to thirty.',
      clause: 'ICDR Schedule VI Part A, para 10(B)',
      feedsInto: [APPROVALS, 'general.riskFactors'],
      extractionHint: 'The "Government and Other Approvals" section, every table row.',
    },
    {
      path: 'approvals.approvalsRequiredNotObtained',
      label: 'Approvals required for the present or proposed business that have not been applied for',
      type: 'longtext',
      schema: z.string().nullable(),
      placeholder: 'The particulars, where there are any',
      helpText:
        'Where the objects of the issue include a new unit or a new line, its licences will not exist yet — a consent to establish, a factory licence for the new premises. The section names what will be needed and when it will be applied for. Choose "None" where there is nothing to state.',
      clause: 'ICDR Schedule VI Part A, para 10(B)',
      feedsInto: [APPROVALS, 'general.riskFactors'],
    },
    {
      path: 'capital.depositoryAgreements.nsdl',
      label: 'Has the tripartite agreement with NSDL and the Registrar been executed?',
      type: 'boolean',
      schema: z.boolean(),
      helpText:
        'Regulation 230(1)(b) requires an agreement with the depositories, and BSE SME requires tripartite agreements with BOTH depositories and the registrar before the application. The agreements are usually signed once the Registrar to the Issue is appointed.',
      clause: 'R-021 (Reg 230(1)(b)); E-15',
      feedsInto: [APPROVALS, 'regulatory.statutoryStatements'],
    },
    {
      path: 'capital.depositoryAgreements.nsdlDate',
      label: 'Date of the NSDL tripartite agreement',
      type: 'date',
      schema: zDate,
      helpText: 'Quoted by date in the approvals section, alongside the name of the Registrar the agreement is with.',
      feedsInto: [APPROVALS],
      showIf: (f) => f.capital?.depositoryAgreements?.nsdl === true,
    },
    {
      path: 'capital.depositoryAgreements.cdsl',
      label: 'Has the tripartite agreement with CDSL and the Registrar been executed?',
      type: 'boolean',
      schema: z.boolean(),
      helpText: 'As for NSDL. Both are required on BSE SME; both are customary on NSE Emerge.',
      clause: 'R-021 (Reg 230(1)(b)); E-15',
      feedsInto: [APPROVALS, 'regulatory.statutoryStatements'],
    },
    {
      path: 'capital.depositoryAgreements.cdslDate',
      label: 'Date of the CDSL tripartite agreement',
      type: 'date',
      schema: zDate,
      helpText: 'Quoted by date in the approvals section, alongside the name of the Registrar the agreement is with.',
      feedsInto: [APPROVALS],
      showIf: (f) => f.capital?.depositoryAgreements?.cdsl === true,
    },
  ],
};
