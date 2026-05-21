import 'server-only'

import { SHIPPING_CURRENCY_MX } from '@/src/config/shipping'

import { getShippingOriginConfig } from '../shipping.config'
import type { PackageDimensions } from '../shipping.package'
import type { CartItemQuantityInput } from '../shipping.package'
import { getPackageForCartItems } from '../shipping.package'
import type {
  SkydropxAddressInput,
  SkydropxCreateQuotationRequest,
  SkydropxParcelInput,
} from './skydropx.types'

export type DestinationAddressInput = {
  postalCode: string
  state: string
  city: string
  neighborhood: string
  country?: string
  street?: string
  name?: string
  company?: string
  phone?: string
  email?: string
}

export type MappedShippingRate = {
  providerRateId: string
  carrier: string
  service: string | null
  amountCents: number
  currency: string
  estimatedDays: number | null
  estimatedDeliveryDate: Date | null
  rawJson: Record<string, unknown>
}

export type MappedShipmentData = {
  providerShipmentId: string | null
  trackingNumber: string | null
  labelUrl: string | null
  carrier: string | null
  rawJson: Record<string, unknown>
}

function asRecord(value: unknown): Record<string, unknown> | null {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null
}

function readString(record: Record<string, unknown>, key: string): string | null {
  const value = record[key]
  return typeof value === 'string' && value.length > 0 ? value : null
}

function readNumber(record: Record<string, unknown>, key: string): number | null {
  const value = record[key]
  return typeof value === 'number' && Number.isFinite(value) ? value : null
}

function readBoolean(record: Record<string, unknown>, key: string): boolean | null {
  const value = record[key]
  return typeof value === 'boolean' ? value : null
}

/** Parses Skydropx monetary fields (often strings in MXN pesos). */
function parseAmountToCents(value: unknown): number | null {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return Math.round(value * 100)
  }
  if (typeof value === 'string' && value.trim().length > 0) {
    const parsed = Number.parseFloat(value.replace(/,/g, ''))
    if (Number.isFinite(parsed)) {
      return Math.round(parsed * 100)
    }
  }
  return null
}

/** Skydropx PRO rates are valid for 24 hours from quotation time. */
export const SKYDROPX_RATE_VALIDITY_MS = 24 * 60 * 60 * 1000

export function skydropxRateExpiresAt(from: Date = new Date()): Date {
  return new Date(from.getTime() + SKYDROPX_RATE_VALIDITY_MS)
}

/**
 * Maps Chef Room warehouse origin (env) to Skydropx address_from.
 */
export function mapOriginToSkydropxAddress(): SkydropxAddressInput {
  const origin = getShippingOriginConfig()
  return {
    country_code: origin.country,
    postal_code: origin.postalCode,
    area_level1: origin.state,
    area_level2: origin.city,
    area_level3: origin.neighborhood || origin.city,
    street1: origin.street || undefined,
    name: origin.name,
    company: origin.company,
    phone: origin.phone || undefined,
    email: origin.email || undefined,
  }
}

/**
 * Maps a customer destination to Skydropx address_to.
 */
export function mapAddressToSkydropxAddress(
  input: DestinationAddressInput,
): SkydropxAddressInput {
  const origin = getShippingOriginConfig()
  return {
    country_code: input.country ?? origin.country,
    postal_code: input.postalCode,
    area_level1: input.state,
    area_level2: input.city,
    area_level3: input.neighborhood,
    street1: input.street,
    name: input.name,
    company: input.company,
    phone: input.phone,
    email: input.email,
  }
}

/**
 * Maps internal package dimensions (cm/kg) to Skydropx parcel integers/float.
 * Skydropx expects integer cm dimensions and float kg weight.
 */
export function mapPackageToSkydropxParcel(pkg: PackageDimensions): SkydropxParcelInput {
  return {
    length: Math.max(1, Math.round(pkg.lengthCm)),
    width: Math.max(1, Math.round(pkg.widthCm)),
    height: Math.max(1, Math.round(pkg.heightCm)),
    weight: Math.max(0.1, pkg.weightKg),
  }
}

export type MapCartToQuotationPayloadInput = {
  destination: DestinationAddressInput
  cartItems: CartItemQuantityInput[]
  orderId?: string
  requestedCarriers?: string[]
}

/**
 * Builds POST /api/v1/quotations body from cart + destination (BFF entry point).
 */
export function mapShippingQuoteToSkydropxQuotationPayload(
  input: MapCartToQuotationPayloadInput,
): SkydropxCreateQuotationRequest {
  return mapCartToQuotationPayload(input)
}

/**
 * Builds POST /api/v1/quotations body from cart + destination.
 */
