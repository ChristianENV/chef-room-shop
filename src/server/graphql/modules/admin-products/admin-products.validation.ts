import { ProductStatus } from '@prisma/client'
import { z } from 'zod'

const productStatusValues = Object.values(ProductStatus) as [string, ...string[]]
const sortFields = ['name', 'createdAt', 'updatedAt', 'basePriceCents', 'status'] as const

const uuidSchema = z.string().uuid()

export const adminProductsListInputSchema = z.object({
  filter: z
    .object({
      search: z.string().trim().max(120).optional().nullable(),
      productTypeSlug: z.string().trim().max(80).optional().nullable(),
      status: z.enum(productStatusValues).optional().nullable(),
      customizable: z.boolean().optional().nullable(),
      includeArchived: z.boolean().optional().nullable(),
    })
    .optional()
    .nullable(),
  sort: z
    .object({
      field: z.enum(sortFields).optional().nullable(),
      direction: z.enum(['asc', 'desc']).optional().nullable(),
    })
    .optional()
    .nullable(),
  limit: z.number().int().min(1).max(100).optional().nullable(),
  offset: z.number().int().min(0).optional().nullable(),
})

export const productIdSchema = uuidSchema
export const variantIdSchema = uuidSchema
export const imageIdSchema = uuidSchema

export const adminProductInputSchema = z.object({
  name: z.string().trim().min(1).max(160),
  slug: z.string().trim().max(120).optional().nullable(),
  shortDescription: z.string().trim().max(500).optional().nullable(),
  description: z.string().trim().max(8000).optional().nullable(),
  productTypeId: uuidSchema,
  basePriceCents: z.number().int().min(0),
  currency: z.string().trim().max(8).optional().nullable(),
  customizable: z.boolean().optional().nullable(),
  status: z.enum(productStatusValues).optional().nullable(),
  seoTitle: z.string().trim().max(160).optional().nullable(),
  seoDescription: z.string().trim().max(320).optional().nullable(),
  seoImageId: uuidSchema.optional().nullable(),
})

export const adminProductVariantInputSchema = z.object({
  id: uuidSchema.optional().nullable(),
  productId: uuidSchema,
  sku: z.string().trim().max(80).optional().nullable(),
  variantName: z.string().trim().max(120).optional().nullable(),
  colorId: uuidSchema.optional().nullable(),
  sizeId: uuidSchema.optional().nullable(),
  priceCents: z.number().int().min(0).optional().nullable(),
  stockQty: z.number().int().min(0).optional().nullable(),
  isActive: z.boolean().optional().nullable(),
})

export const adminProductImageInputSchema = z.object({
  id: uuidSchema.optional().nullable(),
  productId: uuidSchema,
  url: z.string().trim().min(1).max(2000),
  publicId: z.string().trim().max(200).optional().nullable(),
  alt: z.string().trim().max(200).optional().nullable(),
  sortOrder: z.number().int().min(0).optional().nullable(),
  isPrimary: z.boolean().optional().nullable(),
})

export const updateAdminProductStatusSchema = z.object({
  id: uuidSchema,
  status: z.enum(productStatusValues),
})

export const reorderAdminProductImagesSchema = z.object({
  productId: uuidSchema,
  imageIds: z.array(uuidSchema).min(1).max(10),
})

export const productSlugSchema = z.string().trim().min(1).max(120)

/**
 * Parses admin products list query input with defaults.
 */
export function parseAdminProductsListInput(input: unknown) {
  const parsed = adminProductsListInputSchema.parse(input ?? {})
  return {
    filter: parsed.filter ?? undefined,
    sort: parsed.sort ?? undefined,
    limit: parsed.limit ?? 20,
    offset: parsed.offset ?? 0,
  }
}
