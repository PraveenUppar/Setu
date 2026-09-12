import { cookies } from 'next/headers';
import { parseRole, type Role } from './types';

/**
 * The acting role for this request, server-only (`next/headers`).
 *
 * Every write action in the review workflow calls this itself rather than
 * accepting a role as a function argument from the client — the switcher is
 * the only thing that writes the cookie, so an action reading it here gets
 * whatever was actually chosen, not whatever a stale client render believed.
 * Nothing enforces this role against what the action is allowed to do (the
 * user's explicit "track only" decision for S12): it exists so the audit log
 * can honestly say who, not to gate what.
 */
const ROLE_COOKIE = 'setu-role';

export async function currentRole(): Promise<Role> {
  const store = await cookies();
  return parseRole(store.get(ROLE_COOKIE)?.value);
}

export async function setRoleCookie(role: Role): Promise<void> {
  const store = await cookies();
  store.set(ROLE_COOKIE, role, { path: '/', sameSite: 'lax' });
}
