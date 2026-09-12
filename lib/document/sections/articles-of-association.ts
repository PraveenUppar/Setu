import type { ArticlesProvisions, FactBase } from '../../facts/schema';
import type { DocumentNode } from '../nodes';
import type { RenderContext, SectionSpec } from '../section';
import { gap, h2, h3, para } from './helpers';

/**
 * MAIN PROVISIONS OF THE ARTICLES OF ASSOCIATION — section map #35,
 * 25-38pp in a real prospectus, producer "B" (per-issuer extraction from
 * the uploaded AoA) in the original plan.
 *
 * D69 — S7's replacement, now that S7 is paused permanently (user
 * decision). A real prospectus often reproduces the FULL Articles under
 * ~22 topic headings; the regulation itself asks for far less. Both ICDR
 * Schedule VI Part A and the corpus's own opening line to this chapter
 * name exactly six required topics: "voting rights, dividend, lien,
 * forfeiture, restrictions on transfer and transmission of equity shares
 * or debentures, their consolidation or splitting." Scoped to those six,
 * same "build what's required, not the whole real document" discipline
 * Our Business and Objects of the Issue already follow.
 *
 * NEVER a narrative producer. This is legal clause text carrying the same
 * personal-liability weight as any other disclosure (MM4, Companies Act
 * s.34/35) — an LLM must never paraphrase or draft it. The Company
 * Secretary types or pastes it verbatim from the company's own Articles;
 * this section is a template that prints exactly that, nothing more.
 */

const TOPICS: { key: keyof ArticlesProvisions; heading: string; ask: string }[] = [
  { key: 'votingRights', heading: 'Voting Rights', ask: 'Articles clauses on voting rights' },
  { key: 'dividend', heading: 'Dividend', ask: 'Articles clauses on dividend' },
  { key: 'lien', heading: 'Lien', ask: 'Articles clauses on lien' },
  { key: 'forfeiture', heading: 'Forfeiture', ask: 'Articles clauses on forfeiture of shares' },
  {
    key: 'transferAndTransmission',
    heading: 'Transfer and Transmission of Shares',
    ask: 'Articles clauses on transfer and transmission of shares',
  },
  {
    key: 'consolidationAndSplitting',
    heading: 'Consolidation and Splitting of Capital',
    ask: 'Articles clauses on consolidation and splitting of capital',
  },
];

export const articlesOfAssociation: SectionSpec = {
  id: 'other.articles',
  partOf: '35. Main Provisions of the Articles of Association',
  title: 'Main Provisions of the Articles of Association',
  producer: 'computed',
  order: 3790,
  group: 'SECTION - OTHER INFORMATION',
  clause: 'Companies Act 2013, Schedule I (Table F); ICDR Schedule VI Part A',
  compute: ({ facts }: RenderContext): DocumentNode[] => {
    const nodes: DocumentNode[] = [
      h2('Main Provisions of the Articles of Association'),
      para(
        'The following are the relevant provisions of the Articles of Association of our Company relating to voting rights, ' +
          'dividend, lien, forfeiture, and restrictions on transfer and transmission of Equity Shares, and their consolidation ' +
          'or splitting, as required under Schedule I of the Companies Act, 2013. Each provision below is stated as it appears ' +
          'in the Articles of Association of our Company. Investors are advised to read the Articles of Association in their ' +
          'entirety for a complete understanding.',
      ),
    ];

    const provisions: ArticlesProvisions | undefined = (facts as FactBase).company.articlesProvisions;
    for (const topic of TOPICS) {
      nodes.push(h3(topic.heading));
      const text = provisions?.[topic.key];
      nodes.push(text ? para(text) : gap(`company.articlesProvisions.${topic.key}`, topic.ask));
    }

    return nodes;
  },
};
