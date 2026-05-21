'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'

import { deleteAdminProductImage } from './admin-products.api'
import { adminProductsQueryKeys } from './admin-products.query-keys'

type Variables = { id: string; productId: string }

export function useDeleteAdminProductImageMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id }: Variables) => deleteAdminProductImage(id),
    onSuccess: (_result, variables) => {
      void queryClient.invalidateQueries({ queryKey: adminProductsQueryKeys.all })
      void queryClient.invalidateQueries({
        queryKey: adminProductsQueryKeys.detail(variables.productId),
      })
    },
  })
}
