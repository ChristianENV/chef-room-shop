import type { RoleSlug } from '@prisma/client'

/** Authenticated user with Chef Room RBAC (from Better Auth session + Prisma). */
export type CurrentUser = {
  id: string
  email: string
  name: string
  firstName: string | null
  lastName: string | null
  phone: string | null
  image: string | null
  roles: RoleSlug[]
  permissions: string[]
}
