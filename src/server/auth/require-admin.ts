import 'server-only'

import { redirect } from 'next/navigation'
import { GraphQLError } from 'graphql'

import { routes } from '@/src/config/routes'
import { getCurrentUser } from './current-user'
import { canAccessAdmin } from './permissions'
import type { CurrentUser } from './types'
import { isAdminAuthEnforced } from '@/src/lib/auth/session'

/**
 * Requires an authenticated admin user in GraphQL resolvers.
 * @throws GraphQLError with FORBIDDEN when the user lacks admin access.
 */
export async function requireAdmin(): Promise<CurrentUser> {
  const user = await getCurrentUser()

  if (!user) {
    throw new GraphQLError('Debes iniciar sesión para continuar.', {
      extensions: { code: 'UNAUTHENTICATED' },
    })
  }

  if (!canAccessAdmin(user)) {
    throw new GraphQLError('No tienes permiso para acceder a esta operación.', {
      extensions: { code: 'FORBIDDEN' },
    })
  }

  return user
}

/**
 * Server Component / layout guard for admin routes (validates session in DB).
 */
export async function requireAdminSession(): Promise<CurrentUser> {
  if (!isAdminAuthEnforced()) {
    // TODO: Remove bypass when admin UI is fully wired to real sessions in all environments.
    const user = await getCurrentUser()
    if (user && canAccessAdmin(user)) return user
    return {
      id: 'dev-bypass',
      email: 'dev@chefroom.local',
      name: 'Dev Admin',
      firstName: 'Dev',
      lastName: 'Admin',
      phone: null,
      image: null,
      roles: ['ADMIN'],
      permissions: [],
    }
  }

  const user = await getCurrentUser()

  if (!user || !canAccessAdmin(user)) {
    redirect(routes.adminLogin)
  }

  return user
}
