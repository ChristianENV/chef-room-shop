'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'

import { updateAdminProductStatus } from './admin-products.api'
import { adminProductsQueryKeys } from './admin-products.query-keys'

type Variables = { id: string; status: string }

export function useUpdateAdminProductStatusMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, status }: Variables) => updateAdminProductStatus(id, status),
    onSuccess: (product) => {
      void queryClient.invalidateQueries({ queryKey: adminProductsQueryKeys.all })
      void queryClient.setQueryData(adminProductsQueryKeys.detail(product.id), product)
    },
  })
}
