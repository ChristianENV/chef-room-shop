import 'server-only'

import { PaymentMethod } from '@prisma/client'

import { getConektaAcceptHeader, getConektaConfig, isConektaConfigured } from './conekta.config'
import { ConektaApiError, ConektaConfigError } from './conekta.errors'
import { sanitizeConektaPayload } from './conekta.sanitize'
import type {
  ConektaCreateOrderRequest,
  ConektaOrderResponse,
  ConektaWebhookPayload,
} from './conekta.types'

export type { ConektaWebhookPayload } from './conekta.types'

type ConektaFetchOptions = {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE'
  body?: unknown
}

function requirePrivateKey(): string {
  if (!isConektaConfigured()) {
    throw new ConektaConfigError()
  }
  return getConektaConfig().privateKey
}

/**
 * Low-level Conekta REST call (server-only).
 */
async function conektaFetch<T>(
  path: string,
  options: ConektaFetchOptions = {},
): Promise<T> {
  const { apiBaseUrl, apiVersion } = getConektaConfig()
  const privateKey = requirePrivateKey()

  const response = await fetch(`${apiBaseUrl}${path}`, {
    method: options.method ?? 'GET',
    headers: {
      Accept: getConektaAcceptHeader(apiVersion),
      'Content-Type': 'application/json',
      Authorization: `Bearer ${privateKey}`,
    },
    body: options.body ? JSON.stringify(options.body) : undefined,
    cache: 'no-store',
  })

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
    const message =
      typeof parsed === 'object' &&
      parsed !== null &&
      'details' in parsed &&
      Array.isArray((parsed as { details: unknown }).details)
        ? String(
            (
              (parsed as { details: Array<{ message?: string }> }).details[0]
            )?.message ?? response.statusText,
          )
        : `Conekta API error (${response.status})`
    throw new ConektaApiError(message, response.status, parsed)
  }

  return parsed as T
}

export type CreateConektaCheckoutForOrderInput = {
  currency: string
  customerName: string
  customerEmail: string
  customerPhone?: string | null
  lineItems: Array<{
    name: string
    unitPriceCents: number
    quantity: number
    sku?: string
    description?: string
  }>
  shippingCents: number
  successUrl: string
  failureUrl: string
  allowedPaymentMethods?: Array<'card' | 'cash' | 'bank_transfer'>
  metadata?: Record<string, string>
}

export type CreateConektaCheckoutForOrderResult = {
  conektaOrderId: string
  checkoutId: string | null
  checkoutUrl: string | null
  paymentStatus: string | null
  sanitizedResponse: ConektaOrderResponse
}

/**
 * Creates a Conekta Order with HostedPayment checkout (redirect URL).
 * @see https://developers.conekta.com/docs/checkout-redireccionado
 */
export async function createConektaCheckoutForOrder(
  input: CreateConektaCheckoutForOrderInput,
): Promise<CreateConektaCheckoutForOrderResult> {
  const allowed =
    input.allowedPaymentMethods ?? (['card', 'cash', 'bank_transfer'] as const)

  const body: ConektaCreateOrderRequest = {
    currency: input.currency.toUpperCase(),
    customer_info: {
      name: input.customerName,
      email: input.customerEmail,
      ...(input.customerPhone ? { phone: input.customerPhone } : {}),
    },
    line_items: input.lineItems.map((item) => ({
      name: item.name,
      unit_price: item.unitPriceCents,
      quantity: item.quantity,
      ...(item.sku ? { sku: item.sku } : {}),
      ...(item.description ? { description: item.description } : {}),
    })),
    shipping_lines: [{ amount: input.shippingCents }],
    checkout: {
      type: 'HostedPayment',
      allowed_payment_methods: [...allowed],
      success_url: input.successUrl,
      failure_url: input.failureUrl,
      monthly_installments_enabled: false,
      redirection_time: 8,
    },
    ...(input.metadata ? { metadata: input.metadata } : {}),
  }

  const order = await conektaFetch<ConektaOrderResponse>('/orders', {
    method: 'POST',
    body,
  })

  if (!order.id) {
    throw new ConektaApiError('Conekta no devolvió un id de orden.', 502, order)
  }

  return {
    conektaOrderId: order.id,
    checkoutId: order.checkout?.id ?? null,
    checkoutUrl: order.checkout?.url ?? null,
    paymentStatus: order.payment_status ?? null,
    sanitizedResponse: sanitizeConektaPayload(order),
  }
}

