import 'server-only'

import { headers } from 'next/headers'

import { login, routes } from '@/src/config/routes'
import {
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

export type SocialAuthCompletionResult = {
  redirectTo: string
  clearGuestCookie: boolean
  signOutRequired: boolean
}

function parseSource(value: string | null | undefined): PostAuthRedirectSource {
  if (value && VALID_SOURCES.has(value as PostAuthRedirectSource)) {
    return value as PostAuthRedirectSource
  }
  return 'storefront-login'
}

/**
 * Finishes Google/social OAuth: session, role, guest merge.
 * Cookie mutations must happen in the Route Handler that calls this.
 */
export async function resolveSocialAuthCompletion(params: {
  callbackUrl?: string | null
  source?: string | null
}): Promise<SocialAuthCompletionResult> {
  const source = parseSource(params.source)
  const safeCallback = isSafeInternalRedirect(params.callbackUrl)
    ? params.callbackUrl!.trim()
    : null

  const requestHeaders = await headers()
  const session = await auth.api.getSession({ headers: requestHeaders })

  if (!session?.user?.id) {
    return {
      redirectTo: login({ callbackUrl: safeCallback ?? undefined }),
      clearGuestCookie: false,
      signOutRequired: false,
    }
  }

  let clearGuestCookie = false

  if (source === 'admin-login') {
    const allowed = await userHasAdminAccess(session.user.id)
    if (!allowed) {
      return {
        redirectTo: `${routes.adminLogin}?error=forbidden`,
        clearGuestCookie: false,
        signOutRequired: true,
      }
    }
  } else {
    await ensureCustomerRole(session.user.id)

    const guestSession = await getActiveGuestSessionFromCookies()
    if (guestSession) {
      const result = await mergeGuestSessionIntoUser({
        userId: session.user.id,
        guestSessionId: guestSession.id,
      })

      clearGuestCookie = result.merged && !result.conflict
    }
  }

  const user = await getCurrentUser()
  if (!user) {
    return {
      redirectTo: login({ callbackUrl: safeCallback ?? undefined }),
      clearGuestCookie: false,
      signOutRequired: false,
    }
  }

  return {
    redirectTo: getPostAuthRedirectPath({
      roles: user.roles,
      source,
      fallback: safeCallback,
    }),
    clearGuestCookie,
    signOutRequired: false,
  }
}
