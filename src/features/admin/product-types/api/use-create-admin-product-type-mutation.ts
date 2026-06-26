'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'

import { adminProductsQueryKeys } from '@/src/features/admin/products/api/admin-products.query-keys'

import { createAdminProductType } from './admin-product-types.api'
import { adminProductTypesQueryKeys } from './admin-product-types.query-keys'
import type { CreateAdminProductTypeInput } from '../types'

export function useCreateAdminProductTypeMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (input: CreateAdminProductTypeInput) => createAdminProductType(input),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: adminProductTypesQueryKeys.all })
      void queryClient.invalidateQueries({ queryKey: adminProductsQueryKeys.formOptions() })
    },
  })
}
