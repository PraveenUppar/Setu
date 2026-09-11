import { z } from 'zod';
import { zDate, zDisassociation, zPromoter, zPromoterGroupMember } from '../facts/schema';
import type { Module } from './types';
import type { RepeaterColumn } from './repeater-spec';

/**
 * M3 — Promoters and Promoter Group.
 *
 * The promoter fills this one, because nobody else holds the facts: dates of
 * birth, PANs, the family tree that defines the promoter group, and the other
 * ventures. Two hours, mostly the promoter group table.
 *
 * Everything in "Our Promoters and Promoter Group" is computed from here and
 * from the register in M2. The aggregate promoter holding is NOT asked — the
 * register already carries it, and asking again would let the two disagree.
 *
 * Four eligibility rules read the flags at the end. They are the same
 * questions the standalone pre-check asks, kept here so an issuer who came in
 * through the pre-check sees them once more, in the document's own context.
 */

const PROMOTERS = 'aboutCompany.promoters';
const MANAGEMENT = 'aboutCompany.management';
const DEFINITIONS = 'general.definitions';

export const PROMOTER_COLUMNS: RepeaterColumn[] = [
  { key: 'name', label: 'Name', type: 'text', width: '13rem' },
  {
    key: 'kind',
    label: 'Kind',
    type: 'select',
    width: '8rem',
    options: [
      { value: 'INDIVIDUAL', label: 'Individual' },
      { value: 'BODY_CORPORATE', label: 'Body corporate' },
    ],
  },
  { key: 'designation', label: 'Position in the company', type: 'text', width: '12rem' },
  { key: 'pan', label: 'PAN', type: 'text', width: '7rem' },
  { key: 'din', label: 'DIN', type: 'text', width: '6rem' },
  { key: 'dateOfBirth', label: 'Date of birth', type: 'date', width: '9rem' },
  { key: 'nationality', label: 'Nationality', type: 'text', width: '6rem', placeholder: 'Indian' },
  { key: 'occupation', label: 'Occupation', type: 'text', width: '7rem' },
  { key: 'address', label: 'Residential address', type: 'text', width: '16rem' },
  { key: 'qualification', label: 'Qualifications', type: 'text', width: '14rem' },
  { key: 'experienceYears', label: 'Years of experience', type: 'number', width: '6rem' },
  { key: 'experienceSummary', label: 'Brief profile', type: 'text', width: '20rem' },
  { key: 'otherDirectorships', label: 'Other directorships', type: 'list', width: '14rem' },
  { key: 'otherVentures', label: 'Other ventures (firms, LLPs)', type: 'list', width: '14rem' },
];

export const PROMOTER_GROUP_COLUMNS: RepeaterColumn[] = [
  { key: 'name', label: 'Name', type: 'text', width: '14rem' },
  { key: 'relationship', label: 'Relationship', type: 'text', width: '14rem', placeholder: 'Spouse of the promoter' },
  { key: 'relatedTo', label: 'Related to which promoter', type: 'text', width: '12rem' },
  {
    key: 'kind',
    label: 'Kind',
    type: 'select',
    width: '8rem',
    options: [
      { value: 'INDIVIDUAL', label: 'Individual' },
      { value: 'ENTITY', label: 'Entity' },
    ],
  },
];

export const DISASSOCIATION_COLUMNS: RepeaterColumn[] = [
  { key: 'promoterName', label: 'Promoter', type: 'text', width: '12rem' },
  { key: 'entityName', label: 'Company or firm', type: 'text', width: '14rem' },
  { key: 'date', label: 'Date', type: 'date', width: '9rem' },
  { key: 'reason', label: 'Reason and circumstances', type: 'text', width: '20rem' },
];

