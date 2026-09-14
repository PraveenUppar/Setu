import { GapDashboard } from '@/components/gap-dashboard';
import { renderSections } from '@/lib/document/section';
import { sectionRegistry } from '@/lib/document/sections';
import { assess } from '@/lib/rules/document-assess';
import { loadIssuer } from '@/lib/issuer';

/**
 * The gap report, on its own — separated out from the document itself
 * (previously the two were mixed on one page) so "is this ready to file"
 * and "what does the draft actually say" are two different questions with
 * two different pages.
 */

export const dynamic = 'force-dynamic';

export default function GapReportPage() {
  const { facts } = loadIssuer();
  const sections = renderSections(sectionRegistry, { facts });
  const { findings, summary } = assess(facts, sections);

  return (
    <div className="mx-auto max-w-4xl px-8 py-12">
      <p className="text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">
        Gap report
      </p>
      <h1 className="font-heading mt-2 text-2xl font-semibold tracking-tight">
        {facts.company.name}
      </h1>

      <div className="mt-8">
        <GapDashboard findings={findings} summary={summary} />
      </div>
    </div>
  );
}
