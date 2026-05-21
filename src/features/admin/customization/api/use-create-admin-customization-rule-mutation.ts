'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'

import { createAdminCustomizationRule } from './admin-customization.api'
import { adminCustomizationQueryKeys } from './admin-customization.query-keys'
import type { AdminCustomizationRuleInput } from '../types'

export function useCreateAdminCustomizationRuleMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (input: AdminCustomizationRuleInput) => createAdminCustomizationRule(input),
    onSuccess: (rule) => {
      void queryClient.invalidateQueries({ queryKey: adminCustomizationQueryKeys.all })
      void queryClient.invalidateQueries({
        queryKey: adminCustomizationQueryKeys.rulesByProduct(rule.productId),
      })
    },
  })
}
