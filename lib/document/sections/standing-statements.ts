import type { CommitteeKind, FactBase } from '../../facts/schema';
import type { DocumentNode } from '../nodes';
import { derivedTerms } from '../section';
import { bullets, gap, h3, h4, para } from './helpers';

/**
 * The standing boilerplate inside the computed sections: the committees'
 * terms of reference, the "interest" paragraphs for directors and promoters,
 * and the promoter undertakings.
 *
 * Extracted 2026-09-11 from Om Galaxy RHP (pp.242-258) and Maxwell DRHP
 * (pp.211-224), clause by clause, and checked against Century Business Media
 * (held out). The rule is the template-extraction skill's: a clause is written
 * only where BOTH extraction sources carry it. What each source carried
 * alone, and was therefore left out, is listed at the head of each block so
 * a banker can add it knowingly.
 *
 * Where a statement turns on a fact — no pledged shares, no wilful defaulter
 * — the fact base decides which way it prints, and a "yes" without
 * particulars renders as a gap rather than as the negative.
 */

/* ------------------------------------------------------------------ */
/* Committee terms of reference                                        */
/* ------------------------------------------------------------------ */

/**
 * AUDIT COMMITTEE. Both lists derive from Part C of Schedule II of the SEBI
 * LODR Regulations and match on these 22 items. Left out as single-sourced:
 * Om Galaxy's RPT policy formulation, quarterly review of omnibus approvals,
 * review of subsidiary loans over Rs 100 crore, and KPI approval; Maxwell's
 * "monitoring the end use of funds", its two provisos on RPT approval, and
 * its "Powers of Committee" and quorum paragraphs.
 */
const AUDIT_TERMS = [
  "Oversight of the Company's financial reporting process and the disclosure of its financial information to ensure that the financial statements are correct, sufficient and credible;",
  'Recommendation for the appointment, re-appointment, remuneration and terms of appointment of the statutory auditors of the Company;',
  'Approval of payment to the statutory auditors for any other services rendered by the statutory auditors;',
  "Reviewing, with the management, the annual financial statements and the auditors' report thereon before submission to the Board for approval, with particular reference to: (a) matters required to be included in the Directors' Responsibility Statement to be included in the Board's report in terms of clause (c) of sub-section 3 of Section 134 of the Companies Act, 2013; (b) changes, if any, in accounting policies and practices and the reasons for the same; (c) major accounting entries involving estimates based on the exercise of judgement by the management; (d) significant adjustments made in the financial statements arising out of audit findings; (e) compliance with listing and other legal requirements relating to financial statements; (f) disclosure of any related party transactions; and (g) modified opinion(s) in the draft audit report;",
  'Reviewing, with the management, the quarterly financial statements before submission to the Board for approval;',
  'Reviewing, with the management, the statement of uses / application of funds raised through an issue (public issue, rights issue, preferential issue, etc.), the statement of funds utilised for purposes other than those stated in the offer document / prospectus / notice and the report submitted by the monitoring agency monitoring the utilisation of proceeds of a public or rights issue or preferential issue or qualified institutions placement, and making appropriate recommendations to the Board to take up steps in this matter;',
  "Reviewing and monitoring the auditors' independence and performance, and the effectiveness of the audit process;",
  'Approval of any subsequent modification of transactions of the Company with related parties, and omnibus approval for related party transactions proposed to be entered into by the Company subject to such conditions as may be prescribed;',
  'Scrutiny of inter-corporate loans and investments;',
  'Valuation of undertakings or assets of the Company, wherever it is necessary;',
  'Evaluation of internal financial controls and risk management systems;',
  'Reviewing, with the management, the performance of the statutory and internal auditors, and the adequacy of the internal control systems;',
  'Reviewing the adequacy of the internal audit function, if any, including the structure of the internal audit department, staffing and seniority of the official heading the department, reporting structure, coverage and frequency of internal audit;',
  'Discussion with the internal auditors of any significant findings and follow up thereon;',
  'Reviewing the findings of any internal investigations by the internal auditors into matters where there is suspected fraud or irregularity or a failure of internal control systems of a material nature, and reporting the matter to the Board;',
  'Discussion with the statutory auditors before the audit commences, about the nature and scope of the audit, as well as post-audit discussion to ascertain any area of concern;',
  'Looking into the reasons for substantial defaults in the payment to depositors, debenture holders, shareholders (in case of non-payment of declared dividends) and creditors;',
  'Reviewing the functioning of the whistle blower mechanism;',
  'Approval of the appointment of the Chief Financial Officer after assessing the qualifications, experience and background, etc. of the candidate;',
  'Considering and commenting on the rationale, cost-benefits and impact of schemes involving merger, demerger, amalgamation etc. on the Company and its shareholders;',
  'Carrying out any other function as is mentioned in the terms of reference of the Audit Committee or as may be required by the Companies Act, the SEBI LODR Regulations or any other applicable law.',
];

