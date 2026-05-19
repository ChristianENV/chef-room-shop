/**
 * Guards demo seed execution — DEV/Neon only, never production.
 */

const PROD_URL_MARKERS = [
  'prod',
  'production',
  '/main',
  'chefroom.com',
  'chef-room.com',
] as const

/**
 * Validates environment before running demo seed. Exits process on failure.
 */
export function assertDemoSeedEnvironment(): void {
  const databaseUrl = process.env.DATABASE_URL?.trim()

  if (!databaseUrl) {
    console.error('Demo seed aborted: DATABASE_URL is not set.')
    process.exit(1)
  }

  if (process.env.NODE_ENV === 'production') {
    console.error('Demo seed aborted: NODE_ENV is production.')
    process.exit(1)
  }

  if (process.env.ALLOW_DEMO_SEED !== 'true') {
    console.error(
      'Demo seed aborted: set ALLOW_DEMO_SEED="true" in .env.local to run.',
    )
    process.exit(1)
  }

  const lowerUrl = databaseUrl.toLowerCase()
  for (const marker of PROD_URL_MARKERS) {
    if (lowerUrl.includes(marker)) {
      console.error(
        `Demo seed aborted: DATABASE_URL appears to target production (matched "${marker}").`,
      )
      process.exit(1)
    }
  }

  if (!process.env.BETTER_AUTH_SECRET?.trim()) {
    console.error(
      'Demo seed aborted: BETTER_AUTH_SECRET is required for Better Auth sign-up.',
    )
    process.exit(1)
  }

  const hostHint = databaseUrl.includes('@')
    ? databaseUrl.split('@')[1]?.split('/')[0]
    : '(unknown host)'
  console.log(`Demo seed environment OK (database host: ${hostHint})`)
}
