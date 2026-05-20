/**
 * GraphQL mutations for storefront cart BFF.
 */

const cartMutationFields = `
  id
  status
  currency
  subtotalCents
  customizationTotalCents
  shippingCostCents
  discountTotalCents
  totalCents
  totalItems
  updatedAt
  items {
    id
    quantity
    unitPriceCents
    customizationPriceCents
    totalPriceCents
    productSnapshot {
      name
      colorName
      sizeName
    }
    customizationSnapshot {
      hasLogo
      hasEmbroidery
      summary
    }
  }
`

export const ADD_CART_ITEM_MUTATION = /* GraphQL */ `
  mutation AddCartItem($input: AddCartItemInput!) {
    addCartItem(input: $input) {
      ${cartMutationFields}
    }
  }
`

export const UPDATE_CART_ITEM_QUANTITY_MUTATION = /* GraphQL */ `
  mutation UpdateCartItemQuantity($input: UpdateCartItemQuantityInput!) {
    updateCartItemQuantity(input: $input) {
      ${cartMutationFields}
    }
  }
`

export const REMOVE_CART_ITEM_MUTATION = /* GraphQL */ `
  mutation RemoveCartItem($itemId: ID!) {
    removeCartItem(itemId: $itemId) {
      ${cartMutationFields}
    }
  }
`

export const CLEAR_CART_MUTATION = /* GraphQL */ `
  mutation ClearCart {
    clearCart {
      ${cartMutationFields}
    }
  }
`
