import { RoleSlug } from '@prisma/client'

/** Default invitation TTL in days. */
export const USER_INVITATION_TTL_DAYS = 7

/** Roles that can be assigned via admin invitation in Phase 3A. */
export const INVITABLE_ROLE_SLUGS: RoleSlug[] = [RoleSlug.CUSTOMER, RoleSlug.ADMIN]
