import { formatAs } from '../../facts/money';
import type { CommitteeKind, Director, FactBase, KeyManagerialPerson } from '../../facts/schema';
import { ageOn, longDate } from '../format';
import type { DocumentNode } from '../nodes';
import { derivedTerms, type RenderContext, type SectionSpec } from '../section';
import { gap, h2, h3, nil, para, table } from './helpers';

/**
 * OUR MANAGEMENT — section map #19, 16 to 19 pages. COMPUTED from M4, with
 * directors' shareholding read off the M2 register.
 *
 * Structure and connecting sentences from Om Galaxy pp.235-252 and Maxwell
 * pp.196-211, which agree on the order: the board table, brief profiles,
 * relationships between directors, borrowing powers, remuneration,
 * shareholding of directors, changes in the board, corporate governance and
 * the committees, then KMP and senior management.
 *
 * DELIBERATELY NOT HERE YET, because they are boilerplate the fact base does
 * not carry and Wave 1 extraction has not reached: the committees' terms of
 * reference (three pages of s.177/s.178 text in each source), the "interest
 * of directors" paragraphs, the confirmations on wilful defaulters and
 * securities-market association (facts in M3/M7, prose not yet extracted),
 * and the management organisation chart (an image).
 */

const COMMITTEE_TITLE: Record<CommitteeKind, string> = {
  AUDIT: 'Audit Committee',
  NOMINATION_AND_REMUNERATION: 'Nomination and Remuneration Committee',
  STAKEHOLDERS_RELATIONSHIP: 'Stakeholders Relationship Committee',
  CORPORATE_SOCIAL_RESPONSIBILITY: 'Corporate Social Responsibility Committee',
  OTHER: 'Committee',
};

/** "Non-Executive Independent Director" etc., as the committee tables say. */
function natureOfDirectorship(d: Director | undefined): string {
  if (!d) return '';
  if (d.isIndependent) return 'Non-Executive Independent Director';
  return d.isExecutive ? d.designation : 'Non-Executive Director';
}

/** A person's profile paragraph — KMP and senior management print the same shape. */
function profile(p: KeyManagerialPerson, since: string | undefined): DocumentNode[] {
  const age = ageOn(p.dateOfBirth);
  const opening =
    `${p.name}${age !== undefined ? `, aged ${age} years,` : ''} is the ${p.designation} of our Company` +
    `${since ? ` since ${longDate(since)}` : ''}.`;
  const parts = [
    opening,
    p.qualification ? `${p.qualification.endsWith('.') ? p.qualification : `Holds ${p.qualification}`}.`.replace('Holds Holds', 'Holds') : '',
    p.experienceSummary ?? '',
    p.remuneration ? `Remuneration received in the last financial year: ${formatAs(p.remuneration, 'lakhs')}.` : '',
  ].filter((s) => s !== '');
  return [h3(p.name), para(parts.join(' '))];
}

