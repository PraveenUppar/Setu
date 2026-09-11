import { describe, it, expect } from 'vitest';
import { vardhman } from '../seed/vardhman';
import { materialityThreshold } from '../legal/materiality';
import { money, add } from '../facts/money';
import type { FactBase } from '../facts/schema';
import {
  riskArchetypes,
  selectRisks,
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
} from './index';

/** Deep-ish clone with one branch replaced, same helper as lib/rules/rules.test.ts. */
function variant(mutate: (f: FactBase) => void): FactBase {
  const f = structuredClone(vardhman) as FactBase;
  mutate(f);
  return f;
}

const fires = (id: string, facts: FactBase) => selectRisks(riskArchetypes, facts).some((r) => r.id === id);

describe('the real issuer: Vardhman', () => {
  it('fires customer concentration at its stated 61.3%', () => {
    const risk = selectRisks(riskArchetypes, vardhman).find((r) => r.id === 'customer-concentration');
    expect(risk).toBeDefined();
    expect(risk!.materiality).toBeCloseTo(61.3, 1);
    expect(risk!.detail).toContain('Mahindra & Mahindra Limited');
  });

  it('fires single manufacturing facility, since Vardhman has exactly one', () => {
    expect(fires('single-manufacturing-facility', vardhman)).toBe(true);
  });

  it('does not fire supplier concentration at 31%', () => {
    expect(fires('supplier-concentration', vardhman)).toBe(false);
  });

  it('does not fire high leverage — borrowings sit below net worth', () => {
    expect(fires('high-leverage', vardhman)).toBe(false);
  });

  it('fires material contingent liabilities — Rs 0.90 cr sits above the computed threshold', () => {
    const t = materialityThreshold(vardhman)!;
    expect(Number(vardhman.financials.years[0].contingentLiabilities)).toBeGreaterThan(Number(t.threshold));
    expect(fires('material-contingent-liabilities', vardhman)).toBe(true);
  });

  it('fires material litigation against the company — the Rs 0.34 cr GST claim sits above the same threshold', () => {
    expect(fires('material-litigation-against-company', vardhman)).toBe(true);
  });

  it('sorts by materiality, most material first', () => {
    const risks = selectRisks(riskArchetypes, vardhman);
    for (let i = 1; i < risks.length; i++) {
      expect(risks[i - 1].materiality).toBeGreaterThanOrEqual(risks[i].materiality);
    }
  });
});

describe('customerConcentration', () => {
  it('does not fire at exactly 50%', () => {
    const f = variant((x) => {
      x.business.topCustomers = [{ name: 'Sole Buyer', revenueShare: 50 }];
    });
    expect(fires('customer-concentration', f)).toBe(false);
  });

  it('fires just above 50%', () => {
    const f = variant((x) => {
      x.business.topCustomers = [{ name: 'Sole Buyer', revenueShare: 50.1 }];
    });
    expect(fires('customer-concentration', f)).toBe(true);
  });

  it('does not fire with no customers on file', () => {
    const f = variant((x) => {
      x.business.topCustomers = [];
    });
    expect(fires('customer-concentration', f)).toBe(false);
  });

  it("factSlice carries only the customer data and the company name, not the whole fact base", () => {
    const slice = customerConcentration.factSlice(vardhman) as Record<string, unknown>;
    expect(Object.keys(slice).sort()).toEqual(['companyName', 'topCustomers']);
  });
});

describe('singleManufacturingFacility', () => {
  it('does not fire with two facilities', () => {
    const f = variant((x) => {
      x.business.facilities.push({ ...x.business.facilities[0], name: 'Second unit', location: 'Elsewhere' });
    });
    expect(fires('single-manufacturing-facility', f)).toBe(false);
  });

  it('does not fire with zero facilities on file — nothing to describe yet, not a risk finding', () => {
    const f = variant((x) => {
      x.business.facilities = [];
    });
    expect(fires('single-manufacturing-facility', f)).toBe(false);
  });
});

describe('supplierConcentration', () => {
  it('fires once the top suppliers cross 50% of purchases', () => {
    const f = variant((x) => {
      x.business.topSuppliers = [{ name: 'Sole Supplier', purchaseShare: 55 }];
    });
    expect(fires('supplier-concentration', f)).toBe(true);
  });
});

