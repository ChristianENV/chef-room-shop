import { AddressType, DesignStatus } from '@prisma/client'
import { z } from 'zod'

const DEFAULT_LIMIT = 20
const MAX_LIMIT = 100

export const paginationSchema = z.object({
  limit: z
    .number()
    .int()
    .min(1)
    .max(MAX_LIMIT)
    .optional()
    .nullable()
    .transform((v) => v ?? DEFAULT_LIMIT),
  offset: z
    .number()
    .int()
    .min(0)
    .optional()
    .nullable()
    .transform((v) => v ?? 0),
})

export const designStatusSchema = z
  .string()
  .optional()
  .nullable()
  .transform((value) => {
    if (!value) return undefined
    const upper = value.toUpperCase()
    if (Object.values(DesignStatus).includes(upper as DesignStatus)) {
      return upper as DesignStatus
    }
    return undefined
  })

export const updateMyProfileSchema = z.object({
  firstName: z.string().trim().min(1).max(120).optional().nullable(),
  lastName: z.string().trim().min(1).max(120).optional().nullable(),
  phone: z.string().trim().max(30).optional().nullable(),
  marketingOptIn: z.boolean().optional().nullable(),
})

export const addressTypeSchema = z
  .string()
  .min(1)
  .transform((value) => value.toUpperCase())
  .refine((value) => Object.values(AddressType).includes(value as AddressType), {
    message: 'Tipo de dirección inválido.',
  })
  .transform((value) => value as AddressType)

/**
 * Parses a storefront address type string to Prisma enum.
 */
export function parseAddressType(value: string): AddressType {
  return addressTypeSchema.parse(value)
}

export const myAddressInputSchema = z.object({
  type: addressTypeSchema,
  firstName: z.string().trim().max(120).optional().nullable(),
  lastName: z.string().trim().max(120).optional().nullable(),
  phone: z.string().trim().max(30).optional().nullable(),
  street: z.string().trim().min(1).max(200),
  extNumber: z.string().trim().max(40).optional().nullable(),
  intNumber: z.string().trim().max(40).optional().nullable(),
  neighborhood: z.string().trim().max(120).optional().nullable(),
  city: z.string().trim().min(1).max(120),
  state: z.string().trim().min(1).max(120),
  country: z
    .string()
    .trim()
    .max(2)
    .optional()
    .nullable()
    .transform((v) => v ?? 'MX'),
  postalCode: z.string().trim().min(3).max(20),
  references: z.string().trim().max(300).optional().nullable(),
  isDefault: z.boolean().optional().nullable(),
})

export type ValidatedUpdateMyProfileInput = z.infer<typeof updateMyProfileSchema>
export type ValidatedMyAddressInput = z.infer<typeof myAddressInputSchema>
export type ValidatedPagination = z.infer<typeof paginationSchema>

/**
 * Parses and clamps list pagination arguments.
 */
export function parsePagination(input?: { limit?: number | null; offset?: number | null }) {
  return paginationSchema.parse({
    limit: input?.limit,
    offset: input?.offset,
  })
}
