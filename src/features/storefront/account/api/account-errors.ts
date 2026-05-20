import { GraphQLRequestError } from '@/src/lib/graphql/errors'

/**
 * Returns true when the GraphQL error indicates missing authentication.
 */
export function isAccountUnauthenticated(error: unknown): boolean {
  if (!(error instanceof GraphQLRequestError)) return false
  return error.errors.some(
    (entry) =>
      entry.message.includes('iniciar sesión') ||
      entry.message.toLowerCase().includes('unauthenticated'),
  )
}

/**
 * User-facing account error message (no internal GraphQL details).
 */
export function getAccountUserErrorMessage(
  error: unknown,
  fallback: string,
): string {
  if (isAccountUnauthenticated(error)) {
    return 'Debes iniciar sesión para ver esta sección.'
  }
  if (process.env.NODE_ENV === 'development' && error instanceof Error) {
    console.error('[account]', error)
  }
  return fallback
}