describe('highLeverage', () => {
  it('fires once borrowings exceed net worth', () => {
    const f = variant((x) => {
      x.financials.years[0].totalBorrowings = money('25', 'crores');
      x.financials.years[0].netWorth = money('19.40', 'crores');
    });
    expect(fires('high-leverage', f)).toBe(true);
    const risk = selectRisks(riskArchetypes, f).find((r) => r.id === 'high-leverage')!;
    expect(risk.detail).toContain('debt-to-equity ratio');
  });

  it('does not fire with no financial years on file', () => {
    const f = variant((x) => {
      x.financials.years = [];
    });
    expect(fires('high-leverage', f)).toBe(false);
  });
});

describe('materialContingentLiabilities', () => {
  it('fires once contingent liabilities exceed the computed threshold', () => {
    const t = materialityThreshold(vardhman)!;
    const f = variant((x) => {
      x.financials.years[0].contingentLiabilities = add(t.threshold, money('1'));
    });
    expect(fires('material-contingent-liabilities', f)).toBe(true);
  });
});

describe('materialLitigationAgainstCompany', () => {
  it('fires once an against-company claim meets the computed threshold', () => {
    const t = materialityThreshold(vardhman)!;
    const f = variant((x) => {
      x.legal.litigation.push({
        party: 'COMPANY',
        partyName: x.company.name,
        direction: 'AGAINST',
        category: 'OTHER_MATERIAL',
        counterparty: 'A material claimant',
        amount: t.threshold,
        status: 'Pending',
        description: 'A material claim, for the fixture.',
      });
    });
    expect(fires('material-litigation-against-company', f)).toBe(true);
  });

  it('does not count litigation the company brought, only litigation against it', () => {
    const t = materialityThreshold(vardhman)!;
    const f = variant((x) => {
      // Remove Vardhman's own qualifying AGAINST claim first, so only the
      // newly pushed BY claim could make the archetype fire.
      x.legal.litigation = x.legal.litigation.filter((l) => !(l.direction === 'AGAINST' && l.amount !== null));
      x.legal.litigation.push({
        party: 'COMPANY',
        partyName: x.company.name,
        direction: 'BY',
        category: 'OTHER_MATERIAL',
        counterparty: 'A defendant',
        amount: add(t.threshold, money('10')),
        status: 'Pending',
        description: 'A material claim brought BY the company, for the fixture.',
      });
    });
    expect(fires('material-litigation-against-company', f)).toBe(false);
  });

  it('does not count an unquantified (null-amount) claim', () => {
    const f = variant((x) => {
      // Drop every quantified AGAINST claim, leaving only the unquantified
      // pollution-control notice — nothing left that could clear the threshold.
      x.legal.litigation = x.legal.litigation.filter((l) => !(l.direction === 'AGAINST' && l.amount !== null));
    });
    expect(fires('material-litigation-against-company', f)).toBe(false);
  });
});

describe('exportRevenueDependency — D46, corpus-corroborated at Om Galaxy #38 and Maxwell #3/#8', () => {
  it('fires on Vardhman at its stated 8.4%, well below a 50% floor', () => {
    const risk = selectRisks(riskArchetypes, vardhman).find((r) => r.id === 'export-revenue-dependency');
    expect(risk).toBeDefined();
    expect(risk!.materiality).toBeCloseTo(8.4, 1);
    expect(risk!.detail).toContain('8.4%');
    expect(risk!.detail).not.toContain('substantial'); // scale wording follows the number
  });

  it('does not fire at zero export revenue', () => {
    const f = variant((x) => {
      x.business.exportRevenueShare = 0;
    });
    expect(fires('export-revenue-dependency', f)).toBe(false);
  });

  it('reads as "substantial" once exports dominate, matching Maxwell\'s ~85% framing', () => {
    const f = variant((x) => {
      x.business.exportRevenueShare = 84.73;
    });
    const risk = selectRisks(riskArchetypes, f).find((r) => r.id === 'export-revenue-dependency')!;
    expect(risk.detail).toContain('substantial portion');
  });
});

describe('leasedFacilities — D46, corpus-corroborated at Om Galaxy #29 and Ideas Electricals', () => {
  it('does not fire on Vardhman — its one facility is owned', () => {
    expect(fires('leased-facilities', vardhman)).toBe(false);
  });

  it('fires once any facility is not owned, independent of facility count', () => {
    const f = variant((x) => {
      x.business.facilities[0].owned = false;
    });
    expect(fires('leased-facilities', f)).toBe(true);
    // Still fires single-manufacturing-facility too — the two signals are independent
    expect(fires('single-manufacturing-facility', f)).toBe(true);
  });

  it('fires when even one of several facilities is leased, not only when all are', () => {
    const f = variant((x) => {
      x.business.facilities.push({ ...x.business.facilities[0], name: 'Leased annex', owned: false });
    });
    expect(fires('leased-facilities', f)).toBe(true);
    // Two facilities now, so the single-facility signal no longer fires
    expect(fires('single-manufacturing-facility', f)).toBe(false);
  });
});

