'use client';

import { useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { User, Briefcase, Landmark, Gavel, type LucideIcon } from 'lucide-react';
import { setRole } from '@/app/review/actions';
import { ROLES, ROLE_LABELS, type Role } from '@/lib/review/types';

const ROLE_ICONS: Partial<Record<Role, LucideIcon>> = {
  PROMOTER: User,
  CS: Briefcase,
  CFO: Landmark,
  LEGAL: Gavel,
};

/**
 * The role picker — S12's "acting as" switcher, moved here from the
 * sidebar (D-design) so choosing who you are and seeing that person's
 * modules happen in one place, in one glance, instead of a dropdown
 * somewhere else changing a list somewhere else. Same mechanism as the
 * old `RoleSwitcher`: write the cookie, then refresh so the server
 * component re-scopes the module list below.
 *
 * Only roles with at least one assigned module are offered — Auditor and
 * Merchant Banker never fill an intake module (they review and certify
 * elsewhere), so showing them here would be a dead end.
 */
export function RolePicker({
  current,
  counts,
}: {
  current: Role;
  counts: Record<Role, number>;
}) {
  const [pending, startTransition] = useTransition();
  const router = useRouter();
  const fillableRoles = ROLES.filter((r) => (counts[r] ?? 0) > 0);

  return (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
      {fillableRoles.map((role) => {
        const Icon = ROLE_ICONS[role] ?? User;
        const active = role === current;
        const count = counts[role] ?? 0;
        return (
          <button
            key={role}
            type="button"
            disabled={pending}
            onClick={() => {
              if (role === current) return;
              startTransition(async () => {
                await setRole(role);
                router.refresh();
              });
            }}
            className={`flex flex-col items-center gap-2 rounded-lg border p-4 text-center transition-colors disabled:opacity-60 ${
              active
                ? 'border-primary bg-primary/10'
                : 'border-border bg-card hover:border-foreground/30'
            }`}
          >
            <span
              className={`flex h-9 w-9 items-center justify-center rounded-md ${
                active ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
              }`}
            >
              <Icon className="h-4.5 w-4.5" />
            </span>
            <span className="font-heading text-sm font-semibold">{ROLE_LABELS[role]}</span>
            <span className="text-[11px] text-muted-foreground">
              {count} module{count === 1 ? '' : 's'}
            </span>
          </button>
        );
      })}
    </div>
  );
}
