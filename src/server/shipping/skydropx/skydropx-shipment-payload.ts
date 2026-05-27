import type { SkydropxLabelAddress } from './skydropx-address'
import { toSkydropxV1AddressInput } from './skydropx-address'
import type { SkydropxCreateShipmentRequest } from './skydropx.types'
import {
  validateOrderShippingAddressForSkydropx,
  validateShippingOriginForLabel,
  type OrderAddressForLabel,
} from './skydropx.validation'

export type MapOrderToSkydropxShipmentInput = {
  providerRateId: string
  printingFormat?: 'standard' | 'thermal'
  origin?: SkydropxLabelAddress
  recipient?: SkydropxLabelAddress
  /** Legacy: build recipient from order address when recipient is omitted */
  shippingAddress?: OrderAddressForLabel & {
    neighborhood?: string | null
    reference?: string | null
    email?: string
  }
  customerEmail?: string
  packageJson?: unknown
  orderNumber?: string
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

/**
 * Builds POST /api/v1/shipments body with validated origin + recipient addresses.
 */
export function mapOrderToSkydropxShipmentPayload(
  input: MapOrderToSkydropxShipmentInput,
): SkydropxCreateShipmentRequest {
  const origin = input.origin ?? validateShippingOriginForLabel()

  let recipient: SkydropxLabelAddress
  if (input.recipient) {
    recipient = input.recipient
  } else if (input.shippingAddress && input.customerEmail) {
    recipient = validateOrderShippingAddressForSkydropx(
      input.shippingAddress,
      input.customerEmail,
    )
  } else {
    throw new Error('mapOrderToSkydropxShipmentPayload: recipient or shippingAddress required')
  }

  return {
    shipment: {
      rate_id: input.providerRateId,
      printing_format: input.printingFormat ?? 'standard',
      address_from: toSkydropxV1AddressInput(origin),
      address_to: toSkydropxV1AddressInput(recipient),
    },
  }
}

export type OrderShippingAddressInput = OrderAddressForLabel & {
  neighborhood?: string | null
  reference?: string | null
  email?: string
}
