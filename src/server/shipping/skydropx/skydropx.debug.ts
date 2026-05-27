import 'server-only'

import { sanitizeSkydropxDebugPayload } from './skydropx.sanitize'

const PII_KEYS = new Set([
  'email',
  'phone',
  'name',
  'full_name',
  'tax_id_number',
  'rfc',
])

/**
 * True when Skydropx request/response debug logging is enabled.
 */
export function isSkydropxDebugEnabled(): boolean {
  if (process.env.SKYDROPX_DEBUG?.trim().toLowerCase() === 'true') {
    return true
  }
  return process.env.NODE_ENV === 'development'
}

export type SkydropxDebugLogInput = {
  operation: string
  method: string
  path: string
  orderNumber?: string
  providerQuoteId?: string | null
  providerRateId?: string | null
  carrier?: string | null
  service?: string | null
  statusCode?: number
  requestSummary?: unknown
  errorBody?: unknown
  requestId?: string | null
}

function redactPiiInSummary(value: unknown, key?: string): unknown {
  if (key && PII_KEYS.has(key.toLowerCase())) {
    return '[redacted]'
  }
  return sanitizeSkydropxDebugPayload(value)
}

/**
 * Logs a sanitized Skydropx debug line (never logs Authorization or tokens).
 */
export function logSkydropxDebug(input: SkydropxDebugLogInput): void {
  if (!isSkydropxDebugEnabled()) return

  const payload = {
    operation: input.operation,
    method: input.method,
    path: input.path,
    orderNumber: input.orderNumber,
    providerQuoteId: input.providerQuoteId ?? undefined,
    providerRateId: input.providerRateId ?? undefined,
    carrier: input.carrier ?? undefined,
    service: input.service ?? undefined,
    statusCode: input.statusCode,
    requestId: input.requestId ?? undefined,
    request: input.requestSummary
      ? redactPiiInSummary(input.requestSummary)
      : undefined,
    error: input.errorBody ? redactPiiInSummary(input.errorBody) : undefined,
  }

  if (input.statusCode && input.statusCode >= 400) {
    console.error('[skydropx]', JSON.stringify(payload))
  } else {
    console.info('[skydropx]', JSON.stringify(payload))
  }
}
