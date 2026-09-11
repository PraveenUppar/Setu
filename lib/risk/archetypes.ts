import Decimal from 'decimal.js';
import { shareholding } from '../capital/tables';
import type { FactBase } from '../facts/schema';
import { formatAs } from '../facts/money';
import { materialityThreshold } from '../legal/materiality';
import type { RiskArchetype } from './types';

/**
 * The risk archetype registry (S10).
 *
 * Grounded, not invented — each trigger either reuses a threshold the corpus
 * or the codebase has already established, or is a plain structural fact
 * with no threshold to get wrong. Two archetypes below use a 50% bar for
 * concentration that is NOT independently corpus-verified for suppliers
 * (only for customers, per the Vardhman seed's own comment) — flagged in
 * each one, same honesty norm as a rule at `PROPOSAL-ONLY` confidence in
 * `05-rule-sources.md`. ~40 archetypes is the design target (02-architecture.md);
 * this is the first slice, one per signal already sitting in the fact base.
 *
 * D46 grew this from the real corpus: the numbered Risk Factors chapters of
 * Om Galaxy, Maxwell Engineering and Ideas Electricals (`corpus/prospectus/`,
 * `pdftotext -layout`), not the fact schema alone. Three more archetypes
 * below carry an `extractedFrom`-style citation in their own comment, same
 * discipline as a Wave 1 template.
 */

const latestYear = (facts: FactBase) => facts.financials.years[0];

/**
 * Corroborated by the Vardhman seed's own comment: "Top five total 61.3%,
 * above the 50% materiality threshold" (lib/seed/vardhman.ts). This is the
 * flagship example named in 02-architecture.md's drafting-harness section.
 */
export const customerConcentration: RiskArchetype = {
  id: 'customer-concentration',
  category: 'business',
  title: 'Revenue is concentrated in a small number of customers',
  trigger: (f) => f.business.topCustomers.reduce((s, c) => s + c.revenueShare, 0) > 50,
  materiality: (f) => f.business.topCustomers.reduce((s, c) => s + c.revenueShare, 0),
  detail: (f) => {
    const top = f.business.topCustomers;
    const total = top.reduce((s, c) => s + c.revenueShare, 0);
    return `Our top ${top.length} customers accounted for ${total.toFixed(1)}% of revenue in the last financial year: ${top
      .map((c) => `${c.name} (${c.revenueShare}%)`)
      .join(', ')}. The loss of, or a material reduction in orders from, any of these customers would adversely affect our business.`;
  },
  factSlice: (f) => ({ topCustomers: f.business.topCustomers, companyName: f.company.name }),
};

/**
 * Purely structural — a count, not a threshold — so nothing here is invented.
 * A single manufacturing site is a standard SME risk factor (fire, flood,
 * labour action, or a licence lapse at the one site stops production).
 */
export const singleManufacturingFacility: RiskArchetype = {
  id: 'single-manufacturing-facility',
  category: 'business',
  title: 'Operations are concentrated at a single facility',
  trigger: (f) => f.business.facilities.length === 1,
  materiality: () => 1,
  detail: (f) => {
    const facility = f.business.facilities[0];
    return `We currently operate from a single facility${facility.name ? ` (${facility.name})` : ''} at ${facility.location}. Any disruption to this facility — whether from fire, natural calamity, labour unrest or the loss of a licence specific to it — would adversely affect our ability to manufacture and supply our products.`;
  },
  factSlice: (f) => ({ facilities: f.business.facilities, companyName: f.company.name }),
};

/**
 * NOT independently corpus-verified for suppliers — the 50% bar mirrors
 * `customerConcentration` for internal consistency, but no held-out document
 * has been checked for where real prospectuses draw this line. Treat as
 * provisional until a corpus pass corroborates it (same status as a
 * PROPOSAL-ONLY rule row).
 */
