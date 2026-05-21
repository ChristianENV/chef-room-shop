import 'server-only'

import { getSkydropxAccessToken } from './skydropx.auth'
import { getSkydropxConfig } from './skydropx.config'
import { SkydropxApiError } from './skydropx.errors'
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

function extractApiErrorMessage(parsed: unknown, statusText: string): string {
  if (typeof parsed === 'object' && parsed !== null) {
    if ('message' in parsed && typeof (parsed as { message: unknown }).message === 'string') {
      return (parsed as { message: string }).message
    }
    if ('error' in parsed && typeof (parsed as { error: unknown }).error === 'string') {
      return (parsed as { error: string }).error
    }
  }
  return `Skydropx API error (${statusText})`
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

  const response = await scheduleSkydropxRequest(() =>
    fetch(url, {
      method: options.method ?? 'GET',
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
      parsed = { raw: text }
    }
  }

  if (!response.ok) {
    throw new SkydropxApiError(
      extractApiErrorMessage(parsed, response.statusText),
      response.status,
      parsed,
    )
  }

  return parsed as T
}

/**
 * POST /api/v1/quotations — create a shipping quote.
 */
export async function createSkydropxQuotation(
  input: SkydropxCreateQuotationRequest,
): Promise<SkydropxQuotationResponse> {
  return skydropxRequest<SkydropxQuotationResponse>('/api/v1/quotations', {
    method: 'POST',
    body: input,
  })
}

/**
 * GET /api/v1/quotations/{id} — fetch quote and carrier rates.
 */
export async function getSkydropxQuotation(id: string): Promise<SkydropxQuotationResponse> {
  return skydropxRequest<SkydropxQuotationResponse>(`/api/v1/quotations/${encodeURIComponent(id)}`)
}

/**
 * POST /api/v1/shipments/ — create shipment from a selected rate_id.
 */
export async function createSkydropxShipment(
  input: SkydropxCreateShipmentRequest,
): Promise<SkydropxShipmentResponse> {
  return skydropxRequest<SkydropxShipmentResponse>('/api/v1/shipments/', {
    method: 'POST',
    body: input,
  })
}

/**
 * GET /api/v1/shipments/{id} — retrieve shipment details (label, tracking).
 */
export async function getSkydropxShipment(id: string): Promise<SkydropxShipmentResponse> {
  return skydropxRequest<SkydropxShipmentResponse>(
    `/api/v1/shipments/${encodeURIComponent(id)}`,
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
    { method: 'POST', body: input },
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
  })
}
