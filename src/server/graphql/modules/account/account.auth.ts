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

/**
 * Requires a verified email before returning sensitive order detail.
 *
 * @throws GraphQLError with code EMAIL_NOT_VERIFIED when email is not verified.
 */
export function requireVerifiedEmailForOrderDetail(context: GraphQLContext): void {
  if (!context.currentUser) {
    throw new GraphQLError('Debes iniciar sesión para continuar.', {
      extensions: { code: 'UNAUTHENTICATED' },
    })
  }

  if (!context.currentUser.emailVerified) {
    throw new GraphQLError(
      'Verifica tu correo para consultar el detalle de tu pedido.',
      {
        extensions: { code: 'EMAIL_NOT_VERIFIED' },
      },
    )
  }
}
