import 'server-only'

import { checkoutSuccessPath } from '@/src/lib/checkout-redirect-urls'
import { routes } from '@/src/config/routes'
import { getAppBaseUrl } from '@/src/server/payments/app-url'

/**
 * Absolute URL to checkout success (no email in query).
 */
export function absoluteCheckoutSuccessUrl(orderNumber: string): string {
  return `${getAppBaseUrl()}${checkoutSuccessPath(orderNumber)}`
}

/**
 * Absolute URL to customer account area.
 */
export function absoluteAccountUrl(): string {
  return `${getAppBaseUrl()}${routes.account}`
}

/**
 * Absolute URL to storefront shop.
 */
export function absoluteShopUrl(): string {
  return `${getAppBaseUrl()}${routes.shop}`
}

/**
 * Link bundle for transactional order emails.
 */
export function buildOrderEmailLinks(orderNumber: string) {
  return {
    checkoutSuccessUrl: absoluteCheckoutSuccessUrl(orderNumber),
    accountUrl: absoluteAccountUrl(),
    shopUrl: absoluteShopUrl(),
  }
}
