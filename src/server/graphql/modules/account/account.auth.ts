import { GraphQLError } from 'graphql'

import type { GraphQLContext } from '../../context'

/**
 * Requires an authenticated storefront user in GraphQL account resolvers.
 * Never accepts userId from client input — always uses session context.
 *
 * @returns The authenticated user's id.
 * @throws GraphQLError when there is no valid session.
 */
export function requireAuthenticatedAccount(context: GraphQLContext): string {
  if (!context.currentUser) {
    throw new GraphQLError('Debes iniciar sesión para continuar.', {
      extensions: { code: 'UNAUTHENTICATED' },
    })
  }

  return context.currentUser.id
}
