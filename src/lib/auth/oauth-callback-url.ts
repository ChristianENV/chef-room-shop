import { routes } from '@/src/config/routes'
import {
  isSafeInternalRedirect,
  type PostAuthRedirectSource,
} from '@/src/server/auth/redirects'

/**
 * Better Auth OAuth redirect target: runs post-sign-in hooks, then forwards to `callbackUrl`.
 */
export function buildSocialOAuthCallbackURL(params: {
  callbackUrl?: string | null
  source: PostAuthRedirectSource
}): string {
  const safeCallback = isSafeInternalRedirect(params.callbackUrl)
    ? params.callbackUrl!.trim()
    : null

  const search = new URLSearchParams()
  search.set('source', params.source)
  if (safeCallback) {
    search.set('callbackUrl', safeCallback)
  }

  return `${routes.authSocialComplete}?${search.toString()}`
}
