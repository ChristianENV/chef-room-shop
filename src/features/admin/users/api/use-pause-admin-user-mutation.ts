'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'

import { pauseAdminUser } from './admin-users.api'
import { adminUsersQueryKeys } from './admin-users.query-keys'

export function usePauseAdminUserMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => pauseAdminUser(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: adminUsersQueryKeys.all })
    },
  })
}
