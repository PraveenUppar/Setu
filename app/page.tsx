import Link from 'next/link';
import { DocumentView } from '@/components/document-view';
import { GapDashboard } from '@/components/gap-dashboard';
import { renderSections, flattenSections, derivedTerms } from '@/lib/document/section';
import { sectionRegistry } from '@/lib/document/sections';
import { estimatePages } from '@/lib/document/nodes';
import { assess } from '@/lib/rules/document-assess';
import { loadIssuer } from '@/lib/issuer';
import { readCertification } from '@/lib/store/certification-store';
import { ROLE_LABELS } from '@/lib/review/types';
import { formatTimestamp } from '@/lib/review/timestamp';

export const dynamic = 'force-dynamic';

export default function Home() {
  // One loader for the preview and the export, so they cannot show
  // different issuers. The demo-vs-real decision lives in lib/issuer.ts.
  const { facts, isDemo, version } = loadIssuer();
  const terms = derivedTerms(facts);
  const sections = renderSections(sectionRegistry, { facts });

  const { findings, summary } = assess(facts, sections);
  const pages = estimatePages(flattenSections(sections));
  const certification = readCertification();

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
          <p className="mt-2 text-sm">
            {isDemo ? (
              <>
                <span className="text-zinc-500">Showing the demo issuer. </span>
                <Link href="/intake" className="underline decoration-dotted underline-offset-2">
                  Start with your own company
                </Link>
              </>
            ) : (
              <>
                <span className="text-zinc-500">Your answers, version {version}. </span>
                <Link href="/intake" className="underline decoration-dotted underline-offset-2">
                  Continue filling
                </Link>
              </>
            )}
          </p>
          {/* Plain anchors, not <Link>: these are file downloads, not navigations */}
          <p className="mt-1 text-sm">
            <span className="text-zinc-500">Export: </span>
            <a href="/export/docx" className="underline decoration-dotted underline-offset-2">
              Word
            </a>
            <span className="text-zinc-400"> &middot; </span>
            <a href="/export/pdf" className="underline decoration-dotted underline-offset-2">
              PDF
            </a>
            <span className="text-zinc-400"> &middot; </span>
            <a href="/export/gaps" className="underline decoration-dotted underline-offset-2">
              Gap report (Excel)
            </a>
            <span className="text-zinc-400"> &middot; </span>
            <a href="/export/vault" className="underline decoration-dotted underline-offset-2">
              Vault (zip)
            </a>
            <span className="text-zinc-500"> — all unsigned draft</span>
          </p>
          <p className="mt-1 text-sm">
            <Link href="/review/risks" className="underline decoration-dotted underline-offset-2">
              Review auto-flagged risks
            </Link>
          </p>

          <dl className="mt-5 flex flex-wrap gap-8 text-sm">
            <div>
              {/*
                Count the numbered SUBSECTIONS from the section map, not the
                registry entries. Issue Procedure is one of the 37 and sixteen
                entries in the registry, so counting entries against 37 would
                report roughly four times the real progress.
              */}
              <dt className="text-zinc-500">Subsections</dt>
              <dd className="mt-0.5 text-lg font-semibold tabular-nums">
                {new Set(sections.map((s) => s.partOf)).size}
                <span className="ml-1 text-sm font-normal text-zinc-400">of 37</span>
              </dd>
            </div>
            <div>
              <dt className="text-zinc-500">Drafted parts</dt>
              <dd className="mt-0.5 text-lg font-semibold tabular-nums">{sections.length}</dd>
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
          {certification.certified ? (
            <>
              Certified by {ROLE_LABELS[certification.certifiedBy!]} on{' '}
              {formatTimestamp(certification.certifiedAt!)}
            </>
          ) : (
            <>Unsigned draft &mdash; not for filing</>
          )}
        </p>
      </main>
    </div>
  );
}
