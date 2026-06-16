import { PaymentStatus } from '@prisma/client'
import { z } from 'zod'

const paymentStatusValues = Object.values(PaymentStatus) as [string, ...string[]]

export const adminPaymentsListInputSchema = z.object({
  filter: z
    .object({
      search: z.string().trim().max(120).optional().nullable(),
      status: z.enum(paymentStatusValues).optional().nullable(),
    })
    .optional()
    .nullable(),
  limit: z.number().int().min(1).max(100).optional().nullable(),
  offset: z.number().int().min(0).optional().nullable(),
})

/**
 * Parses admin payments list query input with defaults (limit 50, offset 0).
 */
export function parseAdminPaymentsListInput(input: unknown) {
  const parsed = adminPaymentsListInputSchema.parse(input ?? {})
  return {
    filter: parsed.filter ?? undefined,
    limit: parsed.limit ?? 50,
    offset: parsed.offset ?? 0,
  }
}
