const ADMIN_USER_FIELDS = /* GraphQL */ `
  id
  name
  email
  roles
  status
  customerTier
  emailVerified
  isActive
  firstName
  lastName
  phone
  createdAt
  updatedAt
`

export const ADMIN_USERS_QUERY = /* GraphQL */ `
  query AdminUsers($filter: AdminUsersFilterInput, $limit: Int, $offset: Int) {
    adminUsers(filter: $filter, limit: $limit, offset: $offset) {
      total
      items {
        ${ADMIN_USER_FIELDS}
      }
    }
  }
`

export const ADMIN_USER_QUERY = /* GraphQL */ `
  query AdminUser($id: ID!) {
    adminUser(id: $id) {
      ${ADMIN_USER_FIELDS}
    }
  }
`
