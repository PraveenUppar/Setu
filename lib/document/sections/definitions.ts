import type { DocumentNode } from '../nodes';
import { derivedTerms, type RenderContext, type SectionSpec } from '../section';

/**
 * DEFINITIONS AND ABBREVIATIONS — 16-17 pages, and a different shape from
 * every other section: a two-column glossary, not prose.
 *
 * So it is COMPUTED over a registry rather than templated. Each entry is one
 * of three kinds:
 *
 *   fact     — derived from the fact base (company name, registered office,
 *              auditors, bankers). These MUST be per-issuer.
 *   standard — invariant, drawn from ICDR or the Companies Act. Static data.
 *   sector   — sector-specific technical and industry terms.
 *
 * Extraction, 2026-09-10: 215 term/description pairs pulled from Om Galaxy RHP
 * pp.6-24 using `pdftotext -table` with per-page column detection (see the
 * `template-extraction` skill). Saved to
 * `fixtures/definitions/om-galaxy-definitions.json`.
 *
 * STATUS: the fact-driven entries are built here and are the ones that
 * genuinely need engineering. The ~191 standard entries are static data and a
 * mechanical bulk import; they are NOT yet loaded, so this section currently
 * renders a partial glossary and says so. Do not present it as complete.
 */

type DefinitionKind = 'fact' | 'standard' | 'sector';

interface Definition {
  term: string;
  kind: DefinitionKind;
  /** Returns the description, or null when the underlying fact is missing. */
  describe: (ctx: RenderContext) => string | null;
}

const FACT_DEFINITIONS: Definition[] = [
  {
    term: 'Our Company, the Company, the Issuer',
    kind: 'fact',
    describe: ({ facts }) => {
      const o = facts.company.registeredOffice;
      return (
        `${facts.company.name}, a public limited company incorporated under the ` +
        `${facts.company.incorporatedUnder === 'COMPANIES_ACT_1956' ? 'Companies Act, 1956' : 'Companies Act, 2013'}, ` +
        `having its Registered Office at ${o.line1}${o.line2 ? ', ' + o.line2 : ''}, ${o.city}, ` +
        `${o.state} ${o.pincode}, ${o.country}`
      );
    },
  },
  {
    term: '"we", "us" and "our"',
    kind: 'fact',
    describe: () =>
      'Unless the context otherwise indicates or implies, refers to our Company',
  },
  {
    term: 'AOA, Articles, Articles of Association',
    kind: 'standard',
    describe: () => 'The Articles of Association of our Company, as amended from time to time',
  },
  {
    term: 'MOA, Memorandum, Memorandum of Association',
    kind: 'standard',
    describe: () => 'The Memorandum of Association of our Company, as amended from time to time',
  },
  {
    term: 'Board of Directors, the Board',
    kind: 'fact',
    describe: ({ facts }) =>
      facts.management.directors.length > 0
        ? 'The board of directors of our Company, as described in "Our Management"'
        : null,
  },
  {
    term: 'Company Secretary and Compliance Officer',
    kind: 'fact',
    describe: ({ facts }) => facts.company.companySecretary?.name ?? null,
  },
  {
    term: 'Statutory Auditors, Peer Review Auditor',
    kind: 'fact',
    describe: ({ facts }) => facts.financials.auditorName ?? null,
  },
  {
    term: 'Registrar of Companies, RoC',
    kind: 'fact',
    describe: ({ facts }) => `Registrar of Companies, ${facts.company.registeredOffice.state}`,
  },
  {
    term: 'Promoters',
    kind: 'fact',
    describe: ({ facts }) =>
      facts.promoters.promoters.length > 0
        ? `The promoters of our Company, namely ${facts.promoters.promoters.map((p) => p.name).join(', ')}. ` +
          'For details, see "Our Promoters and Promoter Group"'
        : null,
  },
  {
    term: 'Equity Shares',
    kind: 'fact',
    describe: ({ facts }) =>
      `Equity shares of our Company of face value of Rs ${facts.capital.faceValue} each`,
  },
  {
    term: 'Book Running Lead Manager, BRLM',
    kind: 'fact',
    describe: ({ facts }) => facts.offer.bookRunningLeadManager ?? null,
  },
  {
    term: 'Registrar to the Issue',
    kind: 'fact',
    describe: ({ facts }) => facts.offer.registrarToIssue ?? null,
  },
  {
    term: 'Market Maker',
    kind: 'fact',
    describe: ({ facts }) => facts.offer.marketMakerName ?? null,
  },
  {
    term: 'Stock Exchange, Designated Stock Exchange',
    kind: 'fact',
    describe: ({ facts }) => derivedTerms(facts).designatedStockExchange,
  },
  {
    term: 'Floor Price',
    kind: 'fact',
    describe: ({ facts }) =>
      facts.offer.floorPrice
        ? `Rs ${facts.offer.floorPrice} per Equity Share, being the lower end of the Price Band`
        : null,
  },
  {
    term: 'Cap Price',
    kind: 'fact',
    describe: ({ facts }) =>
      facts.offer.capPrice
        ? `Rs ${facts.offer.capPrice} per Equity Share, being the higher end of the Price Band`
        : null,
  },
  {
    term: 'Bid Lot',
    kind: 'fact',
    describe: ({ facts }) => `${facts.offer.lotSize} Equity Shares`,
  },
  {
    term: 'Net Issue',
    kind: 'fact',
    describe: ({ facts }) => {
      const t = derivedTerms(facts);
      return t.marketMakerShares > 0
        ? `The ${t.issueWord} less the Market Maker Reservation Portion`
        : null;
    },
  },
];

