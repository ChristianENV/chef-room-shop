import { routes } from '@/src/config/routes'

/**
 * Success page URL with order number only (email comes from sessionStorage).
 */
export function checkoutSuccessUrl(orderNumber: string): string {
  const params = new URLSearchParams({ orderNumber })
  return `${routes.checkoutSuccess}?${params.toString()}`
}
