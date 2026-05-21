import { CartStatus, type Prisma } from '@prisma/client'
import { GraphQLError } from 'graphql'

import { getActiveGuestSessionFromCookies } from '@/src/server/guest/guest-session'

import type { GraphQLContext } from '../../context'
import type { CartForShippingQuote, ShippingQuoteOwner } from './shipping.types'

const cartInclude = {
  items: {
    select: { quantity: true },
    orderBy: { createdAt: 'asc' as const },
  },
} satisfies Prisma.CartInclude

function shippingError(message: string, code: string): GraphQLError {
  return new GraphQLError(message, { extensions: { code } })
}

function activeCartWhere(owner: ShippingQuoteOwner): Prisma.CartWhereInput {
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
 * Resolves shipping quote owner from session. Does not create a guest session.
 */
export async function resolveShippingQuoteOwner(
  context: GraphQLContext,
): Promise<ShippingQuoteOwner> {
  if (context.currentUser) {
    return {
      userId: context.currentUser.id,
      guestSessionId: null,
    }
  }

  const guestSession = await getActiveGuestSessionFromCookies()
  if (!guestSession) {
    throw shippingError('Tu carrito está vacío.', 'BAD_REQUEST')
  }

  return {
    userId: null,
    guestSessionId: guestSession.id,
  }
}

/**
 * Loads the ACTIVE cart with line quantities for shipping quotes.
 */
export async function getActiveCartForShippingQuote(
  context: GraphQLContext,
  owner: ShippingQuoteOwner,
): Promise<CartForShippingQuote> {
  const cart = await context.prisma.cart.findFirst({
    where: activeCartWhere(owner),
    include: cartInclude,
  })

  if (!cart) {
    throw shippingError('Tu carrito está vacío.', 'BAD_REQUEST')
  }

  if (cart.items.length === 0) {
    throw shippingError('Tu carrito está vacío.', 'BAD_REQUEST')
  }

  return cart
}

/**
 * Owner + non-empty active cart for shipping mutations.
 */
export async function resolveShippingQuoteOwnerWithCart(
  context: GraphQLContext,
): Promise<{ owner: ShippingQuoteOwner; cart: CartForShippingQuote }> {
  const owner = await resolveShippingQuoteOwner(context)
  const cart = await getActiveCartForShippingQuote(context, owner)
  return { owner, cart }
}
