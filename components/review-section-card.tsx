'use client';

import { useTransition } from 'react';
import { Check, RotateCcw, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { setSectionStatus } from '@/app/review/actions';
import { sectionAnchor } from '@/lib/anchors';
import type { SectionStatus } from '@/lib/review/types';

export interface ReviewSectionCardData {
  id: string;
  title: string;
  status: SectionStatus;
}

/**
 * One rendered section, in the review workflow — simplified (D-design) to a
 * plain Draft / Reviewed toggle. `SectionStatus` still has four values
 * (READY_FOR_REVIEW, LOCKED included) and the store still accepts any of
 * them — nothing was deleted — this card just no longer offers the other
 * two as a click target, and drops the per-section comment thread entirely.
 */
export function ReviewSectionCard({ section }: { section: ReviewSectionCardData }) {
  const [pending, startTransition] = useTransition();
  const reviewed = section.status === 'REVIEWED';

  const moveTo = (status: SectionStatus) => {
    startTransition(async () => {
      await setSectionStatus(section.id, section.title, status);
    });
  };

  return (
    <li className="flex flex-wrap items-center justify-between gap-3 py-3">
      <div className="flex min-w-0 items-center gap-2">
        <span
          className={`shrink-0 rounded px-1.5 py-0.5 text-[11px] font-medium uppercase tracking-wide ${
            reviewed ? 'bg-emerald-500/10 text-emerald-500' : 'bg-muted text-muted-foreground'
          }`}
        >
          {reviewed ? 'Reviewed' : 'Draft'}
        </span>
        <a
          href={`/document#${sectionAnchor(section.id)}`}
          className="truncate text-sm font-medium text-foreground hover:underline"
        >
          {section.title}
        </a>
        <a
          href={`/document#${sectionAnchor(section.id)}`}
          className="shrink-0 text-muted-foreground hover:text-foreground"
          title="View in document"
        >
          <ExternalLink className="h-3.5 w-3.5" />
        </a>
      </div>

      <Button
        type="button"
        variant="outline"
        size="xs"
        disabled={pending}
        onClick={() => moveTo(reviewed ? 'DRAFT' : 'REVIEWED')}
      >
        {reviewed ? (
          <>
            <RotateCcw className="h-3 w-3" />
            Mark Draft
          </>
        ) : (
          <>
            <Check className="h-3 w-3" />
            Mark Reviewed
          </>
        )}
      </Button>
    </li>
  );
}
