import { DocumentView } from '@/components/document-view';
import { renderDocument, derivedTerms } from '@/lib/document/section';
import { sectionRegistry } from '@/lib/document/sections';
import { collectPlaceholders, estimatePages } from '@/lib/document/nodes';
import { vardhman } from '@/lib/seed/vardhman';

export default function Home() {
  const facts = vardhman;
  const terms = derivedTerms(facts);
  const nodes = renderDocument(sectionRegistry, { facts });

  const gaps = collectPlaceholders(nodes);
  const pages = estimatePages(nodes);

  return (
    <div className="min-h-full bg-zinc-100 dark:bg-zinc-950">
      <header className="border-b border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
        <div className="mx-auto max-w-4xl px-8 py-6">
          <p className="text-xs font-medium uppercase tracking-widest text-zinc-500">
            {terms.documentName}
          </p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight">{facts.company.name}</h1>
          <p className="mt-1 text-sm text-zinc-500">
            {terms.exchangeName} &middot; {facts.offer.issueType === 'BOOK_BUILT' ? 'Book Built' : 'Fixed Price'} {terms.issueWord}
          </p>

          <dl className="mt-5 flex gap-8 text-sm">
            <div>
              <dt className="text-zinc-500">Sections</dt>
              <dd className="mt-0.5 text-lg font-semibold tabular-nums">
                {sectionRegistry.length}
                <span className="ml-1 text-sm font-normal text-zinc-400">of 37</span>
              </dd>
            </div>
            <div>
              <dt className="text-zinc-500">Pages</dt>
              <dd className="mt-0.5 text-lg font-semibold tabular-nums">{pages}</dd>
            </div>
            <div>
              <dt className="text-zinc-500">Open gaps</dt>
              <dd className="mt-0.5 text-lg font-semibold tabular-nums text-amber-600 dark:text-amber-500">
                {gaps.length}
              </dd>
            </div>
          </dl>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-8 py-10">
        <div className="rounded-lg border border-zinc-200 bg-white px-12 py-10 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          <DocumentView nodes={nodes} />
        </div>

        {gaps.length > 0 && (
          <section className="mt-8 rounded-lg border border-amber-200 bg-amber-50 p-6 dark:border-amber-900 dark:bg-amber-950/40">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-amber-900 dark:text-amber-300">
              Gaps in this draft
            </h2>
            <ul className="mt-3 space-y-2 text-sm">
              {gaps.map((gap, i) => (
                <li key={i} className="flex gap-3">
                  <code className="shrink-0 text-xs text-amber-700 dark:text-amber-500">
                    {gap.factPath}
                  </code>
                  <span className="text-zinc-700 dark:text-zinc-300">{gap.ask}</span>
                </li>
              ))}
            </ul>
          </section>
        )}

        <p className="mt-8 text-center text-xs uppercase tracking-widest text-zinc-400">
          Unsigned draft &mdash; not for filing
        </p>
      </main>
    </div>
  );
}
