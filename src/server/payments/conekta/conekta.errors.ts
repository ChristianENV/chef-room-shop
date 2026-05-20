export class ConektaConfigError extends Error {
  readonly code = 'CONEKTA_NOT_CONFIGURED'

  constructor(message = 'Conekta no está configurado. Agrega CONEKTA_PRIVATE_KEY en el servidor.') {
    super(message)
    this.name = 'ConektaConfigError'
  }
}

export class ConektaApiError extends Error {
  readonly code = 'CONEKTA_API_ERROR'
  readonly status: number
  readonly details: unknown

  constructor(message: string, status: number, details?: unknown) {
    super(message)
    this.name = 'ConektaApiError'
    this.status = status
    this.details = details
  }
}

export class ConektaWebhookError extends Error {
  readonly code: string

  constructor(message: string, code = 'CONEKTA_WEBHOOK_INVALID') {
    super(message)
    this.name = 'ConektaWebhookError'
    this.code = code
  }
}
