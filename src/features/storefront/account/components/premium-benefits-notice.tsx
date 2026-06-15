'use client'

import { Sparkles } from 'lucide-react'
import { isCustomerPremium } from '@/src/features/storefront/account/components/customer-tier-badge'

type PremiumBenefitsNoticeProps = {
  customerTier?: string | null
}

/**
 * Informational banner for premium customers. Does not apply discounts.
 */
export function PremiumBenefitsNotice({ customerTier }: PremiumBenefitsNoticeProps) {
  if (!isCustomerPremium({ customerTier })) return null

  return (
    <div
      className="mb-6 rounded-lg border border-primary/20 bg-primary/5 px-4 py-3 text-sm text-foreground"
      data-testid="premium-benefits-notice"
    >
      <div className="flex items-start gap-2">
        <Sparkles className="mt-0.5 size-4 shrink-0 text-primary" />
        <p>
          Eres <span className="font-semibold">cliente premium</span>. Tu cuenta tiene prioridad en
          atención y seguimiento de pedidos personalizados.
        </p>
      </div>
    </div>
  )
}
