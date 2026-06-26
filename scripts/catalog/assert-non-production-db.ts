/**
 * Guards destructive catalog scripts — refuses production targets.
 */
import { resolveAppEnvironment } from '../../src/config/app-environment'

const PROD_URL_MARKERS = ['prod', 'production', '/main', 'chefroom.com', 'chef-room.com'] as const

/** Stable error messages for production guard failures (used by scripts and tests). */
export const PRODUCTION_GUARD_ERRORS = {
  missingDatabaseUrl: 'DATABASE_URL is not set.',
  appEnv: 'Refusing to run: APP_ENV=production',
  vercelEnv: 'Refusing to run: VERCEL_ENV=production',
  nodeEnv: 'Refusing to run: NODE_ENV=production',
  resolvedProd: 'Refusing to run: resolved app environment is prod',
} as const

export type NonProductionGuardResult = {
  ok: true
  databaseHost: string
  appEnvironment: string
}

export type NonProductionGuardInput = {
  databaseUrl?: string | null
  nodeEnv?: string | null
  vercelEnv?: string | null
  appEnv?: string | null
}

/**
 * Throws if the current environment appears to target production.
 */
export function assertNonProductionDatabase(
  input: NonProductionGuardInput = {},
): NonProductionGuardResult {
  const databaseUrl = (input.databaseUrl ?? process.env.DATABASE_URL)?.trim()

  if (!databaseUrl) {
    throw new Error(PRODUCTION_GUARD_ERRORS.missingDatabaseUrl)
  }

  const appEnv = input.appEnv ?? process.env.APP_ENV
  if (appEnv?.trim().toLowerCase() === 'production') {
    throw new Error(PRODUCTION_GUARD_ERRORS.appEnv)
  }

  const vercelEnv = input.vercelEnv ?? process.env.VERCEL_ENV
  if (vercelEnv?.trim().toLowerCase() === 'production') {
    throw new Error(PRODUCTION_GUARD_ERRORS.vercelEnv)
  }

  const nodeEnv = input.nodeEnv ?? process.env.NODE_ENV
  if (nodeEnv === 'production') {
    throw new Error(PRODUCTION_GUARD_ERRORS.nodeEnv)
  }

  const appEnvironment = resolveAppEnvironment({
    nodeEnv,
    vercelEnv,
  })
  if (appEnvironment === 'prod') {
    throw new Error(PRODUCTION_GUARD_ERRORS.resolvedProd)
  }

  const lowerUrl = databaseUrl.toLowerCase()
  for (const marker of PROD_URL_MARKERS) {
    if (lowerUrl.includes(marker)) {
      throw new Error(
        `Refusing to run: DATABASE_URL appears to target production (matched "${marker}")`,
      )
    }
  }

  const databaseHost = databaseUrl.includes('@')
    ? (databaseUrl.split('@')[1]?.split('/')[0] ?? '(unknown)')
    : '(unknown)'

  return { ok: true, databaseHost, appEnvironment }
}
