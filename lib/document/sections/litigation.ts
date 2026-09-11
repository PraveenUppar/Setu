import { formatAs } from '../../facts/money';
import type { Litigation, LitigationParty } from '../../facts/schema';
import { litigationFor, materialCreditorThreshold, materialityThreshold } from '../../legal/materiality';
import { lakhs, longDate } from '../format';
import type { DocumentNode } from '../nodes';
import { derivedTerms, type RenderContext, type SectionSpec } from '../section';
import { gap, h2, h3, h4, nil, para, table } from './helpers';

/**
 * OUTSTANDING LITIGATION AND MATERIAL DEVELOPMENTS — section map #28, 5 to
 * 6 pages. COMPUTED from M7, with the materiality threshold computed from M6.
 *
 * Both primary sources organise it by party, then by category, with a
 * standing "Nil" under every empty heading, and consolidate the tax matters
 * into a count-and-amount table (Om Galaxy pp.306-311, Maxwell pp.244-248).
 * The intro states the materiality test with its arithmetic — the lower of
 * 2% of turnover, 2% of net worth and 5% of average absolute PAT — and the
 * creditor threshold as a share of trade payables. Both are computed.
 */

const PARTY_HEADING: Record<LitigationParty, string> = {
  COMPANY: 'Litigation involving our Company',
  PROMOTER: 'Litigation involving our Promoters',
  DIRECTOR: 'Litigation involving our Directors (other than our Promoters)',
  KMP_SENIOR_MANAGEMENT: 'Litigation involving our Key Managerial Personnel and Senior Management',
  SUBSIDIARY: 'Litigation involving our Subsidiaries',
  GROUP_COMPANY: 'Litigation involving our Group Companies',
};

const PARTY_WORD: Record<LitigationParty, string> = {
  COMPANY: 'our Company',
  PROMOTER: 'our Promoters',
  DIRECTOR: 'our Directors',
  KMP_SENIOR_MANAGEMENT: 'our Key Managerial Personnel and Senior Management',
  SUBSIDIARY: 'our Subsidiaries',
  GROUP_COMPANY: 'our Group Companies',
};

/** A list of matters, as the section prints them: one paragraph each. */
function matters(items: Litigation[]): DocumentNode[] {
  if (items.length === 0) return [nil()];
  return items.map((l) =>
    para(
      [
        `${l.counterparty}${l.forum ? `, before the ${l.forum}` : ''}${l.caseNumber ? ` (${l.caseNumber})` : ''}.`,
        l.description,
        `Amount involved: ${l.amount === null ? 'not quantifiable' : formatAs(l.amount, 'lakhs')}.`,
        `Status: ${l.status}.`,
      ].join(' '),
    ),
  );
}

