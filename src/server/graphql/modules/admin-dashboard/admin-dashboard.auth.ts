import { GraphQLError } from 'graphql'

import { canAccessAdmin } from '@/src/server/auth/permissions'
import type { CurrentUser } from '@/src/server/auth/types'

import type { GraphQLContext } from '../../context'

/**
 * Requires an authenticated admin user in GraphQL admin resolvers.
 * Uses session from context only — never accepts userId from client input.
 *
 * @throws GraphQLError UNAUTHENTICATED or FORBIDDEN.
 */
export function requireAdminGraphQL(context: GraphQLContext): CurrentUser {
  if (!context.currentUser) {
    throw new GraphQLError('Debes iniciar sesión para continuar.', {
      extensions: { code: 'UNAUTHENTICATED' },
    })
  }

  if (!canAccessAdmin(context.currentUser)) {
    throw new GraphQLError('No tienes permiso para acceder a esta operación.', {
      extensions: { code: 'FORBIDDEN' },
    })
  }

  return context.currentUser
}
