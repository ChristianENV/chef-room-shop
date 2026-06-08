/**
 * Prints masked environment hints for DATABASE_URL verification.
 * Never prints credentials or full connection strings.
 */
import { config } from 'dotenv'
import { resolve } from 'node:path'

config({ path: resolve(process.cwd(), '.env.local') })
config({ path: resolve(process.cwd(), '.env') })

function maskMiddle(value, keepStart = 4, keepEnd = 4) {
  if (value.length <= keepStart + keepEnd) return '*'.repeat(value.length)
  return `${value.slice(0, keepStart)}***${value.slice(-keepEnd)}`
}

function parseDatabaseUrl(raw) {
  if (!raw?.trim()) {
    return { error: 'DATABASE_URL is not set' }
  }

  try {
    const url = new URL(raw)
    const host = url.hostname
    const database = url.pathname.replace(/^\//, '') || '(empty)'
    const user = url.username || '(empty)'

    const prodHints = ['prod', 'production', 'live']
    const stagingHints = ['staging', 'stage', 'stg', 'np', 'nonprod', 'dev', 'preview']

    const haystack = `${host} ${database} ${user}`.toLowerCase()
    const prodMatches = prodHints.filter((hint) => haystack.includes(hint))
    const stagingMatches = stagingHints.filter((hint) => haystack.includes(hint))

    return {
      hostMasked: maskMiddle(host, 6, 12),
      databaseMasked: maskMiddle(database, 3, 2),
      userMasked: maskMiddle(user, 3, 3),
      ssl: url.searchParams.get('sslmode') ?? '(none)',
      prodMatches,
      stagingMatches,
    }
  } catch {
    return { error: 'DATABASE_URL is malformed' }
  }
}

console.log(
  JSON.stringify(
    {
      envLocalLoaded: Boolean(process.env.DATABASE_URL),
      envLocalPath: '.env.local',
      nodeEnv: process.env.NODE_ENV ?? '(not set)',
      conecktaEnv: process.env.CONEKTA_ENV ?? '(not set)',
      emailProvider: process.env.EMAIL_PROVIDER ?? '(not set)',
      allowDemoSeed: process.env.ALLOW_DEMO_SEED ?? '(not set)',
      appUrl: process.env.NEXT_PUBLIC_APP_URL ?? '(not set)',
      database: parseDatabaseUrl(process.env.DATABASE_URL),
    },
    null,
    2,
  ),
)
