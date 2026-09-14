import { XCircle, AlertTriangle, Info } from 'lucide-react';
import { findingAnchor } from '@/lib/anchors';
import type { Finding, ReadinessSummary, Severity } from '@/lib/rules';

/**
 * The gap dashboard.
 *
 * This is the answer to "why not just use ChatGPT?" — the document is the
 * deliverable, but the list of what is wrong with it, cited and quantified, is
 * the product.
 *
 * Kept deliberately spare: severity (by icon and group, not a badge repeated
 * on every card), what is wrong, and the one clause it cites. "Holds up" and
 * "Fix in" are real data on `Finding` (still used elsewhere, e.g. the
 * document's placeholder tooltips) but are not shown here — on 15 findings
 * that mostly cite the same clause, three more lines of metadata per card
 * added noise without adding anything a first-time reader needed.
 */

const SEVERITY_STYLE: Record<Severity, { label: string; color: string; icon: typeof XCircle }> = {
  blocker: { label: 'Blocker', color: 'text-red-500', icon: XCircle },
  major: { label: 'Major', color: 'text-amber-500', icon: AlertTriangle },
  minor: { label: 'Minor', color: 'text-muted-foreground', icon: Info },
};

function FindingCard({ finding, index }: { finding: Finding; index: number }) {
  return (
    <li
      // The target of the link on every placeholder this finding covers.
      id={findingAnchor(finding.ruleId)}
      className="scroll-mt-6 py-4 target:bg-amber-500/10"
    >
      <div className="flex items-start gap-3">
        <span className="shrink-0 text-sm font-semibold tabular-nums text-foreground">
          {index + 1}.
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium leading-snug text-foreground">{finding.title}</p>

          {/* Show the arithmetic. Whitespace is meaningful here. */}
          <pre className="mt-1.5 whitespace-pre-wrap font-sans text-sm leading-relaxed text-muted-foreground">
            {finding.detail}
          </pre>

          <p className="mt-2 text-xs text-muted-foreground/60">
            {finding.clause} &middot; <code>{finding.ruleId}</code>
          </p>
        </div>
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
    <div className="space-y-6">
      {groups.length === 0 ? (
        <section className="rounded-lg border border-emerald-500/30 bg-emerald-500/5 p-6">
          <p className="text-sm text-emerald-500">
            Every applicable check passes. {summary.notApplicable} rules do not govern this issuer.
          </p>
        </section>
      ) : (
        groups.map((g) => {
          const Icon = SEVERITY_STYLE[g.severity].icon;
          return (
            <section key={g.severity} className="rounded-lg border border-border bg-card p-6 shadow-sm">
              <h3 className={`font-heading flex items-center gap-1.5 text-sm font-semibold ${SEVERITY_STYLE[g.severity].color}`}>
                <Icon className="h-4 w-4" />
                <span className="text-foreground">{SEVERITY_STYLE[g.severity].label}</span>
                <span className="font-normal text-muted-foreground">&middot; {g.items.length}</span>
              </h3>
              <ul className="mt-1 divide-y divide-border">
                {g.items.map((f, i) => (
                  <FindingCard key={f.ruleId} finding={f} index={i} />
                ))}
              </ul>
            </section>
          );
        })
      )}
    </div>
  );
}
