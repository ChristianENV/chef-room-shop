import { sanitizeSkydropxDebugPayload } from './skydropx.sanitize'

export class SkydropxConfigError extends Error {
  readonly code = 'SKYDROPX_NOT_CONFIGURED'

  constructor(
    message = 'Skydropx no está configurado. Agrega SKYDROPX_CLIENT_ID y SKYDROPX_CLIENT_SECRET en el servidor.',
  ) {
    super(message)
    this.name = 'SkydropxConfigError'
  }
}

export type SkydropxApiErrorOptions = {
  message: string
  status: number
  details?: unknown
  operation?: string
  path?: string
  requestId?: string | null
  sanitizedBody?: unknown
}

export class SkydropxApiError extends Error {
  readonly code = 'SKYDROPX_API_ERROR'
  readonly status: number
  readonly details: unknown
  readonly operation?: string
  readonly path?: string
  readonly requestId?: string | null
  readonly sanitizedBody?: unknown

  constructor(options: SkydropxApiErrorOptions) {
    super(options.message)
    this.name = 'SkydropxApiError'
    this.status = options.status
    this.details = options.details
    this.operation = options.operation
    this.path = options.path
    this.requestId = options.requestId
    this.sanitizedBody = options.sanitizedBody ?? sanitizeSkydropxDebugPayload(options.details)
  }
}

export class SkydropxWebhookError extends Error {
  readonly code: string

  constructor(message: string, code = 'SKYDROPX_WEBHOOK_INVALID') {
    super(message)
    this.name = 'SkydropxWebhookError'
    this.code = code
  }
}
