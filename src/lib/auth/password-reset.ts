import { z } from 'zod'

import { routes } from '@/src/config/routes'

export const FORGOT_PASSWORD_SUCCESS_MESSAGE =
  'Si existe una cuenta con ese correo, te enviaremos instrucciones para restablecer tu contraseña.'

export const FORGOT_PASSWORD_GENERIC_ERROR =
  'No pudimos procesar tu solicitud. Intenta de nuevo en unos minutos.'

export const RESET_PASSWORD_GENERIC_ERROR =
  'No pudimos actualizar tu contraseña. Solicita un nuevo enlace e intenta de nuevo.'

export const RESET_PASSWORD_MISSING_TOKEN_MESSAGE =
  'El enlace de restablecimiento no es válido o ha expirado.'

export const forgotPasswordSchema = z.object({
  email: z.string().email('Ingresa un correo electrónico válido'),
})

export const resetPasswordSchema = z
  .object({
    password: z.string().min(8, 'La contraseña debe tener al menos 8 caracteres'),
    confirmPassword: z.string().min(1, 'Confirma tu contraseña'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Las contraseñas no coinciden',
    path: ['confirmPassword'],
  })

export type ForgotPasswordFormValues = z.infer<typeof forgotPasswordSchema>
export type ResetPasswordFormValues = z.infer<typeof resetPasswordSchema>

/**
 * Better Auth `redirectTo` target after the user clicks the email reset link.
 */
export function getPasswordResetRedirectTo(): string {
  return routes.resetPassword
}

/**
 * Parses the reset token from query params (after Better Auth callback redirect).
 */
export function parseResetPasswordToken(token: string | null | undefined): string | null {
  const trimmed = token?.trim()
  return trimmed ? trimmed : null
}

/**
 * Returns true when Better Auth redirected with an invalid/expired token error.
 */
export function isInvalidResetPasswordTokenError(error: string | null | undefined): boolean {
  return error?.trim().toUpperCase() === 'INVALID_TOKEN'
}
