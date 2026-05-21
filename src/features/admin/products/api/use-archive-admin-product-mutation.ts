'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'

import { archiveAdminProduct } from './admin-products.api'
import { adminProductsQueryKeys } from './admin-products.query-keys'

export function useArchiveAdminProductMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => archiveAdminProduct(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: adminProductsQueryKeys.all })
    },
  })
}
