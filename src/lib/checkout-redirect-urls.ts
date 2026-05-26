import { routes } from '@/src/config/routes'

export type CheckoutSuccessUrlOptions = {
  /** Opaque return token (preferred). */
  token?: string
  /** Legacy order number lookup. */
  orderNumber?: string
  /** Informational hint only (state still comes from server). */
  paymentHint?: 'failed'
}

/**
 * Success page path + query (email never in URL).
 */
export function checkoutSuccessPath(options: CheckoutSuccessUrlOptions): string {
  const params = new URLSearchParams()

  if (options.token?.trim()) {
    params.set('token', options.token.trim())
  } else if (options.orderNumber?.trim()) {
    params.set('orderNumber', options.orderNumber.trim())
  }

  if (options.paymentHint === 'failed') {
    params.set('payment', 'failed')
  }

  const query = params.toString()
  return query ? `${routes.checkoutSuccess}?${query}` : routes.checkoutSuccess
}

/**
 * Absolute Conekta redirect URLs for server-side order creation.
 */
export function conektaCheckoutRedirectUrls(
  returnToken: string,
  baseUrl: string,
  options?: { paymentHint?: 'failed' },
): { successUrl: string; failureUrl: string } {
  const base = baseUrl.replace(/\/$/, '')
  return {
    successUrl: `${base}${checkoutSuccessPath({ token: returnToken })}`,
    failureUrl: `${base}${checkoutSuccessPath({
      token: returnToken,
      paymentHint: options?.paymentHint ?? 'failed',
    })}`,
  }
}

/** @deprecated Use token-based checkoutSuccessPath for new checkouts. */
export function checkoutSuccessPathLegacy(
  orderNumber: string,
  options?: Pick<CheckoutSuccessUrlOptions, 'paymentHint'>,
): string {
  return checkoutSuccessPath({ orderNumber, paymentHint: options?.paymentHint })
}

/** @deprecated Use token-based conektaCheckoutRedirectUrls for new checkouts. */
export function conektaCheckoutRedirectUrlsLegacy(
  orderNumber: string,
  baseUrl: string,
): { successUrl: string; failureUrl: string } {
  const base = baseUrl.replace(/\/$/, '')
  return {
    successUrl: `${base}${checkoutSuccessPath({ orderNumber })}`,
    failureUrl: `${base}${checkoutSuccessPath({ orderNumber, paymentHint: 'failed' })}`,
  }
}
