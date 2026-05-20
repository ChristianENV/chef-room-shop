/**
 * User-facing catalog error message (no internal GraphQL details).
 */
export function getCatalogUserErrorMessage(error: unknown, fallback: string): string {
  if (process.env.NODE_ENV === 'development' && error instanceof Error) {
    console.error('[catalog]', error)
  }
  return fallback
}
