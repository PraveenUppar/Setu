'use server';

import { revalidatePath } from 'next/cache';
import { currentRole, setRoleCookie } from '@/lib/review/role';
import { ROLES, SECTION_STATUS_LABELS, type Role, type SectionStatus } from '@/lib/review/types';
import { appendAudit } from '@/lib/store/audit-log';
import { writeStatus } from '@/lib/store/section-status-store';
import { addComment as storeAddComment, resolveComment as storeResolveComment } from '@/lib/store/comment-store';
import { certify, revokeCertification } from '@/lib/store/certification-store';

/**
 * S12's server actions. Every one reads the acting role from the cookie
 * itself (`currentRole()`) rather than trusting a role passed in from the
 * client, and every one appends to the shared audit log — the point of the
 * log is that it can be trusted to say who did something, which only holds
 * if "who" always comes from the same place the switcher writes to.
 *
 * Per the user's explicit S12 decision: nothing here checks whether the
 * acting role is "allowed" to do this — any role can change any section's
 * status or certify the document. The log makes that honest, it doesn't
 * make it permissioned.
 */

export async function setRole(role: Role): Promise<{ ok: boolean }> {
  if (!ROLES.includes(role)) return { ok: false };
  await setRoleCookie(role);
  revalidatePath('/', 'layout');
  return { ok: true };
}

export async function setSectionStatus(
  sectionId: string,
  sectionTitle: string,
  status: SectionStatus,
): Promise<{ ok: boolean }> {
  const actor = await currentRole();
  writeStatus(sectionId, status, actor);
  appendAudit({
    actor,
    action: 'section-status',
    detail: `${sectionTitle} -> ${SECTION_STATUS_LABELS[status]}`,
  });
  revalidatePath('/review');
  return { ok: true };
}

export async function addComment(
  sectionId: string,
  sectionTitle: string,
  text: string,
): Promise<{ ok: boolean; error?: string }> {
  if (text.trim().length === 0) return { ok: false, error: 'Comment cannot be empty.' };

  const actor = await currentRole();
  storeAddComment(sectionId, actor, text.trim());
  appendAudit({ actor, action: 'comment', detail: `On ${sectionTitle}` });
  revalidatePath('/review');
  return { ok: true };
}

export async function resolveComment(
  sectionId: string,
  sectionTitle: string,
  commentId: string,
  resolved: boolean,
): Promise<{ ok: boolean }> {
  const actor = await currentRole();
  const result = storeResolveComment(sectionId, commentId, resolved);
  if (!result) return { ok: false };
  appendAudit({
    actor,
    action: resolved ? 'resolve-comment' : 'reopen-comment',
    detail: `On ${sectionTitle}`,
  });
  revalidatePath('/review');
  return { ok: true };
}

export async function certifyDocument(): Promise<{ ok: boolean }> {
  const actor = await currentRole();
  certify(actor);
  appendAudit({ actor, action: 'certify', detail: 'Draft notice lifted on all exports' });
  revalidatePath('/review');
  revalidatePath('/');
  return { ok: true };
}

export async function revokeDocumentCertification(): Promise<{ ok: boolean }> {
  const actor = await currentRole();
  revokeCertification(actor);
  appendAudit({ actor, action: 'revoke-certification', detail: 'Draft notice restored on all exports' });
  revalidatePath('/review');
  revalidatePath('/');
  return { ok: true };
}
