import 'server-only'

import { APP_LIMITS } from '@/src/config/vars'
import { SHIPPING_CURRENCY_MX } from '@/src/config/shipping'

import { toSkydropxV1AddressInput } from './skydropx-address'
import {
  mapLabelFormatToSkydropx,
  mapOrderToSkydropxShipmentPayload,
  type MapOrderToSkydropxShipmentInput,
  type OrderShippingAddressInput,
} from './skydropx-shipment-payload'
import { normalizeMxPostalCode, validateShippingOriginForQuotation } from './skydropx.validation'

export {
  mapLabelFormatToSkydropx,
  mapOrderToSkydropxShipmentPayload,
  type MapOrderToSkydropxShipmentInput,
  type OrderShippingAddressInput,
}
import {
  mapCartToQuotationPayload,
  mapShippingQuoteToSkydropxQuotationPayload,
  type MapCartToQuotationPayloadInput,
} from './skydropx-quotation-payload'
import type { SkydropxAddressInput } from './skydropx.types'

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
  providerLabelId: string | null
  trackingNumber: string | null
  labelUrl: string | null
  carrier: string | null
  service: string | null
  costCents: number | null
  labelFormat: string | null
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

/** Skydropx PRO rates validity window from quotation time. */
export const SKYDROPX_RATE_VALIDITY_MS = APP_LIMITS.shipping.rateExpirationHours * 60 * 60 * 1000

export function skydropxRateExpiresAt(from: Date = new Date()): Date {
  return new Date(from.getTime() + SKYDROPX_RATE_VALIDITY_MS)
}

/**
 * Maps warehouse origin for quotations (validated + truncated reference).
 */
export function mapOriginToSkydropxAddress(): SkydropxAddressInput {
  return toSkydropxV1AddressInput(validateShippingOriginForQuotation())
}

/**
 * Maps a customer destination to Skydropx address_to (quotation: CP + city/state).
 */
export function mapAddressToSkydropxAddress(input: DestinationAddressInput): SkydropxAddressInput {
  const postal_code = normalizeMxPostalCode(input.postalCode)
  const city = input.city?.trim() || 'Ciudad'
  const state = input.state?.trim() || 'México'
  const neighborhood = input.neighborhood?.trim() || city

  return {
    country_code: input.country?.trim().toUpperCase() === 'MX' ? 'MX' : 'MX',
    postal_code,
    area_level1: state,
    area_level2: city,
    area_level3: neighborhood,
    ...(input.street ? { street1: input.street } : {}),
    ...(input.name ? { name: input.name } : {}),
    ...(input.company ? { company: input.company } : {}),
    ...(input.phone ? { phone: input.phone } : {}),
    ...(input.email ? { email: input.email } : {}),
  }
}

/**
 * Maps internal package dimensions (cm/kg) to Skydropx parcel integers/float.
 * Skydropx expects integer cm dimensions and float kg weight.
 */
export { mapPackageToSkydropxParcel } from './skydropx-parcel'

export {
  mapCartToQuotationPayload,
  mapShippingQuoteToSkydropxQuotationPayload,
  type MapCartToQuotationPayloadInput,
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
      readString(record, 'currency_code') ?? readString(record, 'currency') ?? SHIPPING_CURRENCY_MX,
    estimatedDays: days,
    estimatedDeliveryDate:
      estimatedDeliveryDate && !Number.isNaN(estimatedDeliveryDate.getTime())
        ? estimatedDeliveryDate
        : null,
    rawJson: record,
  }
}

