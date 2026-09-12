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
  groundedIn: "The Vardhman seed's own stated convention (D44): 61.3% concentration, above the 50% bar the fixture's own comment names as material.",
  sourceModules: ['M5'],
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
  groundedIn: 'A plain structural count with no threshold to invent — standard SME risk framing for single-site operations, no corpus percentage or figure involved.',
  sourceModules: ['M5'],
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
  groundedIn: 'PROVISIONAL — the 50% bar mirrors customerConcentration for internal consistency, but no held-out document has been checked for where real prospectuses draw this line for suppliers specifically.',
  sourceModules: ['M5'],
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
  groundedIn: 'PROVISIONAL — a plain solvency read (borrowings exceed net worth), not an independently corpus-verified threshold; flagged provisional for the same reason as supplierConcentration.',
  sourceModules: ['M6'],
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
  groundedIn: 'Reuses the litigation materiality threshold cited to Om Galaxy p.306 and Maxwell p.244 — the same test the litigation section itself applies (lib/legal/materiality.ts).',
  sourceModules: ['M6'],
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
    const singular = material.length === 1;
    return `${material.length} legal ${singular ? 'proceeding' : 'proceedings'} against our Company, totalling ${total}, ${singular ? 'meets or exceeds' : 'meet or exceed'} our litigation materiality threshold of ${formatAs(t.threshold, 'lakhs')}. An adverse outcome could require us to pay damages or comply with orders that affect our operations.`;
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
  groundedIn: 'Reuses the same litigation materiality threshold applied to litigation against the Company rather than a balance-sheet figure.',
  sourceModules: ['M6', 'M7'],
};

/**
 * D61, corpus-corroborated: Om Galaxy #27 ("There are outstanding legal
 * proceedings against our Company, Promoters, Directors...") and Ideas
 * Electricals #17 ("Any adverse legal proceedings initiated against our
 * company or its promoters, directors and KMP's"). Both name the SAME
 * materiality test `materialLitigationAgainstCompany` already applies —
 * this is that archetype's sibling, filtered to `party: 'PROMOTER'` instead
 * of `'COMPANY'`. Zero new fact: `legal.litigation[].party` already
 * distinguishes them (S8).
 */
