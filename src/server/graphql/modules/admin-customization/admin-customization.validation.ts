import { z } from 'zod'

const uuidSchema = z.string().uuid()

const allowedFileTypeValues = ['png', 'jpg', 'jpeg', 'svg', 'pdf'] as const

export const adminCustomizationRulesFilterSchema = z.object({
  productId: uuidSchema.optional().nullable(),
  productSlug: z.string().trim().min(1).max(120).optional().nullable(),
  areaSlug: z.string().trim().min(1).max(80).optional().nullable(),
  optionSlug: z.string().trim().min(1).max(80).optional().nullable(),
  enabled: z.boolean().optional().nullable(),
  search: z.string().trim().max(120).optional().nullable(),
})

export const adminCustomizationRulesListInputSchema = z.object({
  filter: adminCustomizationRulesFilterSchema.optional().nullable(),
  limit: z.number().int().min(1).max(200).optional().nullable(),
  offset: z.number().int().min(0).optional().nullable(),
})

export const ruleIdSchema = uuidSchema

export const adminCustomizationRuleInputSchema = z.object({
  productId: uuidSchema,
  areaId: uuidSchema,
  optionId: uuidSchema,
  enabled: z.boolean().optional().nullable(),
  maxWidthCm: z.number().positive().optional().nullable(),
  maxHeightCm: z.number().positive().optional().nullable(),
  minQuantity: z.number().int().min(1).optional().nullable(),
  basePriceCents: z.number().int().min(0).optional().nullable(),
  pricePerCmCents: z.number().int().min(0).optional().nullable(),
  extraProductionDays: z.number().int().min(0).optional().nullable(),
  allowedFileTypes: z.array(z.enum(allowedFileTypeValues)).optional().nullable(),
  validationMessage: z.string().trim().max(500).optional().nullable(),
  notes: z.string().trim().max(1000).optional().nullable(),
  metadataJson: z.record(z.string(), z.unknown()).optional().nullable(),
})

export const duplicateCustomizationRulesInputSchema = z.object({
  fromProductId: uuidSchema,
  toProductId: uuidSchema,
  overwriteExisting: z.boolean().optional().nullable(),
})

export const adminCustomizationPricingPreviewInputSchema = z.object({
  productId: uuidSchema,
  areaId: uuidSchema,
  optionId: uuidSchema,
  widthCm: z.number().min(0).optional().nullable(),
  heightCm: z.number().min(0).optional().nullable(),
  quantity: z.number().int().min(1).optional().nullable(),
})

export const adminCustomizationProductsInputSchema = z.object({
  search: z.string().trim().max(120).optional().nullable(),
  customizable: z.boolean().optional().nullable(),
})

export const productIdSchema = uuidSchema

/**
 * Parses admin customization rules list query input with defaults.
 */
export function parseAdminCustomizationRulesListInput(
  raw: AdminCustomizationRulesListInputRaw,
): z.infer<typeof adminCustomizationRulesListInputSchema> {
  return adminCustomizationRulesListInputSchema.parse(raw)
}

type AdminCustomizationRulesListInputRaw = {
  filter?: z.infer<typeof adminCustomizationRulesFilterSchema> | null
  limit?: number | null
  offset?: number | null
}
