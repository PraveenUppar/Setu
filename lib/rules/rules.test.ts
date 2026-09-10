import { describe, it, expect } from 'vitest';
import { allRules, assess, eligibilityRules, evaluate, summarise, operatingProfit, freeCashFlowToEquity } from './index';
import { vardhman } from '../seed/vardhman';
import { money } from '../facts/money';
import { renderDocument } from '../document/section';
import { sectionRegistry } from '../document/sections';
import type { FactBase } from '../facts/schema';

/** Deep-ish clone with one branch replaced. */
function broken(mutate: (f: FactBase) => void): FactBase {
  const f = structuredClone(vardhman) as FactBase;
  mutate(f);
  return f;
}

const fires = (ruleId: string, facts: FactBase) =>
  evaluate(allRules, facts).some((x) => x.ruleId === ruleId);

const findingFor = (ruleId: string, facts: FactBase) =>
  evaluate(allRules, facts).find((x) => x.ruleId === ruleId);

describe('the clean seed passes every rule', () => {
  it('produces no findings at all', () => {
    const findings = evaluate(allRules, vardhman);
    if (findings.length > 0) {
      console.error(findings.map((f) => `${f.ruleId}: ${f.detail}`).join('\n\n'));
    }
    expect(findings).toHaveLength(0);
  });

  it('scores 100 with no blockers', () => {
    const s = summarise(allRules, vardhman);
    expect(s.blockers).toBe(0);
    expect(s.score).toBe(100);
    expect(s.passed).toBeGreaterThan(20);
  });

  it('counts rules that do not govern this issuer separately from passes', () => {
    // Vardhman is BSE SME with no OFS, so the NSE and OFS rules do not apply.
    // They are neither passes nor gaps.
    const s = summarise(allRules, vardhman);
    expect(s.notApplicable).toBeGreaterThan(0);
  });
});

