import { GraphQLError } from 'graphql'

import { canAccessAdmin, hasPermission } from '@/src/server/auth/permissions'
import type { CurrentUser } from '@/src/server/auth/types'
import type { GraphQLContext } from '../../context'

export { requireAdminGraphQL } from '../admin-dashboard/admin-dashboard.auth'

/**
 * Requires `users.write` permission for user management mutations.
 * SUPERADMIN always passes. ADMIN only passes if explicitly granted users.write.
 *
 * @throws GraphQLError UNAUTHENTICATED or FORBIDDEN.
 */
export function requireUsersWriteGraphQL(context: GraphQLContext): CurrentUser {
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

  if (!hasPermission(context.currentUser, 'users.write')) {
    throw new GraphQLError('No tienes permiso para gestionar usuarios.', {
      extensions: { code: 'FORBIDDEN' },
    })
  }

  return context.currentUser
}
