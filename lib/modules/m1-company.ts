import { z } from 'zod';
import { zCIN, zDate, zPercent, zSector } from '../facts/schema';
import type { Field, Module } from './types';

/**
 * M1 — Company & History.
 *
 * The first module, and deliberately the simplest: no repeaters, about twenty
 * fields, and the Company Secretary can fill it from the incorporation
 * certificate and the MOA in under an hour.
 *
 * It is also where the rules bite earliest. Six of the eligibility rules read
 * only M1 facts, so a promoter who fills this module alone already learns
 * whether they are a public limited company, whether the track record is long
 * enough, whether a name change or a firm conversion has started a clock, and
 * whether the website BSE asks for exists. That is the point: the module
 * teaches the framework while it collects.
 */

/** Every M1 field feeds Definitions — the company name alone appears ~200 times. */
const DEFINITIONS = 'general.definitions';

const nameChangeFields: Field[] = [
  {
    path: 'company.conversionToPublicDate',
    label: 'Date of conversion to a public limited company',
    type: 'date',
    schema: zDate,
    helpText:
      'Section 23 of the Companies Act requires a public limited company to make a public issue, so every SME issuer converts before filing. The conversion changes the name from "Private Limited" to "Limited", which is why we record its date separately from an ordinary change of name — it does not trigger BSE\'s revenue test.',
    clause: 'Companies Act 2013, s.23',
    feedsInto: [DEFINITIONS, 'general.conventions'],
    showIf: (f) => f.company?.isPublicLimited === true,
    extractionHint: 'The date on the fresh certificate of incorporation issued on conversion.',
  },
  {
    path: 'company.revenueShareFromNewNameActivity',
    label: 'Revenue from the activity the new name indicates',
    type: 'percent',
    suffix: '% of last full year',
    schema: zPercent,
    helpText:
      'Where the company changed its name within the year before filing, BSE SME asks that at least 50% of the preceding full financial year\'s restated revenue came from the activity the new name describes. Below 50%, the issue waits until the change is a year old.',
    clause: 'R-030 (BSE SME listing criteria, per ICDR Reg 5(1)(e))',
    feedsInto: ['general.definitions'],
    /**
     * Only where a GENUINE change of name exists — one that is not the
     * private-to-public conversion.
     *
     * The conversion changes the name without changing the activity the name
     * indicates, so it satisfies the revenue test by definition (R-030), and
     * EL-025 excludes it for exactly this reason. Asking anyway would put a
     * question to every issuer who converted, which is all of them.
     */
    showIf: (f) =>
      (f.company?.nameChanges ?? []).some((c) => c.date !== f.company?.conversionToPublicDate),
    validate: (value) =>
      typeof value === 'number' && value < 50
        ? ['Below 50%. The issue cannot proceed on this basis until the name change is a year old.']
        : [],
  },
];

const conversionFields: Field[] = [
  {
    path: 'company.convertedFromFirmType',
    label: 'Was the business a firm before it became a company?',
    type: 'select',
    options: [
      { value: 'NONE', label: 'No, it was always a company' },
      { value: 'PROPRIETORSHIP', label: 'Yes, a proprietorship' },
      { value: 'PARTNERSHIP', label: 'Yes, a partnership firm' },
      { value: 'LLP', label: 'Yes, an LLP' },
    ],
    schema: z.enum(['NONE', 'PROPRIETORSHIP', 'PARTNERSHIP', 'LLP']),
    helpText:
      'A very common SME path, and one that catches people out: the business may be decades old while the company is months old. Regulation 229(4) requires the COMPANY to have existed for one full financial year — a completed 1 April to 31 March — before the draft offer document is filed.',
    clause: 'R-026 (ICDR Reg 229(4))',
    feedsInto: ['general.definitions'],
  },
  {
    path: 'company.conversionFromFirmDate',
    label: 'Date the company came into existence on that conversion',
    type: 'date',
    schema: zDate,
    helpText:
      'This date decides the earliest possible filing date. A company converted in February has its first full financial year end on 31 March of the FOLLOWING year, not twelve months later.',
    clause: 'R-026 (ICDR Reg 229(4))',
    feedsInto: ['general.definitions'],
    showIf: (f) => (f.company?.convertedFromFirmType ?? 'NONE') !== 'NONE',
  },
];

/**
 * D69 — S7's replacement for AoA upload and extraction (S7 paused
 * permanently). The six topics ICDR Schedule VI Part A and Companies Act
 * Schedule I (Table F) require: paste or type the relevant clauses verbatim
 * from the company's own Articles, not a summary or paraphrase — this text
 * carries the same personal-liability weight as any other disclosure (MM4).
 */
