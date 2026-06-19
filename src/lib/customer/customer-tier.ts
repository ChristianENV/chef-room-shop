import type { CustomerTier } from '@prisma/client'

/** UI-facing customer loyalty status (legacy profile components). */
export type CustomerStatusUi = 'regular' | 'premium' | 'vip'

export function mapCustomerTierToUiStatus(tier: CustomerTier | string): CustomerStatusUi {
  switch (tier) {
    case 'PREMIUM':
      return 'premium'
    case 'VIP':
      return 'vip'
    case 'REGULAR':
    default:
      return 'regular'
  }
}

export function isPremiumCustomerTier(tier: CustomerTier | string | null | undefined): boolean {
  return tier === 'PREMIUM' || tier === 'VIP'
}

export function getCustomerTierLabel(
  tier: CustomerTier | string | null | undefined,
): string | null {
  switch (tier) {
    case 'PREMIUM':
      return 'Cliente premium'
    case 'VIP':
      return 'Cliente VIP'
    default:
      return null
  }
}
