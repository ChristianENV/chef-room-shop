'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'

import { adminProductsQueryKeys } from '@/src/features/admin/products/api/admin-products.query-keys'

import { createAdminColor } from './admin-colors.api'
import { adminColorsQueryKeys } from './admin-colors.query-keys'
import type { CreateAdminColorInput } from '../types'

export function useCreateAdminColorMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (input: CreateAdminColorInput) => createAdminColor(input),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: adminColorsQueryKeys.all })
      void queryClient.invalidateQueries({ queryKey: adminProductsQueryKeys.formOptions() })
    },
  })
}