const ARTICLES = 'other.articles';
const articlesFields: Field[] = [
  {
    path: 'company.articlesProvisions.votingRights',
    label: 'Articles: Voting Rights',
    type: 'longtext',
    schema: z.string().optional(),
    helpText:
      'Paste the Articles clauses on how members vote — on a show of hands, on a poll, and for joint holders — verbatim from the company’s own Articles of Association. Do not summarise; the document prints exactly what is entered here.',
    clause: 'Companies Act 2013, Schedule I (Table F); ICDR Schedule VI Part A',
    feedsInto: [ARTICLES],
  },
  {
    path: 'company.articlesProvisions.dividend',
    label: 'Articles: Dividend',
    type: 'longtext',
    schema: z.string().optional(),
    helpText: 'Paste the Articles clauses on declaration and payment of dividends, verbatim.',
    clause: 'Companies Act 2013, Schedule I (Table F); ICDR Schedule VI Part A',
    feedsInto: [ARTICLES],
  },
  {
    path: 'company.articlesProvisions.lien',
    label: 'Articles: Lien',
    type: 'longtext',
    schema: z.string().optional(),
    helpText: 'Paste the Articles clauses on the company’s lien over partly-paid shares, verbatim.',
    clause: 'Companies Act 2013, Schedule I (Table F); ICDR Schedule VI Part A',
    feedsInto: [ARTICLES],
  },
  {
    path: 'company.articlesProvisions.forfeiture',
    label: 'Articles: Forfeiture',
    type: 'longtext',
    schema: z.string().optional(),
    helpText: 'Paste the Articles clauses on forfeiture of shares for non-payment of calls, verbatim.',
    clause: 'Companies Act 2013, Schedule I (Table F); ICDR Schedule VI Part A',
    feedsInto: [ARTICLES],
  },
  {
    path: 'company.articlesProvisions.transferAndTransmission',
    label: 'Articles: Transfer and Transmission of Shares',
    type: 'longtext',
    schema: z.string().optional(),
    helpText: 'Paste the Articles clauses on transfer and transmission of shares or debentures, verbatim.',
    clause: 'Companies Act 2013, Schedule I (Table F); ICDR Schedule VI Part A',
    feedsInto: [ARTICLES],
  },
  {
    path: 'company.articlesProvisions.consolidationAndSplitting',
    label: 'Articles: Consolidation and Splitting of Capital',
    type: 'longtext',
    schema: z.string().optional(),
    helpText: 'Paste the Articles clauses on consolidation, sub-division and conversion of share capital, verbatim.',
    clause: 'Companies Act 2013, Schedule I (Table F); ICDR Schedule VI Part A',
    feedsInto: [ARTICLES],
  },
];

