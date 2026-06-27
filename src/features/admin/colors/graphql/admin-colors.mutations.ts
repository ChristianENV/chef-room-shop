import { ADMIN_COLOR_FIELDS } from './admin-colors.queries'

export const CREATE_ADMIN_COLOR_MUTATION = /* GraphQL */ `
  mutation CreateAdminColor($input: CreateAdminColorInput!) {
    createAdminColor(input: $input) {
      ${ADMIN_COLOR_FIELDS}
    }
  }
`

export const UPDATE_ADMIN_COLOR_MUTATION = /* GraphQL */ `
  mutation UpdateAdminColor($id: ID!, $input: UpdateAdminColorInput!) {
    updateAdminColor(id: $id, input: $input) {
      ${ADMIN_COLOR_FIELDS}
    }
  }
`

export const ARCHIVE_ADMIN_COLOR_MUTATION = /* GraphQL */ `
  mutation ArchiveAdminColor($id: ID!) {
    archiveAdminColor(id: $id) {
      ${ADMIN_COLOR_FIELDS}
    }
  }
`
