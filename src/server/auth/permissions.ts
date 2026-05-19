import { routes } from '@/src/config/routes'

/**
 * Application roles.
 * TODO: Align with backend / GraphQL role claims once auth is integrated.
 */
export type UserRole = 'USER' | 'ADMIN' | 'SUPERADMIN'

export type SessionUser = {
  id: string
  email: string
  role: UserRole
}

/** Admin routes that require an authenticated ADMIN or SUPERADMIN session. */
export const PROTECTED_ADMIN_ROUTES = [
  routes.adminDashboard,
  routes.adminProducts,
  routes.adminOrders,
  routes.adminCustomization,
  routes.adminAnalytics,
] as const

export type ProtectedAdminRoute = (typeof PROTECTED_ADMIN_ROUTES)[number]

/** Routes that must stay public (no session required). */
export const ADMIN_PUBLIC_ROUTES = [routes.adminLogin] as const

const PROTECTED_ADMIN_ROUTE_SET = new Set<string>(PROTECTED_ADMIN_ROUTES)
const ADMIN_PUBLIC_ROUTE_SET = new Set<string>(ADMIN_PUBLIC_ROUTES)

/** Normalizes pathname (strips trailing slash except for root). */
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

export function isProtectedAdminPath(pathname: string): boolean {
  const path = normalizePathname(pathname)
  if (ADMIN_PUBLIC_ROUTE_SET.has(path)) return false
  return PROTECTED_ADMIN_ROUTE_SET.has(path)
}

/**
 * TODO: Replace with provider-specific role checks (JWT claims, session DB, etc.).
 */
export function canAccessAdmin(role: UserRole | null | undefined): boolean {
  if (!role) return false
  return role === 'ADMIN' || role === 'SUPERADMIN'
}

/**
 * TODO: Enforce per-route policies when SUPERADMIN-only areas are introduced.
 */
export function canAccessAdminRoute(
  pathname: string,
  role: UserRole | null | undefined
): boolean {
  if (!isProtectedAdminPath(pathname)) return true
  return canAccessAdmin(role)
}

/**
 * TODO: Implement hierarchical role checks (e.g. SUPERADMIN > ADMIN > USER).
 */
export function hasMinimumRole(
  role: UserRole | null | undefined,
  minimum: UserRole
): boolean {
  if (!role) return false

  const rank: Record<UserRole, number> = {
    USER: 0,
    ADMIN: 1,
    SUPERADMIN: 2,
  }

  return rank[role] >= rank[minimum]
}
