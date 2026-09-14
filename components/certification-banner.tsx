'use client';

import { useTransition } from 'react';
import { ShieldCheck, ShieldAlert } from 'lucide-react';
import { Button } from '@/components/ui/button';
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
        data.certified ? 'border-emerald-500/30 bg-emerald-500/5' : 'border-amber-500/30 bg-amber-500/5'
      }`}
    >
      <div className="flex items-start gap-2.5 text-sm">
        {data.certified ? (
          <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
        ) : (
          <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" />
        )}
        <p>
          {data.certified ? (
            <>
              <span className="font-medium text-emerald-500">Certified</span>
              <span className="text-muted-foreground">
                {' '}
                by {ROLE_LABELS[data.certifiedBy!]} on {formatTimestamp(data.certifiedAt!)}
              </span>
            </>
          ) : (
            <span className="font-medium text-amber-500">Not certified</span>
          )}
        </p>
      </div>
      <Button type="button" variant="outline" size="sm" disabled={pending} onClick={act}>
        {data.certified ? 'Revoke certification' : 'Certify document'}
      </Button>
    </div>
  );
}
