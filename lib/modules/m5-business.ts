import { z } from 'zod';
import { zFacility, zMoney, zPercent } from '../facts/schema';
import type { Module } from './types';
import type { RepeaterColumn } from './repeater-spec';

/**
 * M5 — Business Operations.
 *
 * The promoter's module, and the shortest of the content-heavy ones, because
 * it asks only for what can be stated as fact: who the customers are and how
 * concentrated, where the plants are and how full, how many people, what the
 * order book is. Everything judgemental about the business — strengths,
 * strategy, the industry — is drafted at S9 from these facts, not asked as
 * prose in a form.
 *
 * Two things read it today: the customer concentration rule (CO-009) and the
 * unit-wise approval tables. The rest feeds sections that are not yet
 * drafted, and the form says so.
 */

const BUSINESS = 'aboutCompany.ourBusiness';
const RISK = 'general.riskFactors';
const APPROVALS = 'legal.approvals';

export const CUSTOMER_COLUMNS: RepeaterColumn[] = [
  { key: 'name', label: 'Customer', type: 'text', width: '18rem' },
  { key: 'revenueShare', label: '% of revenue', type: 'number', total: true, width: '8rem' },
];

export const SUPPLIER_COLUMNS: RepeaterColumn[] = [
  { key: 'name', label: 'Supplier', type: 'text', width: '18rem' },
  { key: 'purchaseShare', label: '% of purchases', type: 'number', total: true, width: '8rem' },
];

export const FACILITY_COLUMNS: RepeaterColumn[] = [
  { key: 'name', label: 'Unit', type: 'text', width: '9rem', placeholder: 'Unit I' },
  { key: 'location', label: 'Location', type: 'text', width: '18rem' },
  { key: 'owned', label: 'Owned?', type: 'boolean', width: '6rem' },
  { key: 'capacity', label: 'Installed capacity', type: 'text', width: '14rem' },
  { key: 'capacityUtilisationPercent', label: 'Utilisation last FY (%)', type: 'number', width: '7rem' },
  { key: 'areaSqFt', label: 'Area (sq ft)', type: 'number', width: '7rem' },
];

