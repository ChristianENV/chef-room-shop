'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'

import { adminProductsQueryKeys } from '@/src/features/admin/products/api/admin-products.query-keys'

import { updateAdminColor } from './admin-colors.api'
import { adminColorsQueryKeys } from './admin-colors.query-keys'
import type { UpdateAdminColorInput } from '../types'

export function useUpdateAdminColorMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateAdminColorInput }) =>
      updateAdminColor(id, input),
    onSuccess: (_data, variables) => {
      void queryClient.invalidateQueries({ queryKey: adminColorsQueryKeys.all })
      void queryClient.invalidateQueries({ queryKey: adminColorsQueryKeys.detail(variables.id) })
      void queryClient.invalidateQueries({ queryKey: adminProductsQueryKeys.formOptions() })
    },
  })
}
