import Link from 'next/link';
import { readAuditLog } from '@/lib/store/audit-log';
import { ROLE_LABELS } from '@/lib/review/types';
import { formatTimestamp } from '@/lib/review/timestamp';

export const dynamic = 'force-dynamic';

const ACTION_LABELS: Record<string, string> = {
  'section-status': 'Section status changed',
  comment: 'Comment posted',
  'resolve-comment': 'Comment resolved',
  'reopen-comment': 'Comment reopened',
  certify: 'Document certified',
  'revoke-certification': 'Certification revoked',
  dismiss: 'Risk excluded from document',
  reinstate: 'Risk reinstated',
};

/**
 * S12's audit log gate: every review action, with who and when. Reads
 * `lib/store/audit-log.ts` directly — a plain table, no interactivity, since
 * an audit trail's job is to be read, not edited.
 */
export default function AuditLogPage() {
  const entries = readAuditLog();

  return (
    <div className="min-h-full bg-zinc-100 dark:bg-zinc-950">
      <header className="border-b border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
        <div className="mx-auto max-w-4xl px-8 py-6">
          <p className="text-xs font-medium uppercase tracking-widest text-zinc-500">Audit log</p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight">Every review action, in order</h1>
          <p className="mt-2 text-sm text-zinc-500">
            {entries.length} entries, newest first.{' '}
            <Link href="/review" className="underline decoration-dotted underline-offset-2">
              Back to review
            </Link>
            .
          </p>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-8 py-10">
        {entries.length === 0 ? (
          <p className="text-sm text-zinc-500">No review actions recorded yet.</p>
        ) : (
          <div className="overflow-x-auto rounded-lg border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-zinc-200 text-xs uppercase tracking-wide text-zinc-500 dark:border-zinc-800">
                  <th className="px-4 py-2 font-medium">When</th>
                  <th className="px-4 py-2 font-medium">Actor</th>
                  <th className="px-4 py-2 font-medium">Action</th>
                  <th className="px-4 py-2 font-medium">Detail</th>
                </tr>
              </thead>
              <tbody>
                {entries.map((e) => (
                  <tr key={e.id} className="border-b border-zinc-100 last:border-0 dark:border-zinc-800">
                    <td className="whitespace-nowrap px-4 py-2 text-zinc-500">{formatTimestamp(e.at)}</td>
                    <td className="whitespace-nowrap px-4 py-2">{ROLE_LABELS[e.actor] ?? e.actor}</td>
                    <td className="whitespace-nowrap px-4 py-2">{ACTION_LABELS[e.action] ?? e.action}</td>
                    <td className="px-4 py-2 text-zinc-600 dark:text-zinc-400">{e.detail}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  );
}