function extractLabelUrlFromShipmentNode(shipment: Record<string, unknown>): string | null {
  const direct =
    readString(shipment, 'label_url') ??
    readString(shipment, 'label_pdf') ??
    readString(shipment, 'tracking_url_provider')

  if (direct) return direct

  const labelUrls = shipment.label_urls
  if (Array.isArray(labelUrls) && labelUrls.length > 0) {
    const first = labelUrls[0]
    if (typeof first === 'string') return first
    const firstRecord = asRecord(first)
    if (firstRecord) {
      return readString(firstRecord, 'url') ?? readString(firstRecord, 'label_url')
    }
  }

  const packages = shipment.packages
  if (Array.isArray(packages)) {
    for (const pkg of packages) {
      const pkgRecord = asRecord(pkg)
      if (!pkgRecord) continue
      const url = readString(pkgRecord, 'label_url') ?? readString(pkgRecord, 'label_pdf')
      if (url) return url
    }
  }

  return null
}

function extractShipmentNode(raw: unknown): Record<string, unknown> {
  const root = asRecord(raw) ?? {}
  const data = asRecord(root.data) ?? root

  const shipment = asRecord(data.shipment)
  if (shipment) return shipment

  if (Array.isArray(data)) {
    const first = asRecord(data[0])
    if (first) return first
  }

  if (Array.isArray(data.shipments)) {
    const first = asRecord((data.shipments as unknown[])[0])
    if (first) return first
  }

  return data
}

/**
 * Parses Skydropx shipment create/GET response into DB-ready fields.
 */
export function parseSkydropxShipmentResponse(raw: unknown): MappedShipmentData {
  const shipment = extractShipmentNode(raw)

  const rateNode = asRecord(shipment.rate) ?? shipment

  const providerShipmentId = readString(shipment, 'id') ?? readString(shipment, 'shipment_id')

  const providerLabelId =
    readString(shipment, 'label_id') ??
    readString(shipment, 'provider_label_id') ??
    readString(rateNode, 'id')

  const trackingNumber =
    readString(shipment, 'tracking_number') ?? readString(shipment, 'master_tracking_number')

  const labelUrl = extractLabelUrlFromShipmentNode(shipment)

  const carrier =
    readString(shipment, 'carrier') ??
    readString(shipment, 'carrier_name') ??
    readString(rateNode, 'provider_name') ??
    readString(rateNode, 'provider_display_name')

  const service =
    readString(shipment, 'service') ??
    readString(rateNode, 'provider_service_name') ??
    readString(rateNode, 'service_name')

  const costCents =
    parseAmountToCents(rateNode.total) ??
    parseAmountToCents(rateNode.amount) ??
    parseAmountToCents(shipment.total) ??
    parseAmountToCents(shipment.amount)

  const labelFormat =
    readString(shipment, 'printing_format') ?? readString(shipment, 'label_format')

  return {
    providerShipmentId,
    providerLabelId,
    trackingNumber,
    labelUrl,
    carrier,
    service,
    costCents,
    labelFormat,
    rawJson: shipment,
  }
}

/**
 * Reads package/shipment status from a Skydropx tracking or shipment response.
 */
export function readSkydropxPackageStatus(raw: unknown): string | null {
  const shipment = extractShipmentNode(raw)
  const fromShipment = readString(shipment, 'status')
  if (fromShipment) return fromShipment

  const packages = shipment.packages
  if (Array.isArray(packages)) {
    for (const entry of packages) {
      const pkg = asRecord(entry)
      const status = pkg ? readString(pkg, 'status') : null
      if (status) return status
    }
  }

  return null
}

/** @deprecated Use parseSkydropxShipmentResponse */
export function mapSkydropxShipmentToShipmentData(raw: unknown): MappedShipmentData {
  return parseSkydropxShipmentResponse(raw)
}

export function extractProviderShipmentId(raw: unknown): string | null {
  return parseSkydropxShipmentResponse(raw).providerShipmentId
}

export function extractTrackingNumber(raw: unknown): string | null {
  return parseSkydropxShipmentResponse(raw).trackingNumber
}

export function extractLabelUrl(raw: unknown): string | null {
  return parseSkydropxShipmentResponse(raw).labelUrl
}

export function extractProviderLabelId(raw: unknown): string | null {
  return parseSkydropxShipmentResponse(raw).providerLabelId
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
    quotation.is_completed === true || data.is_completed === true || root.is_completed === true

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
