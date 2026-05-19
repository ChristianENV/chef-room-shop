import type { NextRequest } from 'next/server'

/** Better Auth default session cookie name (see better-auth/cookies). */
export const BETTER_AUTH_SESSION_COOKIE = 'better-auth.session_token'

/**
 * When false (default), middleware allows admin access without a session cookie.
 * Set ADMIN_AUTH_ENFORCE=true to require a Better Auth session cookie on protected admin routes.
 */
export function isAdminAuthEnforced(): boolean {
  return process.env.ADMIN_AUTH_ENFORCE === 'true'
}

/**
 * Edge-safe: returns true when Better Auth session cookie is present.
 * Does not validate the session — use {@link getCurrentUser} server-side.
 */
export function hasSessionCookieOnRequest(request: NextRequest): boolean {
  const value = request.cookies.get(BETTER_AUTH_SESSION_COOKIE)?.value
  return Boolean(value && value.length > 0)
}
