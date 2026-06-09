import 'server-only'

import { headers } from 'next/headers'
import { redirect } from 'next/navigation'

import { login, routes } from '@/src/config/routes'
import {
  clearGuestSessionCookie,
  getActiveGuestSessionFromCookies,
} from '@/src/server/guest/guest-session'
import { mergeGuestSessionIntoUser } from '@/src/server/guest/merge-guest-session'

import { auth } from './better-auth'
import { getCurrentUser } from './current-user'
import {
  getPostAuthRedirectPath,
  isSafeInternalRedirect,
  type PostAuthRedirectSource,
} from './redirects'
import { ensureCustomerRole, userHasAdminAccess } from './roles'

const VALID_SOURCES = new Set<PostAuthRedirectSource>([
  'storefront-login',
  'storefront-register',
  'admin-login',
])

function parseSource(value: string | null | undefined): PostAuthRedirectSource {
  if (value && VALID_SOURCES.has(value as PostAuthRedirectSource)) {
    return value as PostAuthRedirectSource
  }
  return 'storefront-login'
}

/**
 * Finishes Google/social OAuth on the server (session cookie is already set)
 * and redirects to the final destination, honoring `callbackUrl`.
 */
export async function completeSocialAuthAndRedirect(params: {
  callbackUrl?: string | null
  source?: string | null
}): Promise<never> {
  const source = parseSource(params.source)
  const safeCallback = isSafeInternalRedirect(params.callbackUrl)
    ? params.callbackUrl!.trim()
    : null

  const requestHeaders = await headers()
  const session = await auth.api.getSession({ headers: requestHeaders })

  if (!session?.user?.id) {
    redirect(login({ callbackUrl: safeCallback ?? undefined }))
  }

  if (source === 'admin-login') {
    const allowed = await userHasAdminAccess(session.user.id)
    if (!allowed) {
      await auth.api.signOut({ headers: requestHeaders })
      redirect(`${routes.adminLogin}?error=forbidden`)
    }
  } else {
    await ensureCustomerRole(session.user.id)

    const guestSession = await getActiveGuestSessionFromCookies()
    if (guestSession) {
      const result = await mergeGuestSessionIntoUser({
        userId: session.user.id,
        guestSessionId: guestSession.id,
      })

      if (result.merged && !result.conflict) {
        await clearGuestSessionCookie()
      }
    }
  }

  const user = await getCurrentUser()
  if (!user) {
    redirect(login({ callbackUrl: safeCallback ?? undefined }))
  }

  redirect(
    getPostAuthRedirectPath({
      roles: user.roles,
      source,
      fallback: safeCallback,
    }),
  )
}
