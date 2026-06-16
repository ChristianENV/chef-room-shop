import { DesignStatus } from '@prisma/client'
import { z } from 'zod'

const designStatusValues = Object.values(DesignStatus) as [string, ...string[]]
const ownerTypeValues = ['USER', 'GUEST'] as const

export const adminDesignsListInputSchema = z.object({
  filter: z
    .object({
      search: z.string().trim().max(120).optional().nullable(),
      status: z.enum(designStatusValues).optional().nullable(),
      ownerType: z.enum(ownerTypeValues).optional().nullable(),
    })
    .optional()
    .nullable(),
  limit: z.number().int().min(1).max(100).optional().nullable(),
  offset: z.number().int().min(0).optional().nullable(),
})

/**
 * Parses admin designs list query input with defaults (limit 50, offset 0).
 */
export function parseAdminDesignsListInput(input: unknown) {
  const parsed = adminDesignsListInputSchema.parse(input ?? {})
  return {
    filter: parsed.filter ?? undefined,
    limit: parsed.limit ?? 50,
    offset: parsed.offset ?? 0,
  }
}
