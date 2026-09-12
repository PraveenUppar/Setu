/**
 * S12 — shared review-workflow types.
 *
 * Deliberately pure (no `node:fs`, no `next/headers`): `role-switcher.tsx` is
 * a client component and needs `Role`/`ROLES`/`ROLE_LABELS` without dragging
 * in server-only code, the same reason `lib/modules/types.ts` keeps `Field`
 * (server-only: a Zod schema and two functions) separate from `FieldView`
 * (plain data the client can hold).
 */

/**
 * Who is "acting" right now. No real auth (D8's posture, extended here) — a
 * cookie remembers a choice, not a signed-in identity. `MERCHANT_BANKER` is
 * the only one with no module `assignableTo` default (see
 * `lib/modules/types.ts`'s `Assignee`): the MB reviews and certifies, never
 * fills a module.
 */
export type Role = 'PROMOTER' | 'CS' | 'CFO' | 'LEGAL' | 'AUDITOR' | 'MERCHANT_BANKER';

export const ROLES: Role[] = ['PROMOTER', 'CS', 'CFO', 'LEGAL', 'AUDITOR', 'MERCHANT_BANKER'];

export const ROLE_LABELS: Record<Role, string> = {
  PROMOTER: 'Promoter',
  CS: 'Company Secretary',
  CFO: 'Chief Financial Officer',
  LEGAL: 'Legal counsel',
  AUDITOR: 'Auditor',
  MERCHANT_BANKER: 'Merchant Banker',
};

/** Unknown or missing input defaults to Promoter — the coordinator, and the role a first-time visitor is. */
export function parseRole(raw: string | undefined | null): Role {
  return (ROLES as string[]).includes(raw ?? '') ? (raw as Role) : 'PROMOTER';
}

/**
 * A section's place in the review workflow. Independent of the fact base —
 * a section can be Reviewed while its underlying facts keep changing; that
 * mismatch is exactly what a reviewer re-opening it to Draft is for.
 */
export type SectionStatus = 'DRAFT' | 'READY_FOR_REVIEW' | 'REVIEWED' | 'LOCKED';

export const SECTION_STATUSES: SectionStatus[] = ['DRAFT', 'READY_FOR_REVIEW', 'REVIEWED', 'LOCKED'];

export const SECTION_STATUS_LABELS: Record<SectionStatus, string> = {
  DRAFT: 'Draft',
  READY_FOR_REVIEW: 'Ready for review',
  REVIEWED: 'Reviewed',
  LOCKED: 'Locked',
};
