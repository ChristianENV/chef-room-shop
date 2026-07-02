export const ACCEPT_USER_INVITATION_MUTATION = /* GraphQL */ `
  mutation AcceptUserInvitation($token: String!) {
    acceptUserInvitation(token: $token) {
      success
      message
      redirectTo
      targetRole
    }
  }
`
