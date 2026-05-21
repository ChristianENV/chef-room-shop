import { z } from 'zod'

const LABEL_FORMATS = ['PDF', 'ZPL', 'EPL'] as const

export const orderNumberSchema = z
  .string()
  .trim()
  .min(1, 'Número de pedido requerido')

export const adminCreateShippingLabelInputSchema = z.object({
  orderNumber: orderNumberSchema,
  rateId: z.string().trim().uuid('ID de tarifa inválido').optional().nullable(),
  labelFormat: z
    .string()
    .trim()
    .toUpperCase()
    .refine(
      (value) => LABEL_FORMATS.includes(value as (typeof LABEL_FORMATS)[number]),
      'Formato de etiqueta inválido (PDF, ZPL o EPL).',
    )
    .optional()
    .nullable(),
})

export const adminCancelShippingLabelInputSchema = z.object({
  orderNumber: orderNumberSchema,
  reason: z
    .string()
    .trim()
    .max(500, 'El motivo no puede exceder 500 caracteres.')
    .optional()
    .nullable(),
})

export type ParsedAdminCreateShippingLabelInput = z.infer<
  typeof adminCreateShippingLabelInputSchema
>