export const supplierConcentration: RiskArchetype = {
  id: 'supplier-concentration',
  category: 'business',
  title: 'Purchases are concentrated in a small number of suppliers',
  trigger: (f) => f.business.topSuppliers.reduce((s, c) => s + c.purchaseShare, 0) > 50,
  materiality: (f) => f.business.topSuppliers.reduce((s, c) => s + c.purchaseShare, 0),
  detail: (f) => {
    const top = f.business.topSuppliers;
    const total = top.reduce((s, c) => s + c.purchaseShare, 0);
    return `Our top ${top.length} suppliers accounted for ${total.toFixed(1)}% of purchases in the last financial year: ${top
      .map((c) => `${c.name} (${c.purchaseShare}%)`)
      .join(', ')}. A disruption to supply from, or an adverse change in terms with, any of these suppliers would adversely affect our operations.`;
  },
  factSlice: (f) => ({ topSuppliers: f.business.topSuppliers, companyName: f.company.name }),
};

/**
 * NOT a SEBI figure — a plain solvency read (borrowings exceed net worth),
 * flagged provisional for the same reason as supplier concentration above.
 */
export const highLeverage: RiskArchetype = {
  id: 'high-leverage',
  category: 'financial',
  title: 'Borrowings exceed net worth',
  trigger: (f) => {
    const y = latestYear(f);
    return y !== undefined && new Decimal(y.totalBorrowings).greaterThan(y.netWorth);
  },
  materiality: (f) => {
    const y = latestYear(f)!;
    const netWorth = new Decimal(y.netWorth);
    return netWorth.isZero() ? Infinity : new Decimal(y.totalBorrowings).dividedBy(netWorth).toNumber();
  },
  detail: (f) => {
    const y = latestYear(f)!;
    const ratio = new Decimal(y.totalBorrowings).dividedBy(y.netWorth).toFixed(2);
    return `Our total borrowings of ${formatAs(y.totalBorrowings, 'crores')} as of FY${y.yearEnding} exceeded our net worth of ${formatAs(y.netWorth, 'crores')} (a debt-to-equity ratio of ${ratio}). Our ability to service this debt depends on our cash flows, and a downturn could impair it.`;
  },
  factSlice: (f) => {
    const y = latestYear(f)!;
    return {
      totalBorrowings: formatAs(y.totalBorrowings, 'crores'),
      netWorth: formatAs(y.netWorth, 'crores'),
      debtToEquityRatio: new Decimal(y.totalBorrowings).dividedBy(y.netWorth).toFixed(2),
      yearEnding: y.yearEnding,
      companyName: f.company.name,
    };
  },
};

/**
 * Reuses `materialityThreshold()` (lib/legal/materiality.ts) — the same test
 * cited to Om Galaxy p.306 and Maxwell p.244 that the litigation section
 * itself uses. No new number is introduced here.
 */
export const materialContingentLiabilities: RiskArchetype = {
  id: 'material-contingent-liabilities',
  category: 'financial',
  title: 'Contingent liabilities exceed the materiality threshold',
  trigger: (f) => {
    const t = materialityThreshold(f);
    const y = latestYear(f);
    return t !== null && y !== undefined && new Decimal(y.contingentLiabilities).greaterThan(t.threshold);
  },
  materiality: (f) => {
    const t = materialityThreshold(f)!;
    const y = latestYear(f)!;
    return new Decimal(y.contingentLiabilities).dividedBy(t.threshold).toNumber();
  },
  detail: (f) => {
    const t = materialityThreshold(f)!;
    const y = latestYear(f)!;
    return `Our contingent liabilities not provided for totalled ${formatAs(y.contingentLiabilities, 'lakhs')} as of FY${y.yearEnding}, above our materiality threshold of ${formatAs(t.threshold, 'lakhs')} (the lower of 2% of turnover, 2% of net worth and 5% of average absolute profit after tax). If any of these liabilities crystallise, it would adversely affect our financial condition.`;
  },
  factSlice: (f) => {
    const t = materialityThreshold(f)!;
    const y = latestYear(f)!;
    return {
      contingentLiabilityItems: f.financials.contingentLiabilityItems.map((item) => ({
        particulars: item.particulars,
        amountLatest: item.amountLatest ? formatAs(item.amountLatest, 'lakhs') : null,
      })),
      contingentLiabilities: formatAs(y.contingentLiabilities, 'lakhs'),
      threshold: formatAs(t.threshold, 'lakhs'),
      yearEnding: y.yearEnding,
      companyName: f.company.name,
    };
  },
};

