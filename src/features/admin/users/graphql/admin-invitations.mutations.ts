const USER_INVITATION_FIELDS = /* GraphQL */ `
  id
  email
  targetRole
  status
  expiresAt
  acceptedAt
  revokedAt
  createdAt
  updatedAt
  invitedBy {
    id
    name
    email
  }
`

export const CREATE_USER_INVITATION_MUTATION = /* GraphQL */ `
  mutation CreateUserInvitation($input: CreateUserInvitationInput!) {
    createUserInvitation(input: $input) {
      ${USER_INVITATION_FIELDS}
    }
  }
`

export const REVOKE_USER_INVITATION_MUTATION = /* GraphQL */ `
  mutation RevokeUserInvitation($input: RevokeUserInvitationInput!) {
    revokeUserInvitation(input: $input) {
      ${USER_INVITATION_FIELDS}
    }
  }
`

export const RESEND_USER_INVITATION_MUTATION = /* GraphQL */ `
  mutation ResendUserInvitation($input: ResendUserInvitationInput!) {
    resendUserInvitation(input: $input) {
      ${USER_INVITATION_FIELDS}
    }
  }
`
