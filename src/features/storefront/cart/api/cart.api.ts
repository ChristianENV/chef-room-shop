import { fetchGraphQL } from '@/src/lib/graphql/fetch-graphql'

import {
  ADD_CART_ITEM_MUTATION,
  CLEAR_CART_MUTATION,
  REMOVE_CART_ITEM_MUTATION,
  UPDATE_CART_ITEM_QUANTITY_MUTATION,
} from '../graphql/cart.mutations'
import { MY_CART_QUERY } from '../graphql/cart.queries'
import type { AddCartItemInput, Cart, UpdateCartItemQuantityInput } from '../types/cart-bff.types'

type MyCartData = { myCart: Cart }
type AddCartItemData = { addCartItem: Cart }
type UpdateCartItemQuantityData = { updateCartItemQuantity: Cart }
type RemoveCartItemData = { removeCartItem: Cart }
type ClearCartData = { clearCart: Cart }

/**
 * Fetches the active cart for the current user or guest session.
 */
export async function getMyCart(): Promise<Cart> {
  const data = await fetchGraphQL<MyCartData>({ query: MY_CART_QUERY })
  return data.myCart
}

/**
 * Adds a line item to the active cart.
 */
export async function addCartItem(input: AddCartItemInput): Promise<Cart> {
  const data = await fetchGraphQL<AddCartItemData, { input: AddCartItemInput }>({
    query: ADD_CART_ITEM_MUTATION,
    variables: { input },
  })
  return data.addCartItem
}

/**
 * Updates a cart line quantity (0 removes the line on the server).
 */
export async function updateCartItemQuantity(input: UpdateCartItemQuantityInput): Promise<Cart> {
  const data = await fetchGraphQL<
    UpdateCartItemQuantityData,
    { input: UpdateCartItemQuantityInput }
  >({
    query: UPDATE_CART_ITEM_QUANTITY_MUTATION,
    variables: { input },
  })
  return data.updateCartItemQuantity
}

/**
 * Removes a line item from the active cart.
 */
export async function removeCartItem(itemId: string): Promise<Cart> {
  const data = await fetchGraphQL<RemoveCartItemData, { itemId: string }>({
    query: REMOVE_CART_ITEM_MUTATION,
    variables: { itemId },
  })
  return data.removeCartItem
}

/**
 * Removes all items from the active cart.
 */
export async function clearCart(): Promise<Cart> {
  const data = await fetchGraphQL<ClearCartData>({ query: CLEAR_CART_MUTATION })
  return data.clearCart
}