function computeDefinitions(ctx: RenderContext): DocumentNode[] {
  const t = derivedTerms(ctx.facts);

  const resolved = FACT_DEFINITIONS.map((d) => ({
    term: d.term,
    description: d.describe(ctx),
  }));

  const present = resolved.filter((d) => d.description !== null);
  const missing = resolved.filter((d) => d.description === null);

  const nodes: DocumentNode[] = [
    { type: 'heading', level: 2, text: 'Definitions and Abbreviations' },
    {
      type: 'paragraph',
      runs: [
        {
          text:
            `This ${t.documentName} uses certain definitions and abbreviations which, unless the ` +
            'context otherwise indicates or implies, or unless otherwise specified, shall have the ' +
            'meaning set out below. References to any legislation, act, regulation, rule, guideline, ' +
            'policy, circular, notification, clarification or direction shall be to that instrument ' +
            'as amended, updated, supplemented, re-enacted or modified from time to time.',
        },
      ],
    },
    {
      type: 'paragraph',
      runs: [
        {
          text:
            `The words and expressions used in this ${t.documentName} but not defined herein shall ` +
            'have, to the extent applicable, the meaning ascribed to such terms under the Companies ' +
            'Act, 2013, the SEBI ICDR Regulations, the Securities Contracts (Regulation) Act, 1956, ' +
            'the Depositories Act, 1996, or the rules and regulations made thereunder.',
        },
      ],
    },
    { type: 'heading', level: 3, text: 'Company and Issue Related Terms' },
    {
      type: 'table',
      headers: ['Term', 'Description'],
      rows: present.map((d) => [d.term, d.description as string]),
    },
  ];

  // The general glossary is static data and not yet loaded. Say so rather than
  // letting a 17-page section quietly render as one page.
  nodes.push({
    type: 'paragraph',
    runs: [
      {
        text: '[TO BE PROVIDED: General terms, conventional terms and abbreviations glossary]',
        placeholder: {
          factPath: 'definitions.standardGlossary',
          ask: 'General terms, conventional terms and abbreviations glossary (approximately 190 standard entries, a static bulk import)',
        },
      },
    ],
  });

  for (const m of missing) {
    nodes.push({
      type: 'paragraph',
      runs: [
        {
          text: `[TO BE PROVIDED: Definition of "${m.term}"]`,
          placeholder: {
            factPath: `definitions.${m.term}`,
            ask: `Definition of "${m.term}" — the underlying fact is not yet recorded`,
          },
        },
      ],
    });
  }

  return nodes;
}

export const definitions: SectionSpec = {
  id: 'general.definitions',
  title: 'Definitions and Abbreviations',
  producer: 'computed',
  order: 100,
  group: 'SECTION I - GENERAL',
  extractedFrom: [
    'bookbuilt__manufacturing__om-galaxy__bse-sme__2026-09__rhp.pdf pp.6-24 (215 pairs, fixtures/definitions/)',
  ],
  compute: computeDefinitions,
};
