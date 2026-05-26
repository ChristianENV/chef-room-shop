import { routes } from '@/src/config/routes'

export type PaidOrderRedirectInput = {
  orderNumber: string
  isAuthenticated: boolean
  detailUrl?: string | null
  accountOrderUrl?: string | null
  canViewDetails?: boolean
  claimUrl?: string | null
}

/**
 * Resolves where to send the user after payment is confirmed on checkout success.
 */
export function resolvePaidOrderRedirectUrl(input: PaidOrderRedirectInput): string | null {
  const orderNumber = input.orderNumber.trim()
  if (!orderNumber) {
    return null
  }

  const detailUrl = input.detailUrl?.trim()
  if (detailUrl) {
    return detailUrl
  }

  if (input.canViewDetails && input.accountOrderUrl?.trim()) {
    return input.accountOrderUrl.trim()
  }

  if (input.isAuthenticated) {
    return routes.accountOrderDetail(orderNumber)
  }

  const claimUrl = input.claimUrl?.trim()
  if (claimUrl) {
    return claimUrl
  }

  const callbackUrl = routes.accountOrderDetail(orderNumber)
  return `${routes.login}?callbackUrl=${encodeURIComponent(callbackUrl)}`
}