/**
 * Parses a Conekta webhook JSON body.
 */
export function parseConektaWebhookEvent(
  rawBody: string,
): ConektaWebhookPayload {
  try {
    return JSON.parse(rawBody) as ConektaWebhookPayload
  } catch {
    throw new ConektaApiError('Webhook payload inválido.', 400)
  }
}

/**
 * Maps Conekta payment method type to local PaymentMethod code.
 */
export function mapConektaPaymentMethod(method: string | undefined): PaymentMethod {
  switch ((method ?? '').toLowerCase()) {
    case 'card':
    case 'credit':
    case 'debit':
      return PaymentMethod.CARD
    case 'cash':
    case 'oxxo':
      return PaymentMethod.OXXO
    case 'bank_transfer':
    case 'spei':
      return PaymentMethod.SPEI
    default:
      return PaymentMethod.OTHER
  }
}

/**
 * Maps Conekta order/charge status or webhook event type to PaymentStatus.
 */
export function mapConektaStatusToPaymentStatus(
  statusOrEventType: string | undefined,
): 'PENDING' | 'PAID' | 'FAILED' | 'CANCELLED' | 'AUTHORIZED' {
  const value = (statusOrEventType ?? '').toLowerCase()

  if (
    value.includes('paid') ||
    value === 'paid' ||
    value === 'successful' ||
    value === 'success'
  ) {
    return 'PAID'
  }

  if (value.includes('failed') || value === 'declined') {
    return 'FAILED'
  }

  if (value.includes('expired') || value.includes('cancel')) {
    return 'CANCELLED'
  }

  if (value.includes('authorized') || value.includes('pending_confirmation')) {
    return 'AUTHORIZED'
  }

  return 'PENDING'
}

/**
 * Optional webhook verification.
 * - DIGEST RSA when CONEKTA_WEBHOOK_PUBLIC_KEY is set (per Conekta docs).
 * - Shared secret header when CONEKTA_WEBHOOK_SECRET is set.
 */
export async function verifyConektaWebhookRequest(params: {
  rawBody: string
  headers: Headers
}): Promise<void> {
  const { webhookSecret, webhookPublicKey } = getConektaConfig()

  if (webhookSecret) {
    const digest = params.headers.get('digest')
    const auth = params.headers.get('authorization')
    const secretHeader = params.headers.get('x-webhook-secret')
    if (
      digest === webhookSecret ||
      auth === `Bearer ${webhookSecret}` ||
      secretHeader === webhookSecret
    ) {
      return
    }
  }

  if (webhookPublicKey) {
    const digestHeader = params.headers.get('digest')
    if (!digestHeader) {
      throw new ConektaApiError('Falta header Digest en webhook Conekta.', 401)
    }

    const crypto = await import('crypto')
    const signature = Buffer.from(digestHeader, 'base64')
    const verified = crypto.verify(
      'RSA-SHA256',
      Buffer.from(params.rawBody, 'utf8'),
      webhookPublicKey,
      signature,
    )

    if (!verified) {
      throw new ConektaApiError('Firma de webhook Conekta inválida.', 401)
    }
    return
  }

  if (process.env.NODE_ENV === 'production') {
    throw new ConektaApiError(
      'Webhook Conekta sin verificación. Configura CONEKTA_WEBHOOK_SECRET o CONEKTA_WEBHOOK_PUBLIC_KEY.',
      401,
    )
  }
}
