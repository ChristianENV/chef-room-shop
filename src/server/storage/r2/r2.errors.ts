/** Error codes surfaced by the R2 storage layer. */
export type R2ErrorCode =
  | 'R2_NOT_CONFIGURED'
  | 'R2_INVALID_CONTENT_TYPE'
  | 'R2_FILE_TOO_LARGE'
  | 'R2_INVALID_SIZE'
  | 'R2_PRESIGN_FAILED'
  | 'R2_OBJECT_NOT_FOUND'

/**
 * Domain error for the R2 storage layer. Carries a stable {@link R2ErrorCode}
 * so callers (e.g. GraphQL resolvers) can map it to user-facing messages.
 */
export class R2StorageError extends Error {
  readonly code: R2ErrorCode

  constructor(code: R2ErrorCode, message: string) {
    super(message)
    this.name = 'R2StorageError'
    this.code = code
  }
}

export function r2NotConfigured(): R2StorageError {
  return new R2StorageError(
    'R2_NOT_CONFIGURED',
    'El almacenamiento de imágenes (R2) no está configurado en el servidor.',
  )
}

export function r2InvalidContentType(contentType: string): R2StorageError {
  return new R2StorageError(
    'R2_INVALID_CONTENT_TYPE',
    `Tipo de archivo no permitido: ${contentType}.`,
  )
}

export function r2FileTooLarge(bytes: number, maxBytes: number): R2StorageError {
  return new R2StorageError(
    'R2_FILE_TOO_LARGE',
    `El archivo (${bytes} bytes) supera el máximo permitido (${maxBytes} bytes).`,
  )
}

export function r2InvalidSize(): R2StorageError {
  return new R2StorageError('R2_INVALID_SIZE', 'El tamaño del archivo no es válido.')
}