describe('directorsLackListedExperience — D46, corroborated at Om Galaxy #60, Maxwell #52, Ideas Electricals', () => {
  it('fires on Vardhman: 4 of 5 directors lack listed-company experience', () => {
    const risk = selectRisks(riskArchetypes, vardhman).find((r) => r.id === 'directors-lack-listed-experience');
    expect(risk).toBeDefined();
    expect(risk!.detail).toContain('4 of our 5 directors');
  });

  it('does not fire once a majority have listed-company experience', () => {
    const f = variant((x) => {
      x.management.directors.forEach((d, i) => {
        d.hasListedCompanyExperience = i < 3; // 3 of 5, a majority
      });
    });
    expect(fires('directors-lack-listed-experience', f)).toBe(false);
  });

  it('fires at exactly half — the trigger takes the weaker "majority lacks" framing, not "none"', () => {
    const f = variant((x) => {
      // 5 directors: exactly 2 have experience, 3 do not — majority lack it
      x.management.directors.forEach((d, i) => {
        d.hasListedCompanyExperience = i < 2;
      });
    });
    expect(fires('directors-lack-listed-experience', f)).toBe(true);
  });

  it('does not fire with no directors on file', () => {
    const f = variant((x) => {
      x.management.directors = [];
    });
    expect(fires('directors-lack-listed-experience', f)).toBe(false);
  });
});

describe('keyManInsuranceAbsent — D48, corroborated at Om Galaxy and Century (absence), Ideas Electricals (presence)', () => {
  it('fires on Vardhman, which matches the more common corpus pattern of no cover', () => {
    expect(fires('key-man-insurance-absent', vardhman)).toBe(true);
    const risk = selectRisks(riskArchetypes, vardhman).find((r) => r.id === 'key-man-insurance-absent')!;
    expect(risk.detail).toContain('do not maintain key man insurance');
  });

  it('does not fire once the company confirms it holds the cover', () => {
    const f = variant((x) => {
      x.management.hasKeyManInsurance = true;
    });
    expect(fires('key-man-insurance-absent', f)).toBe(false);
  });

  it('factSlice carries only the insurance flag and the company name', () => {
    const slice = keyManInsuranceAbsent.factSlice(vardhman) as Record<string, unknown>;
    expect(Object.keys(slice).sort()).toEqual(['companyName', 'hasKeyManInsurance']);
  });
});

describe('promoterMajorityControl — D49, corroborated at Om Galaxy #56 and Maxwell #44', () => {
  it('fires on Vardhman at ~54.5% post-issue — Promoters + Promoter Group', () => {
    const risk = selectRisks(riskArchetypes, vardhman).find((r) => r.id === 'promoter-majority-control');
    expect(risk).toBeDefined();
    expect(risk!.materiality).toBeCloseTo(54.54, 1);
    expect(risk!.detail).toContain('54.54%');
  });

  it('does not fire at or below 50% — matches the corpus\'s own "majority" framing', () => {
    const f = variant((x) => {
      // Halve the promoter block, add the rest to a public holder, so
      // Promoters + Promoter Group sit under half post-issue.
      x.capital.shareholders = [
        { name: 'Rajesh Vardhman', category: 'PROMOTER', shares: 1000000, isDematerialised: true },
        { name: 'Public Holder', category: 'PUBLIC_INDIVIDUAL', shares: 11000000, isDematerialised: true },
      ];
    });
    expect(fires('promoter-majority-control', f)).toBe(false);
  });

  it('counts PROMOTER_GROUP shares toward the total, not just PROMOTER', () => {
    const f = variant((x) => {
      x.capital.shareholders = [
        { name: 'Promoter', category: 'PROMOTER', shares: 100000, isDematerialised: true },
        { name: 'Group Entity', category: 'PROMOTER_GROUP', shares: 11000000, isDematerialised: true },
      ];
    });
    expect(fires('promoter-majority-control', f)).toBe(true);
  });
});

