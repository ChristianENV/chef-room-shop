import { Star } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import {
  getCustomerTierLabel,
  isPremiumCustomerTier,
  type CustomerStatusUi,
} from '@/src/lib/customer/customer-tier'

type CustomerTierBadgeProps = {
  customerTier?: string | null
  customerStatus?: CustomerStatusUi | null
  className?: string
  showRegular?: boolean
}

function resolveTier(
  customerTier?: string | null,
  customerStatus?: CustomerStatusUi | null,
): string | null {
  if (customerTier) return customerTier
  if (customerStatus === 'premium') return 'PREMIUM'
  if (customerStatus === 'vip') return 'VIP'
  return 'REGULAR'
}

export function CustomerTierBadge({
  customerTier,
  customerStatus,
  className,
  showRegular = false,
}: CustomerTierBadgeProps) {
  const tier = resolveTier(customerTier, customerStatus)
  const label = getCustomerTierLabel(tier)

  if (!label && !showRegular) return null
  if (!label) {
    return (
      <Badge variant="secondary" className={cn('font-normal', className)} data-testid="customer-tier-badge">
        Cliente
      </Badge>
    )
  }

  const isPremium = isPremiumCustomerTier(tier)

  return (
    <Badge
      className={cn(
        isPremium ? 'bg-primary text-primary-foreground' : 'bg-warning text-warning-foreground',
        className,
      )}
      data-testid="customer-tier-badge"
    >
      <Star className="mr-1 size-3" />
      {label}
    </Badge>
  )
}

export function isCustomerPremium(params: {
  customerTier?: string | null
  customerStatus?: CustomerStatusUi | null
}): boolean {
  return isPremiumCustomerTier(resolveTier(params.customerTier, params.customerStatus))
}
