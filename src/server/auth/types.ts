import type { RoleSlug, CustomerTier } from '@prisma/client'

/** Authenticated user with Chef Room RBAC (from Better Auth session + Prisma). */
export type CurrentUser = {
  id: string
  email: string
  emailVerified: boolean
  name: string
  firstName: string | null
  lastName: string | null
  phone: string | null
  image: string | null
  customerTier: CustomerTier
  roles: RoleSlug[]
  permissions: string[]
}
