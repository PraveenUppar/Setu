import Decimal from 'decimal.js';
import type { FactBase } from '../../facts/schema';
import { ageOn, longDate } from '../format';
import type { DocumentNode } from '../nodes';
import { derivedTerms, type RenderContext, type SectionSpec } from '../section';
import { gap, h2, h3, nil, para, table } from './helpers';
import { interestOfPromoters, promoterUndertakings } from './standing-statements';

/**
 * OUR PROMOTERS AND PROMOTER GROUP — section map #20, 6 to 7 pages.
 * COMPUTED from M3, with the aggregate holding read off the M2 register.
 *
 * Order from Om Galaxy pp.244-256 and Maxwell pp.212-226, which agree: the
 * promoters and their aggregate holding, brief profiles with PAN, other
 * ventures, change in management and control, relationship with directors,
 * disassociations, pledged shares, then the promoter group by relationship.
 *
 * "Interest of our Promoters", the payment-or-benefit statement, common
 * pursuits and the undertakings are extracted boilerplate in
 * standing-statements.ts, each switched by the fact that decides it.
 */

/** The promoters' aggregate holding, from the register. */
export function promoterHolding(facts: FactBase): { shares: number; percent: string } {
  const names = new Set(facts.promoters.promoters.map((p) => p.name));
  const shares = facts.capital.shareholders
    .filter((s) => names.has(s.name))
    .reduce((n, s) => n + s.shares, 0);
  const pre = facts.capital.paidUpShares;
  const percent = pre === 0 ? '0.00' : new Decimal(shares).dividedBy(pre).times(100).toFixed(2);
  return { shares, percent };
}

const listNames = (names: string[]) =>
  names.length <= 1 ? names.join('') : `${names.slice(0, -1).join(', ')} and ${names[names.length - 1]}`;

