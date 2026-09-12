'use server';

import { revalidatePath } from 'next/cache';
import { writeDismissal } from '@/lib/store/risk-dismissal-store';

/**
 * The S10 "dismiss-with-reason, logged" action.
 *
 * No real auth (D8) — `dismissedBy` is a fixed string rather than a signed-in
 * identity, the same posture `writeFacts` takes with `'issuer'`. Reversing a
 * dismissal is `setRiskDismissal(id, false, reason)`, not a delete — the
 * store is append-only (`risk-dismissal-store.ts`) so a reversal is itself a
 * logged event, not an erasure of the first one.
 */
export async function setRiskDismissal(
  id: string,
  dismissed: boolean,
  reason: string,
): Promise<{ ok: boolean; error?: string }> {
  if (dismissed && reason.trim().length === 0) {
    return { ok: false, error: 'A reason is required to exclude a flagged risk from the document.' };
  }

  writeDismissal(id, dismissed, reason.trim(), 'merchant-banker');

  // The document reads dismissal state at render time (risk-factors.ts), and
  // the review page shows the same records — both need to see the write.
  revalidatePath('/review/risks');
  revalidatePath('/');

  return { ok: true };
}
