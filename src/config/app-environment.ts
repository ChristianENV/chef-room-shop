export type AppEnvironment = 'local' | 'np' | 'prod'

export type AppEnvironmentResolutionInput = {
  appEnv?: string | null
  nodeEnv?: string | null
  vercelEnv?: string | null
  railwayEnvironment?: string | null
}

export class AppEnvironmentConfigError extends Error {
  readonly name = 'AppEnvironmentConfigError'

  constructor(message: string) {
    super(message)
  }
}

const APP_ENV_ALIASES: Record<string, AppEnvironment> = {
  local: 'local',
  dev: 'local',
  development: 'local',
  np: 'np',
  staging: 'np',
  stage: 'np',
  preview: 'np',
  nonprod: 'np',
  prod: 'prod',
  production: 'prod',
}

function parseAppEnv(raw: string): AppEnvironment | null {
  const value = raw.trim().toLowerCase()
  return APP_ENV_ALIASES[value] ?? null
}

/**
 * Resolves the Chef Room deployment environment (local / np / prod).
 * Prefer explicit `APP_ENV`; otherwise infer from platform signals.
 */
export function resolveAppEnvironment(
  input: AppEnvironmentResolutionInput = {},
): AppEnvironment {
  const explicitRaw = input.appEnv ?? process.env.APP_ENV
  if (explicitRaw?.trim()) {
    const parsed = parseAppEnv(explicitRaw)
    if (!parsed) {
      throw new AppEnvironmentConfigError(
        `Invalid APP_ENV "${explicitRaw.trim()}". Expected local, np, or prod.`,
      )
    }
    return parsed
  }

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

export function isProductionAppEnvironment(
  input: AppEnvironmentResolutionInput = {},
): boolean {
  return resolveAppEnvironment(input) === 'prod'
}
