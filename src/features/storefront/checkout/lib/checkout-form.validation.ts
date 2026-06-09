import { z } from 'zod'

const addressFieldsSchema = z.object({
  firstName: z.string().trim().min(1, 'El nombre es requerido'),
  lastName: z.string().trim().min(1, 'El apellido es requerido'),
  street: z.string().trim().min(1, 'La calle es requerida'),
  exteriorNumber: z.string().trim().min(1, 'El número exterior es requerido'),
  interiorNumber: z.string().trim().optional(),
  neighborhood: z.string().trim().min(1, 'La colonia es requerida'),
  city: z.string().trim().min(1, 'La ciudad es requerida'),
  state: z.string().trim().min(1, 'El estado es requerido'),
  postalCode: z.string().trim().min(4, 'El código postal es requerido'),
  country: z.string().trim().min(2, 'El país es requerido'),
})

export const checkoutFormSchema = z.object({
  email: z.string().trim().email('Ingresa un correo válido'),
  phone: z.string().trim().min(8, 'El teléfono es requerido'),
  shipping: addressFieldsSchema,
  billingSameAsShipping: z.boolean(),
  billing: addressFieldsSchema.optional(),
  paymentMethod: z.enum(['card', 'oxxo', 'spei'], {
    message: 'Selecciona un método de pago',
  }),
  notes: z.string().trim().optional(),
})

export type CheckoutFormValues = z.infer<typeof checkoutFormSchema>

/**
 * Maps UI payment tab value to BFF payment method code.
 */
export function mapPaymentMethodToBff(method: CheckoutFormValues['paymentMethod']): string {
  switch (method) {
    case 'card':
      return 'CARD'
    case 'oxxo':
      return 'OXXO'
    case 'spei':
      return 'SPEI'
  }
}

/**
 * Normalizes country label from UI to ISO-style code for the BFF.
 */
export function normalizeCountryCode(country: string): string {
  const normalized = country.trim().toLowerCase()
  if (normalized === 'méxico' || normalized === 'mexico' || normalized === 'mx') {
    return 'MX'
  }
  return country.trim().toUpperCase()
}
