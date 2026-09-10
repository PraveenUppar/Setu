import type { z } from 'zod';
import type { FactPath } from '../facts/provenance';
import type { FactBase, PartialFactBase } from '../facts/schema';
import type { RepeaterColumn } from './repeater-spec';

/**
 * The intake module engine.
 *
 * A MODULE IS DATA, not code (MM2). One renderer walks the spec; modules M1 to
 * M10 are content. The same shape drives the form, the validation, the
 * extraction schema and the "where does this appear" explanation, because they
 * all read the same Zod schema (MM3).
 *
 * The four intake design rules from 02-architecture.md are structural here,
 * not stylistic:
 *
 *   1. Delegate, don't struggle  -> `assignableTo`
 *   2. Ask once                  -> a field is addressed by FactPath, so the
 *                                   company name is typed once and read ~200
 *                                   times
 *   3. Every question explains itself -> `helpText`, `clause`, `feedsInto`
 *   4. Live consistency          -> `validate`
 */

export type FieldType =
  | 'text'
  | 'longtext'
  | 'number'
  | 'currency'
  | 'percent'
  | 'date'
  | 'select'
  | 'boolean'
  /** The repeater. ~60% of all data volume goes through this one type. */
  | 'table';

export interface SelectOption {
  value: string;
  label: string;
}

export interface Field {
  /** Where the answer lands in the fact base. This is what makes "ask once" work. */
  path: FactPath;
  label: string;
  type: FieldType;

  /** Validation, and the extraction schema for S7. One definition, both uses. */
  schema: z.ZodTypeAny;

  /**
   * The "Why we ask" block. Written for someone who has never done this — it
   * explains the disclosure framework while they fill the form, which is the
   * difference between a form and a teacher.
   */
  helpText: string;
  /** Citation from 05-rule-sources.md, shown with the help text. */
  clause?: string;

  /**
   * Section ids this field feeds. Powers "Where this appears", and earns its
   * place three times over: promoter education, the dependency graph, and
   * knowing which sections unblock when a module completes.
   */
  feedsInto: string[];

  /** Hidden until the condition holds. Keeps the form as short as the issuer is simple. */
  showIf?: (facts: PartialFactBase) => boolean;

  /** Hint for the extraction prompt at S7. */
  extractionHint?: string;

  /**
   * Live consistency, checked as the field is filled rather than in week nine
   * of merchant-banker review. Returns messages, empty when fine.
   */
  validate?: (value: unknown, facts: PartialFactBase) => string[];

  placeholder?: string;
  options?: SelectOption[];
  /** Shown after the input — "shares", "years", "% of revenue". */
  suffix?: string;
}

export type Assignee = 'PROMOTER' | 'CS' | 'CFO' | 'LEGAL' | 'AUDITOR';

export interface Module {
  id: string;
  title: string;
  /** Honest estimate, so the promoter can plan who does what and when. */
  estimatedMinutes: number;
  assignableTo: Assignee;
  /** Modules that must be complete first. */
  dependsOn: string[];
  /** Documents worth having to hand before starting. */
  requestsDocuments: string[];
  /** One line on what this module is for, shown on the module list. */
  purpose: string;
  fields: Field[];
}

/**
 * A field as the browser sees it: plain data only.
 *
 * A `Field` carries a Zod schema and two functions, and React Server
 * Components cannot serialise either — passing one to the form is a runtime
 * error, not a type error, which is how it got as far as the browser first
 * time. The split is also the right shape: validation and `showIf` both run on
 * the server, where the schema and the whole fact base already are, so the
 * client has no reason to carry Zod or the section registry.
 */
export interface FieldView {
  path: FactPath;
  label: string;
  type: FieldType;
  helpText: string;
  clause?: string;
  /** Section TITLES, already resolved — the client has no registry. */
  feedsInto: string[];
  placeholder?: string;
  options?: SelectOption[];
  suffix?: string;
  value: unknown;
  issues: string[];
  /** Set for `type: 'table'` — the repeater's columns, as plain data. */
  columns?: RepeaterColumn[];
}

export function toFieldView(
  field: Field,
  value: unknown,
  feedsInto: string[],
  issues: string[],
  columns?: RepeaterColumn[],
): FieldView {
  return {
    path: field.path,
    label: field.label,
    type: field.type,
    helpText: field.helpText,
    clause: field.clause,
    feedsInto,
    placeholder: field.placeholder,
    options: field.options,
    suffix: field.suffix,
    value: value ?? null,
    issues,
    columns,
  };
}

export interface FieldStatus {
  field: Field;
  value: unknown;
  /** Empty means answered and valid. */
  issues: string[];
  answered: boolean;
}

/** How far through a module the issuer is. */
export interface ModuleProgress {
  moduleId: string;
  /** Fields the issuer actually has to answer, after `showIf`. */
  applicable: number;
  answered: number;
  withIssues: number;
  percent: number;
  /** False while a module this one depends on is incomplete. */
  unlocked: boolean;
}

/** Fields that apply to this issuer, after evaluating `showIf`. */
export function applicableFields(module: Module, facts: PartialFactBase): Field[] {
  return module.fields.filter((f) => !f.showIf || f.showIf(facts));
}

/**
 * Whether a value counts as answered.
 *
 * `false` and `0` ARE answers — the commonest bug in a form like this is
 * treating them as blanks, which would ask an issuer with no partly paid
 * shares the same question forever.
 */
export function isAnswered(value: unknown): boolean {
  if (value === undefined || value === null) return false;
  if (typeof value === 'string') return value.trim() !== '';
  if (Array.isArray(value)) return value.length > 0;
  return true;
}

export function fieldStatus(field: Field, facts: PartialFactBase, value: unknown): FieldStatus {
  const answered = isAnswered(value);
  const issues: string[] = [];

  if (answered) {
    const parsed = field.schema.safeParse(value);
    if (!parsed.success) {
      issues.push(...parsed.error.issues.map((i) => i.message));
    }
    if (field.validate) issues.push(...field.validate(value, facts));
  }

  return { field, value, issues, answered };
}

export function moduleProgress(
  module: Module,
  facts: PartialFactBase,
  read: (path: FactPath) => unknown,
  completedModules: Set<string>,
): ModuleProgress {
  const fields = applicableFields(module, facts);
  const statuses = fields.map((f) => fieldStatus(f, facts, read(f.path)));
  const answered = statuses.filter((s) => s.answered && s.issues.length === 0).length;

  return {
    moduleId: module.id,
    applicable: fields.length,
    answered,
    withIssues: statuses.filter((s) => s.issues.length > 0).length,
    percent: fields.length === 0 ? 100 : Math.round((answered / fields.length) * 100),
    unlocked: module.dependsOn.every((d) => completedModules.has(d)),
  };
}

/** A module is complete when every applicable field is answered and valid. */
export function isComplete(progress: ModuleProgress): boolean {
  return progress.answered === progress.applicable && progress.withIssues === 0;
}

export type { FactBase, PartialFactBase };
export type { RepeaterColumn };
