'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'

import { upsertAdminProductImage } from './admin-products.api'
import { adminProductsQueryKeys } from './admin-products.query-keys'
import type { AdminProductImageInput } from '../types'

export function useUpsertAdminProductImageMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (input: AdminProductImageInput) => upsertAdminProductImage(input),
    onSuccess: (_image, input) => {
      void queryClient.invalidateQueries({ queryKey: adminProductsQueryKeys.all })
      void queryClient.invalidateQueries({
        queryKey: adminProductsQueryKeys.detail(input.productId),
      })
    },
  })
}
