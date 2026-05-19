import type { RoleSlug } from '@prisma/client'
import { routes } from '@/src/config/routes'

import type { CurrentUser } from './types'

/** Admin panel access roles (DB slugs). */
export const ADMIN_ROLE_SLUGS: RoleSlug[] = ['ADMIN', 'SUPERADMIN']

/** Routes that must stay public (no session required). */
export const ADMIN_PUBLIC_ROUTES = [routes.adminLogin] as const

const ADMIN_PREFIX = '/admin'
const ADMIN_PUBLIC_ROUTE_SET = new Set<string>(ADMIN_PUBLIC_ROUTES)

/**
 * Normalizes pathname (strips trailing slash except for root).
 */
export function normalizePathname(pathname: string): string {
  if (pathname.length > 1 && pathname.endsWith('/')) {
    return pathname.slice(0, -1)
  }
  return pathname
}

export function isAdminPublicPath(pathname: string): boolean {
  const path = normalizePathname(pathname)
  return ADMIN_PUBLIC_ROUTE_SET.has(path)
}

/**
 * All /admin/* routes except /admin/login require auth when enforcement is enabled.
 */
export function isProtectedAdminPath(pathname: string): boolean {
  const path = normalizePathname(pathname)
  if (!path.startsWith(ADMIN_PREFIX)) return false
  if (ADMIN_PUBLIC_ROUTE_SET.has(path)) return false
  return true
}

/**
 * Edge proxy: when enforcement is on, protected admin paths need a session cookie.
 * Role validation happens server-side via {@link requireAdminSession} (no Prisma in Edge).
 */
export function canAccessAdminRoute(
  pathname: string,
  hasSessionCookie: boolean,
): boolean {
  if (!isProtectedAdminPath(pathname)) return true
  return hasSessionCookie
}

/**
 * Returns true if the user has the given permission slug.
 * SUPERADMIN is treated as having all permissions.
 */
export function hasPermission(
  user: CurrentUser,
  permissionKey: string,
): boolean {
  if (user.roles.includes('SUPERADMIN')) return true
  return user.permissions.includes(permissionKey)
}

/**
 * Returns true if the user can access the admin panel (server-side, with RBAC).
 */
export function canAccessAdmin(user: CurrentUser | null | undefined): boolean {
  if (!user) return false
  return user.roles.some((role) => ADMIN_ROLE_SLUGS.includes(role))
}