/** Same `materialityThreshold()` reuse, applied to litigation against the company rather than a balance-sheet figure. */
export const materialLitigationAgainstCompany: RiskArchetype = {
  id: 'material-litigation-against-company',
  category: 'legal',
  title: 'Material legal proceedings are pending against the Company',
  trigger: (f) => {
    const t = materialityThreshold(f);
    if (t === null) return false;
    return f.legal.litigation.some(
      (l) => l.party === 'COMPANY' && l.direction === 'AGAINST' && l.amount !== null && new Decimal(l.amount).greaterThanOrEqualTo(t.threshold),
    );
  },
  materiality: (f) => {
    const t = materialityThreshold(f)!;
    const material = f.legal.litigation.filter(
      (l) => l.party === 'COMPANY' && l.direction === 'AGAINST' && l.amount !== null && new Decimal(l.amount).greaterThanOrEqualTo(t.threshold),
    );
    return material.reduce((s, l) => s.plus(l.amount!), new Decimal(0)).dividedBy(t.threshold).toNumber();
  },
  detail: (f) => {
    const t = materialityThreshold(f)!;
    const material = f.legal.litigation.filter(
      (l) => l.party === 'COMPANY' && l.direction === 'AGAINST' && l.amount !== null && new Decimal(l.amount).greaterThanOrEqualTo(t.threshold),
    );
    const total = formatAs(material.reduce((s, l) => s.plus(l.amount!), new Decimal(0)).toFixed(), 'lakhs');
    return `${material.length} legal ${material.length === 1 ? 'proceeding' : 'proceedings'} against our Company, totalling ${total}, meet or exceed our litigation materiality threshold of ${formatAs(t.threshold, 'lakhs')}. An adverse outcome could require us to pay damages or comply with orders that affect our operations.`;
  },
  factSlice: (f) => {
    const t = materialityThreshold(f)!;
    return {
      litigation: f.legal.litigation
        .filter((l) => l.party === 'COMPANY' && l.direction === 'AGAINST')
        .map((l) => ({ ...l, amount: l.amount ? formatAs(l.amount, 'lakhs') : null })),
      threshold: formatAs(t.threshold, 'lakhs'),
      companyName: f.company.name,
    };
  },
};

/**
 * D46, corpus-corroborated: Om Galaxy #38 ("Certain portion of our revenue...
 * derived from exports... any adverse developments... could adversely affect
 * our business") and Maxwell #3 / #8 (export share ~85%, plus a dedicated FX
 * risk factor). The two disclose at very different magnitudes — Om Galaxy's
 * exports are ~9% of revenue, Maxwell's ~85% — yet BOTH carry the risk, worded
 * to match its scale ("certain portion" vs "substantial portion"). That rules
 * out a percentage floor: the trigger is presence of any export revenue at
 * all, and materiality (for sorting, and for how the sentence reads) scales
 * with the share itself.
 */
export const exportRevenueDependency: RiskArchetype = {
  id: 'export-revenue-dependency',
  category: 'business',
  title: 'Revenue depends on export markets',
  trigger: (f) => (f.business.exportRevenueShare ?? 0) > 0,
  materiality: (f) => f.business.exportRevenueShare ?? 0,
  detail: (f) => {
    const share = f.business.exportRevenueShare!;
    const scale = share >= 50 ? 'substantial portion' : 'portion';
    return `A ${scale} of our revenue from operations (${share}% in the last financial year) is derived from exports to international markets. Any adverse political, economic or regulatory development in those markets, or adverse movement in foreign exchange rates, could adversely affect our business, financial condition and results of operations.`;
  },
  factSlice: (f) => ({ exportRevenueShare: f.business.exportRevenueShare, companyName: f.company.name }),
};

/**
 * D46, corpus-corroborated: Om Galaxy #29 (Registered Office and majority of
 * Manufacturing Units on leased properties) and Ideas Electricals (leased or
 * licensed premises, no assurance of renewal on the same terms). A distinct
 * signal from `singleManufacturingFacility` above — that one fires on COUNT,
 * this one fires on OWNERSHIP, and an issuer can trigger either, neither or
 * both independently.
 */
