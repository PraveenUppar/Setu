import { z } from 'zod';
import { zDate, zGroupCompany, zPercent, zRelatedParty, zRelatedPartyTransaction } from '../facts/schema';
import type { Module } from './types';
import type { RepeaterColumn } from './repeater-spec';

/**
 * M10 — Group Companies and Related Party Transactions.
 *
 * The CFO's module, ninety minutes, and the shortest of the ten: the related
 * party note to the accounts already lists every party and every transaction
 * by year, and this is that note pasted in.
 *
 * Two computed sections read it — "Our Group Companies" and "Summary of
 * Related Party Transactions" — and the RPT totals per year should tie to the
 * figures in M6, which the section checks.
 */

const GROUP = 'aboutCompany.groupCompanies';
const RPT = 'introduction.relatedPartyTransactions';

export const GROUP_COMPANY_COLUMNS: RepeaterColumn[] = [
  { key: 'name', label: 'Name', type: 'text', width: '16rem' },
  { key: 'cin', label: 'CIN', type: 'text', width: '12rem' },
  { key: 'relationship', label: 'Why it is a group company', type: 'text', width: '16rem' },
  { key: 'natureOfBusiness', label: 'Nature of business', type: 'text', width: '16rem' },
  { key: 'registeredOffice', label: 'Registered office', type: 'text', width: '16rem' },
  { key: 'isListed', label: 'Listed?', type: 'boolean', width: '6rem' },
  { key: 'publicOrRightsIssueInLastThreeYears', label: 'Public or rights issue in 3 years?', type: 'boolean', width: '7rem' },
];

export const RELATED_PARTY_COLUMNS: RepeaterColumn[] = [
  { key: 'name', label: 'Related party', type: 'text', width: '16rem' },
  { key: 'relationship', label: 'Relationship', type: 'text', width: '20rem' },
];

export const RPT_COLUMNS: RepeaterColumn[] = [
  { key: 'nature', label: 'Nature of transaction', type: 'text', width: '14rem' },
  { key: 'partyName', label: 'Related party', type: 'text', width: '14rem' },
  { key: 'amountLatest', label: 'Latest FY (Rs)', type: 'money', total: true, width: '9rem' },
  { key: 'amountPrior1', label: 'Year before (Rs)', type: 'money', total: true, width: '9rem' },
  { key: 'amountPrior2', label: 'Two years before (Rs)', type: 'money', total: true, width: '9rem' },
];

export const m10GroupCompanies: Module = {
  id: 'M10',
  title: 'Group Companies and Related Parties',
  estimatedMinutes: 90,
  assignableTo: 'CFO',
  dependsOn: ['M3', 'M6'],
  requestsDocuments: [
    'The related party note to the accounts for each of the three years',
    'The board resolution adopting the group company materiality policy',
    'Incorporation details of each group company',
  ],
  purpose:
    'Which companies count as group companies, and every related party transaction by year. The group company section and the RPT summary are built from this.',
  fields: [
    {
      path: 'groupCompanies.materialityResolutionDate',
      label: 'Date of the board resolution adopting the group company materiality policy',
      type: 'date',
      schema: zDate,
      helpText:
        'A group company is one with which there were related party transactions in the restated financials, plus any promoter-group company the board considers material. The board adopts that policy by resolution and the section quotes the date.',
      clause: 'ICDR Reg 2(1)(t); Schedule VI Part A',
      feedsInto: [GROUP],
    },
    {
      path: 'groupCompanies.materialityThresholdPercent',
      label: 'Threshold above which transactions with a promoter-group company make it material',
      type: 'percent',
      suffix: '%',
      schema: zPercent,
      helpText:
        'The second limb of the policy. Ten per cent is usual; what it is ten per cent OF varies — profit after tax in some documents, revenue in others — so the base is asked next.',
      clause: 'ICDR Reg 2(1)(t)',
      feedsInto: [GROUP],
    },
    {
      path: 'groupCompanies.materialityBase',
      label: 'That threshold is measured against',
      type: 'select',
      options: [
        { value: 'PROFIT_AFTER_TAX', label: 'Profit after tax of the latest restated year' },
        { value: 'REVENUE', label: 'Total revenue of the latest audited year' },
      ],
      schema: z.enum(['PROFIT_AFTER_TAX', 'REVENUE']),
      helpText: 'Whichever base the board resolution names. The section quotes the policy in the words of the resolution, so this must match it.',
      feedsInto: [GROUP],
    },
    {
      path: 'groupCompanies.companies',
      label: 'Group companies',
      type: 'table',
      schema: z.array(zGroupCompany),
      columns: GROUP_COMPANY_COLUMNS,
      helpText:
        'Every company that meets the policy. Leave the table empty if there are none — both primary corpus documents have none, and the section then prints the policy and the standard statement. Where there are, the document discloses each with its business, and whether any is listed or has made a public or rights issue in the last three years.',
      clause: 'ICDR Schedule VI Part A',
      feedsInto: [GROUP, 'general.definitions', 'legal.litigation'],
    },
    {
      path: 'groupCompanies.relatedParties',
      label: 'Related parties',
      type: 'table',
      schema: z.array(zRelatedParty),
      columns: RELATED_PARTY_COLUMNS,
      helpText:
        'Every related party from the note to the accounts, with the relationship as the note states it — directors and KMP, their relatives, entities they control, subsidiaries. This is the first table of the RPT summary.',
      clause: 'AS 18 / Ind AS 24; ICDR Schedule VI Part A',
      feedsInto: [RPT],
    },
    {
      path: 'groupCompanies.relatedPartyTransactions',
      label: 'Related party transactions',
      type: 'table',
      schema: z.array(zRelatedPartyTransaction),
      columns: RPT_COLUMNS,
      helpText:
        'Each transaction by nature and party, with the amount in each of the three financial years — most recent first, matching the financials module. Remuneration, rent, purchases, loans taken and repaid, guarantees. The yearly totals should tie to the related party figure in the financials; the section checks and says where they do not. Paste from the note.',
      clause: 'AS 18 / Ind AS 24; ICDR Schedule VI Part A',
      feedsInto: [RPT, 'general.riskFactors'],
      extractionHint: 'The related party transactions note in the restated financials, every line.',
    },
  ],
};