const AUDIT_REVIEWS = [
  'Management discussion and analysis of financial condition and results of operations;',
  'Management letters / letters of internal control weaknesses issued by the statutory auditors;',
  'Internal audit reports relating to internal control weaknesses; and',
  'The appointment, removal and terms of remuneration of the chief internal auditor.',
];

/**
 * NOMINATION AND REMUNERATION COMMITTEE. Seven items in both. Left out as
 * single-sourced: Maxwell's "relationship of remuneration to performance",
 * its insider-trading policy item, and its separate performance-evaluation
 * item, which restates item 6.
 */
const NRC_TERMS = [
  'Formulation of the criteria for determining qualifications, positive attributes and independence of a director, and recommending to the Board a policy relating to the remuneration of the directors, key managerial personnel, senior management and other employees;',
  'For every appointment of an independent director, evaluating the balance of skills, knowledge and experience on the Board and, on the basis of such evaluation, preparing a description of the role and capabilities required of an independent director. The person recommended to the Board for appointment as an independent director shall have the capabilities identified in such description. For the purpose of identifying suitable candidates, the Committee may: (a) use the services of external agencies, if required; (b) consider candidates from a wide range of backgrounds, having due regard to diversity; and (c) consider the time commitments of the candidates;',
  'Formulation of criteria for evaluation of the performance of independent directors and the Board;',
  'Devising a policy on diversity of the Board;',
  'Identifying persons who are qualified to become directors and who may be appointed in senior management in accordance with the criteria laid down, and recommending to the Board their appointment and removal;',
  'Deciding whether to extend or continue the term of appointment of an independent director, on the basis of the report of performance evaluation of independent directors;',
  'Recommending to the Board all remuneration, in whatever form, payable to senior management; and',
  'Performing such other functions as may be delegated by the Board or prescribed under the Companies Act, 2013, the SEBI LODR Regulations or any other applicable law.',
];

/**
 * STAKEHOLDERS RELATIONSHIP COMMITTEE. Four items in both. Left out: Om
 * Galaxy's debenture-holder grievances item; Maxwell's "such other matters".
 */
const SRC_TERMS = [
  'Resolving the grievances of the security holders of the Company, including complaints related to transfer or transmission of shares, non-receipt of the annual report, non-receipt of declared dividends, issue of new or duplicate certificates, general meetings, etc.;',
  'Review of measures taken for effective exercise of voting rights by shareholders;',
  'Review of adherence to the service standards adopted by the Company in respect of various services being rendered by the Registrar and Share Transfer Agent; and',
  'Review of the various measures and initiatives taken by the Company for reducing the quantum of unclaimed dividends and ensuring timely receipt of dividend warrants, annual reports and statutory notices by the shareholders of the Company.',
];

