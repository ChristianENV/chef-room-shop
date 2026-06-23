export type AppEnvironment = 'local' | 'np' | 'prod'

export type AppEnvironmentResolutionInput = {
  nodeEnv?: string | null
  vercelEnv?: string | null
  railwayEnvironment?: string | null
}

/**
 * Resolves Chef Room deployment tier (local / np / prod) from existing env signals.
 *
 * - Local: `NODE_ENV=development` or `test` (typical `.env.local`)
 * - NP: platform preview/staging signals (`VERCEL_ENV=preview`, Railway np/staging, …)
 * - Prod: platform production signals, or `NODE_ENV=production` when no staging signal
 */
export function resolveAppEnvironment(input: AppEnvironmentResolutionInput = {}): AppEnvironment {
  const vercel = (input.vercelEnv ?? process.env.VERCEL_ENV)?.trim().toLowerCase()
  if (vercel === 'production') return 'prod'
  if (vercel === 'preview') return 'np'
  if (vercel === 'development') return 'local'

  const railway = (input.railwayEnvironment ?? process.env.RAILWAY_ENVIRONMENT)
    ?.trim()
    .toLowerCase()
  if (railway) {
    if (railway === 'production' || railway === 'prod') return 'prod'
    if (
      railway.includes('np') ||
      railway.includes('staging') ||
      railway.includes('preview') ||
      railway.includes('nonprod')
    ) {
      return 'np'
    }
    return 'local'
  }

  const nodeEnv = (input.nodeEnv ?? process.env.NODE_ENV)?.trim().toLowerCase()
  if (nodeEnv === 'production') return 'prod'
  if (nodeEnv === 'test') return 'local'

  return 'local'
}

export function isProductionAppEnvironment(input: AppEnvironmentResolutionInput = {}): boolean {
  return resolveAppEnvironment(input) === 'prod'
}
