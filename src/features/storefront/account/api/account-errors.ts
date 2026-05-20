import { GraphQLRequestError } from '@/src/lib/graphql/errors'

/**
 * Returns true when the GraphQL error indicates missing authentication.
 */
export function isAccountUnauthenticated(error: unknown): boolean {
  if (!(error instanceof GraphQLRequestError)) return false
  return error.errors.some(
    (entry) =>
      entry.extensions?.code === 'UNAUTHENTICATED' ||
      entry.message.includes('iniciar sesión') ||
      entry.message.toLowerCase().includes('unauthenticated'),
  )
}

/**
 * Returns true when order detail is blocked until email verification.
 */
export function isEmailNotVerifiedError(error: unknown): boolean {
  if (!(error instanceof GraphQLRequestError)) return false
  return error.errors.some(
    (entry) =>
      entry.extensions?.code === 'EMAIL_NOT_VERIFIED' ||
      entry.message.toLowerCase().includes('verifica tu correo'),
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
