import 'server-only'

import type {
  SkydropxCreateShipmentRequest,
  SkydropxShipmentResponse,
} from './skydropx.types'
import type { SkydropxShipmentProviderContext } from './skydropx.provider'

const MOCK_CARRIER = 'fedex'
const MOCK_SERVICE = 'standard'

export function buildMockTrackingNumber(orderNumber: string): string {
  return `CRMOCK-${orderNumber}`
}

export function buildMockTrackingUrl(orderNumber: string): string {
  const trackingNumber = buildMockTrackingNumber(orderNumber)
  return `https://tracking.example.test/${encodeURIComponent(trackingNumber)}`
}

export function buildMockLabelUrl(orderNumber: string): string {
  return `/mock-labels/${encodeURIComponent(orderNumber)}.pdf`
}

export function buildMockProviderShipmentId(orderNumber: string): string {
  return `mock-shipment-${orderNumber}`
}

export function buildMockProviderLabelId(orderNumber: string): string {
  return `mock-label-${orderNumber}`
}

export function buildMockProviderPackageId(orderNumber: string): string {
  return `mock-package-${orderNumber}`
}

/**
 * Builds a Skydropx-shaped shipment response for admin label generation in mock mode.
 */
export function buildMockSkydropxShipmentResponse(params: {
  orderNumber: string
  carrier?: string | null
  service?: string | null
}): SkydropxShipmentResponse {
  const trackingNumber = buildMockTrackingNumber(params.orderNumber)
  const labelUrl = buildMockLabelUrl(params.orderNumber)
  const trackingUrl = buildMockTrackingUrl(params.orderNumber)
  const carrier = params.carrier?.trim() || MOCK_CARRIER
  const service = params.service?.trim() || MOCK_SERVICE

  return {
    data: {
      id: buildMockProviderShipmentId(params.orderNumber),
      label_id: buildMockProviderLabelId(params.orderNumber),
      tracking_number: trackingNumber,
      label_url: labelUrl,
      tracking_url_provider: trackingUrl,
      carrier,
      carrier_name: carrier,
      service,
      status: 'label_generated',
      created_at: new Date().toISOString(),
      packages: [
        {
          id: buildMockProviderPackageId(params.orderNumber),
          status: 'created',
          label_url: labelUrl,
        },
      ],
      rate: {
        provider_name: carrier,
        provider_service_name: service,
      },
    },
  }
}

export async function createMockSkydropxShipment(
  _input: SkydropxCreateShipmentRequest,
  context?: SkydropxShipmentProviderContext,
): Promise<SkydropxShipmentResponse> {
  const orderNumber = context?.orderNumber?.trim()
  if (!orderNumber) {
    throw new Error('Mock Skydropx shipment requires orderNumber in provider context.')
  }

  return buildMockSkydropxShipmentResponse({
    orderNumber,
    carrier: context?.carrier,
    service: context?.service,
  })
}