export const materialLitigationAgainstPromoters: RiskArchetype = {
  id: 'material-litigation-against-promoters',
  category: 'promoter',
  title: 'Material legal proceedings are pending against our Promoters',
  trigger: (f) => {
    const t = materialityThreshold(f);
    if (t === null) return false;
    return f.legal.litigation.some(
      (l) => l.party === 'PROMOTER' && l.direction === 'AGAINST' && l.amount !== null && new Decimal(l.amount).greaterThanOrEqualTo(t.threshold),
    );
  },
  materiality: (f) => {
    const t = materialityThreshold(f)!;
    const material = f.legal.litigation.filter(
      (l) => l.party === 'PROMOTER' && l.direction === 'AGAINST' && l.amount !== null && new Decimal(l.amount).greaterThanOrEqualTo(t.threshold),
    );
    return material.reduce((s, l) => s.plus(l.amount!), new Decimal(0)).dividedBy(t.threshold).toNumber();
  },
  detail: (f) => {
    const t = materialityThreshold(f)!;
    const material = f.legal.litigation.filter(
      (l) => l.party === 'PROMOTER' && l.direction === 'AGAINST' && l.amount !== null && new Decimal(l.amount).greaterThanOrEqualTo(t.threshold),
    );
    const total = formatAs(material.reduce((s, l) => s.plus(l.amount!), new Decimal(0)).toFixed(), 'lakhs');
    const singular = material.length === 1;
    return `${material.length} legal ${singular ? 'proceeding' : 'proceedings'} against our Promoters, totalling ${total}, ${singular ? 'meets or exceeds' : 'meet or exceed'} our litigation materiality threshold of ${formatAs(t.threshold, 'lakhs')}. An adverse outcome could impose personal liability on our Promoters, which may in turn affect their ability to continue to serve our Company.`;
  },
  factSlice: (f) => {
    const t = materialityThreshold(f)!;
    return {
      litigation: f.legal.litigation
        .filter((l) => l.party === 'PROMOTER' && l.direction === 'AGAINST')
        .map((l) => ({ ...l, amount: l.amount ? formatAs(l.amount, 'lakhs') : null })),
      threshold: formatAs(t.threshold, 'lakhs'),
      companyName: f.company.name,
    };
  },
  groundedIn: 'D61, corroborated at Om Galaxy #27 and Ideas Electricals #17, both naming outstanding legal proceedings against Promoters and Directors alongside the Company. Reuses the same litigation materiality threshold as materialLitigationAgainstCompany, filtered to party PROMOTER instead of COMPANY.',
  sourceModules: ['M3', 'M6', 'M7'],
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
  groundedIn: 'D46, corroborated at Om Galaxy #38 (~9% of revenue, "certain portion") and Maxwell #3/#8 (~85%, "substantial portion" plus a dedicated FX risk) — the trigger fires on any export revenue at all, not a percentage floor.',
  sourceModules: ['M5'],
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
  groundedIn: 'D46, corroborated at Om Galaxy #29 (Registered Office and majority of Manufacturing Units leased) and Ideas Electricals (leased/licensed premises, no assurance of renewal). Independent of singleManufacturingFacility — that fires on COUNT, this fires on OWNERSHIP.',
  sourceModules: ['M5'],
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
  groundedIn: 'D46, corroborated at Om Galaxy #60 ("none"), Maxwell #52 ("majority lack"), Ideas Electricals (same). Trigger takes the weaker "majority lacks" framing, covering Om Galaxy\'s stricter "none" case as a subset.',
  sourceModules: ['M4'],
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
  groundedIn: 'D48, corroborated at Om Galaxy and Century (both state absence explicitly); Ideas Electricals carries an actual Keyman Insurance expense line, evidence the fact genuinely varies rather than being universal boilerplate.',
  sourceModules: ['M4'],
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
  groundedIn: 'D49, corroborated at Om Galaxy #56 and Maxwell #44, both worded around "majority"/"significant" control rather than a fixed percentage. Reuses the post-issue shareholding table (lib/capital/tables.ts), not a new question.',
  sourceModules: ['M2', 'M9'],
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
  groundedIn: 'D49, corroborated at Om Galaxy #22, Century #32, Ideas Electricals #54 — all three carry the same structural risk (EXISTENCE of RPTs, not a size threshold; none of the three states a percentage bar).',
  sourceModules: ['M6', 'M10'],
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
  groundedIn: 'D52, corroborated at Om Galaxy #21, Maxwell #10/#15, Photonics Watertech #16. Reuses legal.statutoryDuesDefaults, already asked as a closing statement of the litigation section — no new fact.',
  sourceModules: ['M7'],
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
  groundedIn: 'D53, corroborated at Om Galaxy #26, Photonics Watertech #17, Shakti Polytarp #35. Reuses financials.borrowings[].personalGuaranteeByPromoter, already carried as free text in the security field before this archetype existed.',
  sourceModules: ['M6'],
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
  groundedIn: "D54, corroborated at Maxwell's Gujarat exposure, Shakti Polytarp's Madhya Pradesh exposure (\"majority of our revenues\"), Axiom Gas's Karnataka/Telangana/Maharashtra cluster. The 50% bar matches Shakti's own \"majority\" framing.",
  sourceModules: ['M5'],
};

/**
 * D57, corpus-corroborated at four of seven documents — the strongest
 * corroboration of any archetype added since the initial six (D44): Axiom
 * Gas #8 ("Unsecured loans taken by us can be recalled by the lenders
 * thereof at any time... these unsecured loans are repayable on demand"),
 * Photonics Watertech #38 ("Our Company has availed unsecured loans which
 * are repayable on demand"), Shakti Polytarp #23 (same), Century Business
 * Media #40 (same). All four state it as a standalone numbered risk factor,
 * not a passing mention inside a broader liquidity risk.
 *
 * Zero schema change: `financials.borrowings[].category` already
 * distinguishes `UNSECURED_LOAN_FROM_DIRECTORS` and `UNSECURED_LOAN_OTHER`
 * from every secured facility (added at S8, before this archetype existed to
 * use it) — the same "the fixture was already catching up to its own facts"
 * shape as D46's Arvind Joshi finding and D53's personal-guarantee archetype.
 * Vardhman's own director loan (Rajesh Vardhman, Rs 1.50 Cr, "Repayable on
 * demand") already carried this exact fact before this archetype was written.
 */
