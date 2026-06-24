import { z } from 'zod'

export const KEBAB_CASE_SLUG_REGEX = /^[a-z0-9]+(?:-[a-z0-9]+)*$/

const uuidSchema = z.string().uuid()

const kebabSlugSchema = z
  .string()
  .trim()
  .min(1, 'El slug es requerido.')
  .max(80)
  .regex(KEBAB_CASE_SLUG_REGEX, 'El slug debe estar en minúsculas y formato kebab-case.')

const optionalKebabSlugSchema = z
  .string()
  .trim()
  .min(1)
  .max(80)
  .regex(KEBAB_CASE_SLUG_REGEX, 'El shopSlug debe estar en minúsculas y formato kebab-case.')
  .optional()
  .nullable()

export const productTypeIdSchema = uuidSchema

export const adminProductTypesListInputSchema = z.object({
  includeInactive: z.boolean().optional().nullable(),
})

export const createAdminProductTypeInputSchema = z.object({
  slug: kebabSlugSchema,
  shopSlug: optionalKebabSlugSchema,
  nameEs: z.string().trim().min(1, 'El nombre en español es requerido.').max(120),
  nameEn: z.string().trim().max(120).optional().nullable(),
  description: z.string().trim().max(2000).optional().nullable(),
  sortOrder: z.number().int().min(0).max(9999).optional().nullable(),
  isActive: z.boolean().optional().nullable(),
  showInNav: z.boolean().optional().nullable(),
})

export const updateAdminProductTypeInputSchema = z
  .object({
    slug: kebabSlugSchema.optional(),
    shopSlug: optionalKebabSlugSchema,
    nameEs: z.string().trim().min(1).max(120).optional(),
    nameEn: z.string().trim().max(120).optional().nullable(),
    description: z.string().trim().max(2000).optional().nullable(),
    sortOrder: z.number().int().min(0).max(9999).optional().nullable(),
    isActive: z.boolean().optional().nullable(),
    showInNav: z.boolean().optional().nullable(),
  })
  .refine((value) => Object.keys(value).length > 0, {
    message: 'Debes enviar al menos un campo para actualizar.',
  })

/**
 * Parses admin product types list query input with defaults.
 */
export function parseAdminProductTypesListInput(input: unknown) {
  const parsed = adminProductTypesListInputSchema.parse(input ?? {})
  return {
    includeInactive: parsed.includeInactive ?? true,
  }
}
