import { z } from 'zod';
import { zAllotment, zPromoterHolding, zShareholder } from '../facts/schema';
import type { Module } from './types';
import type { RepeaterColumn } from './repeater-spec';

/**
 * M2 — Capital and Shareholding.
 *
 * The heaviest module in the build: three to four hours, three repeaters, and
 * roughly 60% of the data volume of the whole intake. Everything in the
 * Capital Structure section — twelve to eighteen pages of tables — is derived
 * from what is collected here, and nothing in it is typed twice.
 *
 * The source of truth for a real issuer is the PAS-3 filings on MCA21, which
 * is why the module asks for the allotment history "since incorporation"
 * rather than "recent allotments": the cumulative total has to reconcile to
 * paid-up capital, and a missing bonus issue from 2019 breaks every table
 * downstream.
 */

export const ALLOTMENT_COLUMNS: RepeaterColumn[] = [
  { key: 'date', label: 'Date of allotment', type: 'date', width: '9rem' },
  { key: 'shares', label: 'Shares', type: 'number', total: true, width: '7rem' },
  { key: 'faceValue', label: 'Face value (Rs)', type: 'money', width: '6rem' },
  { key: 'issuePrice', label: 'Issue price (Rs)', type: 'money', width: '6rem', placeholder: 'Nil for bonus' },
  {
    key: 'consideration',
    label: 'Consideration',
    type: 'select',
    width: '9rem',
    options: [
      { value: 'CASH', label: 'Cash' },
      { value: 'OTHER_THAN_CASH', label: 'Other than cash' },
      { value: 'BONUS', label: 'Bonus' },
    ],
  },
  {
    key: 'nature',
    label: 'Nature of allotment',
    type: 'select',
    width: '12rem',
    options: [
      { value: 'SUBSCRIPTION_TO_MOA', label: 'Subscription to the MOA' },
      { value: 'FURTHER_ALLOTMENT', label: 'Further allotment' },
      { value: 'RIGHTS_ISSUE', label: 'Rights issue' },
      { value: 'PREFERENTIAL_ALLOTMENT', label: 'Preferential allotment' },
      { value: 'PRIVATE_PLACEMENT', label: 'Private placement' },
      { value: 'BONUS_ISSUE', label: 'Bonus issue' },
      { value: 'CONVERSION', label: 'Conversion' },
      { value: 'SCHEME_OF_ARRANGEMENT', label: 'Scheme of arrangement' },
      { value: 'ESOP', label: 'ESOP' },
    ],
  },
  { key: 'allottees', label: 'Allottees', type: 'text', width: '14rem' },
];

export const SHAREHOLDER_COLUMNS: RepeaterColumn[] = [
  { key: 'name', label: 'Name', type: 'text', width: '16rem' },
  {
    key: 'category',
    label: 'Category',
    type: 'select',
    width: '12rem',
    options: [
      { value: 'PROMOTER', label: 'Promoter' },
      { value: 'PROMOTER_GROUP', label: 'Promoter group' },
      { value: 'PUBLIC_INDIVIDUAL', label: 'Public — individual' },
      { value: 'PUBLIC_BODY_CORPORATE', label: 'Public — body corporate' },
      { value: 'INSTITUTIONAL', label: 'Institutional' },
      { value: 'EMPLOYEE', label: 'Employee' },
    ],
  },
  { key: 'shares', label: 'Shares held', type: 'number', total: true, width: '8rem' },
];

export const PROMOTER_HOLDING_COLUMNS: RepeaterColumn[] = [
  { key: 'promoterName', label: 'Promoter', type: 'text', width: '14rem' },
  { key: 'shares', label: 'Shares', type: 'number', total: true, width: '7rem' },
  { key: 'acquisitionDate', label: 'Acquired on', type: 'date', width: '9rem' },
  { key: 'costPerShare', label: 'Cost per share (Rs)', type: 'money', width: '7rem' },
  {
    key: 'natureOfAcquisition',
    label: 'Nature',
    type: 'select',
    width: '12rem',
    options: [
      { value: 'SUBSCRIPTION_TO_MOA', label: 'Subscription to the MOA' },
      { value: 'FURTHER_ALLOTMENT', label: 'Further allotment' },
      { value: 'PREFERENTIAL_ALLOTMENT', label: 'Preferential allotment' },
      { value: 'BONUS_ISSUE', label: 'Bonus issue' },
      { value: 'TRANSFER', label: 'Transfer' },
    ],
  },
  { key: 'eligibleForMPC', label: 'Eligible for MPC', type: 'boolean', width: '7rem' },
];

