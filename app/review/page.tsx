import Link from 'next/link';
import { CertificationBanner } from '@/components/certification-banner';
import { ReviewSectionCard } from '@/components/review-section-card';
import { renderSections } from '@/lib/document/section';
import { sectionRegistry } from '@/lib/document/sections';
import { loadIssuer } from '@/lib/issuer';
import { readCertification } from '@/lib/store/certification-store';
import { readStatus } from '@/lib/store/section-status-store';
import { readThread } from '@/lib/store/comment-store';

export const dynamic = 'force-dynamic';

/**
 * S12's review hub: the certification action, and every rendered section
 * with its status and comment thread — the general, cross-role counterpart
 * to `/review/risks` (D58's narrow, S10-specific dismissal review, built
 * first and kept as its own page rather than folded in here, per the
 * handoff's own note on the overlap).
 */
export default function ReviewPage() {
  const { facts } = loadIssuer();
  const sections = renderSections(sectionRegistry, { facts });
  const certification = readCertification();

  const groups = new Map<string, typeof sections>();
  for (const section of sections) {
    const list = groups.get(section.group) ?? [];
    list.push(section);
    groups.set(section.group, list);
  }

  return (
    <div className="min-h-full bg-zinc-100 dark:bg-zinc-950">
      <header className="border-b border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
        <div className="mx-auto max-w-4xl px-8 py-6">
          <p className="text-xs font-medium uppercase tracking-widest text-zinc-500">Review</p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight">{facts.company.name}</h1>
          <p className="mt-2 text-sm text-zinc-500">
            {sections.length} sections drafted.{' '}
            <Link href="/review/risks" className="underline decoration-dotted underline-offset-2">
              Review auto-flagged risks
            </Link>{' '}
            &middot;{' '}
            <Link href="/review/audit" className="underline decoration-dotted underline-offset-2">
              Audit log
            </Link>{' '}
            &middot; <Link href="/" className="underline decoration-dotted underline-offset-2">Back to the document</Link>.
          </p>
        </div>
      </header>

      <main className="mx-auto max-w-4xl space-y-6 px-8 py-10">
        <CertificationBanner data={certification} />

        <div className="space-y-6">
          {[...groups.entries()].map(([group, groupSections]) => (
            <div key={group} className="rounded-lg border border-zinc-200 bg-white px-6 dark:border-zinc-800 dark:bg-zinc-900">
              <h2 className="pt-4 text-xs font-semibold uppercase tracking-wide text-zinc-500">{group}</h2>
              <ul className="divide-y divide-zinc-100 dark:divide-zinc-800">
                {groupSections.map((section) => {
                  const status = readStatus(section.id);
                  const comments = readThread(section.id);
                  return (
                    <ReviewSectionCard
                      key={section.id}
                      section={{
                        id: section.id,
                        title: section.title,
                        status: status.status,
                        comments: comments.map((c) => ({
                          id: c.id,
                          author: c.author,
                          text: c.text,
                          createdAt: c.createdAt,
                          resolved: c.resolved,
                        })),
                      }}
                    />
                  );
                })}
              </ul>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
