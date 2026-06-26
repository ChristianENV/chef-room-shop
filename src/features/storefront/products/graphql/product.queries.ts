/**
 * GraphQL documents for storefront product detail (PDP).
 * Execute via POST /api/graphql (BFF).
 */

export const PRODUCT_BY_SLUG_QUERY = /* GraphQL */ `
  query ProductBySlug($slug: String!) {
    productBySlug(slug: $slug) {
      id
      slug
      name
      shortDescription
      description
      basePriceCents
      currency
      productionTimeDays
      isCustomizable
      status
      seoTitle
      seoDescription
      productType {
        id
        slug
        shopSlug
        name
        nameEs
        nameEn
        description
        sortOrder
        isActive
        showInNav
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
      customizationRules {
        id
        enabled
        maxWidthCm
        maxHeightCm
        minQuantity
        basePriceCents
        pricePerCmCents
        extraProductionDays
        allowedFileTypes
        validationMessage
        area {
          id
          slug
          name
          description
        }
        option {
          id
          slug
          name
          basePriceCents
          pricePerCmCents
        }
      }
    }
  }
`

export const CUSTOMIZATION_RULES_BY_PRODUCT_QUERY = /* GraphQL */ `
  query CustomizationRulesByProduct($productId: ID!) {
    customizationRulesByProduct(productId: $productId) {
      id
      enabled
      maxWidthCm
      maxHeightCm
      minQuantity
      basePriceCents
      pricePerCmCents
      extraProductionDays
      allowedFileTypes
      validationMessage
      area {
        slug
        name
      }
      option {
        slug
        name
        basePriceCents
      }
    }
  }
`
