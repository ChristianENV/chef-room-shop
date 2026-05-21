'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'

import { duplicateCustomizationRulesToProduct } from './admin-customization.api'
import { adminCustomizationQueryKeys } from './admin-customization.query-keys'
import type { DuplicateCustomizationRulesInput } from '../types'

export function useDuplicateCustomizationRulesToProductMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (input: DuplicateCustomizationRulesInput) =>
      duplicateCustomizationRulesToProduct(input),
    onSuccess: (_rules, input) => {
      void queryClient.invalidateQueries({ queryKey: adminCustomizationQueryKeys.all })
      void queryClient.invalidateQueries({
        queryKey: adminCustomizationQueryKeys.rulesByProduct(input.toProductId),
      })
      void queryClient.invalidateQueries({
        queryKey: adminCustomizationQueryKeys.rulesByProduct(input.fromProductId),
      })
    },
  })
}
