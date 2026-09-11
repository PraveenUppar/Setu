import { formatAs } from '../../facts/money';
import type { FactBase } from '../../facts/schema';
import type { RenderContext, SectionSpec } from '../section';

/**
 * OUR BUSINESS — section map #15, 35-36pp observed, producer N. The
 * flagship narrative section named alongside Risk Factors in
 * 02-architecture.md's drafting-harness section, and the hardest kind of
 * narrative this project produces: real commercial description, not a
 * restatement of structured facts (History, #17, is the latter — this is
 * not).
 *
 * Scoped deliberately narrow for a first draft, same reasoning as History:
 * only the "Overview" opening paragraph a real Our Business chapter starts
 * with (what the company makes, where, at what scale, for whom) — not the
 * Products, Manufacturing Process, Competitive Strengths or Strategy
 * subsections a full 35pp chapter needs, none of which this fact base has
 * the raw material to draft honestly yet. M5 gives products, facilities,
 * headcount, order book and principal customers; nothing here is risk
 * framing (that is Risk Factors' job) — Our Business describes, it does not
 * warn.
 */

function ourBusinessFactSlice(facts: FactBase) {
  const b = facts.business;
  return {
    companyName: facts.company.name,
    productLines: b.productLines,
    facilities: b.facilities,
    employeeCount: b.employeeCount,
    // Pre-formatted, not a raw rupee integer — the first draft handed the
    // model "316000000" and it printed exactly that string into a prose
    // sentence. Every other section formats money before it reaches a
    // renderer; this factSlice now does too, rather than trusting the model
    // to reformat a number it was told never to alter.
    orderBook: b.orderBook ? formatAs(b.orderBook, 'crores') : undefined,
    exportRevenueShare: b.exportRevenueShare,
    principalCustomers: b.topCustomers.map((c) => c.name),
  };
}

export const ourBusiness: SectionSpec = {
  id: 'aboutCompany.ourBusiness',
  partOf: '15. Our Business / Business Overview',
  title: 'Our Business',
  producer: 'narrative',
  order: 2350,
  group: 'SECTION - ABOUT THE COMPANY',
  clause: 'ICDR Schedule VI Part A',
  promptSpec: {
    factSlice: ourBusinessFactSlice,
    instructions:
      'Draft the opening "Overview" paragraph of the "Our Business" section of an Indian SME IPO prospectus. ' +
      'Describe, in this order: (1) what the company manufactures or the services it provides, from productLines; ' +
      '(2) its manufacturing facility or facilities — location, capacity and utilisation where given; ' +
      '(3) the scale of operations — employee headcount and order book, where given; (4) the categories or names of ' +
      'its principal customers, where given, stated as a description of who it serves, not as a concentration risk. ' +
      'This is a DESCRIPTIVE overview, not a risk disclosure — do not use cautionary language ("risk", "adversely ' +
      'affect", "cannot assure") anywhere in it. State only what the factSlice contains; where it is silent on ' +
      'something a full Our Business chapter would also cover (history, competitive strengths, strategy), leave it ' +
      'out rather than guessing.',
    wordTarget: 180,
  },
};
