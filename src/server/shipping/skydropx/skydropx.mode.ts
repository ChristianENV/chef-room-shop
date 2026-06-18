import 'server-only'

import { getSkydropxConfig, isSkydropxConfigured } from './skydropx.config'

export type SkydropxMode = 'live' | 'mock'

export type SkydropxModeResolutionInput = {
  explicitMode?: string | null
  nodeEnv?: string | null
  configured?: boolean
}

function readExplicitSkydropxMode(
  raw = process.env.SKYDROPX_MODE,
): SkydropxMode | null {
  const value = raw?.trim().toLowerCase()
  if (value === 'mock') return 'mock'
  if (value === 'live') return 'live'
  return null
}

/**
 * Resolves Skydropx integration mode (testable with explicit inputs).
 */
export function resolveSkydropxMode(
  input: SkydropxModeResolutionInput = {},
): SkydropxMode {
  const explicit = readExplicitSkydropxMode(input.explicitMode ?? undefined)
  if (explicit) return explicit

  const nodeEnv = input.nodeEnv ?? process.env.NODE_ENV ?? ''
  if (nodeEnv === 'production') {
    return 'live'
  }

  const configured = input.configured ?? isSkydropxConfigured()
  if (!configured) {
    return 'mock'
  }

  return 'live'
}

/**
 * Resolves Skydropx integration mode from runtime env.
 * Production never defaults to mock; dev/test without credentials may.
 */
export function getSkydropxMode(): SkydropxMode {
  return resolveSkydropxMode()
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