export const leasedFacilities: RiskArchetype = {
  id: 'leased-facilities',
  category: 'business',
  title: 'Operations depend on leased, not owned, premises',
  trigger: (f) => f.business.facilities.some((fac) => !fac.owned),
  materiality: (f) => f.business.facilities.filter((fac) => !fac.owned).length,
  detail: (f) => {
    const leased = f.business.facilities.filter((fac) => !fac.owned);
    const names = leased.map((fac) => fac.name ?? fac.location).join(', ');
    return `${leased.length} of our ${f.business.facilities.length} ${f.business.facilities.length === 1 ? 'facility is' : 'facilities are'} held on a leasehold basis (${names}). There can be no assurance that these lease agreements will be renewed on the same or similar commercial terms, or at all, and any failure to renew could disrupt our operations.`;
  },
  factSlice: (f) => ({ facilities: f.business.facilities, companyName: f.company.name }),
};

/**
 * D46, corpus-corroborated at three of the first four documents checked: Om
 * Galaxy #60 ("None of our directors have prior experience of directorship
 * in any of companies listed..."), Maxwell #52 ("Majority of the Directors...
 * do not possess experience..."), Ideas Electricals (same, "due to their lack
 * of prior experience as directors of companies listed..."). The trigger
 * takes the weaker of the two framings — a MAJORITY lacking experience — so
 * it also covers Om Galaxy's stricter "none" case, rather than requiring
 * unanimity across sources that phrase the bar differently.
 */
export const directorsLackListedExperience: RiskArchetype = {
  id: 'directors-lack-listed-experience',
  category: 'business',
  title: 'Most of the Board lacks listed-company board experience',
  trigger: (f) => {
    const directors = f.management.directors;
    if (directors.length === 0) return false;
    const withExperience = directors.filter((d) => d.hasListedCompanyExperience).length;
    return withExperience < directors.length / 2;
  },
  materiality: (f) => {
    const directors = f.management.directors;
    const withExperience = directors.filter((d) => d.hasListedCompanyExperience).length;
    return (directors.length - withExperience) / directors.length;
  },
  detail: (f) => {
    const directors = f.management.directors;
    const withExperience = directors.filter((d) => d.hasListedCompanyExperience).length;
    return `${directors.length - withExperience} of our ${directors.length} directors have no prior experience of serving on the board of a company listed on a recognised stock exchange. They may accordingly be able to provide only limited guidance on the compliance obligations of a listed entity.`;
  },
  factSlice: (f) => ({
    directors: f.management.directors.map((d) => ({ name: d.name, hasListedCompanyExperience: d.hasListedCompanyExperience })),
    companyName: f.company.name,
  }),
};

/**
 * D48, corpus-corroborated at three of the first four documents checked: Om
 * Galaxy and Century both close their key-person dependency risk factor with
 * the same line — they do NOT maintain key man insurance for their
 * Promoters, KMP and Senior Management. Ideas Electricals' restated
 * financials carry an actual "Keyman Insurance" expense line, evidence this
 * genuinely varies by issuer rather than being boilerplate every document
 * states identically (the surrounding "we depend on our Promoters and KMP"
 * paragraph IS near-universal, and was deliberately NOT turned into its own
 * archetype for that reason — only the insurable, binary fact is asked).
 */
export const keyManInsuranceAbsent: RiskArchetype = {
  id: 'key-man-insurance-absent',
  category: 'business',
  title: 'No key man insurance for Promoters or Key Managerial Personnel',
  trigger: (f) => !f.management.hasKeyManInsurance,
  materiality: () => 1,
  detail: () =>
    'Our success depends on the continued services of our Promoters, Key Managerial Personnel and Senior Management, and we do not maintain key man insurance in respect of any of them. The loss of any of these individuals, without insurance to offset the resulting cost or disruption, could adversely affect our business.',
  factSlice: (f) => ({
    hasKeyManInsurance: f.management.hasKeyManInsurance,
    companyName: f.company.name,
  }),
};

/**
 * D49, corpus-corroborated at Om Galaxy #56 and Maxwell #44, both worded
 * around "majority"/"significant" control rather than a fixed percentage —
 * both also leave the actual number blank ("[]%"), fixed only at pricing.
 * The 50% bar matches their own "majority control" framing, the same way
 * `customerConcentration`'s 50% matches the seed's own comment (D44).
 *
 * No new fact: `shareholding()` (`lib/capital/tables.ts`) already computes
 * post-issue percentage per holder from `capital.shareholders` and
 * `offer.freshIssueShares` — the same table Capital Structure prints. An
 * archetype reusing a computed table, not a new question.
 */