export const m5Business: Module = {
  id: 'M5',
  title: 'Business Operations',
  estimatedMinutes: 90,
  assignableTo: 'PROMOTER',
  dependsOn: ['M1'],
  requestsDocuments: [
    'Customer-wise and supplier-wise sales and purchase registers for the last financial year',
    'Capacity and production records for each unit',
    'Order book as on a recent date, with the backing purchase orders',
    'Property documents or lease deeds for each facility',
  ],
  purpose:
    'The facts of the business: customers and how concentrated, suppliers, plants and their utilisation, headcount and order book. The business narrative and the risk factors are drafted from these.',
  fields: [
    {
      path: 'business.topCustomers',
      label: 'Top customers by share of revenue',
      type: 'table',
      schema: z.array(z.object({ name: z.string(), revenueShare: zPercent })),
      columns: CUSTOMER_COLUMNS,
      helpText:
        'The five or ten largest customers in the last financial year and each one’s share of revenue. This is the single fact most risk factors are built on: where the top five exceed half of revenue, the customer concentration risk factor is written with the real percentage. The shares cannot total more than 100%, and the check is live.',
      clause: 'ICDR Schedule VI Part A',
      feedsInto: [BUSINESS, RISK],
      validate: (value) =>
        Array.isArray(value) &&
        value.reduce((s, c) => s + (typeof c?.revenueShare === 'number' ? c.revenueShare : 0), 0) > 100
          ? ['The shares total more than 100% of revenue.']
          : [],
    },
    {
      path: 'business.topSuppliers',
      label: 'Top suppliers by share of purchases',
      type: 'table',
      schema: z.array(z.object({ name: z.string(), purchaseShare: zPercent })),
      columns: SUPPLIER_COLUMNS,
      helpText:
        'The largest suppliers of raw material and their share of purchases. Supplier concentration is a standard risk factor, and a single-source raw material is a query the exchange asks about.',
      clause: 'ICDR Schedule VI Part A',
      feedsInto: [BUSINESS, RISK],
    },
    {
      path: 'business.hasFixedPriceSupplyContracts',
      label: 'Do you have long-term or fixed-price agreements with your key suppliers?',
      type: 'boolean',
      schema: z.boolean(),
      helpText:
        'Most SME manufacturers buy raw materials purchase-order by purchase-order, with no long-term or fixed-price lock-in — which is exactly why every corpus prospectus checked states a raw-material price volatility risk factor. Answering no (the common case) fires that risk factor; answering yes because a real fixed-price contract exists mutes it.',
      feedsInto: [BUSINESS, RISK],
    },
    {
      path: 'business.facilities',
      label: 'Manufacturing units and offices',
      type: 'table',
      schema: z.array(zFacility),
      columns: FACILITY_COLUMNS,
      helpText:
        'Every plant, warehouse and office, with whether it is owned or leased, its installed capacity and last year’s utilisation. The unit names are reused by the approvals module so that licences can be listed per unit, the way the document presents them. A leased factory is a risk factor; a leased registered office is a query.',
      clause: 'ICDR Schedule VI Part A',
      feedsInto: [BUSINESS, APPROVALS, RISK],
    },
    {
      path: 'business.productLines',
      label: 'Principal products or services',
      type: 'longtext',
      schema: z.string().min(3),
      placeholder: 'One per line, or separated by semicolons',
      helpText:
        'What the company sells, as the business itself describes it — the product families or service lines, not the marketing copy. The business overview and the glossary of sector terms are drafted around these.',
      feedsInto: [BUSINESS, 'general.definitions'],
    },
    {
      path: 'business.employeeCount',
      label: 'Number of permanent employees',
      type: 'number',
      suffix: 'on the rolls',
      schema: z.number().int().nonnegative(),
      helpText:
        'Permanent employees on the rolls as on a recent date, excluding contract labour. The business section states headcount, and the labour law compliance disclosures depend on it — the Factories Act and the ESI Act both have headcount thresholds.',
      feedsInto: [BUSINESS],
    },
    {
      path: 'business.orderBook',
      label: 'Order book (Rs)',
      type: 'currency',
      schema: zMoney,
      helpText:
        'The value of unexecuted orders in hand, in rupees, as on a recent date. Stated in the business section and relied on in the objects of the issue where working capital is an object. Backing purchase orders are among the documents for inspection.',
      feedsInto: [BUSINESS, 'particulars.objectsOfTheIssue'],
    },
    {
      path: 'business.exportRevenueShare',
      label: 'Share of revenue from exports',
      type: 'percent',
      suffix: '% of last FY revenue',
      schema: zPercent,
      helpText:
        'Exports as a percentage of revenue in the last financial year. Zero is an answer. Where exports matter, currency risk becomes a risk factor and the Importer Exporter Code becomes a material approval.',
      feedsInto: [BUSINESS, RISK],
    },
    {
      path: 'business.primaryMarketDescription',
      label: 'State or states revenue is concentrated in, if any',
      type: 'text',
      schema: z.string(),
      placeholder: 'e.g. the State of Maharashtra',
      helpText:
        'Only if a substantial share of revenue comes from one state or a small group of states — leave blank if the business is nationally or regionally diversified. Several corpus prospectuses name this as a specific risk factor, with the state and the actual percentage.',
      feedsInto: [BUSINESS, RISK],
    },
    {
      path: 'business.primaryMarketRevenueSharePercent',
      label: 'Share of revenue from that state or states',
      type: 'percent',
      suffix: '% of last FY revenue',
      schema: zPercent,
      helpText: 'The percentage that makes the concentration above material enough to state.',
      showIf: (facts) => Boolean(facts.business?.primaryMarketDescription),
      feedsInto: [BUSINESS, RISK],
    },
  ],
};