describe('eligibility rules each fire on their own breach', () => {
  it('EL-001 private limited company', () => {
    expect(fires('EL-001', vardhman)).toBe(false);
    const f = broken((x) => { x.company.isPublicLimited = false; });
    expect(fires('EL-001', f)).toBe(true);
    expect(findingFor('EL-001', f)!.severity).toBe('blocker');
    expect(findingFor('EL-001', f)!.detail).toContain('45 to 60 days');
  });

  it('EL-002 post-issue capital above Rs 25 crore', () => {
    expect(fires('EL-002', vardhman)).toBe(false);
    const f = broken((x) => { x.offer.freshIssueShares = 20000000; x.capital.authorisedShares = 99999999; });
    expect(fires('EL-002', f)).toBe(true);
    expect(findingFor('EL-002', f)!.detail).toContain('Rs 32.00 Crores');
  });

  it('EL-003 issue below 25% of post-issue capital', () => {
    expect(fires('EL-003', vardhman)).toBe(false);
    const f = broken((x) => { x.offer.freshIssueShares = 1000000; });
    expect(fires('EL-003', f)).toBe(true);
    expect(findingFor('EL-003', f)!.detail).toMatch(/7\.\d\d% of post-issue capital/);
  });

  it('EL-004 operating profit below Rs 1 crore in 2 of 3 years', () => {
    expect(fires('EL-004', vardhman)).toBe(false);
    const f = broken((x) => {
      x.financials.years[1].profitBeforeTax = money('0.1', 'crores');
      x.financials.years[2].profitBeforeTax = money('0.1', 'crores');
      x.financials.years[1].financeCosts = money('0');
      x.financials.years[2].financeCosts = money('0');
      x.financials.years[1].depreciationAndAmortisation = money('0');
      x.financials.years[2].depreciationAndAmortisation = money('0');
    });
    expect(fires('EL-004', f)).toBe(true);
    expect(findingFor('EL-004', f)!.detail).toContain('Only 1 of the last 3 years');
  });

  it('EL-005 track record under three years', () => {
    expect(fires('EL-005', vardhman)).toBe(false);
    const f = broken((x) => { x.company.dateOfIncorporation = '2025-06-01'; });
    expect(fires('EL-005', f)).toBe(true);
  });

  it('EL-006 net worth applies to BSE and not to NSE', () => {
    const thin = (x: FactBase) => {
      x.financials.years[1].netWorth = money('0.2', 'crores');
      x.financials.years[2].netWorth = money('0.2', 'crores');
    };
    expect(fires('EL-006', broken(thin))).toBe(true);
    // NSE Emerge does not state a net worth floor
    expect(fires('EL-006', broken((x) => { thin(x); x.offer.exchange = 'NSE_EMERGE'; }))).toBe(false);
  });

  it('EL-007 leverage above 3:1, BSE only', () => {
    const levered = (x: FactBase) => { x.financials.years[0].totalBorrowings = money('80', 'crores'); };
    expect(fires('EL-007', broken(levered))).toBe(true);
    expect(findingFor('EL-007', broken(levered))!.detail).toContain(':1');
    expect(fires('EL-007', broken((x) => { levered(x); x.offer.exchange = 'NSE_EMERGE'; }))).toBe(false);
  });

  it('EL-008 free cash flow, NSE only', () => {
    // Vardhman is BSE, so the rule does not govern it at all
    expect(fires('EL-008', vardhman)).toBe(false);
    const onNse = broken((x) => { x.offer.exchange = 'NSE_EMERGE'; });
    expect(fires('EL-008', onNse)).toBe(false); // its FCFE is positive
    const negative = broken((x) => {
      x.offer.exchange = 'NSE_EMERGE';
      for (const y of x.financials.years.slice(1)) y.netPurchaseOfFixedAssets = money('50', 'crores');
    });
    expect(fires('EL-008', negative)).toBe(true);
  });

  it('EL-009 to EL-012 the Reg 228 blockers', () => {
    expect(fires('EL-009', broken((x) => { x.promoters.anyDebarredBySebi = true; }))).toBe(true);
    expect(fires('EL-010', broken((x) => { x.promoters.anyWilfulDefaulterOrFraudulentBorrower = true; }))).toBe(true);
    expect(fires('EL-011', broken((x) => { x.promoters.anyFugitiveEconomicOffender = true; }))).toBe(true);

    const convertibles = broken((x) => { x.capital.hasOutstandingConvertibles = true; });
    expect(fires('EL-012', convertibles)).toBe(true);
    // The long lead time is the point of surfacing this early
    expect(findingFor('EL-012', convertibles)!.detail).toContain('long lead time');
  });

  it('EL-013 partly paid shares', () => {
    expect(fires('EL-013', broken((x) => { x.capital.hasPartlyPaidShares = true; }))).toBe(true);
  });

  it('EL-014 promoter holdings in physical form', () => {
    expect(fires('EL-014', vardhman)).toBe(false);
    const f = broken((x) => { x.capital.shareholders[0].isDematerialised = false; });
    expect(fires('EL-014', f)).toBe(true);
    expect(findingFor('EL-014', f)!.detail).toContain('Rajesh Vardhman');
    // A public shareholder in physical form is not caught by Reg 230(1)(d)
    const publicPhysical = broken((x) => { x.capital.shareholders[4].isDematerialised = false; });
    expect(fires('EL-014', publicPhysical)).toBe(false);
  });

  it('EL-015 objects repaying promoter loans', () => {
    expect(fires('EL-015', vardhman)).toBe(false);
    const f = broken((x) => { x.offer.objects[2].involvesPromoterLoanRepayment = true; });
    expect(fires('EL-015', f)).toBe(true);
    expect(findingFor('EL-015', f)!.severity).toBe('blocker');
  });

  it('EL-016 firm finance, unconfirmed, where an object is a project', () => {
    // Vardhman has a plant and machinery object and has confirmed the finance
    expect(fires('EL-016', vardhman)).toBe(false);

    const unconfirmed = broken((x) => { x.offer.firmFinanceConfirmed = false; });
    expect(fires('EL-016', unconfirmed)).toBe(true);
    expect(findingFor('EL-016', unconfirmed)!.severity).toBe('major');

    // No project object means the rule does not govern the issuer at all,
    // confirmed or not
    const noProject = broken((x) => {
      x.offer.firmFinanceConfirmed = false;
      for (const o of x.offer.objects) o.isProject = false;
    });
    expect(fires('EL-016', noProject)).toBe(false);
  });

  it('EL-017 general corporate purposes above the cap', () => {
    expect(fires('EL-017', vardhman)).toBe(false);
    const f = broken((x) => { x.offer.objects[3].amount = money('8', 'crores'); });
    expect(fires('EL-017', f)).toBe(true);
    // 15% of Rs 22.05 cr is the binding limit here, not the Rs 10 cr ceiling
    expect(findingFor('EL-017', f)!.detail).toContain('15% of gross proceeds');
  });

  it('EL-018 and EL-019 the OFS caps, only where there is an OFS', () => {
    expect(fires('EL-018', vardhman)).toBe(false);
    expect(fires('EL-019', vardhman)).toBe(false);

    const bigOfs = broken((x) => {
      x.offer.sellingShareholders = [
        { name: 'Anil Vardhman', type: 'PROMOTER_GROUP', sharesOffered: 2000000, preIssueShares: 1200000, weightedAverageCostOfAcquisition: money('12') },
      ];
    });
    expect(fires('EL-018', bigOfs)).toBe(true); // over 20% of the issue
    expect(fires('EL-019', bigOfs)).toBe(true); // and over 50% of their holding

    const smallOfs = broken((x) => {
      x.offer.sellingShareholders = [
        { name: 'Anil Vardhman', type: 'PROMOTER_GROUP', sharesOffered: 400000, preIssueShares: 1200000, weightedAverageCostOfAcquisition: money('12') },
      ];
    });
    expect(fires('EL-018', smallOfs)).toBe(false);
    expect(fires('EL-019', smallOfs)).toBe(false);
  });

  it('EL-020 BRLM underwriting below 15%', () => {
    expect(fires('EL-020', broken((x) => { x.offer.brlmUnderwritingPercent = 10; }))).toBe(true);
  });

  it('EL-021 market making missing or under three years', () => {
    expect(fires('EL-021', vardhman)).toBe(false);
    expect(fires('EL-021', broken((x) => { x.offer.marketMakerName = undefined; }))).toBe(true);
    expect(fires('EL-021', broken((x) => { x.offer.marketMakingYears = 1; }))).toBe(true);
  });
});

