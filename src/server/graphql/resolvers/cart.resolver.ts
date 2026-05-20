import type { GraphQLContext } from '../context'
import {
  addCartItem,
  clearCart,
  getOrCreateActiveCart,
  removeCartItem,
  updateCartItemQuantity,
} from '../modules/cart/cart.service'
import type {
  AddCartItemInput,
  UpdateCartItemQuantityInput,
} from '../modules/cart/cart.types'

type AddCartItemArgs = { input: AddCartItemInput }
type UpdateCartItemQuantityArgs = { input: UpdateCartItemQuantityInput }
type RemoveCartItemArgs = { itemId: string }

export const cartResolvers = {
  Query: {
    myCart: (_parent: unknown, _args: unknown, context: GraphQLContext) =>
      getOrCreateActiveCart(context),
  },
  Mutation: {
    addCartItem: (
      _parent: unknown,
      args: AddCartItemArgs,
      context: GraphQLContext,
    ) => addCartItem(context, args.input),
    updateCartItemQuantity: (
      _parent: unknown,
      args: UpdateCartItemQuantityArgs,
      context: GraphQLContext,
    ) => updateCartItemQuantity(context, args.input),
    removeCartItem: (
      _parent: unknown,
      args: RemoveCartItemArgs,
      context: GraphQLContext,
    ) => removeCartItem(context, args.itemId),
    clearCart: (_parent: unknown, _args: unknown, context: GraphQLContext) =>
      clearCart(context),
  },
}
