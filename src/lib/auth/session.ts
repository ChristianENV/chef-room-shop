import type { NextRequest } from 'next/server'
import type { SessionUser, UserRole } from '@/src/server/auth/permissions'

export const SESSION_COOKIE_NAME = 'chef_room_session'

export type Session = SessionUser

/**
 * When false (default), middleware and server guards allow access so local dev is not blocked.
 * Set ADMIN_AUTH_ENFORCE=true to enable redirects for unauthenticated admin requests.
 */
export function isAdminAuthEnforced(): boolean {
  return process.env.ADMIN_AUTH_ENFORCE === 'true'
}

/**
 * TODO: Read signed JWT / session id from cookie and validate with auth provider.
 * Edge-safe — safe to import from middleware.
 */
export function parseSessionCookie(cookieValue: string | undefined): Session | null {
  if (!cookieValue) return null

  // TODO: verify signature, expiry, and map claims to SessionUser
  // Placeholder: opaque dev token only when enforcement is explicitly enabled
  if (cookieValue === 'dev-admin') {
    return {
      id: 'dev-admin',
      email: 'admin@chefroom.mx',
      role: 'ADMIN',
    }
  }

  return null
}

/** Edge-safe session lookup for middleware. */
export function getSessionFromRequest(request: NextRequest): Session | null {
  const cookieValue = request.cookies.get(SESSION_COOKIE_NAME)?.value
  return parseSessionCookie(cookieValue)
}

/**
 * TODO: Issue httpOnly session cookie after successful login (JWT or session id).
 */
export function buildSessionCookieValue(_session: Session): string {
  // TODO: return signed token from auth provider
  return 'dev-admin'
}

/**
 * TODO: Map external auth profile to application roles (USER | ADMIN | SUPERADMIN).
 */
export function resolveUserRole(_claims: Record<string, unknown>): UserRole {
  // TODO: read role from JWT claims or user record
  return 'USER'
}
