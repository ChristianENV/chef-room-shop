'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'

import { syncAdminProductVariants } from './admin-products.api'
import { adminProductsQueryKeys } from './admin-products.query-keys'
import type { AdminProductVariantBatchInput } from '../types'

type SyncVariantsVariables = {
  productId: string
  variants: AdminProductVariantBatchInput[]
}

export function useSyncAdminProductVariantsMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ productId, variants }: SyncVariantsVariables) =>
      syncAdminProductVariants(productId, variants),
    onSuccess: (payload) => {
      void queryClient.invalidateQueries({ queryKey: adminProductsQueryKeys.all })
      void queryClient.invalidateQueries({
        queryKey: adminProductsQueryKeys.detail(payload.productId),
      })
    },
  })
}
