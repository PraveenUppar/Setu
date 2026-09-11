import { z } from 'zod';
import { zBoardChange, zCommittee, zDate, zDirector, zKeyManagerialPerson, zMoney } from '../facts/schema';
import type { Module } from './types';
import type { RepeaterColumn } from './repeater-spec';

/**
 * M4 — Board and Management.
 *
 * The Company Secretary's module: the board register, the DIR-12 history,
 * the committee resolutions and the KMP appointments are all on file. Ninety
 * minutes if the profiles are already written for the annual report.
 *
 * "Our Management" — 16 to 19 pages — is computed from this. Directors'
 * shareholding is read off the register in M2; it is not asked again.
 * EL-044 reads the board for the Companies Act composition test.
 */

const MANAGEMENT = 'aboutCompany.management';
const DEFINITIONS = 'general.definitions';
const DECLARATION = 'other.declaration';

export const DIRECTOR_COLUMNS: RepeaterColumn[] = [
  { key: 'name', label: 'Name', type: 'text', width: '13rem' },
  { key: 'din', label: 'DIN', type: 'text', width: '6rem' },
  { key: 'designation', label: 'Designation', type: 'text', width: '13rem', placeholder: 'Independent Director' },
  { key: 'isExecutive', label: 'Executive?', type: 'boolean', width: '6rem' },
  { key: 'isIndependent', label: 'Independent?', type: 'boolean', width: '6rem' },
  { key: 'appointedOn', label: 'Appointed on', type: 'date', width: '9rem' },
  { key: 'dateOfBirth', label: 'Date of birth', type: 'date', width: '9rem' },
  { key: 'nationality', label: 'Nationality', type: 'text', width: '6rem', placeholder: 'Indian' },
  { key: 'occupation', label: 'Occupation', type: 'text', width: '8rem' },
  { key: 'address', label: 'Residential address', type: 'text', width: '16rem' },
  { key: 'qualification', label: 'Qualifications', type: 'text', width: '14rem' },
  { key: 'experienceSummary', label: 'Brief profile', type: 'text', width: '20rem' },
  { key: 'otherDirectorships', label: 'Other directorships', type: 'list', width: '14rem' },
  { key: 'term', label: 'Term', type: 'text', width: '14rem' },
  { key: 'remuneration', label: 'Remuneration last FY (Rs)', type: 'money', width: '8rem' },
  { key: 'relatedTo', label: 'Related to another director?', type: 'text', width: '12rem' },
];

export const BOARD_CHANGE_COLUMNS: RepeaterColumn[] = [
  { key: 'name', label: 'Director', type: 'text', width: '13rem' },
  { key: 'date', label: 'Date', type: 'date', width: '9rem' },
  { key: 'reason', label: 'Nature of change', type: 'text', width: '20rem', placeholder: 'Appointment as Additional Director' },
];

export const KMP_COLUMNS: RepeaterColumn[] = [
  { key: 'name', label: 'Name', type: 'text', width: '13rem' },
  { key: 'designation', label: 'Designation', type: 'text', width: '13rem' },
  { key: 'appointedOn', label: 'Appointed on', type: 'date', width: '9rem' },
  { key: 'dateOfBirth', label: 'Date of birth', type: 'date', width: '9rem' },
  { key: 'qualification', label: 'Qualifications', type: 'text', width: '14rem' },
  { key: 'experienceSummary', label: 'Brief profile', type: 'text', width: '20rem' },
  { key: 'remuneration', label: 'Remuneration last FY (Rs)', type: 'money', width: '8rem' },
];

export const COMMITTEE_COLUMNS: RepeaterColumn[] = [
  {
    key: 'committee',
    label: 'Committee',
    type: 'select',
    width: '14rem',
    options: [
      { value: 'AUDIT', label: 'Audit Committee' },
      { value: 'NOMINATION_AND_REMUNERATION', label: 'Nomination and Remuneration Committee' },
      { value: 'STAKEHOLDERS_RELATIONSHIP', label: 'Stakeholders Relationship Committee' },
      { value: 'CORPORATE_SOCIAL_RESPONSIBILITY', label: 'Corporate Social Responsibility Committee' },
      { value: 'OTHER', label: 'Other' },
    ],
  },
  { key: 'name', label: 'Name (if other)', type: 'text', width: '10rem' },
  { key: 'constitutedOn', label: 'Constituted on', type: 'date', width: '9rem' },
  { key: 'chairperson', label: 'Chairperson', type: 'text', width: '13rem' },
  { key: 'members', label: 'Other members', type: 'list', width: '18rem' },
];

