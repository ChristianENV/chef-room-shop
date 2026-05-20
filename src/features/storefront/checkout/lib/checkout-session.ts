import type { CheckoutOrderPayload } from '../types'

const SESSION_KEY = 'chefroom_checkout_confirmation'

export type CheckoutConfirmationSession = CheckoutOrderPayload & {
  email: string
  paymentMethod: string
}

/**
 * Persists checkout confirmation data for the success page (avoids email in URL).
 */
export function saveCheckoutConfirmation(data: CheckoutConfirmationSession): void {
  if (typeof window === 'undefined') return
  sessionStorage.setItem(SESSION_KEY, JSON.stringify(data))
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
}
