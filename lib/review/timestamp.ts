/**
 * A fixed locale and timezone for every activity timestamp rendered in a
 * CLIENT component — comments, certification, risk dismissals.
 *
 * `toLocaleString()` with no arguments formats using the RUNNING
 * ENVIRONMENT's own default locale and timezone, which differs between the
 * Node process that renders the initial HTML and the browser that hydrates
 * it. That is a real hydration mismatch, not a cosmetic one — caught live
 * in this session's own browser verification of `/review`
 * (`certification-banner.tsx`, `review-section-card.tsx`), and it turned out
 * `risk-dismissal-card.tsx` (D58) already had the identical bug, just never
 * exercised in a way that surfaced it. Fixed at the source, once, rather
 * than in each component: pin BOTH locale and timezone so server and
 * client always produce the same string regardless of either one's own
 * settings. IST is also the right fixed zone for an Indian merchant
 * banker's audit trail on its own merits, not only to fix the bug.
 */
export function formatTimestamp(iso: string): string {
  return new Date(iso).toLocaleString('en-IN', {
    timeZone: 'Asia/Kolkata',
    dateStyle: 'medium',
    timeStyle: 'short',
  });
}
