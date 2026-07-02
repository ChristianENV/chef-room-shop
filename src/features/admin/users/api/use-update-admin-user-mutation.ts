'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'

import { updateAdminUser } from './admin-users.api'
import { adminUsersQueryKeys } from './admin-users.query-keys'
import type { UpdateAdminUserInput } from '../types'

export function useUpdateAdminUserMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (input: UpdateAdminUserInput) => updateAdminUser(input),
    onSuccess: (updated) => {
      void queryClient.invalidateQueries({ queryKey: adminUsersQueryKeys.all })
      queryClient.setQueryData(adminUsersQueryKeys.detail(updated.id), updated)
    },
  })
}
