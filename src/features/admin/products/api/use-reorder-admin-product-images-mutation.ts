'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'

import { reorderAdminProductImages } from './admin-products.api'
import { adminProductsQueryKeys } from './admin-products.query-keys'

type Variables = { productId: string; imageIds: string[] }

export function useReorderAdminProductImagesMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ productId, imageIds }: Variables) =>
      reorderAdminProductImages(productId, imageIds),
    onSuccess: (_result, variables) => {
      void queryClient.invalidateQueries({ queryKey: adminProductsQueryKeys.all })
      void queryClient.invalidateQueries({
        queryKey: adminProductsQueryKeys.detail(variables.productId),
      })
    },
  })
}
