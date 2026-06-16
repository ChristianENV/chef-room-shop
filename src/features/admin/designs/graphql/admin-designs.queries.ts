export const ADMIN_DESIGNS_QUERY = /* GraphQL */ `
  query AdminDesigns($filter: AdminDesignsFilterInput, $limit: Int, $offset: Int) {
    adminDesigns(filter: $filter, limit: $limit, offset: $offset) {
      total
      items {
        id
        shortId
        name
        previewUrl
        productName
        productSlug
        ownerType
        customerName
        customerEmail
        status
        finalPriceCents
        currency
        createdAt
        updatedAt
        relatedOrderNumber
        relatedCartId
        relatedCartStatus
      }
    }
  }
`

export const ADMIN_DESIGN_BY_ID_QUERY = /* GraphQL */ `
  query AdminDesignById($id: ID!) {
    adminDesignById(id: $id) {
      id
      shortId
      name
      previewUrl
      productName
      productSlug
      ownerType
      customerName
      customerEmail
      status
      finalPriceCents
      currency
      createdAt
      updatedAt
      relatedOrderNumber
      relatedCartId
      relatedCartStatus
      customizationSummary {
        size
        fabricColor
        fabricColorHex
        detailColor
        detailColorHex
        summaryLines
        previewBackUrl
        elements {
          id
          type
          name
          text
          zone
        }
      }
      configJson
    }
  }
`
