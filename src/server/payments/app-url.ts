import 'server-only'

/**
 * Public app base URL for Conekta redirect URLs.
 */
export function getAppBaseUrl(): string {
  const fromEnv =
    process.env.NEXT_PUBLIC_APP_URL?.trim() ||
    process.env.BETTER_AUTH_URL?.trim() ||
    'http://localhost:3000'
  return fromEnv.replace(/\/$/, '')
}
