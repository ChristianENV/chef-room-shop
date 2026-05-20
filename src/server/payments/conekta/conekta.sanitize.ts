const SENSITIVE_KEYS = new Set([
  'card',
  'payment_source',
  'token_id',
  'cvv',
  'cvc',
  'number',
  'pan',
  'exp_month',
  'exp_year',
])

/**
 * Removes known sensitive payment fields before persisting Conekta JSON.
 */
export function sanitizeConektaPayload<T>(value: T): T {
  return sanitizeValue(value) as T
}

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
