'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'

import { createAdminProduct } from './admin-products.api'
import { adminProductsQueryKeys } from './admin-products.query-keys'
import type { AdminProductInput } from '../types'

export function useCreateAdminProductMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (input: AdminProductInput) => createAdminProduct(input),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: adminProductsQueryKeys.all })
    },
  })
}
