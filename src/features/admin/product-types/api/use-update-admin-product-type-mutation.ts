'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'

import { adminProductsQueryKeys } from '@/src/features/admin/products/api/admin-products.query-keys'

import { updateAdminProductType } from './admin-product-types.api'
import { adminProductTypesQueryKeys } from './admin-product-types.query-keys'
import type { UpdateAdminProductTypeInput } from '../types'

type UpdateVariables = {
  id: string
  input: UpdateAdminProductTypeInput
}

export function useUpdateAdminProductTypeMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, input }: UpdateVariables) => updateAdminProductType(id, input),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: adminProductTypesQueryKeys.all })
      void queryClient.invalidateQueries({ queryKey: adminProductsQueryKeys.formOptions() })
    },
  })
}
