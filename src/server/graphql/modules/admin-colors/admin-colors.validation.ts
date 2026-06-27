import { z } from 'zod'

import { hasAtLeastOneColorScope } from '@/src/lib/color-scopes'

export const KEBAB_CASE_SLUG_REGEX = /^[a-z0-9]+(?:-[a-z0-9]+)*$/
export const HEX_COLOR_REGEX = /^#[0-9A-Fa-f]{6}$/

const uuidSchema = z.string().uuid()

const kebabSlugSchema = z
  .string()
  .trim()
  .min(1, 'El slug es requerido.')
  .max(80)
  .regex(KEBAB_CASE_SLUG_REGEX, 'El slug debe estar en minúsculas y formato kebab-case.')

const hexSchema = z
  .string()
  .trim()
  .regex(HEX_COLOR_REGEX, 'El hex debe ser un color válido (#RRGGBB).')

const scopeFlagsSchema = z.object({
  isFabricColor: z.boolean().optional().nullable(),
  isProductColor: z.boolean().optional().nullable(),
  isGeneralColor: z.boolean().optional().nullable(),
})

function parseScopeFlags(input: z.infer<typeof scopeFlagsSchema>) {
  return {
    isFabricColor: input.isFabricColor ?? false,
    isProductColor: input.isProductColor ?? false,
    isGeneralColor: input.isGeneralColor ?? false,
  }
}

export const colorIdSchema = uuidSchema

export const adminColorsListInputSchema = z.object({
  includeInactive: z.boolean().optional().nullable(),
})

export const createAdminColorInputSchema = z
  .object({
    slug: kebabSlugSchema,
    name: z.string().trim().min(1, 'El nombre es requerido.').max(120),
    hex: hexSchema,
    isFabricColor: z.boolean().optional().nullable(),
    isProductColor: z.boolean().optional().nullable(),
    isGeneralColor: z.boolean().optional().nullable(),
    isActive: z.boolean().optional().nullable(),
    sortOrder: z.number().int().min(0).max(9999).optional().nullable(),
  })
  .superRefine((value, ctx) => {
    const scopes = parseScopeFlags(value)
    if (!hasAtLeastOneColorScope(scopes)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Selecciona al menos un alcance: tela, variante o general.',
        path: ['isFabricColor'],
      })
    }
  })
  .transform((value) => ({
    slug: value.slug,
    name: value.name,
    hex: value.hex.toUpperCase(),
    ...parseScopeFlags(value),
    isActive: value.isActive ?? true,
    sortOrder: value.sortOrder ?? 0,
  }))

export const updateAdminColorInputSchema = z
  .object({
    slug: kebabSlugSchema.optional(),
    name: z.string().trim().min(1).max(120).optional(),
    hex: hexSchema.optional(),
    isFabricColor: z.boolean().optional().nullable(),
    isProductColor: z.boolean().optional().nullable(),
    isGeneralColor: z.boolean().optional().nullable(),
    isActive: z.boolean().optional().nullable(),
    sortOrder: z.number().int().min(0).max(9999).optional().nullable(),
  })
  .refine((value) => Object.keys(value).length > 0, {
    message: 'Debes enviar al menos un campo para actualizar.',
  })
  .superRefine((value, ctx) => {
    const hasScopeInput =
      value.isFabricColor != null || value.isProductColor != null || value.isGeneralColor != null
    if (!hasScopeInput) return

    const scopes = parseScopeFlags({
      isFabricColor: value.isFabricColor,
      isProductColor: value.isProductColor,
      isGeneralColor: value.isGeneralColor,
    })
    if (!hasAtLeastOneColorScope(scopes)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Selecciona al menos un alcance: tela, variante o general.',
        path: ['isFabricColor'],
      })
    }
  })

export function parseAdminColorsListInput(input: unknown) {
  const parsed = adminColorsListInputSchema.parse(input ?? {})
  return {
    includeInactive: parsed.includeInactive ?? true,
  }
}
