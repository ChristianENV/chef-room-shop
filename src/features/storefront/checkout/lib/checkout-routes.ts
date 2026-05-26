import { checkoutSuccessPath } from '@/src/lib/checkout-redirect-urls'

/**
 * Success page URL with order number only (legacy; email comes from sessionStorage).
 */
export function checkoutSuccessUrl(orderNumber: string): string {
  return checkoutSuccessPath({ orderNumber })
}

/**
 * Success page URL with opaque return token (preferred).
 */
export function checkoutSuccessUrlWithToken(returnToken: string): string {
  return checkoutSuccessPath({ token: returnToken })
}
