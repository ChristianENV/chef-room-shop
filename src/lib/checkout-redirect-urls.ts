import { routes } from '@/src/config/routes'

export type CheckoutSuccessUrlOptions = {
  /** Informational hint only (state still comes from orderByNumber). */
  paymentHint?: 'failed'
}

/**
 * Success page path + query (email never in URL).
 */
export function checkoutSuccessPath(
  orderNumber: string,
  options?: CheckoutSuccessUrlOptions,
): string {
  const params = new URLSearchParams({ orderNumber })
  if (options?.paymentHint === 'failed') {
    params.set('payment', 'failed')
  }
  return `${routes.checkoutSuccess}?${params.toString()}`
}

/**
 * Absolute Conekta redirect URLs for server-side order creation.
 */
export function conektaCheckoutRedirectUrls(
  orderNumber: string,
  baseUrl: string,
): { successUrl: string; failureUrl: string } {
  const base = baseUrl.replace(/\/$/, '')
  return {
    successUrl: `${base}${checkoutSuccessPath(orderNumber)}`,
    failureUrl: `${base}${checkoutSuccessPath(orderNumber, { paymentHint: 'failed' })}`,
  }
}
