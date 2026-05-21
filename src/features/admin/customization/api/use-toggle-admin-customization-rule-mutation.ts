'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'

import { toggleAdminCustomizationRule } from './admin-customization.api'
import { adminCustomizationQueryKeys } from './admin-customization.query-keys'

type Variables = { id: string; enabled: boolean }

export function useToggleAdminCustomizationRuleMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, enabled }: Variables) => toggleAdminCustomizationRule(id, enabled),
    onSuccess: (rule) => {
      void queryClient.invalidateQueries({ queryKey: adminCustomizationQueryKeys.all })
      void queryClient.setQueryData(
        adminCustomizationQueryKeys.ruleDetail(rule.id),
        rule,
      )
      void queryClient.invalidateQueries({
        queryKey: adminCustomizationQueryKeys.rulesByProduct(rule.productId),
      })
    },
  })
}
