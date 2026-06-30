import { z } from 'zod'

export const itemIdSchema = z.string().trim().min(1, 'ID requerido')

const slugSchema = z.string().trim().min(1, 'Slug requerido')

export const productOptionSelectionInputSchema = z
  .object({
    groupId: itemIdSchema.optional(),
    groupSlug: slugSchema.optional(),
    valueId: itemIdSchema.optional(),
    valueSlug: slugSchema.optional(),
  })
  .superRefine((selection, ctx) => {
    if (!selection.groupId && !selection.groupSlug) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Cada opción comercial debe incluir groupId o groupSlug.',
      })
    }
    if (!selection.valueId && !selection.valueSlug) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Cada opción comercial debe incluir valueId o valueSlug.',
      })
    }
  })

export const addCartItemInputSchema = z.object({
  productId: itemIdSchema,
  productVariantId: itemIdSchema.optional().nullable(),
  designId: itemIdSchema.optional().nullable(),
  quantity: z.number().int().min(1).max(99),
  selectedCommercialOptions: z.array(productOptionSelectionInputSchema).optional().nullable(),
})

export const updateCartItemQuantityInputSchema = z.object({
  itemId: itemIdSchema,
  quantity: z.number().int().min(0).max(99),
})
