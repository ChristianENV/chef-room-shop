'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import {
  archiveAdminProductOptionGroup,
  archiveAdminProductOptionValue,
  createAdminProductOptionGroup,
  createAdminProductOptionValue,
  getAdminProductOptionGroups,
  updateAdminProductOptionGroup,
  updateAdminProductOptionValue,
} from './admin-product-options.api'
import { adminProductOptionsQueryKeys } from './admin-product-options.query-keys'
import type {
  ArchiveAdminProductOptionGroupInput,
  ArchiveAdminProductOptionValueInput,
  CreateAdminProductOptionGroupInput,
  CreateAdminProductOptionValueInput,
  UpdateAdminProductOptionGroupInput,
  UpdateAdminProductOptionValueInput,
} from '../types/admin-product-options.types'

type UseAdminProductOptionGroupsQueryOptions = {
  productId: string
  includeInactive?: boolean
  enabled?: boolean
}

export function useAdminProductOptionGroupsQuery({
  productId,
  includeInactive = true,
  enabled = true,
}: UseAdminProductOptionGroupsQueryOptions) {
  return useQuery({
    queryKey: adminProductOptionsQueryKeys.byProduct(productId, includeInactive),
    queryFn: () => getAdminProductOptionGroups({ productId, includeInactive }),
    enabled: enabled && productId.length > 0,
  })
}

function useInvalidateProductOptions(productId: string) {
  const queryClient = useQueryClient()
  return () => {
    void queryClient.invalidateQueries({ queryKey: adminProductOptionsQueryKeys.all })
    void queryClient.invalidateQueries({
      queryKey: adminProductOptionsQueryKeys.byProduct(productId, true),
    })
    void queryClient.invalidateQueries({
      queryKey: adminProductOptionsQueryKeys.byProduct(productId, false),
    })
  }
}

export function useCreateAdminProductOptionGroupMutation(productId: string) {
  const invalidate = useInvalidateProductOptions(productId)

  return useMutation({
    mutationFn: (input: CreateAdminProductOptionGroupInput) => createAdminProductOptionGroup(input),
    onSuccess: () => invalidate(),
  })
}

export function useUpdateAdminProductOptionGroupMutation(productId: string) {
  const invalidate = useInvalidateProductOptions(productId)

  return useMutation({
    mutationFn: (input: UpdateAdminProductOptionGroupInput) => updateAdminProductOptionGroup(input),
    onSuccess: () => invalidate(),
  })
}

export function useArchiveAdminProductOptionGroupMutation(productId: string) {
  const invalidate = useInvalidateProductOptions(productId)

  return useMutation({
    mutationFn: (input: ArchiveAdminProductOptionGroupInput) => archiveAdminProductOptionGroup(input),
    onSuccess: () => invalidate(),
  })
}

export function useCreateAdminProductOptionValueMutation(productId: string) {
  const invalidate = useInvalidateProductOptions(productId)

  return useMutation({
    mutationFn: (input: CreateAdminProductOptionValueInput) => createAdminProductOptionValue(input),
    onSuccess: () => invalidate(),
  })
}

export function useUpdateAdminProductOptionValueMutation(productId: string) {
  const invalidate = useInvalidateProductOptions(productId)

  return useMutation({
    mutationFn: (input: UpdateAdminProductOptionValueInput) => updateAdminProductOptionValue(input),
    onSuccess: () => invalidate(),
  })
}

export function useArchiveAdminProductOptionValueMutation(productId: string) {
  const invalidate = useInvalidateProductOptions(productId)

  return useMutation({
    mutationFn: (input: ArchiveAdminProductOptionValueInput) => archiveAdminProductOptionValue(input),
    onSuccess: () => invalidate(),
  })
}
