import 'server-only'

import { safeSendTransactionalEmail } from '@/src/server/email/email.service'
import { buildUserInvitationUrl } from '@/src/server/email/email.links'

const ROLE_LABELS: Record<string, string> = {
  CUSTOMER: 'Cliente',
  ADMIN: 'Administrador',
}

type SendUserInvitationEmailInput = {
  to: string
  invitationUrl: string
  targetRole: string
  invitedByName: string
  expiresAt: Date
  userId?: string | null
}

/**
 * Sends a user invitation email. Raw token must only exist in invitationUrl.
 */
export async function sendUserInvitationEmail(input: SendUserInvitationEmailInput): Promise<void> {
  await safeSendTransactionalEmail({
    to: input.to,
    templateKey: 'user_invitation',
    subject: '',
    userId: input.userId ?? null,
    payload: {
      invitationUrl: input.invitationUrl,
      targetRoleLabel: ROLE_LABELS[input.targetRole] ?? input.targetRole,
      invitedByName: input.invitedByName,
      expiresAt: input.expiresAt.toISOString(),
    },
  })
}

export function buildInvitationEmailUrl(rawToken: string): string {
  return buildUserInvitationUrl(rawToken)
}