export const m2Capital: Module = {
  id: 'M2',
  title: 'Capital and Shareholding',
  estimatedMinutes: 210,
  assignableTo: 'CS',
  dependsOn: ['M1'],
  requestsDocuments: [
    'PAS-3 filings for every allotment since incorporation',
    'Register of members',
    'Share transfer records',
    'Board and shareholder resolutions for each allotment',
  ],
  purpose:
    'Every allotment since incorporation and the full register of members. Twelve to eighteen pages of tables are computed from this, and none of it is typed twice.',
  fields: [
    {
      path: 'capital.faceValue',
      label: 'Face value per Equity Share (Rs)',
      type: 'currency',
      schema: z.string(),
      helpText:
        'The current face value. It multiplies through every capital table, so a wrong value here is wrong in twelve places. Note that the face value may have CHANGED over the company\'s life through a split or consolidation — the build-up records the value at the time of each allotment.',
      feedsInto: ['general.definitions', 'capital.structure'],
    },
    {
      path: 'capital.authorisedShares',
      label: 'Authorised share capital (number of shares)',
      type: 'number',
      schema: z.number().int().positive(),
      helpText:
        'From the Memorandum of Association. If the fresh issue would take paid-up capital past this, the authorised capital has to be increased by shareholder resolution first — which is a general meeting and a filing, so it is worth checking early.',
      feedsInto: ['capital.structure'],
    },
    {
      path: 'capital.paidUpShares',
      label: 'Paid-up Equity Shares before the issue',
      type: 'number',
      schema: z.number().int().nonnegative(),
      helpText:
        'The number of Equity Shares in issue today. The allotment history below has to add up to exactly this — if it does not, an allotment is missing or duplicated, and every table computed from it will be wrong.',
      feedsInto: ['capital.structure', 'issueRelated.issueStructure'],
    },
    {
      path: 'capital.allotments',
      label: 'Allotment history since incorporation',
      type: 'table',
      schema: z.array(zAllotment),
      columns: ALLOTMENT_COLUMNS,
      helpText:
        'Every allotment since incorporation, including the subscription to the Memorandum, every rights and preferential issue, every bonus issue and every conversion. The source is the PAS-3 filings on MCA21. The cumulative total must reconcile to paid-up capital — this is the single most common place a draft prospectus fails to tie.',
      clause: 'ICDR Schedule VI Part A',
      feedsInto: ['capital.structure'],
      extractionHint: 'The share capital history table, usually titled "Build-up of our equity share capital".',
    },
    {
      path: 'capital.shareholders',
      label: 'Register of members',
      type: 'table',
      schema: z.array(zShareholder),
      columns: SHAREHOLDER_COLUMNS,
      helpText:
        'Every shareholder and their holding, categorised. The total must equal paid-up capital: the register has to account for every share, and small residual holders are usually the ones missing. The categories drive the shareholding pattern table, so a promoter entered as public understates promoter holding and can fail the minimum contribution test.',
      feedsInto: ['capital.structure'],
    },
    {
      path: 'capital.promoterHoldings',
      label: 'Promoter holdings by tranche',
      type: 'table',
      schema: z.array(zPromoterHolding),
      columns: PROMOTER_HOLDING_COLUMNS,
      helpText:
        'Lock-in attaches to specific tranches, not to a promoter\'s total holding, so each acquisition is listed separately with its date and cost. Mark a tranche ineligible where the regulations exclude it from the minimum contribution — bonus shares issued out of revaluation reserves are the usual case, and a promoter can hold 25% of post-issue capital and still be short because of them.',
      clause: 'R-009 (promoter lock-in)',
      feedsInto: ['capital.structure'],
    },
    {
      path: 'capital.hasOutstandingConvertibles',
      label: 'Are there outstanding convertible securities?',
      type: 'boolean',
      schema: z.boolean(),
      helpText:
        'Any instrument that could entitle someone to Equity Shares — convertible notes, warrants, options outside an ESOP. Regulation 228(e) makes the issuer ineligible while any are outstanding, and converting or extinguishing them takes months. This is the question most worth answering honestly on day one.',
      clause: 'R-020 (ICDR Reg 228(e))',
      feedsInto: ['capital.structure', 'regulatory.statutoryStatements'],
    },
    {
      path: 'capital.hasPartlyPaidShares',
      label: 'Are any existing shares only partly paid up?',
      type: 'boolean',
      schema: z.boolean(),
      helpText:
        'Regulation 230(1)(c) requires all present equity share capital to be fully paid up before the issue. Partly paid shares must be made fully paid or forfeited first.',
      clause: 'R-021 (ICDR Reg 230(1)(c))',
      feedsInto: ['regulatory.statutoryStatements'],
    },
  ],
};
