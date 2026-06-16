import { z } from 'zod'
import { ShipmentStatus } from '@prisma/client'

const LABEL_FORMATS = ['PDF', 'ZPL', 'EPL'] as const
const shipmentStatusValues = Object.values(ShipmentStatus) as [string, ...string[]]

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

export const adminShipmentsListInputSchema = z.object({
  filter: z
    .object({
      search: z.string().trim().max(120).optional().nullable(),
      status: z.enum(shipmentStatusValues).optional().nullable(),
    })
    .optional()
    .nullable(),
  limit: z.number().int().min(1).max(100).optional().nullable(),
  offset: z.number().int().min(0).optional().nullable(),
})

/**
 * Parses admin shipments list query input with defaults (limit 50, offset 0).
 */
export function parseAdminShipmentsListInput(input: unknown) {
  const parsed = adminShipmentsListInputSchema.parse(input ?? {})
  return {
    filter: parsed.filter ?? undefined,
    limit: parsed.limit ?? 50,
    offset: parsed.offset ?? 0,
  }
}
