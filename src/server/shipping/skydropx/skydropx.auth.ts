import 'server-only'

import { getSkydropxConfig, isSkydropxConfigured } from './skydropx.config'
import { SkydropxApiError, SkydropxConfigError } from './skydropx.errors'
import { scheduleSkydropxRequest } from './skydropx-rate-limit'
import type { SkydropxOAuthTokenResponse } from './skydropx.types'

/** Renew token this many seconds before Skydropx expiry (default 2h). */
const EXPIRY_BUFFER_SECONDS = 120

type CachedToken = {
  accessToken: string
  expiresAtMs: number
}

/**
 * In-memory token cache (best-effort per serverless instance).
 * For shared cache across instances, use Redis in production.
 */
let cachedToken: CachedToken | null = null

function requireCredentials(): { clientId: string; clientSecret: string; apiBaseUrl: string } {
  if (!isSkydropxConfigured()) {
    throw new SkydropxConfigError()
  }
  const { clientId, clientSecret, apiBaseUrl } = getSkydropxConfig()
  return { clientId, clientSecret, apiBaseUrl }
}

function isCacheValid(cache: CachedToken | null): cache is CachedToken {
  if (!cache) return false
  return Date.now() < cache.expiresAtMs
}

/**
 * Returns a valid bearer access token, refreshing from cache when possible.
 */
export async function getSkydropxAccessToken(): Promise<string> {
  if (isCacheValid(cachedToken)) {
    return cachedToken.accessToken
  }
  return refreshSkydropxAccessToken()
}

/**
 * Forces a new OAuth token request and updates the in-memory cache.
 */
export async function refreshSkydropxAccessToken(): Promise<string> {
  const { clientId, clientSecret, apiBaseUrl } = requireCredentials()

  const body = new URLSearchParams({
    grant_type: 'client_credentials',
    client_id: clientId,
    client_secret: clientSecret,
  })

  const response = await scheduleSkydropxRequest(() =>
    fetch(`${apiBaseUrl}/api/v1/oauth/token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Accept: 'application/json',
      },
      body: body.toString(),
      cache: 'no-store',
    }),
  )

  const text = await response.text()
  let parsed: unknown = null
  if (text) {
    try {
      parsed = JSON.parse(text) as unknown
    } catch {
      parsed = { raw: text }
    }
  }

  if (!response.ok) {
    const message =
      typeof parsed === 'object' &&
      parsed !== null &&
      'message' in parsed &&
      typeof (parsed as { message: unknown }).message === 'string'
        ? (parsed as { message: string }).message
        : `Skydropx OAuth error (${response.status})`
    throw new SkydropxApiError({
      message,
      status: response.status,
      details: parsed,
      operation: 'oauthToken',
      path: '/api/v1/oauth/token',
    })
  }

  const token = parsed as SkydropxOAuthTokenResponse
  if (!token?.access_token || typeof token.expires_in !== 'number') {
    throw new SkydropxApiError({
      message: 'Skydropx OAuth response inválida',
      status: response.status,
      details: parsed,
      operation: 'oauthToken',
      path: '/api/v1/oauth/token',
    })
  }

  const expiresAtMs = Date.now() + Math.max(0, token.expires_in - EXPIRY_BUFFER_SECONDS) * 1000

  cachedToken = {
    accessToken: token.access_token,
    expiresAtMs,
  }

  return cachedToken.accessToken
}
