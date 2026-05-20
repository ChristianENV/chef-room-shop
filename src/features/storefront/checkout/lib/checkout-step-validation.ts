import type { ZodError } from 'zod'

import type { BillingAddressData } from '../billing-address-form'
import type { ContactFormData } from '../contact-form'
import type { ShippingAddressData } from '../shipping-address-form'
import { checkoutFormSchema } from './checkout-form.validation'

const contactStepSchema = checkoutFormSchema.pick({ email: true, phone: true })
const shippingStepSchema = checkoutFormSchema.pick({ shipping: true })
const paymentStepSchema = checkoutFormSchema.pick({ paymentMethod: true })

function flattenZodErrors(error: ZodError): Record<string, string> {
  const out: Record<string, string> = {}
  for (const issue of error.issues) {
    const key = issue.path.join('.')
    if (!out[key]) out[key] = issue.message
  }
  return out
}

function stripSaveAddress({ saveAddress: _, ...address }: ShippingAddressData) {
  return address
}

function stripBillingMeta({ sameAsShipping: _, ...address }: BillingAddressData) {
  return address
}

/**
 * Validates contact step fields (email, phone).
 */
export function validateContactStep(data: ContactFormData): {
  success: boolean
  errors: Partial<Record<keyof ContactFormData, string>>
} {
  const result = contactStepSchema.safeParse(data)
  if (result.success) return { success: true, errors: {} }

  const flat = flattenZodErrors(result.error)
  return {
    success: false,
    errors: {
      email: flat.email,
      phone: flat.phone,
    },
  }
}

/**
 * Validates shipping address step fields.
 */
export function validateShippingStep(data: ShippingAddressData): {
  success: boolean
  errors: Partial<Record<keyof ShippingAddressData, string>>
} {
  const result = shippingStepSchema.safeParse({ shipping: stripSaveAddress(data) })
  if (result.success) return { success: true, errors: {} }

  const flat = flattenZodErrors(result.error)
  const errors: Partial<Record<keyof ShippingAddressData, string>> = {}
  for (const [key, message] of Object.entries(flat)) {
    const field = key.replace(/^shipping\./, '')
    if (field in data) {
      errors[field as keyof ShippingAddressData] = message
    }
  }
  return { success: false, errors }
}

/**
 * Validates billing address when it differs from shipping.
 */
export function validateBillingStep(data: BillingAddressData): {
  success: boolean
  errors: Partial<Record<keyof BillingAddressData, string>>
} {
  if (data.sameAsShipping) return { success: true, errors: {} }

  const result = checkoutFormSchema.shape.shipping.safeParse(stripBillingMeta(data))
  if (result.success) return { success: true, errors: {} }

  const flat = flattenZodErrors(result.error)
  const errors: Partial<Record<keyof BillingAddressData, string>> = {}
  for (const [key, message] of Object.entries(flat)) {
    if (key in data) {
      errors[key as keyof BillingAddressData] = message
    }
  }
  return { success: false, errors }
}

/**
 * Validates payment method selection.
 */
export function validatePaymentStep(paymentMethod: string): boolean {
  return paymentStepSchema.safeParse({ paymentMethod }).success
}

/**
 * Maps GraphQL/checkout failures to a user-facing message.
 */
export function getCheckoutErrorMessage(error: unknown): string {
  const message = error instanceof Error ? error.message.toLowerCase() : ''

  if (
    message.includes('cart') &&
    (message.includes('empty') || message.includes('vac') || message.includes('not found'))
  ) {
    return 'Tu carrito está vacío o expiró.'
  }

  if (message.includes('guest') && message.includes('session')) {
    return 'Tu sesión de invitado expiró. Agrega productos de nuevo e intenta otra vez.'
  }

  return 'No pudimos crear tu pedido. Revisa tus datos e intenta de nuevo.'
}
