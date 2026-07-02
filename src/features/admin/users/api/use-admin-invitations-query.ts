'use client'

import { useQuery } from '@tanstack/react-query'

import { getAdminUserInvitations } from './admin-invitations.api'
import { adminInvitationsQueryKeys } from './admin-invitations.query-keys'
import type { AdminUserInvitationsListVariables } from '../types/admin-invitations.types'

export function useAdminUserInvitationsQuery(variables?: AdminUserInvitationsListVariables) {
  return useQuery({
    queryKey: adminInvitationsQueryKeys.list(variables),
    queryFn: () => getAdminUserInvitations(variables),
  })
}
