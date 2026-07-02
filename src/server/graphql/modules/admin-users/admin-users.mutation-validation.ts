import { CustomerTier } from '@prisma/client'
import { z } from 'zod'

const customerTierValues = Object.values(CustomerTier) as [string, ...string[]]

export const updateAdminUserInputSchema = z.object({
  id: z.string().uuid(),
  name: z.string().trim().min(1).max(120).optional().nullable(),
  firstName: z.string().trim().max(80).optional().nullable(),
  lastName: z.string().trim().max(80).optional().nullable(),
  phone: z.string().trim().max(30).optional().nullable(),
  customerTier: z.enum(customerTierValues).optional().nullable(),
})

export const userIdInputSchema = z.object({
  id: z.string().uuid(),
})

export function parseUpdateAdminUserInput(input: unknown) {
  return updateAdminUserInputSchema.parse(input)
}

export function parseUserIdInput(input: unknown) {
  return userIdInputSchema.parse(input)
}