describe('consistency rules each fire on their own breach', () => {
  it('CO-001 allotments not summing to paid-up shares', () => {
    const f = broken((x) => { x.capital.allotments[0].shares = 9000; });
    expect(fires('CO-001', f)).toBe(true);
    expect(findingFor('CO-001', f)!.detail).toContain('Short by');
  });

  it('CO-002 shareholding register not summing to 100%', () => {
    const f = broken((x) => { x.capital.shareholders[0].shares -= 72000; });
    expect(fires('CO-002', f)).toBe(true);
    expect(findingFor('CO-002', f)!.detail).toContain('99.40%');
  });

  it('CO-003 paid-up capital not matching shares times face value', () => {
    expect(fires('CO-003', broken((x) => { x.capital.paidUpCapital = money('11', 'crores'); }))).toBe(true);
  });

  it('CO-004 promoter tranches not reconciling with the register', () => {
    const f = broken((x) => { x.capital.promoterHoldings[0].shares = 400000; });
    expect(fires('CO-004', f)).toBe(true);
    expect(findingFor('CO-004', f)!.detail).toContain('lock-in');
  });

  it('CO-005 objects not reconciling with the issue size', () => {
    const f = broken((x) => { x.offer.objects[0].amount = money('11', 'crores'); });
    expect(fires('CO-005', f)).toBe(true);
    const detail = findingFor('CO-005', f)!.detail;
    // Show the arithmetic, not just the verdict
    expect(detail).toContain('Objects listed');
    expect(detail).toContain('Issue expenses');
    expect(detail).toContain('Issue size');
    expect(detail).toContain('Unaccounted');
  });

  it('CO-006 net tangible assets not tying to net worth', () => {
    expect(fires('CO-006', broken((x) => { x.financials.years[0].intangibleAssets = money('2', 'crores'); }))).toBe(true);
  });

  it('CO-007 market maker reservation not a whole number of lots', () => {
    expect(fires('CO-007', vardhman)).toBe(false);
    expect(fires('CO-007', broken((x) => { x.offer.marketMakerReservationShares = 225001; }))).toBe(true);
  });

  it('CO-008 floor price above cap price', () => {
    expect(fires('CO-008', broken((x) => { x.offer.floorPrice = money('60'); }))).toBe(true);
  });

  it('CO-009 floor price below face value', () => {
    expect(fires('CO-009', broken((x) => { x.offer.floorPrice = money('5'); x.offer.capPrice = money('8'); }))).toBe(true);
  });

  it('CO-010 post-issue shares exceeding authorised capital', () => {
    const f = broken((x) => { x.capital.authorisedShares = 13000000; });
    expect(fires('CO-010', f)).toBe(true);
    expect(findingFor('CO-010', f)!.detail).toContain('shareholder resolution');
  });

  it('CO-011 customer revenue shares over 100%', () => {
    expect(fires('CO-011', broken((x) => { x.business.topCustomers[0].revenueShare = 80; }))).toBe(true);
  });

  it('CO-012 a bonus issue carrying an issue price', () => {
    expect(fires('CO-012', broken((x) => { x.capital.allotments[4].issuePrice = money('10'); }))).toBe(true);
    expect(findingFor('CO-012', broken((x) => { x.capital.allotments[4].issuePrice = money('10'); }))!.severity).toBe('minor');
  });
});

