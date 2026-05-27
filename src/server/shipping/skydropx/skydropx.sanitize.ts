const SENSITIVE_KEYS = new Set([
  'authorization',
  'token',
  'secret',
  'password',
  'api_key',
  'apikey',
  'client_secret',
])

/**
 * Sanitizes Skydropx webhook JSON before persisting (redacts auth-like fields).
 */
export function sanitizeSkydropxWebhookPayload<T>(value: T): T {
  return sanitizeValue(value) as T
}

/** Alias for debug logs and internal error context. */
export const sanitizeSkydropxDebugPayload = sanitizeSkydropxWebhookPayload

function sanitizeValue(value: unknown, key?: string): unknown {
  if (key && SENSITIVE_KEYS.has(key.toLowerCase())) {
    return '[redacted]'
  }

  if (Array.isArray(value)) {
    return value.map((item) => sanitizeValue(item))
  }

  if (value && typeof value === 'object') {
    const out: Record<string, unknown> = {}
    for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
      out[k] = sanitizeValue(v, k)
    }
    return out
  }

  return value
}
