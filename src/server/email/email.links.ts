import 'server-only'

import { checkoutSuccessPath } from '@/src/lib/checkout-redirect-urls'
import { routes } from '@/src/config/routes'
import { getAppBaseUrl } from '@/src/server/payments/app-url'

/**
 * Absolute URL to checkout success (no email in query).
 */
export function absoluteCheckoutSuccessUrl(orderNumber: string): string {
  return `${getAppBaseUrl()}${checkoutSuccessPath({ orderNumber })}`
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
 * Absolute URL to claim a guest order (token in query, not email).
 */
export function buildOrderClaimUrl(token: string): string {
  const params = new URLSearchParams({ token })
  return `${getAppBaseUrl()}${routes.claimOrder}?${params.toString()}`
}

/**
 * Absolute URL to approve guest order transfer authorization.
 */
export function buildOrderClaimTransferAuthorizeUrl(token: string): string {
  const params = new URLSearchParams({ token })
  return `${getAppBaseUrl()}${routes.claimOrderAuthorize}?${params.toString()}`
}

/**
 * Absolute URL to accept a user invitation (Phase 3B public page).
 */
export function buildUserInvitationUrl(token: string): string {
  const params = new URLSearchParams({ token })
  return `${getAppBaseUrl()}${routes.acceptInvite}?${params.toString()}`
}

/**
 * Absolute URL to authenticated order detail.
 */
export function buildAccountOrderUrl(orderNumber: string): string {
  return `${getAppBaseUrl()}${routes.accountOrderDetail(orderNumber)}`
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

export type OrderEmailTrackingLinks = {
  checkoutSuccessUrl: string
  accountUrl: string
  shopUrl: string
  claimUrl?: string
  accountOrderUrl?: string
}

/**
 * Tracking links for order emails: account detail for auth, claim URL for guests.
 */
export function buildOrderEmailTrackingLinks(input: {
  orderNumber: string
  userId: string | null
  claimToken?: string | null
}): OrderEmailTrackingLinks {
  const base = buildOrderEmailLinks(input.orderNumber)

  if (input.userId) {
    return {
      ...base,
      accountOrderUrl: buildAccountOrderUrl(input.orderNumber),
    }
  }

  if (input.claimToken) {
    return {
      ...base,
      claimUrl: buildOrderClaimUrl(input.claimToken),
    }
  }

  return base
}
