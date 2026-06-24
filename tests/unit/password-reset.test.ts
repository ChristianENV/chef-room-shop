import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import {
  FORGOT_PASSWORD_SUCCESS_MESSAGE,
  getPasswordResetRedirectTo,
  isInvalidResetPasswordTokenError,
  parseResetPasswordToken,
  resetPasswordSchema,
} from '@/src/lib/auth/password-reset'
import { routes } from '@/src/config/routes'

describe('password reset helpers', () => {
  it('uses /reset-password as Better Auth redirectTo target', () => {
    assert.equal(getPasswordResetRedirectTo(), routes.resetPassword)
    assert.equal(getPasswordResetRedirectTo(), '/reset-password')
  })

  it('parses reset token from query params', () => {
    assert.equal(parseResetPasswordToken('abc123'), 'abc123')
    assert.equal(parseResetPasswordToken('  abc123  '), 'abc123')
    assert.equal(parseResetPasswordToken(''), null)
    assert.equal(parseResetPasswordToken(null), null)
    assert.equal(parseResetPasswordToken(undefined), null)
  })

  it('detects INVALID_TOKEN callback errors', () => {
    assert.equal(isInvalidResetPasswordTokenError('INVALID_TOKEN'), true)
    assert.equal(isInvalidResetPasswordTokenError('invalid_token'), true)
    assert.equal(isInvalidResetPasswordTokenError('OTHER'), false)
    assert.equal(isInvalidResetPasswordTokenError(null), false)
  })

  it('validates password confirmation', () => {
    const mismatch = resetPasswordSchema.safeParse({
      password: 'password1',
      confirmPassword: 'password2',
    })
    assert.equal(mismatch.success, false)
    if (!mismatch.success) {
      assert.equal(mismatch.error.errors[0]?.message, 'Las contraseñas no coinciden')
    }

    const short = resetPasswordSchema.safeParse({
      password: 'short',
      confirmPassword: 'short',
    })
    assert.equal(short.success, false)

    const valid = resetPasswordSchema.safeParse({
      password: 'password1',
      confirmPassword: 'password1',
    })
    assert.equal(valid.success, true)
  })

  it('uses generic anti-enumeration copy for forgot password success', () => {
    assert.match(FORGOT_PASSWORD_SUCCESS_MESSAGE, /Si existe una cuenta/)
    assert.doesNotMatch(FORGOT_PASSWORD_SUCCESS_MESSAGE, /no encontr/i)
    assert.doesNotMatch(FORGOT_PASSWORD_SUCCESS_MESSAGE, /no existe/i)
  })
})

describe('password reset email template', () => {
  it('renders CTA and safe Spanish copy without raw token in body', async () => {
    await import('./helpers/mock-server-only')
    const { renderTransactionalTemplate } = await import('@/src/server/email/email.templates')

    const resetUrl =
      'https://np.chefroom.mx/api/auth/reset-password/abc?callbackURL=%2Freset-password'
    const rendered = renderTransactionalTemplate('password_reset', {
      resetPasswordUrl: resetUrl,
    })

    assert.equal(rendered.subject, 'Restablece tu contraseña de Chef Room')
    assert.match(rendered.html, /Restablece tu contraseña/)
    assert.match(rendered.html, /Recibimos una solicitud para restablecer la contraseña/)
    assert.match(rendered.html, /Cambiar contraseña/)
    assert.match(rendered.html, /Si no solicitaste este cambio/)
    assert.match(rendered.html, /Este enlace estará disponible por tiempo limitado/)
    assert.ok(rendered.html.includes(resetUrl))
    assert.ok(!rendered.text.includes('abc123'))
  })
})
