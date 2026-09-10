import { DocumentView } from '@/components/document-view';
import { GapDashboard } from '@/components/gap-dashboard';
import { renderSections, flattenSections, derivedTerms } from '@/lib/document/section';
import { sectionRegistry } from '@/lib/document/sections';
import { estimatePages } from '@/lib/document/nodes';
import { assess } from '@/lib/rules';
import { vardhman } from '@/lib/seed/vardhman';

export default function Home() {
  const facts = vardhman;
  const terms = derivedTerms(facts);
  const sections = renderSections(sectionRegistry, { facts });

  const { findings, summary } = assess(facts, sections);
  const pages = estimatePages(flattenSections(sections));

  return (
    <div className="min-h-full bg-zinc-100 dark:bg-zinc-950">
      <header className="border-b border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
        <div className="mx-auto max-w-4xl px-8 py-6">
          <p className="text-xs font-medium uppercase tracking-widest text-zinc-500">
            {terms.documentName}
          </p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight">{facts.company.name}</h1>
          <p className="mt-1 text-sm text-zinc-500">
            {terms.exchangeName} &middot;{' '}
            {facts.offer.issueType === 'BOOK_BUILT' ? 'Book Built' : 'Fixed Price'} {terms.issueWord}
          </p>

          <dl className="mt-5 flex flex-wrap gap-8 text-sm">
            <div>
              <dt className="text-zinc-500">Sections</dt>
              <dd className="mt-0.5 text-lg font-semibold tabular-nums">
                {sections.length}
                <span className="ml-1 text-sm font-normal text-zinc-400">of 37</span>
              </dd>
            </div>
            <div>
              <dt className="text-zinc-500">Pages</dt>
              <dd className="mt-0.5 text-lg font-semibold tabular-nums">{pages}</dd>
            </div>
            <div>
              <dt className="text-zinc-500">Findings</dt>
              <dd className="mt-0.5 text-lg font-semibold tabular-nums text-amber-600 dark:text-amber-500">
                {findings.length}
              </dd>
            </div>
            <div>
              <dt className="text-zinc-500">Readiness</dt>
              <dd
                className={`mt-0.5 text-lg font-semibold tabular-nums ${
                  summary.blockers > 0
                    ? 'text-red-600 dark:text-red-500'
                    : 'text-emerald-600 dark:text-emerald-500'
                }`}
              >
                {summary.score}
                <span className="ml-1 text-sm font-normal text-zinc-400">/ 100</span>
              </dd>
            </div>
          </dl>
        </div>
      </header>

      <main className="mx-auto max-w-4xl space-y-8 px-8 py-10">
        <GapDashboard findings={findings} summary={summary} />

        <div className="rounded-lg border border-zinc-200 bg-white px-12 py-10 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          <DocumentView sections={sections} />
        </div>

        <p className="text-center text-xs uppercase tracking-widest text-zinc-400">
          Unsigned draft &mdash; not for filing
        </p>
      </main>
    </div>
  );
}
