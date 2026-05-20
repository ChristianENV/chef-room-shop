import type { GraphQLContext } from '../../context'
import { getOrCreateGuestSession } from '@/src/server/guest/guest-session'

import type { CartOwner } from './cart.types'

/**
 * Resolves the cart owner from the GraphQL session.
 * Authenticated users use `userId`; guests get or create a `GuestSession` via cookie.
 * Never accepts `userId` from client input.
 *
 * @remarks Guest → auth cart merge is not implemented in v1 (see `docs/graphql-cart.md`).
 */
export async function resolveCartOwner(context: GraphQLContext): Promise<CartOwner> {
  if (context.currentUser) {
    return {
      userId: context.currentUser.id,
      guestSessionId: null,
    }
  }

  const { guestSession } = await getOrCreateGuestSession()

  return {
    userId: null,
    guestSessionId: guestSession.id,
  }
}
