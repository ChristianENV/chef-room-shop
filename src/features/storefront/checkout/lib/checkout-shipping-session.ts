import type { SelectedShippingRateSummary } from '../types/checkout-shipping.types'

const SESSION_KEY = 'chefroom_checkout_shipping_draft'

export type CheckoutShippingDraft = {
  quoteId: string | null
  selectedRateId: string | null
  selectedShipping: SelectedShippingRateSummary | null
  destinationPostalCode: string
}

/**
 * Persists shipping quote selection for checkout refresh recovery.
 */
export function saveCheckoutShippingDraft(draft: CheckoutShippingDraft): void {
  if (typeof window === 'undefined') return
  sessionStorage.setItem(SESSION_KEY, JSON.stringify(draft))
}

/**
 * Reads shipping draft from session storage.
 */
export function readCheckoutShippingDraft(): CheckoutShippingDraft | null {
  if (typeof window === 'undefined') return null
  const raw = sessionStorage.getItem(SESSION_KEY)
  if (!raw) return null
  try {
    return JSON.parse(raw) as CheckoutShippingDraft
  } catch {
    return null
  }
}

/**
 * Clears shipping draft (e.g. after order placed or postal code change).
 */
export function clearCheckoutShippingDraft(): void {
  if (typeof window === 'undefined') return
  sessionStorage.removeItem(SESSION_KEY)
}
