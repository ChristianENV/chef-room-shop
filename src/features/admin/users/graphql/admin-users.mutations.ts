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

export const UPDATE_ADMIN_USER_MUTATION = /* GraphQL */ `
  mutation UpdateAdminUser($input: UpdateAdminUserInput!) {
    updateAdminUser(input: $input) {
      ${ADMIN_USER_FIELDS}
    }
  }
`

export const PAUSE_ADMIN_USER_MUTATION = /* GraphQL */ `
  mutation PauseAdminUser($id: ID!) {
    pauseAdminUser(id: $id) {
      ${ADMIN_USER_FIELDS}
    }
  }
`

export const BLOCK_ADMIN_USER_MUTATION = /* GraphQL */ `
  mutation BlockAdminUser($id: ID!) {
    blockAdminUser(id: $id) {
      ${ADMIN_USER_FIELDS}
    }
  }
`

export const REACTIVATE_ADMIN_USER_MUTATION = /* GraphQL */ `
  mutation ReactivateAdminUser($id: ID!) {
    reactivateAdminUser(id: $id) {
      ${ADMIN_USER_FIELDS}
    }
  }
`
