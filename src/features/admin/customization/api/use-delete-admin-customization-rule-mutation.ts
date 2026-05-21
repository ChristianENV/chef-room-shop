'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'

import { deleteAdminCustomizationRule } from './admin-customization.api'
import { adminCustomizationQueryKeys } from './admin-customization.query-keys'

type Variables = { id: string; productId: string }

export function useDeleteAdminCustomizationRuleMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id }: Variables) => deleteAdminCustomizationRule(id),
    onSuccess: (_result, variables) => {
      void queryClient.invalidateQueries({ queryKey: adminCustomizationQueryKeys.all })
      void queryClient.removeQueries({
        queryKey: adminCustomizationQueryKeys.ruleDetail(variables.id),
      })
      void queryClient.invalidateQueries({
        queryKey: adminCustomizationQueryKeys.rulesByProduct(variables.productId),
      })
    },
  })
}
