'use client';

import { useState, useTransition } from 'react';
import { addComment, resolveComment, setSectionStatus } from '@/app/review/actions';
import { sectionAnchor } from '@/lib/anchors';
import { ROLE_LABELS, SECTION_STATUSES, SECTION_STATUS_LABELS, type Role, type SectionStatus } from '@/lib/review/types';
import { formatTimestamp } from '@/lib/review/timestamp';

export interface ReviewCommentData {
  id: string;
  author: Role;
  text: string;
  createdAt: string;
  resolved: boolean;
}

export interface ReviewSectionCardData {
  id: string;
  title: string;
  status: SectionStatus;
  comments: ReviewCommentData[];
}

const STATUS_STYLE: Record<SectionStatus, string> = {
  DRAFT: 'bg-zinc-100 text-zinc-700 ring-zinc-300 dark:bg-zinc-800 dark:text-zinc-300 dark:ring-zinc-700',
  READY_FOR_REVIEW: 'bg-blue-100 text-blue-900 ring-blue-300 dark:bg-blue-950 dark:text-blue-200 dark:ring-blue-800',
  REVIEWED: 'bg-emerald-100 text-emerald-900 ring-emerald-300 dark:bg-emerald-950 dark:text-emerald-200 dark:ring-emerald-800',
  LOCKED: 'bg-purple-100 text-purple-900 ring-purple-300 dark:bg-purple-950 dark:text-purple-200 dark:ring-purple-800',
};

/**
 * One rendered section, in the review workflow: its status in the Draft ->
 * Ready for Review -> Reviewed -> Locked ladder, and its comment thread.
 * Modeled directly on `risk-dismissal-card.tsx` — same `useTransition`,
 * same "action, then let the server action revalidate" shape.
 */
export function ReviewSectionCard({ section }: { section: ReviewSectionCardData }) {
  const [pending, startTransition] = useTransition();
  const [draft, setDraft] = useState('');
  const [commentsOpen, setCommentsOpen] = useState(false);

  const currentIndex = SECTION_STATUSES.indexOf(section.status);

  const moveTo = (status: SectionStatus) => {
    startTransition(async () => {
      await setSectionStatus(section.id, section.title, status);
    });
  };

  const post = () => {
    if (draft.trim().length === 0) return;
    startTransition(async () => {
      await addComment(section.id, section.title, draft);
      setDraft('');
    });
  };

  const toggleResolved = (commentId: string, resolved: boolean) => {
    startTransition(async () => {
      await resolveComment(section.id, section.title, commentId, resolved);
    });
  };

  const openCount = section.comments.filter((c) => !c.resolved).length;

  return (
    <li className="py-3">
      <div className="flex flex-wrap items-center gap-2">
        <span className={`rounded px-1.5 py-0.5 text-[11px] font-medium uppercase tracking-wide ring-1 ${STATUS_STYLE[section.status]}`}>
          {SECTION_STATUS_LABELS[section.status]}
        </span>
        <span className="font-medium">{section.title}</span>
        <a
          href={`/#${sectionAnchor(section.id)}`}
          className="text-xs text-zinc-400 underline decoration-dotted underline-offset-2 hover:text-zinc-700 dark:hover:text-zinc-300"
        >
          view in document
        </a>
      </div>

      <div className="mt-2 flex flex-wrap gap-2">
        {currentIndex > 0 && (
          <button
            type="button"
            disabled={pending}
            onClick={() => moveTo(SECTION_STATUSES[currentIndex - 1])}
            className="rounded border border-zinc-300 bg-white px-2 py-1 text-xs hover:bg-zinc-50 disabled:opacity-60 dark:border-zinc-700 dark:bg-zinc-900 dark:hover:bg-zinc-800"
          >
            &larr; Back to {SECTION_STATUS_LABELS[SECTION_STATUSES[currentIndex - 1]]}
          </button>
        )}
        {currentIndex < SECTION_STATUSES.length - 1 && (
          <button
            type="button"
            disabled={pending}
            onClick={() => moveTo(SECTION_STATUSES[currentIndex + 1])}
            className="rounded border border-zinc-300 bg-white px-2 py-1 text-xs hover:bg-zinc-50 disabled:opacity-60 dark:border-zinc-700 dark:bg-zinc-900 dark:hover:bg-zinc-800"
          >
            Mark {SECTION_STATUS_LABELS[SECTION_STATUSES[currentIndex + 1]]} &rarr;
          </button>
        )}
        <button
          type="button"
          onClick={() => setCommentsOpen((o) => !o)}
          className="rounded border border-zinc-300 bg-white px-2 py-1 text-xs hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:hover:bg-zinc-800"
        >
          {commentsOpen ? 'Hide' : 'Comments'} ({section.comments.length}
          {openCount > 0 ? `, ${openCount} open` : ''})
        </button>
      </div>

      {commentsOpen && (
        <div className="mt-3 space-y-2 border-l-2 border-zinc-200 pl-3 dark:border-zinc-700">
          {section.comments.length === 0 && <p className="text-xs text-zinc-400">No comments yet.</p>}
          {section.comments.map((c) => (
            <div key={c.id} className={`text-xs ${c.resolved ? 'opacity-60' : ''}`}>
              <p>
                <span className="font-medium">{ROLE_LABELS[c.author]}</span>
                <span className="ml-2 text-zinc-400">{formatTimestamp(c.createdAt)}</span>
                {c.resolved && <span className="ml-2 text-zinc-400">(resolved)</span>}
              </p>
              <p className="mt-0.5 text-zinc-700 dark:text-zinc-300">{c.text}</p>
              <button
                type="button"
                disabled={pending}
                onClick={() => toggleResolved(c.id, !c.resolved)}
                className="mt-0.5 text-zinc-400 underline decoration-dotted underline-offset-2 hover:text-zinc-700 disabled:opacity-60 dark:hover:text-zinc-300"
              >
                {c.resolved ? 'Reopen' : 'Mark resolved'}
              </button>
            </div>
          ))}

          <div className="flex gap-2 pt-1">
            <input
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              disabled={pending}
              placeholder="Add a comment"
              className="w-full max-w-sm rounded border border-zinc-300 bg-white px-2 py-1 text-xs outline-none focus:border-zinc-500 disabled:opacity-60 dark:border-zinc-700 dark:bg-zinc-900"
              onKeyDown={(e) => {
                if (e.key === 'Enter') post();
              }}
            />
            <button
              type="button"
              disabled={pending || draft.trim().length === 0}
              onClick={post}
              className="rounded border border-zinc-300 bg-white px-2 py-1 text-xs hover:bg-zinc-50 disabled:opacity-60 dark:border-zinc-700 dark:bg-zinc-900 dark:hover:bg-zinc-800"
            >
              Post
            </button>
          </div>
        </div>
      )}
    </li>
  );
}
