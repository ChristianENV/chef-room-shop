import { CartStatus, type Prisma } from '@prisma/client'
import { GraphQLError } from 'graphql'

import { getActiveGuestSessionFromCookies } from '@/src/server/guest/guest-session'

import type { GraphQLContext } from '../../context'
import type { CartItemWithRelations, CartWithRelations } from '../cart/cart.types'
import type { CheckoutOwner } from './checkout.types'

const cartInclude = {
  items: {
    include: {
      product: {
        include: {
          productType: true,
          images: { orderBy: { sortOrder: 'asc' as const } },
        },
      },
      productVariant: { include: { color: true, size: true } },
      design: true,
    },
    orderBy: { createdAt: 'asc' as const },
  },
} satisfies Prisma.CartInclude

function checkoutError(message: string, code: string): GraphQLError {
  return new GraphQLError(message, { extensions: { code } })
}

function activeCartWhere(owner: CheckoutOwner): Prisma.CartWhereInput {
  if (owner.userId) {
    return { userId: owner.userId, status: CartStatus.ACTIVE, deletedAt: null }
  }
  return {
    guestSessionId: owner.guestSessionId,
    status: CartStatus.ACTIVE,
    deletedAt: null,
  }
}

/**
 * Resolves checkout owner from session. Does not create a new guest session.
 */
export async function resolveCheckoutOwner(
  context: GraphQLContext,
): Promise<CheckoutOwner> {
  if (context.currentUser) {
    return {
      userId: context.currentUser.id,
      guestSessionId: null,
    }
  }

  const guestSession = await getActiveGuestSessionFromCookies()
  if (!guestSession) {
    throw checkoutError('Tu carrito está vacío o expiró.', 'BAD_REQUEST')
  }

  return {
    userId: null,
    guestSessionId: guestSession.id,
  }
}

/**
 * Loads the ACTIVE cart with items for checkout. Throws if missing or empty.
 */
export async function getActiveCartForCheckout(
  context: GraphQLContext,
  owner: CheckoutOwner,
): Promise<CartWithRelations> {
  const cart = await context.prisma.cart.findFirst({
    where: activeCartWhere(owner),
    include: cartInclude,
  })

  if (!cart) {
    throw checkoutError('Tu carrito está vacío.', 'BAD_REQUEST')
  }

  if (cart.items.length === 0) {
    throw checkoutError('Tu carrito está vacío.', 'BAD_REQUEST')
  }

  return cart as CartWithRelations & {
    items: CartItemWithRelations[]
  }
}
