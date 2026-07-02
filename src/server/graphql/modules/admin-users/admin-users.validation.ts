import { RoleSlug, UserStatus } from '@prisma/client'
import { z } from 'zod'

const userStatusValues = Object.values(UserStatus) as [string, ...string[]]
const roleSlugValues = Object.values(RoleSlug) as [string, ...string[]]

const segmentValues = ['CUSTOMERS', 'ADMINS'] as [string, ...string[]]

export const adminUsersListInputSchema = z.object({
  filter: z
    .object({
      search: z.string().trim().max(120).optional().nullable(),
      role: z.enum(roleSlugValues).optional().nullable(),
      status: z.enum(userStatusValues).optional().nullable(),
      segment: z.enum(segmentValues).optional().nullable(),
    })
    .optional()
    .nullable(),
  limit: z.number().int().min(1).max(100).optional().nullable(),
  offset: z.number().int().min(0).optional().nullable(),
})

/**
 * Parses admin users list query input with defaults (limit 25, offset 0).
 */
export function parseAdminUsersListInput(input: unknown) {
  const parsed = adminUsersListInputSchema.parse(input ?? {})
  return {
    filter: parsed.filter ?? undefined,
    limit: parsed.limit ?? 25,
    offset: parsed.offset ?? 0,
  }
}
