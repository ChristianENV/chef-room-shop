import 'server-only'

import { safeSendTransactionalEmail } from '@/src/server/email/email.service'

type SendBetterAuthResetPasswordEmailInput = {
  to: string
  userId?: string
  resetPasswordUrl: string
}

/**
 * Sends the Better Auth password reset link via Chef Room EmailService.
 * Intentionally not awaited by Better Auth callback to reduce timing attacks.
 */
export function sendBetterAuthResetPasswordEmail(
  input: SendBetterAuthResetPasswordEmailInput,
): void {
  void safeSendTransactionalEmail({
    to: input.to,
    templateKey: 'password_reset',
    subject: '',
    userId: input.userId ?? null,
    payload: {
      resetPasswordUrl: input.resetPasswordUrl,
    },
  })
}
