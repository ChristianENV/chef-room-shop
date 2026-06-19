import 'server-only'

import {
  resolveAppEnvironment,
  type AppEnvironmentResolutionInput,
} from '@/src/config/app-environment'

import { getSkydropxConfig, isSkydropxConfigured } from './skydropx.config'

export type SkydropxMode = 'live' | 'mock'

export type SkydropxModeResolutionInput = AppEnvironmentResolutionInput

/**
 * Resolves Skydropx integration mode from deployment env signals.
 * local/np → mock; prod → live.
 */
export function resolveSkydropxModeFromEnvironment(
  input: SkydropxModeResolutionInput = {},
): SkydropxMode {
  const appEnv = resolveAppEnvironment(input)
  if (appEnv === 'prod') return 'live'
  if (appEnv === 'local' || appEnv === 'np') return 'mock'
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
