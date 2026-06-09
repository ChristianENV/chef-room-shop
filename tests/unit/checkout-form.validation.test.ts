import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import { buildCreateCheckoutOrderInput } from '@/src/features/storefront/checkout/mappers/checkout-ui.mapper'
import { validateShippingStep } from '@/src/features/storefront/checkout/lib/checkout-step-validation'

const baseShipping = {
  firstName: 'Ana',
  lastName: 'López',
  street: 'Av. Reforma',
  exteriorNumber: '123',
  interiorNumber: '',
  neighborhood: '',
  city: 'CDMX',
  state: 'Ciudad de México',
  postalCode: '06600',
  country: 'Mexico',
  saveAddress: false,
}

describe('checkout shipping validation', () => {
  it('rejects empty neighborhood before completeCheckout', () => {
    const result = validateShippingStep(baseShipping)
    assert.equal(result.success, false)
    assert.equal(result.errors.neighborhood, 'La colonia es requerida')
  })

  it('maps neighborhood as string, not null', () => {
    const input = buildCreateCheckoutOrderInput({
      contact: { email: 'ana@example.com', phone: '5512345678' },
      shipping: { ...baseShipping, neighborhood: 'Centro' },
      billing: { sameAsShipping: true, ...baseShipping, neighborhood: 'Centro' },
      paymentMethod: 'card',
    })

    assert.equal(input.shippingAddress.neighborhood, 'Centro')
    assert.notEqual(input.shippingAddress.neighborhood, null)
  })
})