export const unsecuredLoansRepayableOnDemand: RiskArchetype = {
  id: 'unsecured-loans-repayable-on-demand',
  category: 'financial',
  title: 'Unsecured loans may be recalled by lenders at any time',
  trigger: (f) => f.financials.borrowings.some((b) => b.category === 'UNSECURED_LOAN_FROM_DIRECTORS' || b.category === 'UNSECURED_LOAN_OTHER'),
  // In crores, matching the scale `detail()` and `factSlice()` already format to —
  // a raw rupee figure would dwarf every percentage- and ratio-based archetype's
  // materiality and always sort first, which is not a claim this archetype makes.
  materiality: (f) =>
    f.financials.borrowings
      .filter((b) => b.category === 'UNSECURED_LOAN_FROM_DIRECTORS' || b.category === 'UNSECURED_LOAN_OTHER')
      .reduce((s, b) => s.plus(b.outstanding), new Decimal(0))
      .dividedBy(1e7)
      .toNumber(),
  detail: (f) => {
    const unsecured = f.financials.borrowings.filter(
      (b) => b.category === 'UNSECURED_LOAN_FROM_DIRECTORS' || b.category === 'UNSECURED_LOAN_OTHER',
    );
    const total = formatAs(unsecured.reduce((s, b) => s.plus(b.outstanding), new Decimal(0)).toFixed(), 'crores');
    return `We have availed unsecured loans with an aggregate outstanding of ${total}, which are repayable on demand. If our lenders were to recall these amounts before they otherwise fall due, it could place significant strain on our cash flows and adversely affect our financial condition.`;
  },
  factSlice: (f) => ({
    unsecuredBorrowings: f.financials.borrowings
      .filter((b) => b.category === 'UNSECURED_LOAN_FROM_DIRECTORS' || b.category === 'UNSECURED_LOAN_OTHER')
      .map((b) => ({ lender: b.lender, category: b.category, outstanding: formatAs(b.outstanding, 'crores') })),
    companyName: f.company.name,
  }),
  groundedIn: 'D57, corroborated at four of seven documents — Axiom Gas #8, Photonics Watertech #38, Shakti Polytarp #23, Century #40 — the strongest support of any archetype since the original six.',
  sourceModules: ['M6'],
};

/**
 * D60, corpus-corroborated at three of seven documents — Ideas Electricals
 * #18 (operating cash flow of Rs -1,158.16 Lakhs in FY2026, after two prior
 * positive years), Photonics Watertech #27 (Rs -302.84 Lakhs for the
 * nine-month stub to December 2025 and Rs -53.48 Lakhs in FY2023), Shakti
 * Polytarp #7 (Rs -1,078.51 Lakhs in FY2025, Rs -205.12 Lakhs in FY2024,
 * before a FY2026 recovery to positive). All three state the actual negative
 * figure, not just the boilerplate warning sentence.
 *
 * Century Business Media carries the SAME risk factor heading ("Our Company
 * had negative cash flows in the past") but its own table shows operating
 * cash flow POSITIVE in all three reported years (605.02 / 540.49 / 15.83
 * Lakhs) — only its investing activities are negative, which is the ordinary
 * signature of a capex-funding growth-stage company, not a liquidity risk.
 * Deliberately EXCLUDED as a source for this trigger — the exact "mirror-
 * image mistake" D26 warns against: a matching risk-factor TITLE across
 * documents is not evidence the underlying trigger matches, and has to be
 * checked against each document's own numbers before being counted.
 *
 * Zero schema change: `financials.years[].cashFlowFromOperations` already
 * exists (part of the Other Financial Information / MD&A figures, S8).
 * Vardhman's own three years are all positive (5.20 / 3.10 / 2.05 Cr), so
 * this correctly does not fire on the seed — same precedent as
 * `statutoryDuesDefaultHistory` (D52): not every archetype needs to fire on
 * the demo issuer to be worth having.
 */
