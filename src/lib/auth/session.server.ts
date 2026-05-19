import 'server-only'

import { cookies } from 'next/headers'
import {
  type Session,
  isAdminAuthEnforced,
  parseSessionCookie,
  SESSION_COOKIE_NAME,
} from '@/src/lib/auth/session'
import { canAccessAdmin } from '@/src/server/auth/permissions'

/**
 * Server Components / Route Handlers — not for middleware or client components.
 */
export async function getServerSession(): Promise<Session | null> {
  const cookieStore = await cookies()
  const cookieValue = cookieStore.get(SESSION_COOKIE_NAME)?.value
  return parseSessionCookie(cookieValue)
}

/**
 * Returns the session when present; when enforcement is off, returns null without blocking.
 * Use {@link requireAdminSession} in protected admin layouts instead of calling this directly.
 */
export async function getAdminSessionOrNull(): Promise<Session | null> {
  const session = await getServerSession()
  if (!session) return null
  return canAccessAdmin(session.role) ? session : null
}

export { isAdminAuthEnforced }
