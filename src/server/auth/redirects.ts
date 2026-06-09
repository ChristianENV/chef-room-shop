import { routes } from '@/src/config/routes'

const ADMIN_ROLES = new Set(['ADMIN', 'SUPERADMIN'])

export type PostAuthRedirectSource =
  | 'storefront-login'
  | 'storefront-register'
  | 'admin-login'

/**
 * Returns true when `path` is a safe same-origin relative path (no open redirect).
 */
export function isSafeInternalRedirect(path: string | null | undefined): boolean {
  if (!path || typeof path !== 'string') return false
  const trimmed = path.trim()
  if (!trimmed.startsWith('/')) return false
  if (trimmed.startsWith('//')) return false
  if (/^https?:\/\//i.test(trimmed)) return false
  return true
}

function hasAdminRole(roles: string[]): boolean {
  return roles.some((role) => ADMIN_ROLES.has(role))
}

/**
 * Resolves the post-login/register redirect path from RBAC roles.
 */
export function getPostAuthRedirectPath(input: {
  roles: string[]
  fallback?: string | null
  source?: PostAuthRedirectSource
}): string {
  const { roles, fallback, source = 'storefront-login' } = input
  const safeFallback = isSafeInternalRedirect(fallback) ? fallback!.trim() : null

  if (hasAdminRole(roles)) {
    if (
      source === 'admin-login' &&
      safeFallback &&
      safeFallback.startsWith('/admin')
    ) {
      return safeFallback
    }
    return routes.adminDashboard
  }

  if (source === 'storefront-register' || source === 'storefront-login') {
    return safeFallback ?? routes.home
  }

  if (source === 'admin-login') {
    return routes.home
  }

  return safeFallback ?? routes.home
}
