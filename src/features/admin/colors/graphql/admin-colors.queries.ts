export const ADMIN_COLOR_FIELDS = /* GraphQL */ `
  id
  slug
  name
  hexCode
  isFabricColor
  isProductColor
  isGeneralColor
  isActive
  sortOrder
  createdAt
  updatedAt
`

export const ADMIN_COLORS_QUERY = /* GraphQL */ `
  query AdminColors($includeInactive: Boolean) {
    adminColors(includeInactive: $includeInactive) {
      ${ADMIN_COLOR_FIELDS}
    }
  }
`

export const ADMIN_COLOR_BY_ID_QUERY = /* GraphQL */ `
  query AdminColorById($id: ID!) {
    adminColorById(id: $id) {
      ${ADMIN_COLOR_FIELDS}
    }
  }
`
