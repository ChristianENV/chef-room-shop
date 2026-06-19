import 'server-only'

import { safeSendTransactionalEmail } from '@/src/server/email/email.service'

type SendBetterAuthVerificationEmailInput = {
  to: string
  userId?: string
  verificationUrl: string
}

/**
 * Sends the Better Auth email verification link via Chef Room EmailService.
 * Intentionally not awaited by Better Auth callback to reduce timing attacks.
 */
export function sendBetterAuthVerificationEmail(input: SendBetterAuthVerificationEmailInput): void {
  void safeSendTransactionalEmail({
    to: input.to,
    templateKey: 'email_verification',
    subject: '',
    userId: input.userId ?? null,
    payload: {
      verificationUrl: input.verificationUrl,
    },
  })
}