export const negativeOperatingCashFlowHistory: RiskArchetype = {
  id: 'negative-operating-cash-flow-history',
  category: 'financial',
  title: 'Negative cash flows from operating activities in past years',
  trigger: (f) => f.financials.years.some((y) => new Decimal(y.cashFlowFromOperations).isNegative()),
  materiality: (f) => f.financials.years.filter((y) => new Decimal(y.cashFlowFromOperations).isNegative()).length,
  detail: (f) => {
    const negative = f.financials.years.filter((y) => new Decimal(y.cashFlowFromOperations).isNegative());
    // Money is formatted from the ABSOLUTE value here — "negative cash flow of Rs X Lakhs" reads as a
    // real prospectus states it; formatAs on a negative figure directly would print "Rs -X Lakhs",
    // a double negative against the sentence's own "negative" (the same lesson D55 learned about
    // running every money value through formatAs applies to its sign, not only its scale).
    const list = negative
      .map((y) => `${formatAs(new Decimal(y.cashFlowFromOperations).abs().toFixed(), 'lakhs')} in FY${y.yearEnding}`)
      .join(', ');
    return `We had negative net cash flow from operating activities in ${negative.length} of the last ${f.financials.years.length} reported financial years: ${list}. Sustained negative operating cash flow could require us to rely on external financing, which may not be available on favourable terms or at all, and could adversely affect our business, financial condition and results of operations.`;
  },
  // The magnitude is ALWAYS the absolute value, formatted; `negative` alone
  // carries the sign. A live draft against an earlier version of this
  // factSlice (which passed the raw signed string through formatAs) printed
  // "Rs -315.00 Lakhs" — technically traceable, but not how the corpus
  // phrases a negative figure (never a bare minus sign on a Rupee amount),
  // and not something a rule telling the model "never alter a number" can
  // fix after the fact. Same lesson as D52/D55, applied to a sign rather
  // than a scale.
  factSlice: (f) => ({
    years: f.financials.years.map((y) => ({
      yearEnding: y.yearEnding,
      cashFlowFromOperations: formatAs(new Decimal(y.cashFlowFromOperations).abs().toFixed(), 'lakhs'),
      negative: new Decimal(y.cashFlowFromOperations).isNegative(),
    })),
    companyName: f.company.name,
  }),
  groundedIn: 'D60, corroborated at Ideas Electricals #18, Photonics Watertech #27, Shakti Polytarp #7 — all three show a genuinely negative operating cash flow figure in at least one reported year. Century states the same risk factor TITLE but its own data is positive throughout; deliberately excluded (D26).',
  sourceModules: ['M6'],
};

/**
 * D62, corpus-corroborated at three of seven documents — Om Galaxy #20 ("The
 * logo used by our Company is not registered under the Trade Marks Act,
 * 1999. Failure to protect our intellectual property rights may adversely
 * affect our competitive business position..."), Century #10 (own logo "is
 * not registered as on date"), Photonics Watertech #42 (same, word for
 * word). A clean, binary, genuinely-varying fact — unlike a generic
 * "we require various statutory approvals" risk seen in the same
 * neighbourhood of several of these documents' risk chapters, which reads as
 * near-universal boilerplate every SME states regardless of its own facts
 * (the same "surrounding paragraph is boilerplate" pattern D48 ruled key-man
 * insurance's context out for) — THIS fact is a specific yes/no about the
 * issuer's own mark, not a generic warning about approvals in general.
 *
 * Zero schema change: `approvals.licences[].category` already has
 * `INTELLECTUAL_PROPERTY` and `.status` already has `OBTAINED` / `APPLIED` /
 * `RENEWAL_APPLIED` (S8). Vardhman's own trademark application ("VARDHMAN
 * PRECISION" device mark, Class 12) is already on file at `APPLIED`, so this
 * fires on the seed without any change to it — another case of the fixture
 * already carrying the fact an archetype later reads (D46/D53's pattern).
 */
