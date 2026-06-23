import type { SkydropxLabelAddress } from './skydropx-address'
import { toSkydropxV1AddressInput } from './skydropx-address'
import type { SkydropxCreateShipmentRequest } from './skydropx.types'
import {
  validateOrderShippingAddressForSkydropx,
  validateShippingOriginForLabel,
  type OrderAddressForLabel,
} from './skydropx.validation'

const DEFAULT_CONSIGNMENT_NOTE = '53102400'
const DEFAULT_PACKAGE_TYPE = '4G'

function getSkydropxDefaultConsignmentNote(): string {
  return process.env.SKYDROPX_DEFAULT_CONSIGNMENT_NOTE?.trim() || DEFAULT_CONSIGNMENT_NOTE
}

function getSkydropxDefaultPackageType(): string {
  return process.env.SKYDROPX_DEFAULT_PACKAGE_TYPE?.trim() || DEFAULT_PACKAGE_TYPE
}

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

export function mapLabelFormatToSkydropx(labelFormat?: string | null): 'standard' | 'thermal' {
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
    recipient = validateOrderShippingAddressForSkydropx(input.shippingAddress, input.customerEmail)
  } else {
    throw new Error('mapOrderToSkydropxShipmentPayload: recipient or shippingAddress required')
  }

  return {
    shipment: {
      rate_id: input.providerRateId,
      printing_format: input.printingFormat ?? 'standard',
      address_from: toSkydropxV1AddressInput(origin),
      address_to: toSkydropxV1AddressInput(recipient),
      // Temporary fixed defaults to satisfy carriers requiring Carta Porte metadata.
      packages: [
        {
          package_number: '1',
          consignment_note: getSkydropxDefaultConsignmentNote(),
          package_type: getSkydropxDefaultPackageType(),
        },
      ],
    },
  }
}

export type OrderShippingAddressInput = OrderAddressForLabel & {
  neighborhood?: string | null
  reference?: string | null
  email?: string
}
