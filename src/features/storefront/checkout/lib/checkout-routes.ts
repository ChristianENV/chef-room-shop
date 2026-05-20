import { checkoutSuccessPath } from '@/src/lib/checkout-redirect-urls'

/**
 * Success page URL with order number only (email comes from sessionStorage).
 */
export function checkoutSuccessUrl(orderNumber: string): string {
  return checkoutSuccessPath(orderNumber)
}
