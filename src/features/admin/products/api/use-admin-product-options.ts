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
  AdminProductOptionScope,
  ArchiveAdminProductOptionGroupInput,
  ArchiveAdminProductOptionValueInput,
  CreateAdminProductOptionGroupInput,
  CreateAdminProductOptionValueInput,
  UpdateAdminProductOptionGroupInput,
  UpdateAdminProductOptionValueInput,
} from '../types/admin-product-options.types'

type UseAdminProductOptionGroupsQueryOptions = {
  scope: AdminProductOptionScope
  includeInactive?: boolean
  enabled?: boolean
}

function getScopeQueryKey(scope: AdminProductOptionScope, includeInactive: boolean) {
  return scope.kind === 'product'
    ? adminProductOptionsQueryKeys.byProduct(scope.productId, includeInactive)
    : adminProductOptionsQueryKeys.byProductType(scope.productTypeId, includeInactive)
}

function getScopeQueryInput(scope: AdminProductOptionScope, includeInactive: boolean) {
  return scope.kind === 'product'
    ? { productId: scope.productId, includeInactive }
    : { productTypeId: scope.productTypeId, includeInactive }
}

function isScopeEnabled(scope: AdminProductOptionScope): boolean {
  return scope.kind === 'product' ? scope.productId.length > 0 : scope.productTypeId.length > 0
}

export function useAdminProductOptionGroupsQuery({
  scope,
  includeInactive = true,
  enabled = true,
}: UseAdminProductOptionGroupsQueryOptions) {
  return useQuery({
    queryKey: getScopeQueryKey(scope, includeInactive),
    queryFn: () => getAdminProductOptionGroups(getScopeQueryInput(scope, includeInactive)),
    enabled: enabled && isScopeEnabled(scope),
  })
}

function useInvalidateProductOptions(scope: AdminProductOptionScope) {
  const queryClient = useQueryClient()
  return () => {
    void queryClient.invalidateQueries({ queryKey: adminProductOptionsQueryKeys.all })
    void queryClient.invalidateQueries({
      queryKey: getScopeQueryKey(scope, true),
    })
    void queryClient.invalidateQueries({
      queryKey: getScopeQueryKey(scope, false),
    })
  }
}

export function useCreateAdminProductOptionGroupMutation(scope: AdminProductOptionScope) {
  const invalidate = useInvalidateProductOptions(scope)

  return useMutation({
    mutationFn: (input: CreateAdminProductOptionGroupInput) => createAdminProductOptionGroup(input),
    onSuccess: () => invalidate(),
  })
}

export function useUpdateAdminProductOptionGroupMutation(scope: AdminProductOptionScope) {
  const invalidate = useInvalidateProductOptions(scope)

  return useMutation({
    mutationFn: (input: UpdateAdminProductOptionGroupInput) => updateAdminProductOptionGroup(input),
    onSuccess: () => invalidate(),
  })
}

export function useArchiveAdminProductOptionGroupMutation(scope: AdminProductOptionScope) {
  const invalidate = useInvalidateProductOptions(scope)

  return useMutation({
    mutationFn: (input: ArchiveAdminProductOptionGroupInput) =>
      archiveAdminProductOptionGroup(input),
    onSuccess: () => invalidate(),
  })
}

export function useCreateAdminProductOptionValueMutation(scope: AdminProductOptionScope) {
  const invalidate = useInvalidateProductOptions(scope)

  return useMutation({
    mutationFn: (input: CreateAdminProductOptionValueInput) => createAdminProductOptionValue(input),
    onSuccess: () => invalidate(),
  })
}

export function useUpdateAdminProductOptionValueMutation(scope: AdminProductOptionScope) {
  const invalidate = useInvalidateProductOptions(scope)

  return useMutation({
    mutationFn: (input: UpdateAdminProductOptionValueInput) => updateAdminProductOptionValue(input),
    onSuccess: () => invalidate(),
  })
}

export function useArchiveAdminProductOptionValueMutation(scope: AdminProductOptionScope) {
  const invalidate = useInvalidateProductOptions(scope)

  return useMutation({
    mutationFn: (input: ArchiveAdminProductOptionValueInput) =>
      archiveAdminProductOptionValue(input),
    onSuccess: () => invalidate(),
  })
}
