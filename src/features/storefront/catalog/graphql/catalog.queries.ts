/**
 * GraphQL documents for storefront catalog listing and filter reference data.
 * Execute via POST /api/graphql (BFF).
 */

export const PRODUCTS_QUERY = /* GraphQL */ `
  query Products(
    $filter: ProductsFilterInput
    $sort: ProductsSortInput
    $limit: Int
    $offset: Int
  ) {
    products(filter: $filter, sort: $sort, limit: $limit, offset: $offset) {
      total
      items {
        id
        slug
        name
        shortDescription
        basePriceCents
        currency
        isCustomizable
        status
        productType {
          id
          slug
          name
        }
        images {
          id
          url
          publicId
          alt
          sortOrder
          isPrimary
        }
        variants {
          id
          sku
          variantName
          priceCents
          stockQty
          isActive
          color {
            id
            name
            slug
            hexCode
          }
          size {
            id
            name
            slug
          }
        }
      }
    }
  }
`

export const PRODUCT_TYPES_QUERY = /* GraphQL */ `
  query ProductTypes {
    productTypes {
      id
      slug
      name
      description
      sortOrder
    }
  }
`

export const COLORS_QUERY = /* GraphQL */ `
  query Colors {
    colors {
      id
      slug
      name
      hexCode
      sortOrder
    }
  }
`

export const SIZES_QUERY = /* GraphQL */ `
  query Sizes {
    sizes {
      id
      slug
      name
      sortOrder
    }
  }
`
