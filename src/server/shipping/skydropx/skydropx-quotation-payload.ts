import type { CartItemQuantityInput } from '../shipping-package.shared'
import { getPackageForCartItems } from '../shipping-package.shared'
import { toSkydropxV1AddressInput } from './skydropx-address'
import { mapPackageToSkydropxParcel } from './skydropx-parcel'
import type { SkydropxCreateQuotationRequest } from './skydropx.types'
import { normalizeMxPostalCode, validateShippingOriginForQuotation } from './skydropx.validation'

export type QuotationDestinationInput = {
  postalCode: string
  state: string
  city: string
  neighborhood: string
  country?: string
}

export type MapCartToQuotationPayloadInput = {
  destination: QuotationDestinationInput
  cartItems: CartItemQuantityInput[]
  orderId?: string
  requestedCarriers?: string[]
}

function mapAddressToSkydropxQuotationDestination(
  input: QuotationDestinationInput,
): ReturnType<typeof toSkydropxV1AddressInput> {
  const postal_code = normalizeMxPostalCode(input.postalCode)
  const city = input.city?.trim() || 'Ciudad'
  const state = input.state?.trim() || 'México'
  const neighborhood = input.neighborhood?.trim() || city

  return {
    country_code: 'MX',
    postal_code,
    area_level1: state,
    area_level2: city,
    area_level3: neighborhood,
  }
}

/**
 * Builds POST /api/v1/quotations body from cart + destination.
 */
export function mapCartToQuotationPayload(
  input: MapCartToQuotationPayloadInput,
): SkydropxCreateQuotationRequest {
  const pkg = getPackageForCartItems(input.cartItems)
  const addressFrom = toSkydropxV1AddressInput(validateShippingOriginForQuotation())
  const addressTo = mapAddressToSkydropxQuotationDestination(input.destination)

  return {
    quotation: {
      order_id: input.orderId,
      address_from: addressFrom,
      address_to: addressTo,
      parcels: [mapPackageToSkydropxParcel(pkg)],
      requested_carriers: input.requestedCarriers,
    },
  }
}

export function mapShippingQuoteToSkydropxQuotationPayload(
  input: MapCartToQuotationPayloadInput,
): SkydropxCreateQuotationRequest {
  return mapCartToQuotationPayload(input)
}
