'use client';

import { useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DocumentView } from '@/components/document-view';
import type { RenderedSection } from '@/lib/document/section-view';

/**
 * Pages the document by SECTION rather than simulating fixed print-page
 * breaks. A real "one HTML page = one Word page" pagination would need to
 * measure rendered heights in the browser and re-measure on every resize —
 * fragile, and sections vary too much in length for a fixed line count to
 * mean anything (`estimatePages` in lib/document/nodes.ts is explicit that
 * its count is "not for pagination"). One section per page is reliable
 * regardless of how long any single section runs.
 *
 * Always starts on page 1 (matches the server render, avoiding a hydration
 * mismatch) and only jumps to a linked section/placeholder in an effect
 * AFTER mount — a brief flash of page 1 before jumping is the honest
 * trade-off for that.
 */
export function DocumentPager({
  sections,
  anchorToPage,
}: {
  sections: RenderedSection[];
  anchorToPage: Record<string, number>;
}) {
  const [index, setIndex] = useState(0);
  const [pendingScroll, setPendingScroll] = useState<string | null>(null);

  useEffect(() => {
    const jumpToHash = () => {
      const hash = window.location.hash.slice(1);
      if (!hash) return;
      const page = anchorToPage[hash];
      if (page === undefined) return;
      setIndex(page);
      setPendingScroll(hash);
    };
    jumpToHash();
    window.addEventListener('hashchange', jumpToHash);
    return () => window.removeEventListener('hashchange', jumpToHash);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!pendingScroll) return;
    const el = document.getElementById(pendingScroll);
    el?.scrollIntoView({ block: 'start' });
    setPendingScroll(null);
  }, [pendingScroll, index]);

  const section = sections[index];

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border bg-card px-4 py-3">
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={index === 0}
          onClick={() => setIndex((i) => Math.max(0, i - 1))}
        >
          <ChevronLeft className="h-4 w-4" />
          Previous
        </Button>

        <div className="flex min-w-0 items-center gap-2">
          <span className="shrink-0 text-xs text-muted-foreground">
            Page {index + 1} of {sections.length}
          </span>
          <select
            value={index}
            onChange={(e) => setIndex(Number(e.target.value))}
            className="min-w-0 max-w-[16rem] truncate rounded-md border border-input bg-transparent px-2 py-1 text-sm outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/30 sm:max-w-xs"
          >
            {sections.map((s, i) => (
              <option key={s.id} value={i} style={{ backgroundColor: 'var(--popover)', color: 'var(--popover-foreground)' }}>
                {i + 1}. {s.title}
              </option>
            ))}
          </select>
        </div>

        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={index === sections.length - 1}
          onClick={() => setIndex((i) => Math.min(sections.length - 1, i + 1))}
        >
          Next
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      {/* The "paper" — deliberately always light, like a real document or PDF, regardless of the app's own dark theme. */}
      <div className="mt-4 rounded-lg bg-white px-12 py-10 text-black shadow-lg">
        <p className="mb-6 text-xs font-medium uppercase tracking-wide text-zinc-400">
          {section.partOf}
        </p>
        <DocumentView sections={[section]} />
      </div>
    </div>
  );
}