/** The terms of reference for one committee, or nothing for a kind the corpus does not cover. */
export function committeeTermsOfReference(kind: CommitteeKind): DocumentNode[] {
  const ordered = (items: string[]): DocumentNode => ({ type: 'list', ordered: true, items: items.map((text) => [{ text }]) });
  switch (kind) {
    case 'AUDIT':
      return [
        h4('Terms of Reference of the Audit Committee'),
        para('The Audit Committee has been constituted pursuant to Section 177 of the Companies Act, 2013. The terms of reference of the Audit Committee include the following:'),
        ordered(AUDIT_TERMS),
        para('The Audit Committee shall mandatorily review the following information:'),
        bullets(AUDIT_REVIEWS),
      ];
    case 'NOMINATION_AND_REMUNERATION':
      return [
        h4('Terms of Reference of the Nomination and Remuneration Committee'),
        para('The Nomination and Remuneration Committee has been constituted pursuant to Section 178 of the Companies Act, 2013. The terms of reference of the Nomination and Remuneration Committee include the following:'),
        ordered(NRC_TERMS),
      ];
    case 'STAKEHOLDERS_RELATIONSHIP':
      return [
        h4('Terms of Reference of the Stakeholders Relationship Committee'),
        para('The Stakeholders Relationship Committee has been constituted pursuant to Section 178 of the Companies Act, 2013. The terms of reference of the Stakeholders Relationship Committee include the following:'),
        ordered(SRC_TERMS),
      ];
    default:
      // CSR and other committees: neither source carries a shared text, so
      // the composition table stands alone rather than carrying terms we
      // would have to write from memory
      return [];
  }
}

/* ------------------------------------------------------------------ */
/* Interest of directors                                               */
/* ------------------------------------------------------------------ */

/** Whether any facility on file carries a personal guarantee of a director or promoter. */
export function personalGuaranteesGiven(facts: FactBase): boolean {
  return facts.financials.borrowings.some((b) => /guarantee/i.test(b.security ?? ''));
}

/**
 * Six statements in both sources (Om Galaxy p.242, Maxwell p.211). Left out
 * as single-sourced: Om Galaxy's "not interested in any company having
 * business similar to that of our Company", "no portion of the Net
 * Proceeds", "not interested in the appointment of intermediaries", the
 * non-salary benefits paragraph and the contingent compensation paragraph;
 * Maxwell's unsecured-loans sentence.
 */
export function interestOfDirectors(facts: FactBase): DocumentNode[] {
  const t = derivedTerms(facts);
  const promoterNames = new Set(facts.promoters.promoters.map((p) => p.name));
  const promoterDirectors = facts.management.directors.filter((d) => promoterNames.has(d.name)).map((d) => d.name);
  const listNames = (names: string[]) =>
    names.length <= 1 ? names.join('') : `${names.slice(0, -1).join(', ')} and ${names[names.length - 1]}`;

  const nodes: DocumentNode[] = [
    h3('Interest of our Directors'),
    para(
      'Our Directors may be deemed to be interested in our Company to the extent of the remuneration, sitting fees, commission and reimbursement of expenses, if any, payable to them for attending meetings of our Board or a committee thereof, and to the extent of remuneration paid to them for services rendered as an officer or employee of our Company.',
    ),
    para(
      'Our Directors may also be regarded as interested to the extent of the Equity Shares, if any, held by them or by their relatives in our Company, and to the extent of any dividend payable to them and other distributions in respect of such Equity Shares.',
    ),
  ];
  if (personalGuaranteesGiven(facts)) {
    nodes.push(
      para(
        'Certain of our Directors have provided personal guarantees in favour of the lenders for borrowings availed by our Company. For details, see "Financial Indebtedness".',
      ),
    );
  }
  nodes.push(
    para(
      'Except as disclosed in "Summary of Related Party Transactions" and in the Restated Financial Information, our Company has not entered into any contracts, agreements or arrangements during the two years preceding the date of this ' +
        t.documentName +
        ' in which our Directors are interested directly or indirectly, and no payments have been made to them in respect of any such contracts, agreements or arrangements which are proposed to be made with them.',
    ),
    para(
      promoterDirectors.length === 0
        ? 'None of our Directors has any interest in the promotion or formation of our Company.'
        : `Except for ${listNames(promoterDirectors)}, who ${promoterDirectors.length === 1 ? 'is a Promoter' : 'are the Promoters'} of our Company, none of our Directors has any interest in the promotion or formation of our Company.`,
    ),
    para(
      `Except as disclosed in this ${t.documentName}, our Directors do not have any interest in any property acquired by our Company in the two years preceding the date of this ${t.documentName}, or proposed to be acquired by our Company as on the date of this ${t.documentName}.`,
    ),
    h3('Bonus or Profit Sharing Plan for our Directors'),
    para(`As on the date of this ${t.documentName}, our Company does not have any bonus or profit sharing plan for our Directors.`),
  );
  return nodes;
}

