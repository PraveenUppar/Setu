import Link from 'next/link';
import { riskArchetypes, selectRisks } from '@/lib/risk';
import { readDismissal } from '@/lib/store/risk-dismissal-store';
import { loadIssuer } from '@/lib/issuer';
import { findModule } from '@/lib/modules';
import { RiskDismissalCard } from '@/components/risk-dismissal-card';

/** "M5" -> "M5 · Business Operations", falling back to the bare id if a module was ever renumbered. */
const moduleLabel = (id: string) => {
  const m = findModule(id);
  return m ? `${id} · ${m.title}` : id;
};

export const dynamic = 'force-dynamic';

/**
 * The review page behind S10's "dismiss-with-reason, logged" gate.
 *
 * Every archetype that FIRES for this issuer is listed here — dismissed or
 * not — because reviewing a false-positive trigger is exactly the workflow
 * the printed Risk Factors section cannot host (it only ever shows what the
 * reviewer stands behind, per `risk-factors.ts`'s D58 note). This page is
 * the diligence-file view; the document is the deliverable view.
 */
export default function RiskReviewPage() {
  const { facts } = loadIssuer();
  const risks = selectRisks(riskArchetypes, facts);

  const cards = risks.map((risk) => {
    const record = readDismissal(risk.id);
    return {
      id: risk.id,
      title: risk.title,
      category: risk.category,
      materiality: risk.materiality,
      materialityRank: risk.materialityRank,
      totalFired: risks.length,
      groundedIn: risk.groundedIn,
      sourceModules: risk.sourceModules.map(moduleLabel),
      detail: risk.detail,
      dismissed: record?.dismissed === true,
      storedReason: record?.reason ?? '',
      dismissedAt: record?.dismissed === true ? record.dismissedAt : null,
    };
  });

  const excludedCount = cards.filter((c) => c.dismissed).length;

  return (
    <div className="min-h-full bg-zinc-100 dark:bg-zinc-950">
      <header className="border-b border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
        <div className="mx-auto max-w-4xl px-8 py-6">
          <p className="text-xs font-medium uppercase tracking-widest text-zinc-500">Risk review</p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight">Auto-flagged risks for {facts.company.name}</h1>
          <p className="mt-2 text-sm text-zinc-500">
            {risks.length} archetype{risks.length === 1 ? '' : 's'} fired against the current facts, {excludedCount} excluded from the
            printed document. <Link href="/" className="underline decoration-dotted underline-offset-2">Back to the document</Link>.
          </p>
        </div>
      </header>

      <main className="mx-auto max-w-4xl space-y-4 px-8 py-10">
        {cards.length === 0 ? (
          <p className="text-sm text-zinc-500">No archetype fires against the current facts.</p>
        ) : (
          <ul className="divide-y divide-zinc-200 rounded-lg border border-zinc-200 bg-white px-6 dark:divide-zinc-800 dark:border-zinc-800 dark:bg-zinc-900">
            {cards.map((risk) => (
              <RiskDismissalCard key={risk.id} risk={risk} />
            ))}
          </ul>
        )}
      </main>
    </div>
  );
}
