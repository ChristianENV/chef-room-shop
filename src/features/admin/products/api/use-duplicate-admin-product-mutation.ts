'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'

import { duplicateAdminProduct } from './admin-products.api'
import { adminProductsQueryKeys } from './admin-products.query-keys'

export function useDuplicateAdminProductMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => duplicateAdminProduct(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: adminProductsQueryKeys.all })
    },
  })
}
