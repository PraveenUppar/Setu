import type { FactBase } from '../../facts/schema';
import type { RenderContext, SectionSpec } from '../section';

/**
 * HISTORY AND CORPORATE MATTERS — section map #17, 4-7 pages, producer
 * "N + facts". The first real narrative SECTION (D51) — everything before
 * this (D50) drafted one risk factor's paragraph, not a whole section with
 * its own `promptSpec`.
 *
 * Kept deliberately narrow for a first section: incorporation, name changes,
 * conversion to public limited, and the registered office are all facts M1
 * already collects with no judgement call left to the model — the "N" in
 * the map is doing less work here than it does for Our Business or Industry
 * Overview, which need real commercial narrative M5/M6 alone cannot supply.
 * A harder narrative section should wait until this one has been read by a
 * human against the corpus, not drafted from the same untested assumptions.
 */

const ACT_NAME: Record<FactBase['company']['incorporatedUnder'], string> = {
  COMPANIES_ACT_1956: 'the Companies Act, 1956',
  COMPANIES_ACT_2013: 'the Companies Act, 2013',
};

function historyFactSlice(facts: FactBase) {
  const c = facts.company;
  return {
    companyName: c.name,
    cin: c.cin,
    dateOfIncorporation: c.dateOfIncorporation,
    incorporatedUnder: ACT_NAME[c.incorporatedUnder],
    isPublicLimited: c.isPublicLimited,
    conversionToPublicDate: c.conversionToPublicDate,
    nameChanges: c.nameChanges,
    registeredOffice: c.registeredOffice,
  };
}

export const history: SectionSpec = {
  id: 'aboutCompany.history',
  partOf: '17. History and Corporate Structure / Certain Corporate Matters',
  title: 'History and Corporate Matters',
  producer: 'narrative',
  order: 2450,
  group: 'SECTION - ABOUT THE COMPANY',
  clause: 'ICDR Schedule VI Part A',
  promptSpec: {
    factSlice: historyFactSlice,
    instructions:
      'Draft the opening of the "History and Corporate Matters" section of an Indian SME IPO prospectus. ' +
      'Cover, in this order: (1) the date and manner of incorporation, and under which Companies Act; ' +
      '(2) every name change on file, in order, with the date and reason for each; (3) the conversion to a public ' +
      'limited company, if the factSlice shows one, with its date; (4) the current registered office address. ' +
      'State only what the factSlice contains — where it is silent on something a real prospectus would also cover ' +
      '(e.g. changes of registered office, corporate approvals, other history), leave it out rather than guessing ' +
      'that nothing of the kind occurred.',
    wordTarget: 150,
  },
};