export const promoters: SectionSpec = {
  id: 'aboutCompany.promoters',
  partOf: '20. Our Promoters and Promoter Group',
  title: 'Our Promoters and Promoter Group',
  producer: 'computed',
  order: 2600,
  group: 'SECTION - ABOUT THE COMPANY',
  clause: 'ICDR Reg 2(1)(oo), 2(1)(pp); ICDR Schedule VI Part A',
  extractedFrom: [
    'bookbuilt__manufacturing__om-galaxy__bse-sme__2026-09__rhp.pdf pp.244-256',
    'bookbuilt__engineering__maxwell-engineering__nse-emerge__2026-08__drhp.pdf pp.212-226',
  ],
  compute: ({ facts }: RenderContext): DocumentNode[] => {
    const t = derivedTerms(facts);
    const p = facts.promoters;
    const nodes: DocumentNode[] = [h2('Our Promoters and Promoter Group'), h3('Our Promoters')];

    if (p.promoters.length === 0) {
      nodes.push(gap('promoters.promoters', 'The promoters of the company, with PAN, date of birth, qualifications and experience'));
    } else {
      const holding = promoterHolding(facts);
      nodes.push(
        para(
          `The Promoters of our Company are ${listNames(p.promoters.map((x) => x.name))}. As on the date of this ${t.documentName}, our Promoters hold an aggregate of ${holding.shares.toLocaleString('en-IN')} Equity Shares, representing ${holding.percent}% of the pre-${t.issueWord} paid-up Equity Share capital of our Company.`,
        ),
        para(`For details of the build-up of the Promoters' shareholding in our Company, see "Capital Structure".`),
        h3('Brief Profile of our Promoters'),
      );

      for (const pr of p.promoters) {
        const age = ageOn(pr.dateOfBirth);
        const lead =
          pr.kind === 'BODY_CORPORATE'
            ? `${pr.name} is a Promoter of our Company.`
            : `${pr.name}${age !== undefined ? `, aged ${age} years,` : ''} is ${pr.designation ? `the Promoter and ${pr.designation}` : 'a Promoter'} of our Company.`;
        const body = [
          lead,
          pr.qualification ? `${pr.name.split(' ')[0]} holds ${pr.qualification}.` : '',
          pr.experienceSummary ?? (pr.experienceYears !== undefined ? `${pr.name.split(' ')[0]} has ${pr.experienceYears} years of experience in the business of our Company.` : ''),
          pr.designation ? `For the complete profile, including residential address, other directorships and positions held in the past, see "Our Management".` : '',
        ]
          .filter(Boolean)
          .join(' ');
        nodes.push(h3(pr.name), para(body));
        if (pr.kind === 'INDIVIDUAL') {
          nodes.push(pr.pan ? para(`PAN: ${pr.pan}`) : gap('promoters.promoters', `PAN of ${pr.name}`));
        }
      }

      /* Other ventures */
      nodes.push(h3('Other Ventures of our Promoters'));
      const ventures = p.promoters.flatMap((pr) =>
        [...pr.otherDirectorships, ...pr.otherVentures].map((v) => [pr.name, v]),
      );
      if (ventures.length === 0) {
        nodes.push(para(`Other than as disclosed in "Our Management", our Promoters are not involved in any other venture as on the date of this ${t.documentName}.`));
      } else {
        nodes.push(table(['Promoter', 'Company or firm'], ventures));
      }
    }

    /* Change in control */
    nodes.push(h3('Change in the Management and Control of our Company'));
    nodes.push(
      p.managementControlChangeDetails
        ? para(p.managementControlChangeDetails)
        : para('There has been no change in the management and control of our Company in the last three years.'),
    );

    /* Relationship with directors — derived from the board */
    nodes.push(h3('Relationship of Promoters with our Directors'));
    const promoterDirectors = facts.management.directors.filter((d) =>
      p.promoters.some((pr) => pr.name === d.name),
    );
    const promoterRelatives = facts.management.directors.filter(
      (d) => d.relatedTo && p.promoters.some((pr) => d.relatedTo!.includes(pr.name)) && !promoterDirectors.includes(d),
    );
    if (promoterDirectors.length === 0 && promoterRelatives.length === 0) {
      nodes.push(para('None of our Promoters is a Director of our Company or related to any Director of our Company.'));
    } else {
      nodes.push(
        para(`Except as stated below, none of our Promoters is related to any of our Directors as on the date of this ${t.documentName}:`),
        table(
          ['Name', 'Relationship'],
          [
            ...promoterDirectors.map((d) => [d.name, `Promoter and ${d.designation}`]),
            ...promoterRelatives.map((d) => [d.name, `${d.designation}; ${d.relatedTo}`]),
          ],
        ),
      );
    }

    /* Disassociations */
    nodes.push(h3('Disassociation by our Promoters in the Last Three Years'));
    if (p.disassociations.length === 0) {
      nodes.push(para('None of our Promoters has disassociated from any company or firm during the three years preceding the date of this ' + t.documentName + '.'));
    } else {
      nodes.push(
        table(
          ['Name of Promoter', 'Company or firm', 'Date of disassociation', 'Reasons and circumstances'],
          p.disassociations.map((d) => [d.promoterName, d.entityName, longDate(d.date), d.reason]),
        ),
      );
    }

    /* Interest of promoters, property, payments, common pursuits — extracted */
    if (p.promoters.length > 0) nodes.push(...interestOfPromoters(facts));

    /* Pledged shares, guarantees */
    nodes.push(h3('Pledged Shares held by our Promoters'));
    nodes.push(
      p.pledgedSharesDetails
        ? para(p.pledgedSharesDetails)
        : para(`None of the Equity Shares held by our Promoters are pledged or otherwise encumbered as on the date of this ${t.documentName}.`),
    );
    nodes.push(h3('Material Guarantees'));
    nodes.push(
      p.materialGuaranteesDetails
        ? para(p.materialGuaranteesDetails)
        : para('Our Promoters have not given any material guarantee to any third party with respect to the specified securities of our Company.'),
    );

    /* Undertakings and confirmations, each switched by its flag */
    if (p.promoters.length > 0) nodes.push(...promoterUndertakings(facts));

    /* Promoter group */
    nodes.push(h3('Our Promoter Group'));
    if (p.promoterGroupMembers.length === 0) {
      nodes.push(gap('promoters.promoterGroupMembers', 'The members of the promoter group, by relationship to each promoter'));
    } else {
      nodes.push(
        para(
          'In addition to our Promoters, the following individuals and entities form part of our Promoter Group in terms of Regulation 2(1)(pp) of the SEBI ICDR Regulations:',
        ),
      );
      const individuals = p.promoterGroupMembers.filter((m) => m.kind === 'INDIVIDUAL');
      const entities = p.promoterGroupMembers.filter((m) => m.kind === 'ENTITY');
      const byPromoter = new Map<string, typeof individuals>();
      for (const m of individuals) {
        const key = m.relatedTo ?? 'Promoter';
        byPromoter.set(key, [...(byPromoter.get(key) ?? []), m]);
      }
      for (const [promoter, members] of byPromoter) {
        nodes.push(
          h3(`Natural persons forming part of the Promoter Group of ${promoter}`),
          table(['Relationship', 'Name'], members.map((m) => [m.relationship, m.name])),
        );
      }
      nodes.push(h3('Entities forming part of the Promoter Group'));
      nodes.push(
        entities.length === 0
          ? nil()
          : table(['Name of entity', 'Nature of relationship'], entities.map((m) => [m.name, m.relationship])),
      );
    }

    return nodes;
  },
};
