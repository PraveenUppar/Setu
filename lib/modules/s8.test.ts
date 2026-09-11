import { describe, expect, it } from 'vitest';
import { z } from 'zod';
import { sectionRegistry } from '../document/sections';
import { plannedSections } from '../document/sections/planned';
import { getFact } from '../facts/provenance';
import { withAnswers } from '../seed/empty';
import { vardhman } from '../seed/vardhman';
import { allProgress, applicableFields, fieldStatus, m2Capital, m8Approvals, m9Offer, moduleRegistry } from './index';
import { blankRow, parsePaste } from './paste';
import { formatCell, parseCell, type RepeaterColumn } from './repeater-spec';

/**
 * S8 gate — the ten modules, as content against one engine.
 *
 *   every module fillable end to end   -> every field has a schema that its
 *                                          seed value passes, and every table
 *                                          has columns that match its schema
 *   Vardhman completable start to finish -> allProgress reports 100% on all ten
 *   each module's computed sections      -> wave2.test.ts
 */

describe('the ten modules', () => {
  it('are all registered, in dependency order', () => {
    expect(moduleRegistry.map((m) => m.id)).toEqual(['M1', 'M2', 'M3', 'M4', 'M5', 'M6', 'M7', 'M8', 'M9', 'M10']);
    const seen = new Set<string>();
    for (const m of moduleRegistry) {
      for (const dep of m.dependsOn) expect(seen.has(dep), `${m.id} depends on ${dep} before it is listed`).toBe(true);
      seen.add(m.id);
    }
  });

  it('give every field a reason, a destination and a clause where there is one', () => {
    for (const m of moduleRegistry) {
      for (const f of m.fields) {
        expect(f.helpText.length, `${m.id} ${f.path}`).toBeGreaterThan(40);
        expect(f.feedsInto.length, `${m.id} ${f.path}`).toBeGreaterThan(0);
        expect(f.label.length, `${m.id} ${f.path}`).toBeGreaterThan(3);
      }
    }
  });

  it('name destinations that are built or planned, never invented', () => {
    const known = new Set([...sectionRegistry.map((s) => s.id), ...Object.keys(plannedSections)]);
    for (const m of moduleRegistry) {
      for (const f of m.fields) {
        for (const id of f.feedsInto) expect(known.has(id), `${m.id} ${f.path} -> ${id}`).toBe(true);
      }
    }
  });

  it('give every table field columns whose keys exist on its row schema', () => {
    for (const m of moduleRegistry) {
      for (const f of m.fields.filter((f) => f.type === 'table')) {
        expect(f.columns, `${m.id} ${f.path} has no columns`).toBeDefined();
        const element = (f.schema as z.ZodArray<z.ZodObject<z.ZodRawShape>>).element;
        const keys = new Set(Object.keys(element.shape));
        for (const c of f.columns!) expect(keys.has(c.key), `${m.id} ${f.path}: column ${c.key}`).toBe(true);
      }
    }
  });

  it('never ask the same fact path twice across all ten', () => {
    const paths = moduleRegistry.flatMap((m) => m.fields.map((f) => f.path));
    expect(new Set(paths).size).toBe(paths.length);
  });

  it('have honest time estimates that add up to a working week, not an afternoon', () => {
    const total = moduleRegistry.reduce((n, m) => n + m.estimatedMinutes, 0);
    expect(total).toBeGreaterThan(15 * 60);
    expect(total).toBeLessThan(30 * 60);
  });
});

describe('Vardhman, start to finish', () => {
  const progress = allProgress(vardhman);

  /**
   * The seed is a DRHP. Five M9 answers cannot exist at that stage and the
   * document is right to show them as gaps: the anchor escrow account names
   * are whatever the bank opens them as (D28), the expert consents are dated
   * letters not yet in hand, and the banker and market-making agreements are
   * signed before the RHP — Maxwell's DRHP prints both as "[dot]". The gate
   * is therefore "everything else", stated exactly, rather than a seed padded
   * to read as complete.
   */
  const DRHP_UNKNOWNS = [
    'offer.anchorEscrowAccountResident',
    'offer.anchorEscrowAccountNonResident',
    'offer.expertConsents',
    'offer.bankerToIssueAgreementDate',
    'offer.marketMakingAgreementDate',
  ];

  it('completes nine modules outright and M9 but for the DRHP-stage unknowns', () => {
    for (const p of progress) {
      expect(p.withIssues, p.moduleId).toBe(0);
      expect(p.unlocked, p.moduleId).toBe(true);
      if (p.moduleId === 'M9') expect(p.applicable - p.answered).toBe(DRHP_UNKNOWNS.length);
      else expect(p.answered, p.moduleId).toBe(p.applicable);
    }
  });

  it('answers each field with a value its own schema accepts, and leaves only those five', () => {
    const unanswered: string[] = [];
    for (const m of moduleRegistry) {
      for (const f of applicableFields(m, vardhman)) {
        const value = getFact(vardhman, f.path);
        const status = fieldStatus(f, vardhman, value);
        if (!status.answered) unanswered.push(f.path);
        expect(status.issues, `${m.id} ${f.path}`).toEqual([]);
      }
    }
    expect(unanswered.sort()).toEqual([...DRHP_UNKNOWNS].sort());
  });

  it('is a few hundred questions, and a blank issuer has answered none of them', () => {
    const total = progress.reduce((n, p) => n + p.applicable, 0);
    expect(total).toBeGreaterThan(100);
    const blank = allProgress({});
    expect(blank.reduce((n, p) => n + p.answered, 0)).toBe(0);
    // Only M1 is open to a blank issuer; everything else waits on it
    expect(blank.filter((p) => p.unlocked).map((p) => p.moduleId)).toEqual(['M1']);
  });
});