export function mapCartToQuotationPayload(
  input: MapCartToQuotationPayloadInput,
): SkydropxCreateQuotationRequest {
  const pkg = getPackageForCartItems(input.cartItems)
  const addressFrom = mapOriginToSkydropxAddress()
  const addressTo = mapAddressToSkydropxAddress(input.destination)

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

/**
 * Parses a Skydropx rate object into DB-ready ShippingRate fields.
 * TODO: tighten shape once we persist live API samples.
 */
export function mapSkydropxRateToShippingRate(raw: unknown): MappedShippingRate | null {
  const record = asRecord(raw)
  if (!record) return null

  const success = readBoolean(record, 'success')
  if (success === false) return null

  const id =
    readString(record, 'id') ??
    readString(record, 'rate_id') ??
    readString(record, 'provider_rate_id')
  if (!id) return null

  const carrier =
    readString(record, 'provider_name') ??
    readString(record, 'provider_display_name') ??
    readString(record, 'carrier') ??
    readString(record, 'carrier_name') ??
    readString(record, 'provider') ??
    'unknown'

  const service =
    readString(record, 'provider_service_name') ??
    readString(record, 'service') ??
    readString(record, 'service_name') ??
    readString(record, 'service_level')

  const amount =
    readNumber(record, 'amount_cents') ??
    parseAmountToCents(record.total) ??
    parseAmountToCents(record.amount) ??
    parseAmountToCents(record.total_value_with_protection) ??
    (readNumber(record, 'price') !== null
      ? Math.round((readNumber(record, 'price') ?? 0) * 100)
      : null)

  if (amount === null || amount < 0) return null

  const days =
    readNumber(record, 'days') ??
    readNumber(record, 'delivery_days') ??
    readNumber(record, 'estimated_days')

  const deliveryRaw =
    readString(record, 'estimated_delivery_date') ?? readString(record, 'delivery_date')
  const estimatedDeliveryDate = deliveryRaw ? new Date(deliveryRaw) : null

  return {
    providerRateId: id,
    carrier,
    service,
    amountCents: amount,
    currency:
      readString(record, 'currency_code') ??
      readString(record, 'currency') ??
      SHIPPING_CURRENCY_MX,
    estimatedDays: days,
    estimatedDeliveryDate:
      estimatedDeliveryDate && !Number.isNaN(estimatedDeliveryDate.getTime())
        ? estimatedDeliveryDate
        : null,
    rawJson: record,
  }
}

/**
 * Extracts shipment identifiers from Skydropx shipment response.
 * TODO: align with documented response once label generation is wired.
 */
export function mapSkydropxShipmentToShipmentData(raw: unknown): MappedShipmentData {
  const root = asRecord(raw) ?? {}
  const data = asRecord(root.data) ?? root
  const shipment = asRecord(data.shipment) ?? data

  const providerShipmentId =
    readString(shipment, 'id') ?? readString(shipment, 'shipment_id')

  const trackingNumber =
    readString(shipment, 'tracking_number') ??
    readString(shipment, 'master_tracking_number')

  const labelUrl =
    readString(shipment, 'label_url') ??
    readString(shipment, 'label_pdf') ??
    readString(shipment, 'tracking_url_provider')

  const carrier =
    readString(shipment, 'carrier') ?? readString(shipment, 'carrier_name')

  return {
    providerShipmentId,
    trackingNumber,
    labelUrl,
    carrier,
    rawJson: shipment,
  }
}

export type ParsedSkydropxQuotation = {
  providerQuoteId: string | null
  isCompleted: boolean
  rates: MappedShippingRate[]
}

/**
 * Parses quotation id, completion flag, and rates from Skydropx PRO responses.
 */
export function parseSkydropxQuotationResponse(raw: unknown): ParsedSkydropxQuotation {
  const root = asRecord(raw) ?? {}
  const data = asRecord(root.data) ?? root
  const quotation = asRecord(data.quotation) ?? data

  const providerQuoteId =
    readString(quotation, 'id') ?? readString(data, 'id') ?? readString(root, 'id')

  const isCompleted =
    quotation.is_completed === true ||
    data.is_completed === true ||
    root.is_completed === true

  return {
    providerQuoteId,
    isCompleted,
    rates: extractRatesFromQuotationResponse(raw),
  }
}

/**
 * Collects rates from GET quotation response (defensive).
 */
export function extractRatesFromQuotationResponse(raw: unknown): MappedShippingRate[] {
  const root = asRecord(raw) ?? {}
  const data = asRecord(root.data) ?? root
  const quotation = asRecord(data.quotation) ?? data

  const candidates: unknown[] = []

  if (Array.isArray(quotation.rates)) {
    candidates.push(...quotation.rates)
  }
  if (Array.isArray(data.rates)) {
    candidates.push(...data.rates)
  }
  if (Array.isArray(root.rates)) {
    candidates.push(...root.rates)
  }

  const mapped: MappedShippingRate[] = []
  for (const item of candidates) {
    const rate = mapSkydropxRateToShippingRate(item)
    if (rate) mapped.push(rate)
  }
  return mapped
}
