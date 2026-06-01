export const CREATE_DESIGN_DRAFT_MUTATION = /* GraphQL */ `
  mutation CreateDesignDraft($input: CreateDesignDraftInput!) {
    createDesignDraft(input: $input) {
      id
      name
      status
      previewUrl
      previewPublicId
      finalPriceCents
      currency
      configJson
      createdAt
      updatedAt
      purchasedAt
      product {
        id
        slug
        name
        basePriceCents
      }
    }
  }
`

export const UPDATE_DESIGN_MUTATION = /* GraphQL */ `
  mutation UpdateDesign($input: UpdateDesignInput!) {
    updateDesign(input: $input) {
      id
      name
      status
      previewUrl
      previewPublicId
      finalPriceCents
      currency
      configJson
      createdAt
      updatedAt
      purchasedAt
      product {
        id
        slug
        name
        basePriceCents
      }
    }
  }
`

export const SAVE_DESIGN_PREVIEW_MUTATION = /* GraphQL */ `
  mutation SaveDesignPreview($input: SaveDesignPreviewInput!) {
    saveDesignPreview(input: $input) {
      id
      name
      status
      previewUrl
      previewPublicId
      finalPriceCents
      currency
      configJson
      createdAt
      updatedAt
      purchasedAt
      product {
        id
        slug
        name
        basePriceCents
      }
    }
  }
`

export const DESIGN_BY_ID_QUERY = /* GraphQL */ `
  query DesignById($designId: ID!) {
    designById(designId: $designId) {
      id
      name
      status
      previewUrl
      previewPublicId
      finalPriceCents
      currency
      configJson
      createdAt
      updatedAt
      purchasedAt
      product {
        id
        slug
        name
        basePriceCents
      }
    }
  }
`