export const m3Promoters: Module = {
  id: 'M3',
  title: 'Promoters and Promoter Group',
  estimatedMinutes: 120,
  assignableTo: 'PROMOTER',
  dependsOn: ['M1'],
  requestsDocuments: [
    'PAN and DIN of each promoter',
    'Educational certificates, for the qualifications stated',
    'List of other companies and firms each promoter is interested in',
    'The family tree: spouse, parents, siblings, children, and the spouse’s parents and siblings',
  ],
  purpose:
    'Who the promoters are, who is in their group, and what else they are involved in. The promoter section and the interest disclosures are built from this.',
  fields: [
    {
      path: 'promoters.promoters',
      label: 'Promoters',
      type: 'table',
      schema: z.array(zPromoter),
      columns: PROMOTER_COLUMNS,
      helpText:
        'Every person or company that will be named as a promoter. The document prints a profile for each — age, qualifications, experience, PAN, other directorships — and the promoters’ aggregate holding is taken from the register of members, so a promoter listed here who is entered as "public" in the register understates promoter holding and can fail the minimum contribution test. Separate items in the two list columns with semicolons.',
      clause: 'ICDR Reg 2(1)(oo); ICDR Schedule VI Part A',
      feedsInto: [PROMOTERS, MANAGEMENT, DEFINITIONS, 'capital.structure'],
      extractionHint: 'The "Our Promoters" section: name, age, PAN, qualifications and experience of each promoter.',
    },
    {
      path: 'promoters.promoterGroupMembers',
      label: 'Promoter group',
      type: 'table',
      schema: z.array(zPromoterGroupMember),
      columns: PROMOTER_GROUP_COLUMNS,
      helpText:
        'The promoter group is defined by relationship, not by shareholding: for each individual promoter it includes the spouse, parents, siblings and children of the promoter AND of the spouse, plus any company or firm in which the promoter or those relatives hold 20% or more. List every one, including relatives who hold no shares — the table in the document is organised by relationship, and a missing parent is a query from the exchange.',
      clause: 'ICDR Reg 2(1)(pp)',
      feedsInto: [PROMOTERS, DEFINITIONS],
    },
    {
      path: 'promoters.managementControlChangeDetails',
      label: 'Any change in management or control in the last three years?',
      type: 'longtext',
      schema: z.string().nullable(),
      placeholder: 'The particulars, where there are any',
      helpText:
        'The section states whether control of the company has changed hands in the last three years. Most issuers print the standard negative; where it has changed, the document needs the particulars — who acquired control, when, and how. Choose "None" where there is nothing to state.',
      clause: 'ICDR Schedule VI Part A',
      feedsInto: [PROMOTERS],
    },
    {
      path: 'promoters.pledgedSharesDetails',
      label: 'Any promoter shares pledged or encumbered?',
      type: 'longtext',
      schema: z.string().nullable(),
      placeholder: 'The particulars, where there are any',
      helpText:
        'Shares pledged to a lender are still counted for the minimum promoter contribution only if the pledge is in favour of a scheduled bank or financial institution and the loan was for the company’s own business. Pledged shares are disclosed with the lender and the number of shares. Choose "None" where there is nothing to state.',
      clause: 'ICDR Reg 237; ICDR Schedule VI Part A',
      feedsInto: [PROMOTERS, 'capital.structure'],
    },
    {
      path: 'promoters.materialGuaranteesDetails',
      label: 'Any material guarantees by promoters over the shares?',
      type: 'longtext',
      schema: z.string().nullable(),
      placeholder: 'The particulars, where there are any',
      helpText:
        'Guarantees given by a promoter to a third party in respect of the Equity Shares they hold — not ordinary personal guarantees for bank loans, which belong in Financial Indebtedness. Almost always "none".',
      clause: 'ICDR Schedule VI Part A',
      feedsInto: [PROMOTERS],
    },
    {
      path: 'promoters.commonPursuitsDetails',
      label: 'Any promoter or promoter group entity in the same line of business?',
      type: 'longtext',
      schema: z.string().nullable(),
      placeholder: 'The entity, its business and how the overlap is managed, where there is one',
      helpText:
        'A "common pursuit" — a promoter firm or a promoter group company doing what the company does — is disclosed by name, and becomes a conflict-of-interest risk factor. The section prints the standard negative where there is none. Choose "None" where there is nothing to state.',
      clause: 'ICDR Schedule VI Part A',
      feedsInto: [PROMOTERS, 'general.riskFactors'],
    },
    {
      path: 'promoters.disassociations',
      label: 'Companies or firms the promoters disassociated from in the last three years',
      type: 'table',
      schema: z.array(zDisassociation),
      columns: DISASSOCIATION_COLUMNS,
      helpText:
        'Where a promoter resigned from or sold out of another company or firm in the last three years, the document states which, when and why. This is checked against the promoter’s DIN history on MCA21, so a resignation that is on record there and missing here is noticed.',
      clause: 'ICDR Schedule VI Part A',
      feedsInto: [PROMOTERS],
    },
    {
      path: 'promoters.anyDebarredBySebi',
      label: 'Is any promoter, promoter group member or director debarred by SEBI from accessing the capital markets?',
      type: 'boolean',
      schema: z.boolean(),
      helpText:
        'Regulation 228(a) makes the issuer ineligible while any of them is debarred, and 228(b) extends it to anyone who is a promoter or director of another company that is debarred. This is a hard stop with no cure short of the debarment expiring.',
      clause: 'R-020 (ICDR Reg 228(a), 228(b))',
      feedsInto: ['regulatory.statutoryStatements', PROMOTERS],
    },
    {
      path: 'promoters.anyWilfulDefaulterOrFraudulentBorrower',
      label: 'Is the company, any promoter or any director a wilful defaulter or fraudulent borrower?',
      type: 'boolean',
      schema: z.boolean(),
      helpText:
        'As classified by a bank under the RBI master directions. Regulation 228(c) makes it a bar on eligibility, and the litigation section carries a specific disclosure heading for it either way.',
      clause: 'R-020 (ICDR Reg 228(c))',
      feedsInto: ['regulatory.statutoryStatements', 'legal.litigation'],
    },
    {
      path: 'promoters.anyFugitiveEconomicOffender',
      label: 'Is any promoter or director a fugitive economic offender?',
      type: 'boolean',
      schema: z.boolean(),
      helpText:
        'Declared as such under the Fugitive Economic Offenders Act, 2018. Regulation 228(d). Almost always no, and asked because the answer is printed as a confirmation.',
      clause: 'R-020 (ICDR Reg 228(d))',
      feedsInto: ['regulatory.statutoryStatements'],
    },
    {
      path: 'promoters.controlChangedInPastYear',
      label: 'Has there been a change in the promoters having significant control in the last year?',
      type: 'boolean',
      schema: z.boolean(),
      helpText:
        'BSE SME asks for no change in the promoters holding significant control in the year before the application. A new promoter coming in, or an old one leaving, in that window is a query at best. Distinct from the next question, which is SEBI’s numeric test.',
      clause: 'E-08 (BSE SME criteria)',
      feedsInto: [PROMOTERS],
    },
    {
      path: 'promoters.majorityPromoterChangeDate',
      label: 'Date of any complete change of promoters, or of new promoters acquiring more than 50%',
      type: 'date',
      schema: zDate.nullable(),
      helpText:
        'Regulation 229(5): where the promoters changed completely, or new promoters acquired more than half the shareholding, the draft offer document may be filed only one year after the final change. A regulation rather than an exchange rule, so it binds on both platforms. Choose "None" if it has not happened.',
      clause: 'R-027 (ICDR Reg 229(5))',
      feedsInto: [PROMOTERS],
    },
    {
      path: 'promoters.anyAssociatedWithDelistedCompany',
      label: 'Is any promoter, executive director or non-independent director a promoter or director of a compulsorily delisted or trading-suspended company?',
      type: 'boolean',
      schema: z.boolean(),
      helpText:
        'Both exchanges test this, and both exclude independent directorships — an independent director who happens to sit on the board of a suspended company does not trip it. Answer for promoters, executive directors and non-executive non-independent directors only.',
      clause: 'R-031 (E-16 / N-11)',
      feedsInto: [MANAGEMENT, PROMOTERS],
    },
  ],
};
