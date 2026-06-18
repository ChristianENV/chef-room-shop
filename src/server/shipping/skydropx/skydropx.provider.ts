import 'server-only'

import { createSkydropxShipment } from './skydropx.client'
import { isSkydropxMockMode } from './skydropx.mode'
import { createMockSkydropxShipment } from './skydropx.mock-provider'
import type {
  SkydropxCreateShipmentRequest,
  SkydropxShipmentResponse,
} from './skydropx.types'

export type SkydropxShipmentProviderContext = {
  orderNumber?: string
  providerQuoteId?: string | null
  providerRateId?: string | null
  carrier?: string | null
  service?: string | null
  destinationPostalCode?: string
  destinationCity?: string
  destinationState?: string
  originPostalCode?: string
}

export type SkydropxShipmentProvider = {
  createShipment(
    input: SkydropxCreateShipmentRequest,
    context?: SkydropxShipmentProviderContext,
  ): Promise<SkydropxShipmentResponse>
}

const liveSkydropxShipmentProvider: SkydropxShipmentProvider = {
  createShipment: (input, context) => createSkydropxShipment(input, context),
}

const mockSkydropxShipmentProvider: SkydropxShipmentProvider = {
  createShipment: (input, context) => createMockSkydropxShipment(input, context),
}

/**
 * Selects live Skydropx API or deterministic mock responses for label creation.
 */
export function createShippingProvider(): SkydropxShipmentProvider {
  return isSkydropxMockMode()
    ? mockSkydropxShipmentProvider
    : liveSkydropxShipmentProvider
}

export function createShippingProviderForMode(
  mode: 'live' | 'mock',
): SkydropxShipmentProvider {
  return mode === 'mock' ? mockSkydropxShipmentProvider : liveSkydropxShipmentProvider
}
