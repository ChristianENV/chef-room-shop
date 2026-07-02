export const PREVIEW_USER_INVITATION_QUERY = /* GraphQL */ `
  query PreviewUserInvitation($token: String!) {
    previewUserInvitation(token: $token) {
      valid
      status
      maskedEmail
      email
      targetRole
      targetRoleLabel
      expiresAt
      isExpired
      existingUserHint
      message
    }
  }
`