/* ------------------------------------------------------------------ */
/* Interest of promoters, common pursuits, undertakings               */
/* ------------------------------------------------------------------ */

/**
 * Statements in both sources (Om Galaxy pp.256-258, Maxwell pp.222-224).
 * The look-back for contracts and property is TWO years: Om Galaxy says two
 * for contracts, Maxwell three; Century, held out, says two for property,
 * and both extraction sources say two for payments or benefits. Left out as
 * single-sourced: Om Galaxy's leave-and-licence disclosures (its own
 * facts), Maxwell's "experience of promoters in the line of business" and
 * "business interest of group entities".
 */
export function interestOfPromoters(facts: FactBase): DocumentNode[] {
  const t = derivedTerms(facts);
  const p = facts.promoters;
  const nodes: DocumentNode[] = [
    h3('Interest of our Promoters'),
    para(
      'Our Promoters are interested in our Company to the extent that they have promoted our Company, to the extent of their respective shareholding and the shareholding of the members of the Promoter Group in our Company, directly or indirectly, the dividend payable, if any, and any other distributions in respect of the Equity Shares held by them, and, where they are Directors, to the extent of the remuneration, perquisites and reimbursement of expenses payable to them in that capacity. For details of the shareholding of our Promoters, see "Capital Structure"; for their remuneration, see "Our Management".',
    ),
    para(
      `Except as disclosed in "Summary of Related Party Transactions" and in the Restated Financial Information, our Company has not entered into any contracts, agreements or arrangements during the two years preceding the date of this ${t.documentName}, and does not propose to enter into any such contract, in which our Promoters are directly or indirectly interested, and no payments have been made to them in respect of any such contracts, agreements or arrangements.`,
    ),
    para(
      'No sum has been paid or agreed to be paid to our Promoters or to the firms or companies in which our Promoters are interested as members, in cash or shares or otherwise by any person, either to induce them to become, or to qualify them as, directors or promoters, or otherwise for services rendered by our Promoters or by such firms or companies in connection with the promotion or formation of our Company.',
    ),
  ];
  if (personalGuaranteesGiven(facts)) {
    nodes.push(
      para('Our Promoters have provided personal guarantees in favour of the lenders for certain borrowings availed by our Company. For details, see "Financial Indebtedness".'),
    );
  }
  nodes.push(
    h3('Interest in the Property, Acquisition of Land, Construction of Building and Supply of Machinery'),
    para(
      `Except in the ordinary course of business and as disclosed in "Summary of Related Party Transactions", our Promoters do not have any interest in any property acquired by our Company in the two years preceding the date of this ${t.documentName} or proposed to be acquired by our Company, or in any transaction by our Company for the acquisition of land, construction of building or supply of machinery, or any other contract, agreement or arrangement entered into by our Company, and no payments have been made or are proposed to be made in respect of such contracts, agreements or arrangements.`,
    ),
    h3('Payment or Benefit to our Promoters or Promoter Group in the Last Two Years'),
    para(
      `Except in the ordinary course of business and as disclosed in this section, in "Our Management" and in "Summary of Related Party Transactions", no amount or benefit has been paid or given to our Promoters or any member of our Promoter Group during the two years preceding the date of this ${t.documentName}, nor is there any intention to pay or give any amount or benefit to our Promoters or any member of our Promoter Group.`,
    ),
    h3('Common Pursuits of our Promoters'),
    p.commonPursuitsDetails
      ? para(p.commonPursuitsDetails)
      : para('None of our Promoters or the members of our Promoter Group is involved in any business activity similar to that of our Company.'),
  );
  return nodes;
}