describe('relatedPartyTransactionsPresent — D49, corroborated at Om Galaxy #22, Century #32, Ideas Electricals #54', () => {
  it('fires on Vardhman, which has related-party transactions on file', () => {
    const risk = selectRisks(riskArchetypes, vardhman).find((r) => r.id === 'related-party-transactions-present');
    expect(risk).toBeDefined();
    expect(risk!.materiality).toBeCloseTo(4.36, 1);
    expect(risk!.detail).toContain('4.36%');
  });

  it('does not fire with no related parties on file', () => {
    const f = variant((x) => {
      x.groupCompanies.relatedParties = [];
      x.groupCompanies.relatedPartyTransactions = [];
    });
    expect(fires('related-party-transactions-present', f)).toBe(false);
  });
});

describe('statutoryDuesDefaultHistory — D52, corroborated at Om Galaxy #21, Maxwell #10/#15, Photonics Watertech #16', () => {
  it('does not fire on Vardhman, whose statutoryDuesDefaults is null', () => {
    expect(fires('statutory-dues-default-history', vardhman)).toBe(false);
  });

  it('fires once a default is stated, with the particulars in the detail sentence', () => {
    const f = variant((x) => {
      x.legal.statutoryDuesDefaults = 'Delayed deposit of TDS for Q3 FY2025, since regularised with interest.';
    });
    expect(fires('statutory-dues-default-history', f)).toBe(true);
    const risk = selectRisks(riskArchetypes, f).find((r) => r.id === 'statutory-dues-default-history')!;
    expect(risk.detail).toContain('Delayed deposit of TDS');
  });
});

describe('promoterPersonalGuarantees — D53, corroborated at Om Galaxy #26, Photonics Watertech #17, Shakti Polytarp #35', () => {
  it('fires on Vardhman: 2 of 5 facilities (term loan + cash credit) carry a personal guarantee', () => {
    const risk = selectRisks(riskArchetypes, vardhman).find((r) => r.id === 'promoter-personal-guarantees');
    expect(risk).toBeDefined();
    expect(risk!.materiality).toBe(2);
    expect(risk!.detail).toContain('2 of our borrowing facilities');
    // 4.20 cr + 2.65 cr outstanding on the two guaranteed facilities, formatted, not a raw rupee integer
    expect(risk!.detail).toContain('Rs 6.85 Crores');
  });

  it('does not fire once no facility carries a personal guarantee', () => {
    const f = variant((x) => {
      x.financials.borrowings.forEach((b) => {
        b.personalGuaranteeByPromoter = false;
      });
    });
    expect(fires('promoter-personal-guarantees', f)).toBe(false);
  });

  it('factSlice lists only the guaranteed facilities, not every borrowing', () => {
    const slice = promoterPersonalGuarantees.factSlice(vardhman) as { guaranteedBorrowings: unknown[] };
    expect(slice.guaranteedBorrowings).toHaveLength(2);
  });
});

describe('geographicRevenueConcentration — D54, corroborated at Maxwell, Shakti Polytarp #11, Axiom Gas #5', () => {
  it('fires on Vardhman at its stated 64.5% (Maharashtra)', () => {
    const risk = selectRisks(riskArchetypes, vardhman).find((r) => r.id === 'geographic-revenue-concentration');
    expect(risk).toBeDefined();
    expect(risk!.materiality).toBeCloseTo(64.5, 1);
    expect(risk!.detail).toContain('the State of Maharashtra');
  });

  it('does not fire with no primary-market fact on file', () => {
    const f = variant((x) => {
      x.business.primaryMarketDescription = undefined;
      x.business.primaryMarketRevenueSharePercent = undefined;
    });
    expect(fires('geographic-revenue-concentration', f)).toBe(false);
  });

  it('does not fire at exactly 50%, matching the "majority" framing the trigger is grounded in', () => {
    const f = variant((x) => {
      x.business.primaryMarketDescription = 'the State of Maharashtra';
      x.business.primaryMarketRevenueSharePercent = 50;
    });
    expect(fires('geographic-revenue-concentration', f)).toBe(false);
  });

  it('fires just above 50%, with the state and figure in the detail sentence', () => {
    const f = variant((x) => {
      x.business.primaryMarketDescription = 'the State of Maharashtra';
      x.business.primaryMarketRevenueSharePercent = 67.5;
    });
    expect(fires('geographic-revenue-concentration', f)).toBe(true);
    const risk = selectRisks(riskArchetypes, f).find((r) => r.id === 'geographic-revenue-concentration')!;
    expect(risk.detail).toContain('67.5%');
    expect(risk.detail).toContain('the State of Maharashtra');
    expect(risk.factSlice).toEqual(geographicRevenueConcentration.factSlice(f));
  });
});
