'use client'

import { useQuery } from '@tanstack/react-query'

import { getAdminUsers } from './admin-users.api'
import { adminUsersQueryKeys } from './admin-users.query-keys'
import type { AdminUsersListVariables } from '../types'

/**
 * TanStack Query hook for paginated admin users list.
 */
export function useAdminUsersQuery(variables?: AdminUsersListVariables) {
  return useQuery({
    queryKey: adminUsersQueryKeys.list(variables),
    queryFn: () => getAdminUsers(variables),
  })
}
