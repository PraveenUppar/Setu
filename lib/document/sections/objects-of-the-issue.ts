import Decimal from 'decimal.js';
import { formatAs } from '../../facts/money';
import type { FactBase } from '../../facts/schema';
import type { RenderContext, SectionSpec } from '../section';

/**
 * OBJECTS OF THE ISSUE — section map #11, 22-32pp observed (far bigger than
 * the original 10-15pp plan), producer "N + C". The computed half — means
 * of finance tables, a deployment schedule, the GCP cap check against
 * R-010 — is not built here; this is the narrative half, the opening
 * paragraph naming the objects and the amount earmarked for each, which
 * every corpus document opens the chapter with before the tables.
 *
 * Scoped the same way as History and Our Business: `offer.objects` already
 * carries description, amount and the GCP/project flags per object — one
 * fact the whole chapter is built from, so drafting the opening is asking
 * the model to describe a structure, not invent one.
 */

function objectsFactSlice(facts: FactBase) {
  const objects = facts.offer.objects;
  const total = objects.reduce((s, o) => s.plus(o.amount), new Decimal(0));
  return {
    companyName: facts.company.name,
    objects: objects.map((o) => ({
      description: o.description,
      amount: formatAs(o.amount, 'crores'),
      isGeneralCorporatePurposes: o.isGeneralCorporatePurposes,
    })),
    totalAmount: formatAs(total.toFixed(), 'crores'),
  };
}

export const objectsOfTheIssue: SectionSpec = {
  id: 'particulars.objectsOfTheIssue',
  partOf: '11. Objects of the Issue',
  title: 'Objects of the Issue',
  producer: 'narrative',
  order: 2100,
  group: 'SECTION - PARTICULARS OF THE OFFER',
  clause: 'ICDR Schedule VI Part A',
  promptSpec: {
    factSlice: objectsFactSlice,
    instructions:
      'Draft the opening paragraph of the "Objects of the Issue" section of an Indian SME IPO prospectus. ' +
      'State that the proceeds of the Fresh Issue are proposed to be utilised for the objects listed in the ' +
      'factSlice, then list each object with its earmarked amount, then state the total. Close with a sentence ' +
      'noting that the detailed means of finance and deployment schedule for each object are set out in the ' +
      'sections that follow. Do not invent an object, an amount, or a deployment timeline not present in the ' +
      'factSlice.',
    wordTarget: 140,
  },
};
