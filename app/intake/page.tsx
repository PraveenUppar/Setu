import Link from 'next/link';
import { allProgress, moduleRegistry } from '@/lib/modules';
import { readFactBase } from '@/lib/store/fact-store';

/**
 * The module list — the issuer's home page during intake.
 *
 * It answers three questions at a glance: what is left, who should do it, and
 * how long it takes. The time estimates are honest rather than encouraging;
 * M2 really does run to three or four hours, and a promoter who plans for
 * forty minutes and hits hour three stops trusting the tool.
 */

export const dynamic = 'force-dynamic';

const ASSIGNEE: Record<string, string> = {
  PROMOTER: 'Promoter',
  CS: 'Company Secretary',
  CFO: 'Chief Financial Officer',
  LEGAL: 'Legal counsel',
  AUDITOR: 'Auditor',
};

function hoursMinutes(total: number): string {
  const h = Math.floor(total / 60);
  const m = total % 60;
  return h === 0 ? `${m} min` : m === 0 ? `${h} h` : `${h} h ${m} min`;
}

export default function IntakePage() {
  const { facts, version } = readFactBase();
  const progress = allProgress(facts);
  const byId = new Map(progress.map((p) => [p.moduleId, p]));

  const totalApplicable = progress.reduce((n, p) => n + p.applicable, 0);
  const totalAnswered = progress.reduce((n, p) => n + p.answered, 0);

  return (
    <div className="min-h-full bg-zinc-100 dark:bg-zinc-950">
      <header className="border-b border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
        <div className="mx-auto max-w-3xl px-8 py-6">
          <p className="text-xs font-medium uppercase tracking-widest text-zinc-500">Intake</p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight">
            {typeof facts.company?.name === 'string' && facts.company.name
              ? facts.company.name
              : 'Your company'}
          </h1>
          <p className="mt-1 text-sm text-zinc-500">
            {totalAnswered} of {totalApplicable} questions answered
            {version > 0 && ` · version ${version}`}
          </p>
          <p className="mt-4 text-sm">
            <Link href="/" className="underline decoration-dotted underline-offset-2">
              See the draft document
            </Link>
          </p>
        </div>
      </header>

      <main className="mx-auto max-w-3xl space-y-4 px-8 py-10">
        {moduleRegistry.map((m) => {
          const p = byId.get(m.id)!;
          const done = p.answered === p.applicable && p.withIssues === 0;
          return (
            <Link
              key={m.id}
              href={`/intake/${m.id.toLowerCase()}`}
              className={`block rounded-lg border bg-white p-5 shadow-sm transition-colors dark:bg-zinc-900 ${
                p.unlocked
                  ? 'border-zinc-200 hover:border-zinc-400 dark:border-zinc-800 dark:hover:border-zinc-600'
                  : 'border-zinc-200 opacity-60 dark:border-zinc-800'
              }`}
            >
              <div className="flex flex-wrap items-baseline justify-between gap-3">
                <h2 className="font-medium">
                  <span className="mr-2 text-zinc-400">{m.id}</span>
                  {m.title}
                </h2>
                <span
                  className={`text-sm tabular-nums ${
                    done ? 'text-emerald-600 dark:text-emerald-500' : 'text-zinc-500'
                  }`}
                >
                  {done ? 'Complete' : `${p.percent}%`}
                </span>
              </div>

              <p className="mt-1 text-sm text-zinc-500">{m.purpose}</p>

              <dl className="mt-3 flex flex-wrap gap-x-6 gap-y-1 text-xs text-zinc-500">
                <span>
                  <span className="text-zinc-400">For: </span>
                  {ASSIGNEE[m.assignableTo]}
                </span>
                <span>
                  <span className="text-zinc-400">About: </span>
                  {hoursMinutes(m.estimatedMinutes)}
                </span>
                <span>
                  <span className="text-zinc-400">Questions: </span>
                  {p.answered} of {p.applicable}
                </span>
                {p.withIssues > 0 && (
                  <span className="text-amber-700 dark:text-amber-500">
                    {p.withIssues} need attention
                  </span>
                )}
                {!p.unlocked && (
                  <span className="text-zinc-400">Needs {m.dependsOn.join(', ')} first</span>
                )}
              </dl>

              {/* Progress bar, because a percentage alone is easy to skim past. */}
              <div className="mt-3 h-1 w-full overflow-hidden rounded bg-zinc-100 dark:bg-zinc-800">
                <div
                  className={`h-full ${done ? 'bg-emerald-500' : 'bg-zinc-400'}`}
                  style={{ width: `${p.percent}%` }}
                />
              </div>
            </Link>
          );
        })}

        <p className="pt-4 text-xs text-zinc-500">
          Nine further modules follow the same shape: capital and shareholding, promoters, board,
          business, financials, litigation, approvals, the offer, and group companies.
        </p>
      </main>
    </div>
  );
}
