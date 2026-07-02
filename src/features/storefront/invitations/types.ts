export type PublicUserInvitationPreview = {
  valid: boolean
  status: string | null
  maskedEmail: string | null
  email: string | null
  targetRole: string | null
  targetRoleLabel: string | null
  expiresAt: string | null
  isExpired: boolean
  existingUserHint: string | null
  message: string | null
}

export type AcceptUserInvitationPayload = {
  success: boolean
  message: string | null
  redirectTo: string | null
  targetRole: string | null
}
