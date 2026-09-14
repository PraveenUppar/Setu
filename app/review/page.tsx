import { ReviewSectionCard } from '@/components/review-section-card';
import { renderSections } from '@/lib/document/section';
import { sectionRegistry } from '@/lib/document/sections';
import { loadIssuer } from '@/lib/issuer';
import { readStatus } from '@/lib/store/section-status-store';

export const dynamic = 'force-dynamic';

/**
 * S12's review hub: every rendered section with its status — the general,
 * cross-role counterpart to `/review/risks` (D58's narrow, S10-specific
 * dismissal review, built first and kept as its own page rather than
 * folded in here, per the handoff's own note on the overlap).
 *
 * The certification action lived here too (D35's "lift the UNSIGNED DRAFT
 * notice" control) — dropped from this page by request. `CertificationBanner`,
 * `certifyDocument`/`revokeDocumentCertification` and the certification
 * store are all still there, just unused: with no UI calling them, a
 * document now always exports as an unsigned draft.
 */
export default function ReviewPage() {
  const { facts } = loadIssuer();
  const sections = renderSections(sectionRegistry, { facts });

  const groups = new Map<string, typeof sections>();
  for (const section of sections) {
    const list = groups.get(section.group) ?? [];
    list.push(section);
    groups.set(section.group, list);
  }

  return (
    <div className="mx-auto max-w-4xl px-8 py-12">
      <p className="text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">
        Review
      </p>
      <h1 className="font-heading mt-2 text-2xl font-semibold tracking-tight">
        {facts.company.name}
      </h1>

      <div className="mt-8 space-y-6">
        {[...groups.entries()].map(([group, groupSections]) => (
          <section key={group} className="rounded-lg border border-border bg-card p-5 shadow-sm">
            <h2 className="font-heading text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              {group}
              <span className="ml-1.5 font-normal normal-case text-muted-foreground/70">
                &middot; {groupSections.length}
              </span>
            </h2>
            <ul className="mt-2 divide-y divide-border">
              {groupSections.map((section) => {
                const status = readStatus(section.id);
                return (
                  <ReviewSectionCard
                    key={section.id}
                    section={{
                      id: section.id,
                      title: section.title,
                      status: status.status,
                    }}
                  />
                );
              })}
            </ul>
          </section>
        ))}
      </div>
    </div>
  );
}
