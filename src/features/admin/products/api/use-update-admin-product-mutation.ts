'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'

import { updateAdminProduct } from './admin-products.api'
import { adminProductsQueryKeys } from './admin-products.query-keys'
import type { AdminProductInput } from '../types'

type Variables = { id: string; input: AdminProductInput }

export function useUpdateAdminProductMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, input }: Variables) => updateAdminProduct(id, input),
    onSuccess: (product) => {
      void queryClient.invalidateQueries({ queryKey: adminProductsQueryKeys.all })
      void queryClient.setQueryData(adminProductsQueryKeys.detail(product.id), product)
      void queryClient.setQueryData(adminProductsQueryKeys.bySlug(product.slug), product)
    },
  })
}