export const m4Management: Module = {
  id: 'M4',
  title: 'Board and Management',
  estimatedMinutes: 90,
  assignableTo: 'CS',
  dependsOn: ['M1'],
  requestsDocuments: [
    'Register of directors and KMP',
    'DIR-12 filings for the last three years',
    'Board resolutions constituting the committees',
    'Appointment letters and remuneration approvals for executive directors and KMP',
  ],
  purpose:
    'The board, its committees, the key managerial personnel and senior management. Sixteen to nineteen pages of the document are built from this.',
  fields: [
    {
      path: 'management.directors',
      label: 'Board of Directors',
      type: 'table',
      schema: z.array(zDirector),
      columns: DIRECTOR_COLUMNS,
      helpText:
        'Every director as on the date of the document, with the details the board table prints: designation, DIN, age (computed from the date of birth), address, occupation, nationality, term, and directorships in other companies. Mark executive and independent status carefully — the Companies Act composition test, the committee rules and the remuneration disclosures all turn on those two flags. Separate other directorships with semicolons.',
      clause: 'R-028 (Companies Act s.149); ICDR Schedule VI Part A',
      feedsInto: [MANAGEMENT, DEFINITIONS, DECLARATION, 'general.conventions'],
      extractionHint: 'The board of directors table in "Our Management", and the register of directors.',
    },
    {
      path: 'management.boardChanges',
      label: 'Changes in the board in the last three years',
      type: 'table',
      schema: z.array(zBoardChange),
      columns: BOARD_CHANGE_COLUMNS,
      helpText:
        'Every appointment, regularisation, redesignation and resignation in the last three years, one row each. An independent director typically produces two rows — appointment as an additional director, then regularisation at the general meeting. The exchange reconciles this against the DIR-12 filings.',
      clause: 'ICDR Schedule VI Part A',
      feedsInto: [MANAGEMENT],
    },
    {
      path: 'management.keyManagerialPersonnel',
      label: 'Key Managerial Personnel',
      type: 'table',
      schema: z.array(zKeyManagerialPerson),
      columns: KMP_COLUMNS,
      helpText:
        'The Chief Financial Officer, the Company Secretary and, where appointed, the Chief Executive Officer — the KMP under Section 2(51) of the Companies Act. Executive directors who also hold a KMP role are listed here as well; the document profiles them under the board and cross-refers. Both the CFO and the Company Secretary sign the Declaration.',
      clause: 'Companies Act 2013, s.2(51), s.203',
      feedsInto: [MANAGEMENT, DEFINITIONS, DECLARATION],
    },
    {
      path: 'management.seniorManagement',
      label: 'Senior Management',
      type: 'table',
      schema: z.array(zKeyManagerialPerson),
      columns: KMP_COLUMNS,
      helpText:
        'Officers one level below the executive directors, and functional heads — operations, quality, sales, plant heads. Recent ICDR amendments require their profiles alongside the KMP. Include remuneration for the last financial year; it is printed.',
      clause: 'ICDR Reg 2(1)(bbbb); ICDR Schedule VI Part A',
      feedsInto: [MANAGEMENT],
    },
    {
      path: 'management.committees',
      label: 'Committees of the Board',
      type: 'table',
      schema: z.array(zCommittee),
      columns: COMMITTEE_COLUMNS,
      helpText:
        'The Audit Committee, the Nomination and Remuneration Committee and the Stakeholders Relationship Committee are mandatory before listing; a CSR Committee where Section 135 applies. Name the chairperson and the other members by name, separated by semicolons — the document prints each member with their nature of directorship, which it looks up from the board table above. The Audit Committee and the NRC need a majority of independent directors.',
      clause: 'Companies Act 2013, s.177, s.178; SEBI LODR Reg 15(2)(b)',
      feedsInto: [MANAGEMENT],
    },
    {
      path: 'management.borrowingPowersResolutionDate',
      label: 'Date of the shareholders’ resolution authorising the board’s borrowing powers',
      type: 'date',
      schema: zDate,
      helpText:
        'Under Section 180(1)(c) the board may borrow beyond the paid-up capital and free reserves only with a special resolution setting a limit. The document quotes the resolution date and the limit under "Borrowing Powers of the Board", and Financial Indebtedness cross-refers to it.',
      clause: 'Companies Act 2013, s.180(1)(c)',
      feedsInto: [MANAGEMENT, 'financial.indebtedness'],
    },
    {
      path: 'management.borrowingPowersLimit',
      label: 'Borrowing limit authorised by that resolution (Rs)',
      type: 'currency',
      schema: zMoney,
      helpText:
        'The figure in the resolution, in rupees. It is compared against total borrowings; a company borrowing past its authorised limit has a ratification to do before filing.',
      clause: 'Companies Act 2013, s.180(1)(c)',
      feedsInto: [MANAGEMENT, 'financial.indebtedness'],
    },
  ],
};
