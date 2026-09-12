'use client';

import { useState, useTransition } from 'react';
import { setRiskDismissal } from '@/app/review/risks/actions';
import type { RiskCategory } from '@/lib/risk';

export interface RiskDismissalCardData {
  id: string;
  title: string;
  category: RiskCategory;
  materiality: number;
  materialityRank: number;
  totalFired: number;
  groundedIn: string;
  sourceModules: string[];
  detail: string;
  dismissed: boolean;
  storedReason: string;
  dismissedAt: string | null;
}

/**
 * D59 — "why this was flagged": corpus grounding, source module(s) and
 * materiality rank. Review-page-only, deliberately never printed in the
 * document itself (`risk-factors.ts` prints only `detail()`/the drafted
 * paragraph) — an investor reads a disclosure, a reviewer reads why a
 * screening tool raised it, and those are different documents.
 */
function WhyFlagged({ risk }: { risk: RiskDismissalCardData }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="mt-2">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="text-xs text-zinc-500 underline decoration-dotted underline-offset-2 hover:text-zinc-800 dark:hover:text-zinc-200"
      >
        {open ? 'Hide' : 'Why this was flagged'}
      </button>
      {open && (
        <div className="mt-2 rounded border-l-2 border-zinc-300 bg-zinc-50 py-2 pl-3 pr-2 text-xs leading-relaxed text-zinc-600 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-400">
          <p>
            <span className="text-zinc-400">Grounded in: </span>
            {risk.groundedIn}
          </p>
          <p className="mt-2">
            <span className="text-zinc-400">Source module{risk.sourceModules.length > 1 ? 's' : ''}: </span>
            {risk.sourceModules.join(', ')}
          </p>
          <p className="mt-2">
            <span className="text-zinc-400">Materiality rank: </span>
            {risk.materialityRank} of {risk.totalFired} fired risks (value {risk.materiality.toFixed(2)})
          </p>
        </div>
      )}
    </div>
  );
}

/**
 * One risk, with the reviewing merchant banker's call on it (S10's
 * "dismiss-with-reason, logged" gate). A dismissed risk drops out of the
 * printed document (`risk-factors.ts`) but stays visible and reversible here
 * — the review record, not the document, is where a false-positive trigger
 * gets adjudicated.
 */
export function RiskDismissalCard({ risk }: { risk: RiskDismissalCardData }) {
  const [reason, setReason] = useState(risk.dismissed ? risk.storedReason : '');
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const act = (dismissed: boolean) => {
    setError(null);
    startTransition(async () => {
      const result = await setRiskDismissal(risk.id, dismissed, reason);
      if (!result.ok) setError(result.error ?? 'Could not save.');
    });
  };

  return (
    <li className={`rounded-r border-l-2 py-3 pl-4 ${risk.dismissed ? 'border-l-zinc-300 opacity-70 dark:border-l-zinc-700' : 'border-l-amber-500'}`}>
      <div className="flex flex-wrap items-center gap-2">
        <span className="rounded bg-zinc-100 px-1.5 py-0.5 text-[11px] font-medium uppercase tracking-wide text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400">
          {risk.category}
        </span>
        <span className="font-medium">{risk.title}</span>
        <code className="text-[11px] text-zinc-400">{risk.id}</code>
        {risk.dismissed && (
          <span className="rounded bg-zinc-200 px-1.5 py-0.5 text-[11px] font-medium uppercase tracking-wide text-zinc-700 dark:bg-zinc-700 dark:text-zinc-200">
            Excluded from document
          </span>
        )}
      </div>

      <p className="mt-2 text-sm text-zinc-700 dark:text-zinc-300">{risk.detail}</p>
      <WhyFlagged risk={risk} />

      <div className="mt-3 flex flex-wrap items-start gap-3">
        <textarea
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          disabled={pending}
          placeholder="Reason to exclude this from the printed document (required to dismiss)"
          rows={2}
          className="w-full max-w-lg rounded border border-zinc-300 bg-white px-3 py-2 text-sm outline-none focus:border-zinc-500 disabled:opacity-60 dark:border-zinc-700 dark:bg-zinc-900"
        />
        <div className="flex shrink-0 flex-col gap-2">
          {!risk.dismissed ? (
            <button
              type="button"
              disabled={pending}
              onClick={() => act(true)}
              className="rounded border border-zinc-300 bg-white px-3 py-1.5 text-sm hover:bg-zinc-50 disabled:opacity-60 dark:border-zinc-700 dark:bg-zinc-900 dark:hover:bg-zinc-800"
            >
              Exclude from document
            </button>
          ) : (
            <button
              type="button"
              disabled={pending}
              onClick={() => act(false)}
              className="rounded border border-zinc-300 bg-white px-3 py-1.5 text-sm hover:bg-zinc-50 disabled:opacity-60 dark:border-zinc-700 dark:bg-zinc-900 dark:hover:bg-zinc-800"
            >
              Reinstate
            </button>
          )}
        </div>
      </div>

      {error && <p className="mt-2 text-xs text-red-600 dark:text-red-500">{error}</p>}
      {risk.dismissed && risk.dismissedAt && (
        <p className="mt-2 text-xs text-zinc-400">Excluded {new Date(risk.dismissedAt).toLocaleString()}</p>
      )}
    </li>
  );
}
