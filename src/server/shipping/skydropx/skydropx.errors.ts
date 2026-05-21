export class SkydropxConfigError extends Error {
  readonly code = 'SKYDROPX_NOT_CONFIGURED'

  constructor(
    message = 'Skydropx no está configurado. Agrega SKYDROPX_CLIENT_ID y SKYDROPX_CLIENT_SECRET en el servidor.',
  ) {
    super(message)
    this.name = 'SkydropxConfigError'
  }
}

export class SkydropxApiError extends Error {
  readonly code = 'SKYDROPX_API_ERROR'
  readonly status: number
  readonly details: unknown

  constructor(message: string, status: number, details?: unknown) {
    super(message)
    this.name = 'SkydropxApiError'
    this.status = status
    this.details = details
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