describe('scoring', () => {
  it('caps the score below 50 while any blocker stands', () => {
    // A single blocker among otherwise clean facts must not read as "nearly there"
    const f = broken((x) => { x.company.isPublicLimited = false; });
    const s = summarise(allRules, f);
    expect(s.blockers).toBe(1);
    expect(s.score).toBeLessThan(50);
  });

  it('does not cap the score for major findings alone', () => {
    const f = broken((x) => { x.offer.brlmUnderwritingPercent = 10; });
    const s = summarise(allRules, f);
    expect(s.blockers).toBe(0);
    expect(s.score).toBeGreaterThan(50);
  });
});

describe('assessment over the whole document', () => {
  it('merges document gaps into the findings list', () => {
    const nodes = renderDocument(sectionRegistry, { facts: vardhman });
    const { findings, summary } = assess(vardhman, nodes);
    const completeness = findings.filter((f) => f.category === 'completeness');
    expect(completeness.length).toBeGreaterThan(0);
    expect(completeness.map((f) => f.fix?.factPath)).toContain('riskFactors.summaryOfMaterialFactors');
    expect(summary.blockers).toBe(0);
  });

  it('does not report full readiness while document gaps remain', () => {
    // A rules-only score beside a longer findings list reads as a
    // contradiction. "100 / 100 ready" above three outstanding items tells
    // the issuer something false, and the score is what they look at first.
    const nodes = renderDocument(sectionRegistry, { facts: vardhman });
    const { findings, summary } = assess(vardhman, nodes);
    expect(findings.length).toBeGreaterThan(0);
    expect(summary.score).toBeLessThan(100);
  });

  it('reports full readiness only when nothing is outstanding', () => {
    const { findings, summary } = assess(vardhman, []);
    expect(findings).toHaveLength(0);
    expect(summary.score).toBe(100);
  });

  it('orders findings by severity', () => {
    const f = broken((x) => {
      x.company.isPublicLimited = false;
      x.offer.brlmUnderwritingPercent = 10;
    });
    const { findings } = assess(f);
    const order = findings.map((x) => x.severity);
    expect(order[0]).toBe('blocker');
    expect(order.indexOf('major')).toBeGreaterThan(order.indexOf('blocker'));
  });
});

describe('financial helpers', () => {
  it('computes operating profit excluding other income', () => {
    // FY2026: 4.85 + 0.78 + 1.12 - 0.35 = 6.40
    expect(operatingProfit(vardhman.financials.years[0])).toBe(money('6.40', 'crores'));
  });

  it('computes free cash flow to equity', () => {
    // FY2026: (5.20 - 3.80) + 0 + 1.40 - 0.58 = 2.22
    expect(freeCashFlowToEquity(vardhman.financials.years[0])).toBe(money('2.22', 'crores'));
  });
});
