import 'server-only'

import { getSkydropxAccessToken } from './skydropx.auth'
import { getSkydropxConfig } from './skydropx.config'
import { logSkydropxDebug } from './skydropx.debug'
import { SkydropxApiError } from './skydropx.errors'
import { sanitizeSkydropxDebugPayload } from './skydropx.sanitize'
import { scheduleSkydropxRequest } from './skydropx-rate-limit'
import type {
  SkydropxCancelShipmentRequest,
  SkydropxCreateQuotationRequest,
  SkydropxCreateShipmentRequest,
  SkydropxQuotationResponse,
  SkydropxShipmentResponse,
  SkydropxTrackingQuery,
} from './skydropx.types'

type SkydropxFetchOptions = {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE'
  body?: unknown
  query?: Record<string, string | undefined>
  operation?: string
  debugContext?: {
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
}

function buildUrl(path: string, query?: Record<string, string | undefined>): string {
  const { apiBaseUrl } = getSkydropxConfig()
  const base = apiBaseUrl.replace(/\/$/, '')
  const normalizedPath = path.startsWith('/') ? path : `/${path}`
  const url = new URL(`${base}${normalizedPath}`)
  if (query) {
    for (const [key, value] of Object.entries(query)) {
      if (value !== undefined && value !== '') {
        url.searchParams.set(key, value)
      }
    }
  }
  return url.toString()
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

function extractApiErrorMessage(parsed: unknown, statusText: string): string {
  const record = asRecord(parsed)
  if (record) {
    const message =
      readString(record, 'message') ??
      readString(record, 'error') ??
      readString(record, 'error_message')
    if (message) return message

    const errors = record.errors
    if (Array.isArray(errors) && errors.length > 0) {
      const first = errors[0]
      if (typeof first === 'string') return first
      const firstRecord = asRecord(first)
      if (firstRecord) {
        return (
          readString(firstRecord, 'message') ??
          readString(firstRecord, 'detail') ??
          `Skydropx API error (${statusText})`
        )
      }
    }
  }
  return `Skydropx API error (${statusText})`
}

function extractRequestId(parsed: unknown): string | null {
  const record = asRecord(parsed)
  if (!record) return null
  return (
    readString(record, 'request_id') ??
    readString(record, 'requestId') ??
    readString(record, 'x-request-id')
  )
}

function summarizeV1AddressNode(node: unknown): Record<string, unknown> | undefined {
  const addr = asRecord(node)
  if (!addr) return undefined
  const phone = readString(addr, 'phone')
  const reference = readString(addr, 'reference')
  return {
    postal_code: readString(addr, 'postal_code'),
    area_level1: readString(addr, 'area_level1'),
    area_level2: readString(addr, 'area_level2'),
    area_level3: readString(addr, 'area_level3'),
    has_street1: Boolean(readString(addr, 'street1')),
    phoneLength: phone?.replace(/\D/g, '').length ?? 0,
    referenceLength: reference?.length ?? 0,
    has_reference: Boolean(reference),
    has_email: Boolean(readString(addr, 'email')),
  }
}

function summarizeRequestBody(body: unknown): unknown {
  if (!body || typeof body !== 'object') return body
  const record = body as Record<string, unknown>
  const quotation = asRecord(record.quotation)
  const shipment = asRecord(record.shipment) ?? quotation
  if (!shipment) return sanitizeSkydropxDebugPayload(body)

  return sanitizeSkydropxDebugPayload({
    rate_id: shipment.rate_id,
    printing_format: shipment.printing_format,
    address_from: summarizeV1AddressNode(shipment.address_from),
    address_to: summarizeV1AddressNode(shipment.address_to),
    parcels: Array.isArray(shipment.parcels)
      ? shipment.parcels.map((p) => {
          const parcel = asRecord(p)
          return parcel
            ? {
                length: readNumber(parcel, 'length'),
                width: readNumber(parcel, 'width'),
                height: readNumber(parcel, 'height'),
                weight: readNumber(parcel, 'weight'),
              }
            : null
        })
      : undefined,
  })
}

/**
 * Low-level Skydropx PRO REST call (server-only, Bearer auth, rate-limited).
 */
export async function skydropxRequest<T>(
  path: string,
  options: SkydropxFetchOptions = {},
): Promise<T> {
  const accessToken = await getSkydropxAccessToken()
  const url = buildUrl(path, options.query)
  const method = options.method ?? 'GET'
  const operation = options.operation ?? `${method} ${path}`

  const response = await scheduleSkydropxRequest(() =>
    fetch(url, {
      method,
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
      body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
      cache: 'no-store',
    }),
  )

  const text = await response.text()
  let parsed: unknown = null
  if (text) {
    try {
      parsed = JSON.parse(text) as unknown
    } catch {
      parsed = { raw: text.slice(0, 500) }
    }
  }

  const requestId = extractRequestId(parsed)
  const debugBase = {
    operation,
    method,
    path,
    orderNumber: options.debugContext?.orderNumber,
    providerQuoteId: options.debugContext?.providerQuoteId,
    providerRateId: options.debugContext?.providerRateId,
    carrier: options.debugContext?.carrier,
    service: options.debugContext?.service,
    destinationPostalCode: options.debugContext?.destinationPostalCode,
    destinationCity: options.debugContext?.destinationCity,
    destinationState: options.debugContext?.destinationState,
    originPostalCode: options.debugContext?.originPostalCode,
    statusCode: response.status,
    requestId,
  }

  if (!response.ok) {
    const sanitizedBody = sanitizeSkydropxDebugPayload(parsed)
    logSkydropxDebug({
      ...debugBase,
      requestSummary: options.body ? summarizeRequestBody(options.body) : undefined,
      errorBody: sanitizedBody,
    })

    throw new SkydropxApiError({
      message: extractApiErrorMessage(parsed, response.statusText),
      status: response.status,
      details: parsed,
      operation,
      path,
      requestId,
      sanitizedBody,
    })
  }

  logSkydropxDebug({
    ...debugBase,
    requestSummary: options.body ? summarizeRequestBody(options.body) : undefined,
  })

  return parsed as T
}

/**
 * POST /api/v1/quotations — create a shipping quote.
 */
export async function createSkydropxQuotation(
  input: SkydropxCreateQuotationRequest,
  debugContext?: SkydropxFetchOptions['debugContext'],
): Promise<SkydropxQuotationResponse> {
  return skydropxRequest<SkydropxQuotationResponse>('/api/v1/quotations', {
    method: 'POST',
    body: input,
    operation: 'createQuotation',
    debugContext,
  })
}

/**
 * GET /api/v1/quotations/{id} — fetch quote and carrier rates.
 */
export async function getSkydropxQuotation(id: string): Promise<SkydropxQuotationResponse> {
  return skydropxRequest<SkydropxQuotationResponse>(`/api/v1/quotations/${encodeURIComponent(id)}`, {
    operation: 'getQuotation',
  })
}

/**
 * POST /api/v1/shipments/ — create shipment from a selected rate_id.
 */
export async function createSkydropxShipment(
  input: SkydropxCreateShipmentRequest,
  debugContext?: SkydropxFetchOptions['debugContext'],
): Promise<SkydropxShipmentResponse> {
  return skydropxRequest<SkydropxShipmentResponse>('/api/v1/shipments/', {
    method: 'POST',
    body: input,
    operation: 'createShipment',
    debugContext: {
      ...debugContext,
      providerRateId:
        debugContext?.providerRateId ?? input.shipment.rate_id,
    },
  })
}

/**
 * GET /api/v1/shipments/{id} — retrieve shipment details (label, tracking).
 */
export async function getSkydropxShipment(id: string): Promise<SkydropxShipmentResponse> {
  return skydropxRequest<SkydropxShipmentResponse>(
    `/api/v1/shipments/${encodeURIComponent(id)}`,
    { operation: 'getShipment' },
  )
}

/**
 * POST /api/v1/shipments/{shipment_id}/cancellations — cancel label/shipment.
 */
export async function cancelSkydropxLabelOrShipment(
  shipmentId: string,
  input: SkydropxCancelShipmentRequest = {},
): Promise<SkydropxShipmentResponse> {
  return skydropxRequest<SkydropxShipmentResponse>(
    `/api/v1/shipments/${encodeURIComponent(shipmentId)}/cancellations`,
    { method: 'POST', body: input, operation: 'cancelShipment' },
  )
}

/**
 * GET /api/v1/shipments/tracking — track by carrier + tracking number.
 */
export async function getSkydropxTracking(
  query: SkydropxTrackingQuery,
): Promise<SkydropxShipmentResponse> {
  return skydropxRequest<SkydropxShipmentResponse>('/api/v1/shipments/tracking', {
    query: {
      tracking_number: query.tracking_number,
      carrier_name: query.carrier_name,
    },
    operation: 'getTracking',
  })
}
