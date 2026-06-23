import { GraphQLRequestError } from '@/src/lib/graphql/errors'

/**
 * Returns true when the GraphQL error indicates missing admin permission.
 */
export function isAdminDashboardForbidden(error: unknown): boolean {
  if (!(error instanceof GraphQLRequestError)) return false
  return error.errors.some((entry) => entry.message.toLowerCase().includes('permiso'))
}

/**
 * User-facing admin dashboard error message (no internal GraphQL details).
 */
export function getAdminDashboardErrorMessage(error: unknown, fallback: string): string {
  if (isAdminDashboardForbidden(error)) {
    return 'No tienes permiso para ver el panel de administración.'
  }
  if (process.env.NODE_ENV === 'development' && error instanceof Error) {
    console.error('[admin-dashboard]', error)
  }
  return fallback
}
