import { PaymentMethod } from '@prisma/client'
import { z } from 'zod'

const checkoutAddressSchema = z.object({
  firstName: z.string().trim().min(1, 'Nombre requerido'),
  lastName: z.string().trim().min(1, 'Apellido requerido'),
  phone: z.string().trim().min(8, 'Teléfono requerido'),
  street: z.string().trim().min(1, 'Calle requerida'),
  extNumber: z.string().trim().optional().nullable(),
  intNumber: z.string().trim().optional().nullable(),
  neighborhood: z.string().trim().optional().nullable(),
  city: z.string().trim().min(1, 'Ciudad requerida'),
  state: z.string().trim().min(1, 'Estado requerido'),
  country: z.string().trim().min(2, 'País requerido'),
  postalCode: z.string().trim().min(4, 'Código postal requerido'),
  references: z.string().trim().optional().nullable(),
})

export const createCheckoutOrderInputSchema = z.object({
  email: z.string().trim().email('Correo electrónico inválido'),
  phone: z.string().trim().min(8, 'Teléfono requerido'),
  shippingAddress: checkoutAddressSchema,
  billingAddress: checkoutAddressSchema.optional().nullable(),
  useSameBillingAddress: z.boolean().optional().default(true),
  notes: z.string().trim().optional().nullable(),
  paymentMethod: z.enum(['CARD', 'OXXO', 'SPEI'], {
    message: 'Método de pago inválido',
  }),
})

export type ParsedCreateCheckoutOrderInput = z.infer<
  typeof createCheckoutOrderInputSchema
>

const PAYMENT_METHOD_MAP: Record<
  ParsedCreateCheckoutOrderInput['paymentMethod'],
  PaymentMethod
> = {
  CARD: PaymentMethod.CARD,
  OXXO: PaymentMethod.OXXO,
  SPEI: PaymentMethod.SPEI,
}

/**
 * Maps validated GraphQL payment method string to Prisma enum.
 */
export function toPaymentMethod(
  method: ParsedCreateCheckoutOrderInput['paymentMethod'],
): PaymentMethod {
  return PAYMENT_METHOD_MAP[method]
}
