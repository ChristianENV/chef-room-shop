import type { CheckoutOrderPayload } from '../types'

const SESSION_KEY = 'chefroom_checkout_confirmation'

/** Same-tab + cross-tab listeners for session confirmation changes. */
export const CHECKOUT_CONFIRMATION_STORAGE_EVENT = 'chefroom_checkout_confirmation_changed'

export type CheckoutConfirmationSession = CheckoutOrderPayload & {
  email: string
  paymentMethod: string
  /** Display-only snapshot from selected rate at checkout (not used for amounts). */
  shippingCarrier?: string | null
  shippingService?: string | null
}

function notifyCheckoutConfirmationChanged(): void {
  if (typeof window === 'undefined') return
  window.dispatchEvent(new Event(CHECKOUT_CONFIRMATION_STORAGE_EVENT))
}

/**
 * Raw JSON from sessionStorage (stable snapshot for useSyncExternalStore).
 */
export function readCheckoutConfirmationRaw(): string | null {
  if (typeof window === 'undefined') return null
  return sessionStorage.getItem(SESSION_KEY)
}

/**
 * Subscribes to checkout confirmation storage updates (same tab + other tabs).
 */
export function subscribeCheckoutConfirmation(callback: () => void): () => void {
  if (typeof window === 'undefined') {
    return () => {}
  }
  window.addEventListener(CHECKOUT_CONFIRMATION_STORAGE_EVENT, callback)
  window.addEventListener('storage', callback)
  return () => {
    window.removeEventListener(CHECKOUT_CONFIRMATION_STORAGE_EVENT, callback)
    window.removeEventListener('storage', callback)
  }
}

/**
 * Persists checkout confirmation data for the success page (avoids email in URL).
 */
export function saveCheckoutConfirmation(data: CheckoutConfirmationSession): void {
  if (typeof window === 'undefined') return
  sessionStorage.setItem(SESSION_KEY, JSON.stringify(data))
  notifyCheckoutConfirmationChanged()
}

/**
 * Reads checkout confirmation from session storage.
 */
export function readCheckoutConfirmation(): CheckoutConfirmationSession | null {
  if (typeof window === 'undefined') return null
  const raw = sessionStorage.getItem(SESSION_KEY)
  if (!raw) return null
  try {
    return JSON.parse(raw) as CheckoutConfirmationSession
  } catch {
    return null
  }
}

/**
 * Clears stored checkout confirmation after it has been consumed.
 */
export function clearCheckoutConfirmation(): void {
  if (typeof window === 'undefined') return
  sessionStorage.removeItem(SESSION_KEY)
  notifyCheckoutConfirmationChanged()
}
