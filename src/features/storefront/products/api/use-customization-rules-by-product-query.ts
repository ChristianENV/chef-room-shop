'use client'

import { useQuery } from '@tanstack/react-query'

import { getCustomizationRulesByProduct } from './products.api'
import { productQueryKeys } from './products.query-keys'

/**
 * Fetches customization rules for a product from the BFF.
 */
export function useCustomizationRulesByProductQuery(productId?: string) {
  return useQuery({
    queryKey: productId
      ? productQueryKeys.customizationRules(productId)
      : [...productQueryKeys.all, 'customization-rules', 'none'],
    queryFn: () => getCustomizationRulesByProduct(productId!),
    enabled: Boolean(productId),
  })
}