export const m1Company: Module = {
  id: 'M1',
  title: 'Company and History',
  estimatedMinutes: 45,
  assignableTo: 'CS',
  dependsOn: [],
  requestsDocuments: [
    'Certificate of incorporation',
    'Memorandum and Articles of Association',
    'Fresh certificates of incorporation for any name change or conversion',
  ],
  purpose:
    'Who the company is, where it is registered, and what it has been called. Six eligibility rules read nothing but this module.',
  fields: [
    {
      path: 'company.name',
      label: 'Full legal name',
      type: 'text',
      schema: z.string().min(3),
      placeholder: 'Vardhman Precision Components Limited',
      helpText:
        'Exactly as on the certificate of incorporation, including "Limited". This name appears roughly 200 times across the document, so it is typed once here and read everywhere else.',
      feedsInto: [DEFINITIONS, 'general.conventions', 'regulatory.disclaimers', 'other.declaration'],
      extractionHint: 'The name on the most recent certificate of incorporation.',
    },
    {
      path: 'company.cin',
      label: 'Corporate Identity Number',
      type: 'text',
      schema: zCIN,
      placeholder: 'U29253MH2016PLC098765',
      helpText:
        'The 21-character CIN from the certificate of incorporation. Its fifth character tells the registry whether the company is public or private, and its state code must match the Registrar named in the document.',
      feedsInto: [DEFINITIONS],
    },
    {
      path: 'company.isPublicLimited',
      label: 'Is the company already a public limited company?',
      type: 'boolean',
      schema: z.boolean(),
      helpText:
        'Only a public limited company may make a public issue. Conversion typically takes 45 to 60 days and gates everything else, so if the answer is no, start it before anything on this list.',
      clause: 'Companies Act 2013, s.23',
      feedsInto: [DEFINITIONS, 'regulatory.authority'],
    },
    {
      path: 'company.dateOfIncorporation',
      label: 'Date of incorporation',
      type: 'date',
      schema: zDate,
      helpText:
        'From the original certificate of incorporation, not the conversion certificate. Both exchanges require a track record of at least three years, measured from here.',
      clause: 'E-02 / N-02 (exchange track record criteria)',
      feedsInto: [DEFINITIONS],
    },
    {
      path: 'company.incorporatedUnder',
      label: 'Incorporated under',
      type: 'select',
      options: [
        { value: 'COMPANIES_ACT_2013', label: 'Companies Act, 2013' },
        { value: 'COMPANIES_ACT_1956', label: 'Companies Act, 1956' },
      ],
      schema: z.enum(['COMPANIES_ACT_1956', 'COMPANIES_ACT_2013']),
      helpText:
        'Which Act the company was ORIGINALLY incorporated under. Companies incorporated before 2014 were incorporated under the 1956 Act even though they are now governed by the 2013 Act, and the definitions section states it that way.',
      feedsInto: [DEFINITIONS],
    },
    ...conversionFields,
    ...nameChangeFields,
    {
      path: 'company.registeredOffice',
      label: 'Registered office address',
      type: 'longtext',
      schema: z.object({}).passthrough(),
      helpText:
        'The address on the RoC records. It decides three things you might not expect: which Registrar of Companies the document names, which High Court has jurisdiction, and which regional language the pre-issue advertisement must appear in.',
      feedsInto: [DEFINITIONS, 'issueRelated.issueProcedure.applicationSize', 'other.declaration'],
    },
    {
      path: 'company.website',
      label: 'Company website',
      type: 'text',
      placeholder: 'https://www.example.in',
      schema: z.string().url(),
      helpText:
        'BSE SME requires a functional website as an eligibility criterion, and the exchange does look. If there is no website yet, that is a week of work rather than a blocker — but it has to exist before the application.',
      clause: 'E-06 (BSE SME functional website criterion)',
      feedsInto: ['regulatory.consents'],
      validate: (value) =>
        typeof value === 'string' && value.trim() !== '' && !/^https?:\/\/\S+\.\S+/.test(value)
          ? ['This does not look like a usable web address.']
          : [],
    },
    {
      path: 'company.email',
      label: 'Company email',
      type: 'text',
      schema: z.string().email(),
      helpText: 'The address investors and the exchange will use. It is printed in the document.',
      feedsInto: ['regulatory.consents'],
    },
    {
      path: 'company.telephone',
      label: 'Company telephone',
      type: 'text',
      placeholder: '+91 20 1234 5678',
      schema: z.string().min(6),
      helpText: 'Printed on the cover page and in General Information.',
      feedsInto: ['regulatory.consents'],
    },
    {
      path: 'company.companySecretary',
      label: 'Company Secretary and Compliance Officer',
      type: 'longtext',
      schema: z.object({}).passthrough(),
      helpText:
        'The Compliance Officer is the named person an investor with a grievance contacts, and the document prints their name, email and telephone. The role is mandatory before filing.',
      feedsInto: [DEFINITIONS, 'regulatory.consents'],
    },
    {
      path: 'company.sector',
      label: 'Primary sector',
      type: 'select',
      options: [
        { value: 'ENGINEERING', label: 'Engineering' },
        { value: 'MANUFACTURING', label: 'Manufacturing' },
        { value: 'IT_SERVICES', label: 'IT and software services' },
        { value: 'TRADING', label: 'Trading and distribution' },
        { value: 'TEXTILES', label: 'Textiles' },
        { value: 'CHEMICALS', label: 'Chemicals' },
        { value: 'PHARMA', label: 'Pharmaceuticals' },
        { value: 'OTHER', label: 'Other' },
      ],
      schema: zSector,
      helpText:
        'The sector switches two whole sections: Key Industry Regulations and Policies, and the technical terms in the glossary. Choosing it wrongly means drafting the wrong law.',
      feedsInto: [DEFINITIONS],
    },
    {
      path: 'company.businessDescription',
      label: 'What the company does',
      type: 'longtext',
      placeholder: 'One or two sentences a stranger would understand.',
      schema: z.string().min(20),
      helpText:
        'One or two sentences, in plain language. This seeds the Business Overview and the cover page summary, and it is the sentence a reader meets first — write it for someone who has never heard of the company.',
      feedsInto: ['general.definitions'],
    },
    ...articlesFields,
  ],
};
