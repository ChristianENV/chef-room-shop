'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'

import { reactivateAdminUser } from './admin-users.api'
import { adminUsersQueryKeys } from './admin-users.query-keys'

export function useReactivateAdminUserMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => reactivateAdminUser(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: adminUsersQueryKeys.all })
    },
  })
}
