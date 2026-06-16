export const ADMIN_USERS_QUERY = /* GraphQL */ `
  query AdminUsers($filter: AdminUsersFilterInput, $limit: Int, $offset: Int) {
    adminUsers(filter: $filter, limit: $limit, offset: $offset) {
      total
      items {
        id
        name
        email
        roles
        status
        customerTier
        emailVerified
        isActive
        createdAt
        updatedAt
      }
    }
  }
`
