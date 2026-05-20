/**
 * GraphQL documents for storefront cart BFF (guest cookie or authenticated session).
 */

export const MY_CART_QUERY = /* GraphQL */ `
  query MyCart {
    myCart {
      id
      status
      currency
      subtotalCents
      customizationTotalCents
      shippingCostCents
      discountTotalCents
      totalCents
      totalItems
      createdAt
      updatedAt
      items {
        id
        productId
        productVariantId
        designId
        quantity
        unitPriceCents
        customizationPriceCents
        totalPriceCents
        createdAt
        updatedAt
        productSnapshot {
          productId
          variantId
          slug
          name
          sku
          imageUrl
          productType
          colorName
          colorHex
          sizeName
        }
        customizationSnapshot {
          designId
          previewUrl
          summary
          areas
          hasLogo
          hasEmbroidery
          embroideredName
        }
      }
    }
  }
`
