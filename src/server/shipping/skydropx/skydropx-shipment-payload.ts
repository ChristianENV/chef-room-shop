import { resolveShippingOriginFromEnv } from '../shipping-origin.resolve'
import type { SkydropxAddressInput, SkydropxCreateShipmentRequest } from './skydropx.types'
import {
  formatSkydropxStreet1,
  parseAddressLine2,
} from './skydropx.validation'

export type OrderShippingAddressInput = {
  fullName: string
  line1: string
  line2?: string | null
  neighborhood?: string | null
  city: string
  state: string
  postalCode: string
  country: string
  phone?: string | null
  email?: string
  reference?: string | null
}

export type MapOrderToSkydropxShipmentInput = {
  providerRateId: string
  printingFormat?: 'standard' | 'thermal'
  packageJson: unknown
  shippingAddress: OrderShippingAddressInput
  orderNumber: string
  customerEmail: string
}

export function mapOriginToSkydropxAddress(): SkydropxAddressInput {
  const origin = resolveShippingOriginFromEnv()
  const street1 = formatSkydropxStreet1(origin.street, origin.extNumber, origin.intNumber)

  return {
    country_code: origin.country,
    postal_code: origin.postalCode,
    area_level1: origin.state,
    area_level2: origin.city,
    area_level3: origin.neighborhood,
    street1,
    name: origin.name,
    company: origin.company,
    phone: origin.phone,
    email: origin.email,
    reference: origin.company || origin.name,
  }
}

function mapOrderAddressToSkydropx(
  address: OrderShippingAddressInput,
  email: string,
): SkydropxAddressInput & {
  street1: string
  name: string
  company: string
  phone: string
  email: string
  reference: string
} {
  const { extNumber, intNumber } = parseAddressLine2(address.line2)
  const street1 = formatSkydropxStreet1(address.line1, extNumber, intNumber)
  const neighborhood = address.neighborhood?.trim() || address.city

  return {
    country_code: address.country.length === 2 ? address.country : 'MX',
    postal_code: address.postalCode,
    area_level1: address.state,
    area_level2: address.city,
    area_level3: neighborhood,
    street1,
    name: address.fullName,
    company: address.fullName,
    phone: address.phone!.trim(),
    email: (address.email ?? email).trim(),
    reference: address.reference?.trim() || neighborhood,
  }
}

export function mapLabelFormatToSkydropx(
  labelFormat?: string | null,
): 'standard' | 'thermal' {
  const normalized = labelFormat?.trim().toUpperCase()
  if (normalized === 'ZPL' || normalized === 'EPL' || normalized === 'THERMAL') {
    return 'thermal'
  }
  return 'standard'
}

export function mapOrderToSkydropxShipmentPayload(
  input: MapOrderToSkydropxShipmentInput,
): SkydropxCreateShipmentRequest {
  return {
    shipment: {
      rate_id: input.providerRateId,
      printing_format: input.printingFormat ?? 'standard',
      address_from: mapOriginToSkydropxAddress(),
      address_to: mapOrderAddressToSkydropx(input.shippingAddress, input.customerEmail),
    },
  }
}
