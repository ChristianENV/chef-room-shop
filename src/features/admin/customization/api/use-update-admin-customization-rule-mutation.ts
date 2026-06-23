'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'

import { updateAdminCustomizationRule } from './admin-customization.api'
import { adminCustomizationQueryKeys } from './admin-customization.query-keys'
import type { AdminCustomizationRuleInput } from '../types'

type Variables = { id: string; input: AdminCustomizationRuleInput }

export function useUpdateAdminCustomizationRuleMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, input }: Variables) => updateAdminCustomizationRule(id, input),
    onSuccess: (rule) => {
      void queryClient.invalidateQueries({ queryKey: adminCustomizationQueryKeys.all })
      void queryClient.setQueryData(adminCustomizationQueryKeys.ruleDetail(rule.id), rule)
      void queryClient.invalidateQueries({
        queryKey: adminCustomizationQueryKeys.rulesByProduct(rule.productId),
      })
    },
  })
}
