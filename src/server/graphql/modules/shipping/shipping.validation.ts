import { z } from 'zod'

const mxPostalCodeSchema = z
  .string()
  .trim()
  .regex(/^\d{5}$/, 'Código postal inválido (5 dígitos, México)')

export const shippingAddressQuoteInputSchema = z.object({
  postalCode: mxPostalCodeSchema,
  city: z.string().trim().min(1).optional().nullable(),
  state: z.string().trim().min(1).optional().nullable(),
  country: z.preprocess(
    (value) => (value == null || value === '' ? 'MX' : value),
    z.string().trim().length(2, 'País inválido'),
  ),
})

export const createShippingQuoteInputSchema = z.object({
  destination: shippingAddressQuoteInputSchema,
})

export const shippingQuoteIdSchema = z.string().trim().uuid('ID de cotización inválido')

export const shippingRateIdSchema = z.string().trim().uuid('ID de tarifa inválido')

export type ParsedCreateShippingQuoteInput = z.infer<typeof createShippingQuoteInputSchema>
