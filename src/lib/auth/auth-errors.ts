/**
 * Maps Better Auth / API errors to user-facing Spanish messages.
 */
export function getAuthErrorMessage(error: unknown, fallback: string): string {
  if (error && typeof error === 'object' && 'message' in error) {
    const message = String((error as { message: string }).message)
    if (message.length > 0 && message !== 'undefined') {
      return translateCommonAuthError(message)
    }
  }

  if (typeof error === 'string' && error.length > 0) {
    return translateCommonAuthError(error)
  }

  return fallback
}

function translateCommonAuthError(message: string): string {
  const lower = message.toLowerCase()

  if (lower.includes('invalid') && lower.includes('credential')) {
    return 'Correo o contraseña incorrectos.'
  }
  if (lower.includes('already exists') || lower.includes('user already')) {
    return 'Ya existe una cuenta con este correo electrónico.'
  }
  if (lower.includes('password') && lower.includes('short')) {
    return 'La contraseña debe tener al menos 8 caracteres.'
  }

  return message
}