export const trademarkNotRegistered: RiskArchetype = {
  id: 'trademark-not-registered',
  category: 'business',
  title: "The Company's own trademark(s) are not yet registered",
  trigger: (f) => f.approvals.licences.some((l) => l.category === 'INTELLECTUAL_PROPERTY' && l.status !== 'OBTAINED'),
  materiality: (f) => f.approvals.licences.filter((l) => l.category === 'INTELLECTUAL_PROPERTY' && l.status !== 'OBTAINED').length,
  detail: (f) => {
    const pending = f.approvals.licences.filter((l) => l.category === 'INTELLECTUAL_PROPERTY' && l.status !== 'OBTAINED');
    const names = pending.map((l) => l.name).join('; ');
    return `${pending.length} of our trademark ${pending.length === 1 ? 'application is' : 'applications are'} still pending registration under the Trade Marks Act, 1999: ${names}. Until registration is granted, we may be unable to prevent third parties from using an identical or deceptively similar mark, which could adversely affect our brand and competitive position.`;
  },
  factSlice: (f) => ({
    pendingTrademarks: f.approvals.licences
      .filter((l) => l.category === 'INTELLECTUAL_PROPERTY' && l.status !== 'OBTAINED')
      .map((l) => ({ name: l.name, status: l.status })),
    companyName: f.company.name,
  }),
  groundedIn: 'D62, corroborated at Om Galaxy #20, Century #10, Photonics Watertech #42 — all three state the same specific fact: the Company\'s own logo/trademark is not registered under the Trade Marks Act, 1999. A specific per-issuer fact, not the generic "various approvals" boilerplate seen nearby in the same risk chapters.',
  sourceModules: ['M8'],
};

/**
 * D63, corpus-corroborated at two documents, both with real quantified
 * figures: Ideas Electricals #44 (trade receivables of Rs 5,038.02 / 4,419.16
 * / 1,789.71 Lakhs across three years, stated AS a percentage of revenue —
 * 19.54% / 24.85% / 10.53%) and Photonics Watertech #6 (Rs 2,799.18 Lakhs,
 * 51.01% of total current assets, plus 183 receivable days). The two state
 * the percentage against DIFFERENT bases — revenue versus total current
 * assets — and this fact base has no "total current assets" figure to lean
 * on, so the trigger follows Ideas Electricals' convention (against revenue,
 * the base every other percentage-of-revenue archetype already uses), the
 * same "pick the base the clearest source states, don't average two
 * conventions into a third" reasoning D25 and D54 both used.
 *
 * PROVISIONAL threshold — 15%, near the low end of Ideas Electricals' own
 * three disclosed figures, all of which that document treats as risk-worthy
 * regardless of which of the three it was in a given year. Flagged
 * provisional in the same way `supplierConcentration` and `highLeverage`
 * are: two sources support the THEME, not yet a settled bar.
 *
 * New fact: `financials.years[].tradeReceivables`, mirroring the
 * `tradePayables` field already on the same year record — same shape, same
 * module, same "at year end" convention.
 */
export const tradeReceivablesConcentration: RiskArchetype = {
  id: 'trade-receivables-concentration',
  category: 'financial',
  title: 'Trade receivables represent a significant share of revenue',
  trigger: (f) => {
    const y = latestYear(f);
    if (y === undefined || y.tradeReceivables === undefined) return false;
    return new Decimal(y.tradeReceivables).dividedBy(y.revenue).times(100).greaterThan(15);
  },
  materiality: (f) => {
    const y = latestYear(f)!;
    return new Decimal(y.tradeReceivables!).dividedBy(y.revenue).times(100).toNumber();
  },
  detail: (f) => {
    const y = latestYear(f)!;
    const pct = new Decimal(y.tradeReceivables!).dividedBy(y.revenue).times(100).toFixed(2);
    return `Our trade receivables stood at ${formatAs(y.tradeReceivables!, 'lakhs')} as of FY${y.yearEnding}, representing ${pct}% of our revenue from operations for that year. Any delay or default by our customers in settling these amounts could increase our working capital requirements and adversely affect our cash flows and liquidity.`;
  },
  factSlice: (f) => {
    const y = latestYear(f)!;
    return {
      tradeReceivables: formatAs(y.tradeReceivables!, 'lakhs'),
      tradeReceivablesPercentOfRevenue: new Decimal(y.tradeReceivables!).dividedBy(y.revenue).times(100).toFixed(2),
      yearEnding: y.yearEnding,
      companyName: f.company.name,
    };
  },
  groundedIn: 'PROVISIONAL — D63, corroborated at Ideas Electricals #44 (19.54%/24.85%/10.53% of revenue across three years) and Photonics Watertech #6 (51.01% of current assets, a different base this fact base cannot compute). 15% threshold is near the low end of Ideas Electricals\' own disclosed range, not independently settled.',
  sourceModules: ['M6'],
};