/**
 * The confirmations both sources make (Om Galaxy p.257, Maxwell p.221), each
 * tied to the flag M3 or M7 collects: where the flag is set, the negative is
 * not printed and a gap asks for the particulars instead. Left out as
 * single-sourced: Om Galaxy's conflict-of-interest with suppliers and
 * lessors, the struck-off companies list and the "no SEBI action" item;
 * Maxwell's "no violations of securities laws".
 */
export function promoterUndertakings(facts: FactBase): DocumentNode[] {
  const p = facts.promoters;
  const l = facts.legal;
  const nodes: DocumentNode[] = [h3('Undertakings and Confirmations')];

  const statement = (flag: boolean, negative: string, factPath: string, ask: string) =>
    flag ? gap(factPath, ask) : para(negative);

  nodes.push(
    statement(
      p.anyDebarredBySebi,
      'None of our Promoters, the members of our Promoter Group or the persons in control of our Company has been prohibited or debarred from accessing or operating in the capital markets or restrained from buying, selling or dealing in securities under any order or direction passed by SEBI or any other authority, or has been refused listing of any securities issued by such entity by any stock exchange in India or abroad.',
      'promoters.anyDebarredBySebi',
      'Particulars of the SEBI debarment or order restraining a promoter, promoter group member or person in control',
    ),
    statement(
      p.anyDebarredBySebi,
      'None of our Promoters is or has ever been a promoter or director of any other company which is debarred from accessing or operating in the capital markets under any order or direction passed by SEBI or any other regulatory or governmental authority.',
      'promoters.anyDebarredBySebi',
      'Particulars of the other company debarred from the capital markets of which a promoter is or was a promoter or director',
    ),
    statement(
      p.anyFugitiveEconomicOffender,
      'None of our Promoters has been declared a fugitive economic offender under Section 12 of the Fugitive Economic Offenders Act, 2018.',
      'promoters.anyFugitiveEconomicOffender',
      'Particulars of the declaration of a promoter as a fugitive economic offender',
    ),
    statement(
      p.anyWilfulDefaulterOrFraudulentBorrower,
      'Neither our Promoters nor the members of our Promoter Group have been declared wilful defaulters or fraudulent borrowers by any bank or financial institution or consortium thereof, in accordance with the guidelines on wilful defaulters or fraudulent borrowers issued by the Reserve Bank of India.',
      'promoters.anyWilfulDefaulterOrFraudulentBorrower',
      'Particulars of the classification of a promoter or promoter group member as a wilful defaulter or fraudulent borrower',
    ),
    statement(
      l.regulatoryActionAgainstPromotersSince !== null,
      'No material regulatory or disciplinary action has been taken by any stock exchange or regulatory authority in the past one year in respect of our Promoters or the companies promoted by our Promoters.',
      'legal.regulatoryActionAgainstPromotersSince',
      'Particulars of the material regulatory or disciplinary action taken against a promoter or a company promoted by the promoters in the past year',
    ),
    statement(
      l.pendingDebtSecurityDefaults,
      'There are no defaults in respect of payment of interest or principal to the debenture, bond or fixed deposit holders, banks or financial institutions by our Company, our Promoters or the companies promoted by our Promoters during the past three years.',
      'legal.pendingDebtSecurityDefaults',
      'Particulars of the default in payment of interest or principal to debenture, bond or fixed deposit holders, banks or financial institutions',
    ),
  );
  return nodes;
}
