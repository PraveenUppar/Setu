/**
 * Sections in the map that are not in the registry yet.
 *
 * A module field names the sections it feeds so the form can say where the
 * answer will appear. Most of M5's answers feed Our Business and the Risk
 * Factors, which are S9 and S10 work — and the choice was between leaving
 * those fields with no destination, inventing placeholder sections that would
 * inflate the progress counter, or naming the destination and saying it is
 * not drafted yet. The third is the honest one, and it keeps the test that
 * every `feedsInto` id is real: real means built OR planned, never a typo.
 *
 * Ids follow the registry's `group.subsection` convention. When a section is
 * built, its entry moves out of here and into the registry; the field specs
 * do not change.
 */
export const plannedSections: Record<string, string> = {
  'introduction.generalInformation': 'General Information',
  'particulars.taxBenefits': 'Statement of Special Tax Benefits',
  'aboutCompany.keyRegulations': 'Key Industry Regulations and Policies',
  'aboutCompany.subsidiaries': 'Our Subsidiaries, Associates and Joint Ventures',
  'financial.restatedFinancialInformation': 'Restated Financial Information',
};