describe('showIf across the new modules', () => {
  it('asks for the in-principle approval and bid dates only past the DRHP', () => {
    const drhp = applicableFields(m9Offer, vardhman).map((f) => f.path);
    expect(drhp).not.toContain('offer.inPrincipleApprovalDate');
    expect(drhp).not.toContain('offer.bidOpeningDate');
    const rhp = applicableFields(m9Offer, { offer: { ...vardhman.offer, documentStage: 'RHP' } }).map((f) => f.path);
    expect(rhp).toContain('offer.inPrincipleApprovalDate');
    expect(rhp).toContain('offer.bidOpeningDate');
  });

  it('asks the BSE six-month question at BSE and the NSE one at NSE', () => {
    const bse = applicableFields(m9Offer, vardhman).map((f) => f.path);
    expect(bse).toContain('offer.exchangeApplicationRejectedSince');
    expect(bse).not.toContain('offer.brlmDraftReturnedSince');
    const nse = applicableFields(m9Offer, { offer: { ...vardhman.offer, exchange: 'NSE_EMERGE' } }).map((f) => f.path);
    expect(nse).toContain('offer.brlmDraftReturnedSince');
    expect(nse).not.toContain('offer.exchangeApplicationRejectedSince');
  });

  it('asks for the firm-finance confirmation only where an object is a project', () => {
    const noProject = { offer: { ...vardhman.offer, objects: vardhman.offer.objects.map((o) => ({ ...o, isProject: false })) } };
    expect(applicableFields(m9Offer, vardhman).map((f) => f.path)).toContain('offer.firmFinanceConfirmed');
    expect(applicableFields(m9Offer, noProject).map((f) => f.path)).not.toContain('offer.firmFinanceConfirmed');
  });

  it('asks for a depository agreement date only once the agreement exists', () => {
    const none = applicableFields(m8Approvals, { capital: { depositoryAgreements: { nsdl: false, cdsl: false } } } as never).map((f) => f.path);
    expect(none).not.toContain('capital.depositoryAgreements.nsdlDate');
    expect(applicableFields(m8Approvals, vardhman).map((f) => f.path)).toContain('capital.depositoryAgreements.nsdlDate');
  });
});

describe('the repeater cell types', () => {
  const money: RepeaterColumn = { key: 'x', label: 'x', type: 'money' };
  const bool: RepeaterColumn = { key: 'x', label: 'x', type: 'boolean' };
  const list: RepeaterColumn = { key: 'x', label: 'x', type: 'list' };

  it('keeps money as a decimal string, never a number', () => {
    expect(parseCell(money, '10')).toBe('10');
    expect(parseCell(money, '1,08,00,000')).toBe('10800000');
    expect(parseCell(money, 'Rs 12.50')).toBe('12.50');
    expect(parseCell(money, '')).toBeUndefined();
    expect(typeof parseCell(money, '49')).toBe('string');
  });

  it('reads yes and no in the forms a spreadsheet exports', () => {
    for (const yes of ['true', 'Yes', 'y', '1']) expect(parseCell(bool, yes)).toBe(true);
    for (const no of ['false', 'No', 'n', '0']) expect(parseCell(bool, no)).toBe(false);
    expect(parseCell(bool, '')).toBeUndefined();
    expect(formatCell(bool, true)).toBe('true');
    expect(formatCell(bool, undefined)).toBe('');
  });

  it('splits and rejoins a list on semicolons', () => {
    expect(parseCell(list, 'A Ltd; B LLP ;; C')).toEqual(['A Ltd', 'B LLP', 'C']);
    expect(parseCell(list, '')).toEqual([]);
    expect(formatCell(list, ['A Ltd', 'B LLP'])).toBe('A Ltd; B LLP');
  });

  it('shapes a blank row by column type', () => {
    expect(blankRow([money, bool, list, { key: 't', label: 't', type: 'text' }])).toEqual({ x: [], t: undefined });
  });

  it('pastes a director row with all three new types intact', () => {
    const columns: RepeaterColumn[] = [
      { key: 'name', label: 'n', type: 'text' },
      { key: 'isIndependent', label: 'i', type: 'boolean' },
      { key: 'otherDirectorships', label: 'o', type: 'list' },
      { key: 'remuneration', label: 'r', type: 'money' },
    ];
    const [row] = parsePaste('Meera Kulkarni\tYes\tA Ltd; B Ltd\t9,00,000', columns)!;
    expect(row).toEqual({ name: 'Meera Kulkarni', isIndependent: true, otherDirectorships: ['A Ltd', 'B Ltd'], remuneration: '900000' });
  });
});

describe('the S5 money bug, fixed', () => {
  it('validates an allotment whose face value was typed into the repeater', () => {
    // Before: the column was numeric, so typing 10 stored 10, and zMoney
    // (a string) rejected it — the row never counted as answered.
    const field = m2Capital.fields.find((f) => f.path === 'capital.allotments')!;
    const column = field.columns!.find((c) => c.key === 'faceValue')!;
    expect(column.type).toBe('money');
    const typed = [
      { date: '2016-04-12', shares: 10000, faceValue: parseCell(column, '10'), issuePrice: parseCell(column, '10'), consideration: 'CASH', nature: 'SUBSCRIPTION_TO_MOA', allottees: 'Promoters' },
    ];
    expect(fieldStatus(field, {}, typed).issues).toEqual([]);
  });

  it('keeps a real issuer separate from the seed after every module is answered', () => {
    const facts = withAnswers({ company: { name: 'Sparse Test Limited' } });
    expect(facts.management.directors).toEqual([]);
    expect(facts.financials.borrowings).toEqual([]);
    expect(facts.legal.litigation).toEqual([]);
  });
});
