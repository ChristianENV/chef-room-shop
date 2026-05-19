import 'server-only'

import { GraphQLError } from 'graphql'

import { getCurrentUser } from './current-user'
import type { CurrentUser } from './types'

/**
 * Requires an authenticated user in GraphQL resolvers or server actions.
 * @throws GraphQLError with UNAUTHENTICATED when no valid session exists.
 */
export async function requireUser(): Promise<CurrentUser> {
  const user = await getCurrentUser()

  if (!user) {
    throw new GraphQLError('Debes iniciar sesión para continuar.', {
      extensions: { code: 'UNAUTHENTICATED' },
    })
  }

  return user
}
