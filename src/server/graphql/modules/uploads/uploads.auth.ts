import { GraphQLError } from 'graphql'

import { canAccessAdmin } from '@/src/server/auth/permissions'
import type { CurrentUser } from '@/src/server/auth/types'

import type { GraphQLContext } from '../../context'

/**
 * Avatar uploads require any authenticated user. A user may only ever act on
 * their own avatar — the session id is the single source of truth, never input.
 *
 * @returns the authenticated user's id.
 */
export function requireAvatarUploadActor(context: GraphQLContext): string {
  if (!context.currentUser) {
    throw new GraphQLError('Debes iniciar sesión para continuar.', {
      extensions: { code: 'UNAUTHENTICATED' },
    })
  }
  return context.currentUser.id
}

/**
 * Product image uploads require an admin (ADMIN or SUPERADMIN).
 *
 * @throws GraphQLError UNAUTHENTICATED or FORBIDDEN.
 */
export function requireProductImageUploadActor(context: GraphQLContext): CurrentUser {
  return requireAdminUploadActor(context, 'No tienes permiso para subir imágenes de producto.')
}

/**
 * Product type (category) card image uploads require an admin (ADMIN or SUPERADMIN).
 */
export function requireProductTypeCardImageUploadActor(context: GraphQLContext): CurrentUser {
  return requireAdminUploadActor(context, 'No tienes permiso para subir imágenes de categoría.')
}

function requireAdminUploadActor(context: GraphQLContext, forbiddenMessage: string): CurrentUser {
  if (!context.currentUser) {
    throw new GraphQLError('Debes iniciar sesión para continuar.', {
      extensions: { code: 'UNAUTHENTICATED' },
    })
  }
  if (!canAccessAdmin(context.currentUser)) {
    throw new GraphQLError(forbiddenMessage, {
      extensions: { code: 'FORBIDDEN' },
    })
  }
  return context.currentUser
}