export const litigation: SectionSpec = {
  id: 'legal.litigation',
  partOf: '28. Outstanding Litigation and Material Developments',
  title: 'Outstanding Litigation and Material Developments',
  producer: 'computed',
  order: 2800,
  group: 'SECTION - LEGAL AND OTHER INFORMATION',
  clause: 'ICDR Schedule VI Part A, para 10(A)',
  extractedFrom: [
    'bookbuilt__manufacturing__om-galaxy__bse-sme__2026-09__rhp.pdf pp.306-311',
    'bookbuilt__engineering__maxwell-engineering__nse-emerge__2026-08__drhp.pdf pp.244-248',
  ],
  compute: ({ facts }: RenderContext): DocumentNode[] => {
    const t = derivedTerms(facts);
    const legal = facts.legal;
    const nodes: DocumentNode[] = [h2('Outstanding Litigation and Material Developments')];

    nodes.push(
      para(
        `Except as stated in this section, there are no outstanding (i) criminal proceedings, including matters at the FIR stage whether or not cognizance has been taken by any court; (ii) actions by any statutory or regulatory authorities; (iii) claims for any direct or indirect tax liabilities, disclosed in a consolidated manner giving the total number of claims and the total amounts involved; or (iv) other proceedings determined to be material pursuant to the materiality policy approved by our Board, in each case involving our Company, our Directors, our Promoters, our Subsidiaries and our Group Companies (together, the "Relevant Parties"), or our Key Managerial Personnel and Senior Management.`,
      ),
    );

    /* Materiality policy and threshold */
    const threshold = materialityThreshold(facts);
    if (!legal.materialityPolicyDate) {
      nodes.push(gap('legal.materialityPolicyDate', 'Date of the board resolution adopting the materiality policy for litigation'));
    }
    if (!threshold) {
      nodes.push(gap('financials.years', 'The financial figures from which the litigation materiality threshold is computed'));
    } else {
      const basis = {
        turnover: 'being 2% of the turnover of our Company for the most recent financial year',
        netWorth: 'being 2% of the net worth of our Company as at the end of the most recent financial period',
        profitAfterTax: 'being 5% of the average of the absolute value of the profit or loss after tax of our Company for the last three financial years',
      }[threshold.basis];
      nodes.push(
        para(
          `In accordance with the materiality policy adopted by our Board${legal.materialityPolicyDate ? ` on ${longDate(legal.materialityPolicyDate)}` : ''} (the "Materiality Policy"), a pending proceeding involving the Relevant Parties, other than those covered under (i) to (iii) above, is considered material for the purposes of disclosure if: (a) the aggregate monetary claim or liability involved exceeds the lower of (A) 2% of the turnover of our Company for the most recent financial year as per the Restated Financial Information, being ${formatAs(threshold.turnoverLimb, 'lakhs')}; (B) 2% of the net worth of our Company as at the end of the most recent financial period as per the Restated Financial Information, ${threshold.netWorthLimb === null ? 'not applicable as the net worth is negative' : `being ${formatAs(threshold.netWorthLimb, 'lakhs')}`}; or (C) 5% of the average of the absolute value of the profit or loss after tax of our Company for the last three financial years as per the Restated Financial Information, being ${formatAs(threshold.patLimb, 'lakhs')} (the "Threshold"); or (b) the outcome of the proceeding could have a material adverse effect on the business, operations, performance, prospects, financial position or reputation of our Company, irrespective of the amount involved; or (c) the decision in the proceeding is likely to affect the decision in similar proceedings, such that the cumulative amount involved exceeds the Threshold.`,
        ),
        para(
          `Accordingly, ${formatAs(threshold.threshold, 'lakhs')}, ${basis}, being the lowest of the above, has been considered as the Threshold, and all outstanding proceedings where the amount involved equals or exceeds it have been disclosed in this ${t.documentName}.`,
        ),
        para(
          'For the purposes of the above, pre-litigation notices received by the Relevant Parties from third parties, excluding notices from governmental, statutory or regulatory authorities and notices threatening criminal action, are not considered litigation until the Relevant Party is impleaded as a party in proceedings before a court, tribunal or authority.',
        ),
      );
    }

    /* Material creditors */
    const creditorThreshold = materialCreditorThreshold(facts);
    if (legal.materialCreditorThresholdPercent === undefined) {
      nodes.push(gap('legal.materialCreditorThresholdPercent', 'The share of trade payables above which a creditor is material, per the materiality policy'));
    } else if (!creditorThreshold) {
      nodes.push(gap('financials.years', 'Total trade payables at the latest year end, for the material creditors threshold'));
    } else {
      const y = facts.financials.years[0];
      nodes.push(
        para(
          `Further, in accordance with the Materiality Policy, a creditor of our Company is considered material where the amount due to it equals or exceeds ${legal.materialCreditorThresholdPercent}% of the total trade payables of our Company as at the end of the most recent financial period. Our total trade payables as at March 31, ${y.yearEnding} were ${formatAs(y.tradePayables!, 'lakhs')}, and accordingly creditors to whom outstanding dues exceed ${formatAs(creditorThreshold, 'lakhs')} have been considered material. Dues to micro, small and medium enterprises are disclosed on the basis of information available with our Company regarding the status of the creditor under Section 2 of the Micro, Small and Medium Enterprises Development Act, 2006.`,
        ),
      );
    }

    nodes.push(para(`Unless stated to the contrary, the information below is as of the date of this ${t.documentName}. All terms defined in a particular litigation disclosure below apply to that litigation only.`));

    /* Per-party disclosure */
    const parties: LitigationParty[] = ['COMPANY', 'PROMOTER', 'DIRECTOR', 'KMP_SENIOR_MANAGEMENT'];
    if (facts.groupCompanies.companies.length > 0) parties.push('GROUP_COMPANY');

    for (const party of parties) {
      const l = litigationFor(facts, party);
      const who = PARTY_WORD[party];
      nodes.push(h3(PARTY_HEADING[party]));

      nodes.push(h4('A. Outstanding criminal proceedings'));
      nodes.push(para(`Criminal proceedings against ${who}`), ...matters(l.criminalAgainst));
      nodes.push(para(`Criminal proceedings initiated by ${who}`), ...matters(l.criminalBy));

      nodes.push(h4('B. Outstanding actions by statutory or regulatory authorities'), ...matters(l.statutoryRegulatory));

      nodes.push(
        h4('C. Disciplinary action, including penalty, imposed by SEBI or a stock exchange in the last five financial years, including outstanding action'),
        ...matters(l.sebiDisciplinary),
      );

      nodes.push(h4('D. Outstanding tax proceedings'));
      const taxTotal = { count: l.directTax.count + l.indirectTax.count, amount: lakhs(String(Number(l.directTax.amount) + Number(l.indirectTax.amount))) };
      nodes.push(
        para(`As on the date of this ${t.documentName}, there are no outstanding tax proceedings involving ${who} except as listed below:`),
        table(
          ['Nature of case', 'Number of cases', 'Amount involved (Rs in Lakhs)'],
          [
            ['Direct Tax', l.directTax.count === 0 ? 'Nil' : String(l.directTax.count), l.directTax.count === 0 ? 'Nil' : lakhs(l.directTax.amount)],
            ['Indirect Tax', l.indirectTax.count === 0 ? 'Nil' : String(l.indirectTax.count), l.indirectTax.count === 0 ? 'Nil' : lakhs(l.indirectTax.amount)],
            ['Total', taxTotal.count === 0 ? 'Nil' : String(taxTotal.count), taxTotal.count === 0 ? 'Nil' : taxTotal.amount],
          ],
          { numericColumns: [1, 2] },
        ),
      );

      nodes.push(h4(`E. Other pending material litigation involving ${who}`));
      nodes.push(para(`Proceedings against ${who}`), ...matters(l.otherMaterialAgainst));
      nodes.push(para(`Proceedings initiated by ${who}`), ...matters(l.otherMaterialBy));
    }

    /* Standing statements */
    const standing: [string, string | null, string][] = [
      ['Proceedings initiated against our Company for economic offences', legal.economicOffenceProceedings, 'There are no proceedings initiated against our Company for any economic offences.'],
      ['Material frauds against our Company', legal.materialFrauds, `There have been no material frauds committed against our Company in the three years preceding the date of this ${t.documentName}.`],
      ['Non-payment of statutory dues', legal.statutoryDuesDefaults, `As on the date of this ${t.documentName}, there are no outstanding defaults in the payment of statutory dues by our Company.`],
      ['Past inquiries, inspections or investigations', legal.pastInquiriesInspections, `There have been no inquiries, inspections or investigations initiated or conducted under the Companies Act against our Company in the five years preceding the date of this ${t.documentName}, and no prosecutions filed or fines imposed as a result.`],
    ];
    for (const [heading, details, negative] of standing) {
      nodes.push(h3(heading), para(details ?? negative));
    }

    nodes.push(h3('Disclosures pertaining to wilful defaulters and fraudulent borrowers'));
    nodes.push(
      facts.promoters.anyWilfulDefaulterOrFraudulentBorrower
        ? gap('promoters.anyWilfulDefaulterOrFraudulentBorrower', 'Particulars of the classification as a wilful defaulter or fraudulent borrower, and the bank that made it')
        : para(
            'Neither our Company nor any of our Promoters or Directors has been categorised or identified as a wilful defaulter or a fraudulent borrower by any bank or financial institution, as defined under the SEBI ICDR Regulations.',
          ),
    );

    nodes.push(h3('Material developments since the last balance sheet date'));
    nodes.push(
      para(
        legal.materialDevelopmentsSinceBalanceSheet ??
          `Other than as disclosed in this ${t.documentName}, in the opinion of our Board, there have been no material developments since the date of the last balance sheet which would materially and adversely affect or are likely to affect the trading or profitability of our Company, the value of its assets or its ability to pay its liabilities within the next twelve months.`,
      ),
    );

    return nodes;
  },
};
