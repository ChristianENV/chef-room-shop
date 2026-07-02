export const ADMIN_USER_INVITATIONS_QUERY = /* GraphQL */ `
  query AdminUserInvitations($filter: AdminUserInvitationsFilterInput, $limit: Int, $offset: Int) {
    adminUserInvitations(filter: $filter, limit: $limit, offset: $offset) {
      total
      items {
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
        acceptedBy {
          id
          name
          email
        }
        revokedBy {
          id
          name
          email
        }
      }
    }
  }
`
