'use server';

import { revalidatePath } from 'next/cache';
import { writeDismissal } from '@/lib/store/risk-dismissal-store';
import { appendAudit } from '@/lib/store/audit-log';
import { currentRole } from '@/lib/review/role';

/**
 * The S10 "dismiss-with-reason, logged" action.
 *
 * No real auth (D8) — `dismissedBy` used to be a fixed string
 * (`'merchant-banker'`); S12 gives the app an actual (if unauthenticated)
 * acting-role concept, so this now records whoever the switcher says is
 * acting, same as every S12 action. Reversing a dismissal is
 * `setRiskDismissal(id, false, reason)`, not a delete — the store is
 * append-only (`risk-dismissal-store.ts`) so a reversal is itself a logged
 * event, not an erasure of the first one. Also appends to S12's shared audit
 * log (`lib/store/audit-log.ts`), so "every action" there means every
 * action, not every action except the one review feature that shipped first.
 */
export async function setRiskDismissal(
  id: string,
  dismissed: boolean,
  reason: string,
): Promise<{ ok: boolean; error?: string }> {
  if (dismissed && reason.trim().length === 0) {
    return { ok: false, error: 'A reason is required to exclude a flagged risk from the document.' };
  }

  const actor = await currentRole();
  writeDismissal(id, dismissed, reason.trim(), actor);
  appendAudit({
    actor,
    action: dismissed ? 'dismiss' : 'reinstate',
    detail: `${id}${reason.trim() ? ` — ${reason.trim()}` : ''}`,
  });

  // The document reads dismissal state at render time (risk-factors.ts), and
  // the review page shows the same records — both need to see the write.
  revalidatePath('/review/risks');
  revalidatePath('/');

  return { ok: true };
}
