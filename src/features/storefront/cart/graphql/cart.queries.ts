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
      optionTotalCents
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
        optionPriceCents
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
          previewBackUrl
          selectedVariantId
          selectedSize {
            id
            name
            label
          }
          selectedColor {
            id
            name
            hex
            label
          }
          fabricColor {
            name
            hex
          }
          detailColor {
            name
            hex
          }
          selectedOptions
          summary
          areas
          hasLogo
          hasEmbroidery
          embroideredName
        }
        commercialOptionsSnapshot {
          groupId
          groupSlug
          groupName
          valueId
          valueSlug
          valueLabel
          priceDeltaCents
        }
      }
    }
  }
`
