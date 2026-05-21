'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'

import { upsertAdminProductVariant } from './admin-products.api'
import { adminProductsQueryKeys } from './admin-products.query-keys'
import type { AdminProductVariantInput } from '../types'

export function useUpsertAdminProductVariantMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (input: AdminProductVariantInput) => upsertAdminProductVariant(input),
    onSuccess: (_variant, input) => {
      void queryClient.invalidateQueries({ queryKey: adminProductsQueryKeys.all })
      void queryClient.invalidateQueries({
        queryKey: adminProductsQueryKeys.detail(input.productId),
      })
    },
  })
}