/**
 * D71, corpus-corroborated at effectively all seven documents, each in a
 * sector-specific form: raw material price fluctuations for the
 * manufacturers (Maxwell #63, Om Galaxy #6, Shakti Polytarp, Photonics
 * Watertech, Century), global LPG pricing for Axiom Gas (#10). Maxwell
 * states the operative, checkable fact directly: "Currently, we do not
 * have long-term supply agreements or fixed pricing arrangements with our
 * suppliers." The theme itself (commodity/input price volatility) is
 * industry-wide, not a claim about the issuer's own operations the way
 * `supplierConcentration` or `leasedFacilities` are — the first archetype
 * in the 'industry' category, previously empty (TODO.md's S10 checklist).
 *
 * New fact: `business.hasFixedPriceSupplyContracts`, defaulting false to
 * match the overwhelming SME norm every corpus document reflects (same
 * `.default(false)` precedent as `hasKeyManInsurance`, D48) — asked
 * directly, not assumed, since a genuinely locked-in issuer could answer
 * "yes".
 */
export const rawMaterialPriceExposure: RiskArchetype = {
  id: 'raw-material-price-exposure',
  category: 'industry',
  title: 'No long-term or fixed-price arrangements with key suppliers',
  trigger: (f) => !f.business.hasFixedPriceSupplyContracts,
  materiality: () => 1,
  detail: () =>
    'We do not have long-term supply agreements or fixed-price arrangements with our key suppliers, and source our raw materials and other inputs on a purchase-order basis at prevailing market prices. We are accordingly exposed to fluctuations in the price and availability of these inputs, which we may not always be able to pass on to our customers, and which could adversely affect our margins, business and results of operations.',
  factSlice: (f) => ({
    hasFixedPriceSupplyContracts: f.business.hasFixedPriceSupplyContracts,
    companyName: f.company.name,
  }),
  groundedIn: 'D71, corroborated in some sector-specific form at effectively all seven corpus documents — raw material pricing for the manufacturers, global LPG pricing for Axiom Gas. Maxwell #63 states the operative checkable fact directly: no long-term supply agreements or fixed pricing arrangements with suppliers.',
  sourceModules: ['M5'],
};

/**
 * D71, corpus-corroborated at all seven documents, in near-identical
 * language — the strongest single corroboration of any fact this registry
 * reads (stronger even than `unsecuredLoansRepayableOnDemand`'s 4 of 7):
 * every document states that the objects of the Issue and the proposed
 * deployment of Net Proceeds have not been appraised by any bank, financial
 * institution or independent agency, and rest on management's own
 * estimates. The first archetype in the 'offer' category, previously empty
 * (TODO.md's S10 checklist) — a risk about the ISSUE itself, not the
 * ongoing business, which is exactly what that category is for.
 *
 * New fact: `offer.objectsAppraisedByBankOrAgency`, defaulting false to
 * match the SME norm every corpus document reflects, asked directly rather
 * than assumed — a larger issuer with a bank-appraised project could
 * genuinely answer "yes".
 */
export const objectsNotIndependentlyAppraised: RiskArchetype = {
  id: 'objects-not-independently-appraised',
  category: 'offer',
  title: 'The objects of the Issue have not been independently appraised',
  trigger: (f) => !f.offer.objectsAppraisedByBankOrAgency,
  materiality: () => 1,
  detail: () =>
    'The objects of the Issue and the deployment of the Net Proceeds are based on internal management estimates and current business plans, and have not been appraised by any bank, financial institution or other independent agency. Our actual funding requirements and deployment may vary from these estimates, and our Board retains discretion over how the Net Proceeds are applied.',
  factSlice: (f) => ({
    objectsAppraisedByBankOrAgency: f.offer.objectsAppraisedByBankOrAgency,
    companyName: f.company.name,
  }),
  groundedIn: 'D71, corroborated at all seven corpus documents in near-identical language — the strongest single corroboration of any fact this registry reads.',
  sourceModules: ['M9'],
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
  unsecuredLoansRepayableOnDemand,
  negativeOperatingCashFlowHistory,
  materialLitigationAgainstPromoters,
  trademarkNotRegistered,
  tradeReceivablesConcentration,
  rawMaterialPriceExposure,
  objectsNotIndependentlyAppraised,
];
