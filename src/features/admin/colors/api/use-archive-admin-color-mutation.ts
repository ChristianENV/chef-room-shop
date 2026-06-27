'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'

import { adminProductsQueryKeys } from '@/src/features/admin/products/api/admin-products.query-keys'

import { archiveAdminColor } from './admin-colors.api'
import { adminColorsQueryKeys } from './admin-colors.query-keys'

export function useArchiveAdminColorMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => archiveAdminColor(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: adminColorsQueryKeys.all })
      void queryClient.invalidateQueries({ queryKey: adminProductsQueryKeys.formOptions() })
    },
  })
}
