import type { ConektaCheckoutPayloadGql } from './payments.types'

type PaymentSummary = {
  id: string
  providerOrderId: string
  status: string
  amountCents: number
  currency: string
}

type ProductSnapshot = {
  name?: string
  sku?: string
}

function parseProductSnapshot(value: unknown): ProductSnapshot {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return {}
  return value as ProductSnapshot
}

/**
 * Builds Conekta line items from order rows (amounts in centavos).
 */
export function mapOrderItemsToConektaLineItems(
  items: Array<{
    quantity: number
    unitPriceCents: number
    customizationPriceCents: number
    productSnapshotJson: unknown
  }>,
): Array<{
  name: string
  unitPriceCents: number
  quantity: number
  sku?: string
}> {
  return items.map((item) => {
    const snapshot = parseProductSnapshot(item.productSnapshotJson)
    return {
      name: snapshot.name ?? 'Producto',
      unitPriceCents: item.unitPriceCents + item.customizationPriceCents,
      quantity: item.quantity,
      ...(snapshot.sku ? { sku: snapshot.sku } : {}),
    }
  })
}

/**
 * Reads cached checkout URL from the latest payment attempt JSON.
 */
export function getCachedCheckoutFromAttempts(attempts: Array<{ rawResponseJson: unknown }>): {
  checkoutUrl: string | null
  checkoutId: string | null
  conektaOrderId: string | null
} {
  for (const attempt of attempts) {
    const raw = attempt.rawResponseJson
    if (!raw || typeof raw !== 'object' || Array.isArray(raw)) continue
    const record = raw as Record<string, unknown>
    const checkout =
      record.checkout && typeof record.checkout === 'object'
        ? (record.checkout as Record<string, unknown>)
        : null
    const checkoutUrl =
      typeof checkout?.url === 'string'
        ? checkout.url
        : typeof record.checkoutUrl === 'string'
          ? record.checkoutUrl
          : null
    const checkoutId =
      typeof checkout?.id === 'string'
        ? checkout.id
        : typeof record.checkoutId === 'string'
          ? record.checkoutId
          : null
    const conektaOrderId =
      typeof record.id === 'string'
        ? record.id
        : typeof record.conektaOrderId === 'string'
          ? record.conektaOrderId
          : null
    if (checkoutUrl && conektaOrderId) {
      return { checkoutUrl, checkoutId, conektaOrderId }
    }
  }
  return { checkoutUrl: null, checkoutId: null, conektaOrderId: null }
}

/**
 * Maps DB state to GraphQL ConektaCheckoutPayload.
 */
export function mapToConektaCheckoutPayload(params: {
  orderId: string
  orderNumber: string
  payment: PaymentSummary
  checkoutId: string | null
  checkoutUrl: string | null
}): ConektaCheckoutPayloadGql {
  return {
    orderId: params.orderId,
    orderNumber: params.orderNumber,
    paymentId: params.payment.id,
    providerOrderId: params.payment.providerOrderId,
    checkoutId: params.checkoutId,
    checkoutUrl: params.checkoutUrl,
    status: params.payment.status,
    amountCents: params.payment.amountCents,
    currency: params.payment.currency,
  }
}

export function isPlaceholderProviderOrderId(providerOrderId: string): boolean {
  return providerOrderId.startsWith('checkout_pending_')
}

type CashPaymentDetails = {
  reference: string | null
  expiresAt: string | null
}

/**
 * Extracts cash payment reference/expiry from sanitized Conekta attempt JSON.
 */
export function getCashPaymentDetailsFromAttempts(
  attempts: Array<{ rawResponseJson: unknown }>,
): CashPaymentDetails | null {
  for (const attempt of attempts) {
    const raw = attempt.rawResponseJson
    if (!raw || typeof raw !== 'object' || Array.isArray(raw)) continue
    const record = raw as Record<string, unknown>
    const charges = record.charges
    if (!charges || typeof charges !== 'object' || Array.isArray(charges)) continue
    const data = (charges as { data?: unknown }).data
    if (!Array.isArray(data)) continue
    for (const charge of data) {
      if (!charge || typeof charge !== 'object') continue
      const c = charge as Record<string, unknown>
      const paymentMethod = c.payment_method
      if (!paymentMethod || typeof paymentMethod !== 'object') continue
      const pm = paymentMethod as Record<string, unknown>
      const reference =
        typeof pm.reference === 'string'
          ? pm.reference
          : typeof c.reference === 'string'
            ? c.reference
            : null
      const expiresAt =
        typeof pm.expires_at === 'number'
          ? new Date(pm.expires_at * 1000).toISOString()
          : typeof pm.expires_at === 'string'
            ? pm.expires_at
            : null
      if (reference || expiresAt) {
        return { reference, expiresAt }
      }
    }
  }
  return null
}
