'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'

import { blockAdminUser } from './admin-users.api'
import { adminUsersQueryKeys } from './admin-users.query-keys'

export function useBlockAdminUserMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => blockAdminUser(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: adminUsersQueryKeys.all })
    },
  })
}
