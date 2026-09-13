import type { DocumentNode } from '../nodes';
import { derivedTerms, type RenderContext, type SectionSpec } from '../section';
import { gap, h2, h3, para } from './helpers';

/**
 * GENERAL INFORMATION — section map #9, 11-13pp, B + facts.
 *
 * Read against the real chapter in two corpus documents (Om Galaxy's
 * "GENERAL INFORMATION" and Maxwell's "SECTION IV – GENERAL INFORMATION"),
 * not assumed: a table of key intermediaries, the Company Secretary &
 * Compliance Officer's contact details, a cross-reference to "Our
 * Management" for the Board rather than a repeated table, and a
 * near-universal investor-grievances paragraph.
 *
 * Every intermediary name here already existed as a fact before this
 * section did (`offer.bookRunningLeadManager`, `.legalAdvisor`,
 * `.registrarToIssue`, `.escrowCollectionBank`, `financials.auditorName`) —
 * this is the first section to actually READ them, not a reason to ask for
 * them twice. Only one new fact was needed: `offer.bankerToCompany`, the
 * Company's ordinary bank, distinct from the Issue-specific escrow/sponsor
 * banking the other fields already cover.
 *
 * Deliberately does NOT print an address, contact person, email or SEBI/FRN
 * registration number for the BRLM, Legal Advisor or Registrar — two
 * existing field comments (`bookRunningLeadManager`, `legalAdvisor` in
 * `m9-offer.ts`, before this section existed) said those details would
 * live here, but no field for them was ever built, and inventing plausible-
 * looking contact details would be exactly the fabrication MM4 forbids.
 * The Statutory Auditor is the one exception with real numeric detail,
 * because `financials.auditorFirmRegistrationNumber` and
 * `.auditorPeerReviewNumber` already exist (S8) and this is now their
 * first reader too.
 */

const CFO_DESIGNATION = /chief financial officer|\bcfo\b/i;

interface IntermediaryRow {
  label: string;
  value: string | undefined;
  factPath: string;
}

export const generalInformation: SectionSpec = {
  id: 'introduction.generalInformation',
  partOf: '9. General Information',
  title: 'General Information',
  producer: 'computed',
  order: 800,
  group: 'SECTION - GENERAL INFORMATION',
  clause: 'ICDR Schedule VI Part A',
  extractedFrom: [
    'bookbuilt__manufacturing__om-galaxy__bse-sme__2026-09__rhp.pdf (General Information chapter)',
    'bookbuilt__engineering__maxwell-engineering__nse-emerge__2026-08__drhp.pdf (Section IV - General Information)',
  ],
  compute: ({ facts }: RenderContext): DocumentNode[] => {
    const t = derivedTerms(facts);
    const nodes: DocumentNode[] = [h2('General Information')];

    nodes.push(h3('Key Intermediaries'));
    const roles: IntermediaryRow[] = [
      { label: 'Book Running Lead Manager', value: facts.offer.bookRunningLeadManager, factPath: 'offer.bookRunningLeadManager' },
      { label: 'Legal Advisor to the Issue', value: facts.offer.legalAdvisor, factPath: 'offer.legalAdvisor' },
      { label: 'Registrar to the Issue', value: facts.offer.registrarToIssue, factPath: 'offer.registrarToIssue' },
      { label: 'Statutory Auditor and Peer Review Auditor', value: facts.financials.auditorName, factPath: 'financials.auditorName' },
      { label: 'Banker to our Company', value: facts.offer.bankerToCompany, factPath: 'offer.bankerToCompany' },
      { label: 'Escrow Collection Bank / Banker to the Issue', value: facts.offer.escrowCollectionBank, factPath: 'offer.escrowCollectionBank' },
    ];
    for (const role of roles) {
      nodes.push(role.value ? para(`${role.label}: ${role.value}`) : gap(role.factPath, role.label));
    }

    const auditorNumbers = [
      facts.financials.auditorFirmRegistrationNumber ? `Firm Registration Number ${facts.financials.auditorFirmRegistrationNumber}` : null,
      facts.financials.auditorPeerReviewNumber ? `Peer Review Certificate Number ${facts.financials.auditorPeerReviewNumber}` : null,
    ].filter((v): v is string => v !== null);
    if (auditorNumbers.length > 0) nodes.push(para(`${auditorNumbers.join('; ')}.`));

    nodes.push(h3('Company Secretary and Compliance Officer'));
    const cs = facts.company.companySecretary;
    if (cs.name) {
      const contact = [cs.email, cs.telephone].filter(Boolean).join(' | ');
      nodes.push(para(`${cs.name}, Company Secretary and Compliance Officer.${contact ? ` ${contact}` : ''}`));
    } else {
      nodes.push(gap('company.companySecretary', 'Name of the Company Secretary and Compliance Officer'));
    }

    nodes.push(h3('Chief Financial Officer'));
    const cfo = facts.management.keyManagerialPersonnel.find((k) => CFO_DESIGNATION.test(k.designation));
    nodes.push(
      cfo
        ? para(`${cfo.name}, Chief Financial Officer.`)
        : gap('management.keyManagerialPersonnel', 'Name of the Chief Financial Officer, among the Key Managerial Personnel'),
    );

    nodes.push(para('For details of our Board of Directors, see "Our Management".'));

    nodes.push(h3('Investor Grievances'));
    nodes.push(
      para(
        `Investors may contact our Company Secretary and Compliance Officer, the Registrar to the ${t.issueWord}, or the Book Running Lead Manager in case of any pre-${t.issueWord} or post-${t.issueWord} related grievance, including non-receipt of intimation of allotment, non-receipt of credit of allotted Equity Shares, or non-receipt of refunds. All grievances relating to the ASBA process may be addressed to the Registrar to the ${t.issueWord}, with a copy to the relevant Designated Intermediary, giving full details of the Bid.`,
      ),
    );

    return nodes;
  },
};
