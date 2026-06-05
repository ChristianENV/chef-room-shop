export type CustomizerPriceItemType = 'text' | 'logo'

export type CustomizerPriceBreakdownItem = {
  id: string
  type: CustomizerPriceItemType
  label: string
  zone: string
  amountCents: number
  quantity?: number
  metadata?: Record<string, unknown>
}

import type { CUSTOMIZER_PRICING_RULES_VERSION } from './customizer-pricing.constants'

export type CustomizerPriceBreakdown = {
  basePriceCents: number
  customizationPriceCents: number
  totalPriceCents: number
  items: CustomizerPriceBreakdownItem[]
  rulesVersion: typeof CUSTOMIZER_PRICING_RULES_VERSION
}
