import 'server-only'

import { redirect } from 'next/navigation'

import { getCurrentUser } from './current-user'
import {
  getPostAuthRedirectPath,
  isSafeInternalRedirect,
  type PostAuthRedirectSource,
} from './redirects'

/**
 * Redirects authenticated users away from auth pages (login/register).
 */
export async function redirectIfAuthenticated(
  source: PostAuthRedirectSource,
  callbackUrl?: string | null,
): Promise<void> {
  const user = await getCurrentUser()
  if (!user) return

  const safeCallback = isSafeInternalRedirect(callbackUrl) ? callbackUrl!.trim() : null

  redirect(
    getPostAuthRedirectPath({
      roles: user.roles,
      source,
      fallback: safeCallback,
    }),
  )
}

/**
 * Admin login page: admins → dashboard; customers → landing.
 */
export async function redirectIfAuthenticatedAdminLogin(): Promise<void> {
  const user = await getCurrentUser()
  if (!user) return

  const path = getPostAuthRedirectPath({
    roles: user.roles,
    source: 'admin-login',
  })

  redirect(path)
}
