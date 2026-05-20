import { z } from 'zod'

export const itemIdSchema = z.string().trim().min(1, 'ID requerido')

export const addCartItemInputSchema = z.object({
  productId: itemIdSchema,
  productVariantId: itemIdSchema.optional().nullable(),
  designId: itemIdSchema.optional().nullable(),
  quantity: z.number().int().min(1).max(99),
})

export const updateCartItemQuantityInputSchema = z.object({
  itemId: itemIdSchema,
  quantity: z.number().int().min(0).max(99),
})
