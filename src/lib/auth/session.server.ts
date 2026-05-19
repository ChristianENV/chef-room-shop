import 'server-only'

import { getCurrentUser } from '@/src/server/auth/current-user'
import { canAccessAdmin } from '@/src/server/auth/permissions'
import type { CurrentUser } from '@/src/server/auth/types'
import { isAdminAuthEnforced } from '@/src/lib/auth/session'

export { isAdminAuthEnforced }

/**
 * Returns the authenticated user from the session cookie, or null.
 */
export async function getServerSession(): Promise<CurrentUser | null> {
  return getCurrentUser()
}

/**
 * Returns the current user when they have admin access.
 */
export async function getAdminSessionOrNull(): Promise<CurrentUser | null> {
  const user = await getCurrentUser()
  if (!user) return null
  return canAccessAdmin(user) ? user : null
}