export const management: SectionSpec = {
  id: 'aboutCompany.management',
  partOf: '19. Our Management',
  title: 'Our Management',
  producer: 'computed',
  order: 2500,
  group: 'SECTION - ABOUT THE COMPANY',
  clause: 'ICDR Schedule VI Part A; Companies Act 2013 s.149, s.177, s.178',
  extractedFrom: [
    'bookbuilt__manufacturing__om-galaxy__bse-sme__2026-09__rhp.pdf pp.235-252',
    'bookbuilt__engineering__maxwell-engineering__nse-emerge__2026-08__drhp.pdf pp.196-211',
  ],
  compute: ({ facts }: RenderContext): DocumentNode[] => {
    const t = derivedTerms(facts);
    const m = facts.management;
    const directors = m.directors;
    const byName = new Map(directors.map((d) => [d.name, d]));
    const nodes: DocumentNode[] = [h2('Our Management')];

    /* -------------------------------------------------------------- */
    /* Board of Directors                                              */
    /* -------------------------------------------------------------- */
    nodes.push(h3('Board of Directors'));
    nodes.push(
      para(
        'In terms of the Companies Act, our Company shall have not less than three directors and not more than fifteen directors, provided that our shareholders may appoint more than fifteen directors after passing a special resolution in a general meeting.',
      ),
    );

    if (directors.length === 0) {
      nodes.push(gap('management.directors', 'The board of directors, with designation, DIN, date of birth, address and other directorships'));
    } else {
      const executive = directors.filter((d) => d.isExecutive).length;
      const independent = directors.filter((d) => d.isIndependent).length;
      const nonExecutive = directors.length - executive - independent;
      const composition = [
        `${executive} Executive Director${executive === 1 ? '' : 's'}`,
        nonExecutive > 0 ? `${nonExecutive} Non-Executive Director${nonExecutive === 1 ? '' : 's'}` : '',
        `${independent} Non-Executive Independent Director${independent === 1 ? '' : 's'}`,
      ].filter(Boolean);
      nodes.push(
        para(
          `As on the date of this ${t.documentName}, we have ${directors.length} Directors on our Board, including ${composition.join(', ')}.`,
        ),
        para(`The following table sets forth the details of our Board as on the date of this ${t.documentName}:`),
        table(
          ['Sr. No.', 'Name, Designation, DIN, Date of Birth, Age, Address, Occupation, Nationality and Term', 'Directorships in other companies'],
          directors.map((d, i) => [
            String(i + 1),
            [
              d.name,
              `Designation: ${d.designation}`,
              d.din ? `DIN: ${d.din}` : '',
              d.dateOfBirth ? `Date of Birth: ${longDate(d.dateOfBirth)}` : '',
              ageOn(d.dateOfBirth) !== undefined ? `Age: ${ageOn(d.dateOfBirth)} years` : '',
              d.address ? `Address: ${d.address}` : '',
              d.occupation ? `Occupation: ${d.occupation}` : '',
              d.nationality ? `Nationality: ${d.nationality}` : '',
              d.term ? `Term: ${d.term}` : '',
            ]
              .filter(Boolean)
              .join('; '),
            d.otherDirectorships.length > 0 ? d.otherDirectorships.join('; ') : 'Nil',
          ]),
          { numericColumns: [0] },
        ),
      );

      /* Brief profiles */
      nodes.push(h3('Brief Profile of the Directors of our Company'));
      for (const d of directors) {
        const age = ageOn(d.dateOfBirth);
        const lead = `${d.name}${age !== undefined ? `, aged ${age} years,` : ''} is the ${d.designation} of our Company.`;
        const body = [lead, d.qualification ? `${d.name.split(' ')[0]} holds ${d.qualification}.` : '', d.experienceSummary ?? '']
          .filter(Boolean)
          .join(' ');
        nodes.push(h3(d.name), para(body));
      }

      /* Relationships */
      nodes.push(h3('Relationship between our Directors, Key Managerial Personnel and Senior Management'));
      const related = directors.filter((d) => d.relatedTo && d.relatedTo.trim() !== '');
      if (related.length === 0) {
        nodes.push(para('None of our Directors is related to any other Director, Key Managerial Personnel or Senior Management of our Company.'));
      } else {
        nodes.push(
          para('Except as stated below, none of our Directors is related to any other Director, Key Managerial Personnel or Senior Management of our Company:'),
          table(['Name of Director', 'Relationship'], related.map((d) => [d.name, d.relatedTo!])),
        );
      }
    }

    /* -------------------------------------------------------------- */
    /* Borrowing powers                                                */
    /* -------------------------------------------------------------- */
    nodes.push(h3('Borrowing Powers of the Board'));
    if (m.borrowingPowersResolutionDate && m.borrowingPowersLimit) {
      nodes.push(
        para(
          `Pursuant to a special resolution passed by our shareholders on ${longDate(m.borrowingPowersResolutionDate)} under Section 180(1)(c) of the Companies Act, our Board is authorised to borrow, from time to time, such sums of money as may be required for the purposes of the business of our Company, notwithstanding that the money to be borrowed together with the money already borrowed may exceed the aggregate of the paid-up share capital, free reserves and securities premium of our Company, provided that the total amount so borrowed shall not exceed ${formatAs(m.borrowingPowersLimit, 'crores')}.`,
        ),
      );
    } else {
      if (!m.borrowingPowersResolutionDate) nodes.push(gap('management.borrowingPowersResolutionDate', 'Date of the shareholders resolution under Section 180(1)(c) authorising the borrowing powers of the Board'));
      if (!m.borrowingPowersLimit) nodes.push(gap('management.borrowingPowersLimit', 'The borrowing limit authorised by the shareholders under Section 180(1)(c)'));
    }

    /* -------------------------------------------------------------- */
    /* Remuneration                                                    */
    /* -------------------------------------------------------------- */
    const paid = directors.filter((d) => d.isExecutive);
    if (paid.length > 0) {
      const fy = facts.financials.years[0]?.yearEnding;
      nodes.push(
        h3(`Remuneration Paid to the Executive Directors${fy ? ` in Fiscal ${fy}` : ''}`),
        table(
          ['Sr. No.', 'Name of Director', 'Designation', 'Remuneration (Rs in Lakhs)'],
          paid.map((d, i) => [
            String(i + 1),
            d.name,
            d.designation,
            d.remuneration ? formatAs(d.remuneration, 'lakhs').replace(/^Rs /, '').replace(/ Lakhs$/, '') : '[TO BE PROVIDED]',
          ]),
          { numericColumns: [0, 3] },
        ),
      );
      for (const d of paid.filter((d) => !d.remuneration)) {
        nodes.push(gap('management.directors', `Remuneration paid to ${d.name} in the last financial year`));
      }
    }

    /* -------------------------------------------------------------- */
    /* Shareholding of directors — from the register, never typed     */
    /* -------------------------------------------------------------- */
    if (directors.length > 0) {
      nodes.push(h3('Shareholding of Directors in our Company'));
      const holdings = directors
        .map((d) => ({ name: d.name, shares: facts.capital.shareholders.find((s) => s.name === d.name)?.shares ?? 0 }))
        .filter((h) => h.shares > 0);
      if (holdings.length === 0) {
        nodes.push(para(`None of our Directors holds any Equity Shares in our Company as on the date of this ${t.documentName}.`));
      } else {
        const pre = facts.capital.paidUpShares;
        nodes.push(
          para(`Except as disclosed in the table below, none of our Directors holds any Equity Shares in our Company as on the date of this ${t.documentName}:`),
          table(
            ['Sr. No.', 'Name of Director', 'Number of Equity Shares held', `Percentage of pre-${t.issueWordLower} capital`],
            holdings.map((h, i) => [
              String(i + 1),
              h.name,
              h.shares.toLocaleString('en-IN'),
              pre > 0 ? ((h.shares / pre) * 100).toFixed(2) : '-',
            ]),
            { numericColumns: [0, 2, 3] },
          ),
        );
      }
    }

    /* -------------------------------------------------------------- */
    /* Changes in the board                                            */
    /* -------------------------------------------------------------- */
    nodes.push(h3('Changes in our Board in the Preceding Three Years'));
    if (m.boardChanges.length === 0) {
      nodes.push(para('There has been no change in our Board of Directors during the preceding three years.'));
    } else {
      nodes.push(
        para('Except as mentioned below, there has been no change in our Board of Directors during the preceding three years:'),
        table(
          ['Name of Director', 'Date of Event', 'Reason for Change'],
          [...m.boardChanges]
            .sort((a, b) => a.date.localeCompare(b.date))
            .map((c) => [c.name, longDate(c.date), c.reason]),
        ),
      );
    }

    /* -------------------------------------------------------------- */
    /* Corporate governance and committees                             */
    /* -------------------------------------------------------------- */
    nodes.push(h3('Corporate Governance'));
    nodes.push(
      // Om Galaxy p.244 and Maxwell p.206, near-verbatim in both
      para(
        `In addition to the applicable provisions of the Companies Act with respect to corporate governance, the provisions of the SEBI LODR Regulations will be applicable to our Company immediately upon the listing of the Equity Shares on ${t.exchangeLongName}. As on the date of this ${t.documentName}, as our Company is coming with an issue in terms of Chapter IX of the SEBI ICDR Regulations, the requirements specified in Regulations 17, 18, 19, 20, 21, 22, 23, 24, 25, 26 and 27 and clauses (b) to (i) of sub-regulation (2) of Regulation 46 and paragraphs C, D and E of Schedule V of the SEBI LODR Regulations are not applicable to our Company, although we are required to comply with the requirements of the Companies Act, 2013 wherever applicable.`,
      ),
    );
    if (m.committees.length === 0) {
      nodes.push(gap('management.committees', 'The committees of the Board — at least the Audit Committee, the Nomination and Remuneration Committee and the Stakeholders Relationship Committee — with their members'));
    } else {
      nodes.push(
        para('Our Board functions either on its own or through committees constituted to oversee specific operational areas. Our Company has constituted the following Committees of the Board:'),
        {
          type: 'list',
          ordered: true,
          items: m.committees.map((c) => [{ text: c.committee === 'OTHER' && c.name ? c.name : COMMITTEE_TITLE[c.committee] }]),
        },
      );
      for (const c of m.committees) {
        const title = c.committee === 'OTHER' && c.name ? c.name : COMMITTEE_TITLE[c.committee];
        nodes.push(h3(title));
        nodes.push(
          para(
            `${c.constitutedOn ? `The ${title} was constituted by a resolution of our Board dated ${longDate(c.constitutedOn)}. ` : ''}As on the date of this ${t.documentName}, the ${title} comprises:`,
          ),
          table(
            ['Name of the Director', 'Designation in the Committee', 'Nature of Directorship'],
            [
              [c.chairperson, 'Chairperson', natureOfDirectorship(byName.get(c.chairperson))],
              ...c.members.map((name) => [name, 'Member', natureOfDirectorship(byName.get(name))]),
            ],
          ),
        );
        if (c.committee === 'AUDIT') {
          nodes.push(para('The Company Secretary of our Company acts as the secretary of the Committee.'));
        }
      }
    }

    /* -------------------------------------------------------------- */
    /* Key Managerial Personnel and Senior Management                  */
    /* -------------------------------------------------------------- */
    nodes.push(h3('Key Managerial Personnel'));
    const kmp = m.keyManagerialPersonnel.filter((k) => !byName.has(k.name));
    if (m.keyManagerialPersonnel.length === 0) {
      nodes.push(gap('management.keyManagerialPersonnel', 'The Key Managerial Personnel — the Chief Financial Officer and the Company Secretary at least'));
    } else {
      nodes.push(
        para(
          `The details of our Key Managerial Personnel, in addition to our executive Directors whose details are provided under "Board of Directors" above, are as follows:`,
        ),
      );
      if (kmp.length === 0) nodes.push(nil());
      for (const p of kmp) nodes.push(...profile(p, p.appointedOn));
    }

    nodes.push(h3('Senior Management'));
    if (m.seniorManagement.length === 0) {
      // "Nil" is how the corpus prints an empty heading; a sentence explaining
      // the absence would be ours, not theirs
      nodes.push(nil());
    } else {
      nodes.push(para('The details of our Senior Management are as follows:'));
      for (const p of m.seniorManagement) nodes.push(...profile(p, p.appointedOn));
    }

    return nodes;
  },
};
