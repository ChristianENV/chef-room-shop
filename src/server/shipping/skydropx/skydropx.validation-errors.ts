export class SkydropxValidationError extends Error {
  readonly code = 'SKYDROPX_VALIDATION'

  constructor(message: string) {
    super(message)
    this.name = 'SkydropxValidationError'
  }
}
