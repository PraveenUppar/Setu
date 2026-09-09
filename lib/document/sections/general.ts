import type { SectionSpec } from '../section';

/**
 * SECTION I — GENERAL
 *
 * All boilerplate. Extracted by diffing the same subsection across corpus
 * documents (see the `template-extraction` skill), never written from memory.
 */

/**
 * Forward Looking Statements.
 *
 * Extraction notes, 2026-09-09:
 *   - Om Galaxy RHP (BSE SME) pp.26-28 and Maxwell DRHP (NSE Emerge) pp.23-24
 *   - The second paragraph is WORD-FOR-WORD IDENTICAL in both documents
 *   - The opening paragraph shares a common core; Maxwell adds a longer
 *     preamble and two extra trigger words. The shared core is used here.
 *   - The list of factors is issuer-specific, drawn from the risk factors, so
 *     it is NOT template text. It renders as a gap until S10 supplies it.
 *   - Om Galaxy's closing paragraph repeats "nor any of their respective
 *     affiliates" twice, evidently a drafting slip. Not reproduced.
 */
export const forwardLookingStatements: SectionSpec = {
  id: 'general.forwardLookingStatements',
  title: 'Forward Looking Statements',
  producer: 'template',
  order: 300,
  group: 'SECTION I - GENERAL',
  extractedFrom: [
    'bookbuilt__manufacturing__om-galaxy__bse-sme__2026-09__rhp.pdf pp.26-28',
    'bookbuilt__engineering__maxwell-engineering__nse-emerge__2026-08__drhp.pdf pp.23-24',
  ],
  asks: {
    'riskFactors.summaryOfMaterialFactors':
      'Summary of material risk factors — generated once Risk Factors are drafted',
  },
  template: `
## Forward Looking Statements

This {{ terms.documentName }} includes certain "forward-looking statements". We have
included statements in this {{ terms.documentName }} which contain words or phrases such as
"will", "aim", "believe", "expect", "will continue", "anticipate", "estimate", "intend",
"plan", "contemplate", "seek to", "future", "objective", "goal", "project", "should", and
similar expressions or variations of such expressions, that are "forward-looking statements".
Also, statements which describe our strategies, objectives, plans or goals are also
forward-looking statements.

All forward-looking statements are subject to risks, uncertainties and assumptions about us
that could cause actual results to differ materially from those contemplated by the relevant
forward-looking statement. Forward-looking statements reflect our current views with respect
to future events and are not a guarantee of future performance. These statements are based on
our management's beliefs and assumptions, which in turn are based on currently available
information. Although we believe the assumptions upon which these forward-looking statements
are based are reasonable, any of these assumptions could prove to be inaccurate, and the
forward-looking statements based on these assumptions could be incorrect.

Important factors that could cause actual results to differ materially from our expectations
include but are not limited to:

{{ riskFactors.summaryOfMaterialFactors }}

By their nature, certain market risk disclosures are only estimates and could be materially
different from what actually occurs in the future. As a result, actual gains or losses could
materially differ from those that have been estimated. Prospective investors are cautioned not
to place undue reliance on these forward-looking statements and not to regard such statements
to be a guarantee of our future performance.

Neither our Company, our Directors, our Promoters, the {{#if offer.bookRunningLeadManager }}Book Running Lead Manager{{/if}}{{#unless offer.bookRunningLeadManager }}Lead Manager{{/unless}},
nor any of their respective affiliates or advisors have any obligation to update or otherwise
revise any statements reflecting circumstances arising after the date hereof or to reflect the
occurrence of underlying events, even if the underlying assumptions do not come to fruition. In
accordance with SEBI's requirements, our Company shall ensure that investors in India are
informed of material developments pertaining to our Company from the date of this
{{ terms.documentName }} in relation to the statements and undertakings made by them in this
{{ terms.documentName }} until the time of the grant of listing and trading permission by the
Stock Exchange for this {{ terms.issueWord }}.
`.trim(),
};

export const generalSections: SectionSpec[] = [forwardLookingStatements];
