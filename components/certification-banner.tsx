'use client';

import { useTransition } from 'react';
import { certifyDocument, revokeDocumentCertification } from '@/app/review/actions';
import { ROLE_LABELS, type Role } from '@/lib/review/types';
import { formatTimestamp } from '@/lib/review/timestamp';

export interface CertificationBannerData {
  certified: boolean;
  certifiedBy: Role | null;
  certifiedAt: string | null;
}

/**
 * The MB certification action — the thing that lifts `UNSIGNED DRAFT — NOT
 * FOR FILING` on every export (D35), for real now that S12 exists. Visible
 * and usable regardless of the acting role (the user's "track only" S12
 * decision): nothing here blocks a non-MB role from clicking Certify, the
 * audit log just honestly records who did.
 */
export function CertificationBanner({ data }: { data: CertificationBannerData }) {
  const [pending, startTransition] = useTransition();

  const act = () => {
    startTransition(async () => {
      if (data.certified) await revokeDocumentCertification();
      else await certifyDocument();
    });
  };

  return (
    <div
      className={`flex flex-wrap items-center justify-between gap-3 rounded-lg border p-4 ${
        data.certified
          ? 'border-emerald-300 bg-emerald-50 dark:border-emerald-800 dark:bg-emerald-950/40'
          : 'border-amber-300 bg-amber-50 dark:border-amber-800 dark:bg-amber-950/40'
      }`}
    >
      <div className="text-sm">
        {data.certified ? (
          <>
            <span className="font-medium text-emerald-800 dark:text-emerald-300">Certified</span>
            <span className="text-zinc-600 dark:text-zinc-400">
              {' '}
              by {ROLE_LABELS[data.certifiedBy!]} on {formatTimestamp(data.certifiedAt!)}. The draft
              notice is off on every export.
            </span>
          </>
        ) : (
          <>
            <span className="font-medium text-amber-800 dark:text-amber-300">Not certified</span>
            <span className="text-zinc-600 dark:text-zinc-400">
              {' '}
              — every export prints &ldquo;UNSIGNED DRAFT — NOT FOR FILING&rdquo; until certified.
            </span>
          </>
        )}
      </div>
      <button
        type="button"
        disabled={pending}
        onClick={act}
        className="shrink-0 rounded border border-zinc-300 bg-white px-3 py-1.5 text-sm hover:bg-zinc-50 disabled:opacity-60 dark:border-zinc-700 dark:bg-zinc-900 dark:hover:bg-zinc-800"
      >
        {data.certified ? 'Revoke certification' : 'Certify document'}
      </button>
    </div>
  );
}