export const promoterMajorityControl: RiskArchetype = {
  id: 'promoter-majority-control',
  category: 'promoter',
  title: 'Promoters will continue to hold majority control after the Issue',
  trigger: (f) => promoterPostIssuePercent(f).greaterThan(50),
  materiality: (f) => promoterPostIssuePercent(f).toNumber(),
  detail: (f) => {
    const pct = promoterPostIssuePercent(f).toFixed(2);
    return `Our Promoters and Promoter Group will collectively hold approximately ${pct}% of our post-Issue equity share capital. By virtue of this shareholding, they will continue to be able to control the outcome of matters requiring shareholder approval, and their interests may not always align with those of our other shareholders.`;
  },
  factSlice: (f) => ({
    promoterPostIssuePercent: promoterPostIssuePercent(f).toFixed(2),
    companyName: f.company.name,
  }),
};

function promoterPostIssuePercent(f: FactBase): Decimal {
  const rows = shareholding(f).filter((r) => r.category === 'PROMOTER' || r.category === 'PROMOTER_GROUP');
  return rows.reduce((sum, r) => sum.plus(r.postIssuePercent), new Decimal(0));
}

/**
 * D49, corpus-corroborated at three of the first four documents checked: Om
 * Galaxy #22, Century #32 and Ideas Electricals #54 all carry the same
 * structural risk factor — the company has entered into related party
 * transactions and expects to continue to. Unlike customer concentration,
 * none of the three states a percentage bar; the risk is the EXISTENCE of
 * RPTs, not their size, so the trigger is presence, matching
 * `exportRevenueDependency`'s "any amount, not a floor" pattern (D46).
 * `groupCompanies.relatedPartyTransactions` and the RPT total already exist.
 */
export const relatedPartyTransactionsPresent: RiskArchetype = {
  id: 'related-party-transactions-present',
  category: 'business',
  title: 'We have entered into related party transactions',
  trigger: (f) => f.groupCompanies.relatedPartyTransactions.length > 0,
  materiality: (f) => {
    const y = f.financials.years[0];
    if (!y) return 0;
    return new Decimal(y.relatedPartyTransactionsTotal).dividedBy(y.revenue).times(100).toNumber();
  },
  detail: (f) => {
    const y = f.financials.years[0];
    const count = f.groupCompanies.relatedPartyTransactions.length;
    const shareOfRevenue = y ? new Decimal(y.relatedPartyTransactionsTotal).dividedBy(y.revenue).times(100).toFixed(2) : null;
    return `We have entered into, and expect to continue entering into, related party transactions with our Promoters, Directors and members of our Promoter Group (${count} related ${count === 1 ? 'party' : 'parties'} on file${shareOfRevenue ? `, ${shareOfRevenue}% of revenue in the last financial year` : ''}). We cannot assure you that such transactions will always be on terms as favourable as those available from unrelated third parties.`;
  },
  factSlice: (f) => {
    const y = f.financials.years[0];
    return {
      relatedParties: f.groupCompanies.relatedParties,
      relatedPartyTransactionsTotal: y ? formatAs(y.relatedPartyTransactionsTotal, 'lakhs') : undefined,
      companyName: f.company.name,
    };
  },
};

/**
 * D52, corpus-corroborated at three of the five documents checked: Om Galaxy
 * #21 ("Instances of delay or non-compliance in payment and filing of
 * statutory dues"), Maxwell #10/#15 ("has not complied with certain
 * statutory provisions... delayed filings"), Photonics Watertech #16
 * ("certain instances of delays in payment of statutory dues"). Flagged in
 * D49 as needing a new fact — it did not. `legal.statutoryDuesDefaults`
 * already exists, asked as a closing statement of the litigation section
 * ("null if none"), and is exactly this fact under a different name.
 */
export const statutoryDuesDefaultHistory: RiskArchetype = {
  id: 'statutory-dues-default-history',
  category: 'legal',
  title: 'A history of delay or default in statutory dues',
  trigger: (f) => f.legal.statutoryDuesDefaults !== null,
  materiality: () => 1,
  detail: (f) => `We have outstanding or past defaults in the payment of statutory dues: ${f.legal.statutoryDuesDefaults}. Any further delay or default could expose us to interest, penalties or other regulatory action.`,
  factSlice: (f) => ({
    statutoryDuesDefaults: f.legal.statutoryDuesDefaults,
    companyName: f.company.name,
  }),
};

