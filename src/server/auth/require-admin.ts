import 'server-only'

import { redirect } from 'next/navigation'
import { routes } from '@/src/config/routes'
import {
  getAdminSessionOrNull,
  isAdminAuthEnforced,
} from '@/src/lib/auth/session.server'
import type { Session } from '@/src/lib/auth/session'

/**
 * Server-side guard for admin route groups.
 * Keeps auth out of UI components — call from layouts, pages, or route handlers only.
 */
export async function requireAdminSession(): Promise<Session | null> {
  if (!isAdminAuthEnforced()) {
    // TODO: remove bypass once JWT / session auth is production-ready
    return null
  }

  const session = await getAdminSessionOrNull()

  if (!session) {
    redirect(routes.adminLogin)
  }

  return session
}
