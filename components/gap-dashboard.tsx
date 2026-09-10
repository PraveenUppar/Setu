import type { Finding, ReadinessSummary, Severity } from '@/lib/rules';

/**
 * The gap dashboard.
 *
 * This is the answer to "why not just use ChatGPT?" — the document is the
 * deliverable, but the list of what is wrong with it, cited and quantified, is
 * the product.
 *
 * Every finding shows four things, per the rule-authoring skill: what is wrong
 * with the actual numbers, which clause requires it, what it holds up, and
 * where to fix it. A first-time issuer needs to see WHY, not be told THAT.
 */

const SEVERITY_STYLE: Record<Severity, { label: string; chip: string; rail: string }> = {
  blocker: {
    label: 'Blocker',
    chip: 'bg-red-100 text-red-900 ring-red-300 dark:bg-red-950 dark:text-red-200 dark:ring-red-800',
    rail: 'border-l-red-500',
  },
  major: {
    label: 'Major',
    chip: 'bg-amber-100 text-amber-900 ring-amber-300 dark:bg-amber-950 dark:text-amber-200 dark:ring-amber-800',
    rail: 'border-l-amber-500',
  },
  minor: {
    label: 'Minor',
    chip: 'bg-zinc-100 text-zinc-700 ring-zinc-300 dark:bg-zinc-800 dark:text-zinc-300 dark:ring-zinc-700',
    rail: 'border-l-zinc-400',
  },
};

function Score({ summary }: { summary: ReadinessSummary }) {
  const blocked = summary.blockers > 0;
  return (
    <div className="flex items-baseline gap-3">
      <span
        className={`text-4xl font-semibold tabular-nums ${
          blocked ? 'text-red-600 dark:text-red-500' : 'text-emerald-600 dark:text-emerald-500'
        }`}
      >
        {summary.score}
      </span>
      <span className="text-sm text-zinc-500">/ 100 ready</span>
      {blocked && (
        <span className="text-sm text-red-600 dark:text-red-500">
          &mdash; cannot file while a blocker stands
        </span>
      )}
    </div>
  );
}

function FindingCard({ finding }: { finding: Finding }) {
  const style = SEVERITY_STYLE[finding.severity];
  return (
    <li className={`border-l-2 ${style.rail} py-3 pl-4`}>
      <div className="flex flex-wrap items-center gap-2">
        <span className={`rounded px-1.5 py-0.5 text-[11px] font-medium uppercase tracking-wide ring-1 ${style.chip}`}>
          {style.label}
        </span>
        <span className="font-medium">{finding.title}</span>
        <code className="text-[11px] text-zinc-400">{finding.ruleId}</code>
      </div>

      {/* Show the arithmetic. Whitespace is meaningful here. */}
      <pre className="mt-2 whitespace-pre-wrap font-sans text-sm leading-relaxed text-zinc-700 dark:text-zinc-300">
        {finding.detail}
      </pre>

      <div className="mt-2 flex flex-wrap gap-x-5 gap-y-1 text-xs text-zinc-500">
        <span>
          <span className="text-zinc-400">Requirement: </span>
          {finding.clause}
        </span>
        {finding.blocks && finding.blocks.length > 0 && (
          <span>
            <span className="text-zinc-400">Holds up: </span>
            {finding.blocks.join(', ')}
          </span>
        )}
        {finding.fix && (
          <span>
            <span className="text-zinc-400">Fix in: </span>
            {finding.fix.action ?? `${finding.fix.module}${finding.fix.factPath ? ` → ${finding.fix.factPath}` : ''}`}
          </span>
        )}
      </div>
    </li>
  );
}

export function GapDashboard({
  findings,
  summary,
}: {
  findings: Finding[];
  summary: ReadinessSummary;
}) {
  const groups: { severity: Severity; items: Finding[] }[] = (
    ['blocker', 'major', 'minor'] as Severity[]
  )
    .map((severity) => ({ severity, items: findings.filter((f) => f.severity === severity) }))
    .filter((g) => g.items.length > 0);

  return (
    <section className="rounded-lg border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="text-sm font-semibold uppercase tracking-wide text-zinc-500">Readiness</h2>
          <div className="mt-1">
            <Score summary={summary} />
          </div>
        </div>

        <dl className="flex gap-6 text-sm">
          {(['blocker', 'major', 'minor'] as Severity[]).map((s) => (
            <div key={s}>
              <dt className="text-zinc-500">{SEVERITY_STYLE[s].label}</dt>
              <dd className="mt-0.5 text-lg font-semibold tabular-nums">
                {findings.filter((f) => f.severity === s).length}
              </dd>
            </div>
          ))}
          <div>
            <dt className="text-zinc-500">Checks passed</dt>
            <dd className="mt-0.5 text-lg font-semibold tabular-nums text-emerald-600 dark:text-emerald-500">
              {summary.passed}
            </dd>
          </div>
          <div>
            {/* Not a pass and not a gap. Showing these as either would mislead. */}
            <dt className="text-zinc-500">Not applicable</dt>
            <dd className="mt-0.5 text-lg font-semibold tabular-nums text-zinc-400">
              {summary.notApplicable}
            </dd>
          </div>
        </dl>
      </div>

      {groups.length === 0 ? (
        <p className="mt-6 text-sm text-emerald-700 dark:text-emerald-400">
          Every applicable check passes. {summary.notApplicable} rules do not govern this issuer.
        </p>
      ) : (
        <div className="mt-6 space-y-6">
          {groups.map((g) => (
            <div key={g.severity}>
              <h3 className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
                {SEVERITY_STYLE[g.severity].label} &middot; {g.items.length}
              </h3>
              <ul className="mt-2 divide-y divide-zinc-100 dark:divide-zinc-800">
                {g.items.map((f) => (
                  <FindingCard key={f.ruleId} finding={f} />
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
