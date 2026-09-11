import { z } from 'zod';
import { zDate, zDIN, zMoney } from './shared';

/**
 * Module M4 — Board and Management.
 *
 * "Our Management" (section map #19) is 16 to 19 pages, and COMPUTED from
 * this domain: the board table, the brief profiles, changes in the board over
 * three years, directors' shareholding (read off the M2 register, not asked
 * again), the committees, the key managerial personnel and senior management.
 *
 * Both primary sources tabulate the board with the same columns — name,
 * designation, date of birth, age, address, occupation, nationality, DIN,
 * term, and directorships in other companies (Om Galaxy p.235, Maxwell p.196)
 * — and both list the committees as name / designation in the committee /
 * nature of directorship.
 */

export const zDirector = z.object({
  name: z.string(),
  din: zDIN.optional(),
  designation: z
    .string()
    .describe('As on the board, e.g. "Chairman and Managing Director", "Independent Director"'),
  isIndependent: z.boolean().default(false),
  /** Executive directors draw remuneration; non-executive draw sitting fees. */
  isExecutive: z.boolean().default(false),
  /**
   * A recurring risk factor across the corpus (Om Galaxy #60, Maxwell #52,
   * Ideas Electricals #~25 area — three of the first four documents checked):
   * first-time SME boards are typically drawn from operators and local
   * professionals, not people who have sat on a LISTED company's board, and
   * the document says so. `otherDirectorships` is free text and cannot answer
   * this reliably — a director could hold several private directorships and
   * none listed — so this is asked directly rather than inferred.
   */
  hasListedCompanyExperience: z
    .boolean()
    .default(false)
    .describe('Has held a directorship in a company listed on a recognised stock exchange'),
  appointedOn: zDate.optional().describe('Date of appointment in the current designation'),
  dateOfBirth: zDate.optional(),
  nationality: z.string().optional(),
  occupation: z.string().optional(),
  address: z.string().optional().describe('Residential address, printed in the board table'),
  qualification: z.string().optional(),
  experienceSummary: z
    .string()
    .optional()
    .describe('Brief profile: qualifications, experience and role, in two to four sentences'),
  otherDirectorships: z
    .array(z.string())
    .default([])
    .describe('Indian companies, foreign companies and LLPs in which the director holds office'),
  term: z
    .string()
    .optional()
    .describe('Term of office, e.g. "Five years from March 10, 2025" or "Liable to retire by rotation"'),
  remuneration: zMoney.optional().describe('Remuneration paid in the last financial year, in rupees'),
  relatedTo: z
    .string()
    .optional()
    .describe('Relationship with any other director, e.g. "Spouse of Rajesh Vardhman"; blank if none'),
});

/** "Changes in our Board for the preceding three years": name, date, reason. */
export const zBoardChange = z.object({
  name: z.string(),
  date: zDate,
  reason: z
    .string()
    .describe('e.g. "Appointment as Additional Director", "Regularised as Independent Director", "Resignation"'),
});

export const zKeyManagerialPerson = z.object({
  name: z.string(),
  designation: z.string(),
  appointedOn: zDate.optional(),
  dateOfBirth: zDate.optional(),
  qualification: z.string().optional(),
  experienceSummary: z.string().optional(),
  remuneration: zMoney.optional().describe('Remuneration paid in the last financial year, in rupees'),
});

export const zCommitteeKind = z.enum([
  'AUDIT',
  'NOMINATION_AND_REMUNERATION',
  'STAKEHOLDERS_RELATIONSHIP',
  'CORPORATE_SOCIAL_RESPONSIBILITY',
  'OTHER',
]);

export const zCommittee = z.object({
  committee: zCommitteeKind,
  name: z.string().optional().describe('Only for OTHER'),
  constitutedOn: zDate.optional().describe('Date of the board resolution constituting the committee'),
  chairperson: z.string().describe('Name of the director chairing the committee'),
  members: z.array(z.string()).default([]).describe('Other members, by name'),
});

export const zManagement = z.object({
  directors: z.array(zDirector).default([]),
  boardChanges: z
    .array(zBoardChange)
    .default([])
    .describe('Every appointment, regularisation, redesignation and resignation in the last three years'),
  keyManagerialPersonnel: z
    .array(zKeyManagerialPerson)
    .default([])
    .describe('KMP other than the executive directors: CFO, Company Secretary, CEO where applicable'),
  seniorManagement: z.array(zKeyManagerialPerson).default([]),
  committees: z.array(zCommittee).default([]),

  /**
   * D48, corpus-corroborated at three of the first four documents checked:
   * Om Galaxy and Century state, as the closing line of the key-person
   * dependency risk factor, that they do NOT maintain key man insurance for
   * their Promoters, KMP and Senior Management; Ideas Electricals' restated
   * financials carry an actual "Keyman Insurance" expense line, evidence a
   * company can and does hold it. A genuinely varying fact, not boilerplate
   * — worth asking directly rather than assuming its absence.
   */
  hasKeyManInsurance: z
    .boolean()
    .default(false)
    .describe('Whether the company maintains key man insurance for its Promoters, KMP or Senior Management'),

  /**
   * "Borrowing Powers of the Board": the shareholders' resolution under
   * Companies Act s.180(1)(c) authorising the board to borrow up to a limit.
   * Both the date and the limit are quoted.
   */
  borrowingPowersResolutionDate: zDate
    .optional()
    .describe('Date of the shareholders resolution under Section 180(1)(c)'),
  borrowingPowersLimit: zMoney
    .optional()
    .describe('The borrowing limit authorised by that resolution, in rupees'),
});

export type Director = z.infer<typeof zDirector>;
export type BoardChange = z.infer<typeof zBoardChange>;
export type KeyManagerialPerson = z.infer<typeof zKeyManagerialPerson>;
export type Committee = z.infer<typeof zCommittee>;
export type CommitteeKind = z.infer<typeof zCommitteeKind>;
export type Management = z.infer<typeof zManagement>;
