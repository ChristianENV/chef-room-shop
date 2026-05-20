export class EmailConfigError extends Error {
  readonly code = 'EMAIL_NOT_CONFIGURED'

  constructor(message: string) {
    super(message)
    this.name = 'EmailConfigError'
  }
}

export class EmailProviderError extends Error {
  readonly code = 'EMAIL_PROVIDER_ERROR'

  constructor(message: string, cause?: unknown) {
    super(message)
    this.name = 'EmailProviderError'
    if (cause instanceof Error) {
      this.cause = cause
    }
  }
}
