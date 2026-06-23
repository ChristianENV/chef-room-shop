'use client'

import { useQuery } from '@tanstack/react-query'

import { getAdminCustomizationPricingPreview } from './admin-customization.api'
import { adminCustomizationQueryKeys } from './admin-customization.query-keys'
import type { AdminCustomizationPricingPreviewInput } from '../types'

export function useAdminCustomizationPricingPreviewQuery(
  input: AdminCustomizationPricingPreviewInput | null,
  enabled = true,
) {
  return useQuery({
    queryKey: adminCustomizationQueryKeys.pricingPreview(
      input ?? { productId: '', areaId: '', optionId: '' },
    ),
    queryFn: () => getAdminCustomizationPricingPreview(input!),
    enabled:
      enabled &&
      !!input &&
      input.productId.length > 0 &&
      input.areaId.length > 0 &&
      input.optionId.length > 0,
  })
}
