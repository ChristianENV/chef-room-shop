'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'

import { catalogQueryKeys } from '@/src/features/storefront/catalog/api/catalog.query-keys'

import { removeAdminProductTypeImage } from '../api/admin-product-types.api'
import { adminProductTypesQueryKeys } from '../api/admin-product-types.query-keys'

export function useRemoveAdminProductTypeImageMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => removeAdminProductTypeImage(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: adminProductTypesQueryKeys.all })
      void queryClient.invalidateQueries({ queryKey: catalogQueryKeys.all })
    },
  })
}
