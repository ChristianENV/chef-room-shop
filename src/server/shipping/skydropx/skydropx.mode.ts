import 'server-only'

import {
  resolveAppEnvironment,
  type AppEnvironmentResolutionInput,
} from '@/src/config/app-environment'

import { getSkydropxConfig, isSkydropxConfigured } from './skydropx.config'

export type SkydropxMode = 'live' | 'mock'

export type SkydropxModeResolutionInput = AppEnvironmentResolutionInput

function isProductionRuntime(input: SkydropxModeResolutionInput): boolean {
  const nodeEnv = (input.nodeEnv ?? process.env.NODE_ENV)?.trim().toLowerCase()
  if (nodeEnv === 'production') return true

  const vercel = (input.vercelEnv ?? process.env.VERCEL_ENV)?.trim().toLowerCase()
  if (vercel === 'production') return true

  const railway = (input.railwayEnvironment ?? process.env.RAILWAY_ENVIRONMENT)
    ?.trim()
    .toLowerCase()
  if (railway === 'production' || railway === 'prod') return true

  return false
}

/**
 * Resolves Skydropx integration mode from the app environment.
 * local/np → mock; prod → live. Production runtime signals always force live.
 */
export function resolveSkydropxModeFromEnvironment(
  input: SkydropxModeResolutionInput = {},
): SkydropxMode {
  if (isProductionRuntime(input)) {
    return 'live'
  }

  try {
    const appEnv = resolveAppEnvironment(input)
    if (appEnv === 'prod') return 'live'
    if (appEnv === 'local' || appEnv === 'np') return 'mock'
  } catch {
    return 'live'
  }

  return 'live'
}

/**
 * @deprecated Prefer resolveSkydropxModeFromEnvironment. Kept for existing tests/callers.
 */
export function resolveSkydropxMode(
  input: SkydropxModeResolutionInput = {},
): SkydropxMode {
  return resolveSkydropxModeFromEnvironment(input)
}

/**
 * Resolves Skydropx integration mode from runtime env.
 */
export function getSkydropxMode(): SkydropxMode {
  return resolveSkydropxModeFromEnvironment()
}

export function isSkydropxMockMode(): boolean {
  return getSkydropxMode() === 'mock'
}

/**
 * Exposed for admin settings / diagnostics (no secrets).
 */
export function getSkydropxModeSummary(): {
  mode: SkydropxMode
  configured: boolean
  env: string
} {
  const { env } = getSkydropxConfig()
  return {
    mode: getSkydropxMode(),
    configured: isSkydropxConfigured(),
    env,
  }
}