/**
 * D53, corpus-corroborated at three documents: Om Galaxy #26 ("Our
 * Promoters have provided personal guarantees"), Photonics Watertech #17
 * ("Our Promoters and other persons have extended guarantees for loan
 * facilities"), Shakti Polytarp #35 (same). `financials.borrowings[].security`
 * already carried this as free text where it applied — Vardhman's own two
 * guaranteed facilities state it in full sentences ("personal guarantees of
 * Rajesh Vardhman and Sunita Vardhman"). `personalGuaranteeByPromoter` makes
 * it a fact an archetype can trigger on without parsing prose.
 */
export const promoterPersonalGuarantees: RiskArchetype = {
  id: 'promoter-personal-guarantees',
  category: 'financial',
  title: 'Borrowings are secured in part by personal guarantees from Promoters',
  trigger: (f) => f.financials.borrowings.some((b) => b.personalGuaranteeByPromoter),
  materiality: (f) => f.financials.borrowings.filter((b) => b.personalGuaranteeByPromoter).length,
  detail: (f) => {
    const guaranteed = f.financials.borrowings.filter((b) => b.personalGuaranteeByPromoter);
    const total = formatAs(guaranteed.reduce((s, b) => s.plus(b.outstanding), new Decimal(0)).toFixed(), 'crores');
    return `${guaranteed.length} of our borrowing ${guaranteed.length === 1 ? 'facility is' : 'facilities are'} secured in part by personal guarantees from our Promoters, with an aggregate outstanding of ${total} under those facilities. Invocation of any such guarantee could adversely affect our Promoters personally, which may in turn affect their ability to hold or exercise control over our Company.`;
  },
  factSlice: (f) => ({
    guaranteedBorrowings: f.financials.borrowings
      .filter((b) => b.personalGuaranteeByPromoter)
      .map((b) => ({ lender: b.lender, category: b.category, outstanding: formatAs(b.outstanding, 'crores') })),
    companyName: f.company.name,
  }),
};

/**
 * D54, corpus-corroborated at three documents: Maxwell's Gujarat exposure,
 * Shakti Polytarp's Madhya Pradesh exposure ("majority of our revenues"),
 * Axiom Gas's Karnataka/Telangana/Maharashtra cluster. The 50% trigger
 * matches Shakti's own "majority" framing — the clearest of the three on
 * where the bar sits — same reasoning D25 used to settle a disputed
 * threshold: pick the one that is defensible from the strongest source,
 * rather than manufacturing false precision where sources differ.
 */
export const geographicRevenueConcentration: RiskArchetype = {
  id: 'geographic-revenue-concentration',
  category: 'business',
  title: 'Revenue is concentrated in one state or a small group of states',
  trigger: (f) => (f.business.primaryMarketRevenueSharePercent ?? 0) > 50,
  materiality: (f) => f.business.primaryMarketRevenueSharePercent ?? 0,
  detail: (f) =>
    `${f.business.primaryMarketRevenueSharePercent}% of our revenue from operations in the last financial year was derived from ${f.business.primaryMarketDescription}. Any adverse political, economic, regulatory or competitive development in this market could disproportionately affect our business, financial condition and results of operations.`,
  factSlice: (f) => ({
    primaryMarketDescription: f.business.primaryMarketDescription,
    primaryMarketRevenueSharePercent: f.business.primaryMarketRevenueSharePercent,
    companyName: f.company.name,
  }),
};

export const riskArchetypes: RiskArchetype[] = [
  customerConcentration,
  singleManufacturingFacility,
  supplierConcentration,
  highLeverage,
  materialContingentLiabilities,
  materialLitigationAgainstCompany,
  exportRevenueDependency,
  leasedFacilities,
  directorsLackListedExperience,
  keyManInsuranceAbsent,
  promoterMajorityControl,
  relatedPartyTransactionsPresent,
  statutoryDuesDefaultHistory,
  promoterPersonalGuarantees,
  geographicRevenueConcentration,
];
