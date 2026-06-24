'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'

import { adminProductsQueryKeys } from '@/src/features/admin/products/api/admin-products.query-keys'

import { archiveAdminProductType } from './admin-product-types.api'
import { adminProductTypesQueryKeys } from './admin-product-types.query-keys'

export function useArchiveAdminProductTypeMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => archiveAdminProductType(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: adminProductTypesQueryKeys.all })
      void queryClient.invalidateQueries({ queryKey: adminProductsQueryKeys.formOptions() })
    },
  })
}
