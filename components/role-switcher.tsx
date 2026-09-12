'use client';

import { useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { setRole } from '@/app/review/actions';
import { ROLES, ROLE_LABELS, type Role } from '@/lib/review/types';

/**
 * "Acting as" — S12's role switcher, with no real auth behind it (D8's
 * posture, extended). Mounted once in the root layout so it's reachable
 * from every page; changing it writes a cookie (`lib/review/role.ts`) that
 * every server action reads as the actor for the audit log.
 */
export function RoleSwitcher({ current }: { current: Role }) {
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  return (
    <label className="flex items-center gap-2 text-xs text-zinc-500">
      <span className="hidden sm:inline">Acting as</span>
      <select
        value={current}
        disabled={pending}
        onChange={(e) => {
          const role = e.target.value as Role;
          startTransition(async () => {
            await setRole(role);
            router.refresh();
          });
        }}
        className="rounded border border-zinc-300 bg-white px-2 py-1 text-xs font-medium text-zinc-700 outline-none disabled:opacity-60 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300"
      >
        {ROLES.map((role) => (
          <option key={role} value={role}>
            {ROLE_LABELS[role]}
          </option>
        ))}
      </select>
    </label>
  );
}
