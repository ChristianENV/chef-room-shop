import { fetchGraphQL } from '@/src/lib/graphql/fetch-graphql'

import { ADMIN_USERS_QUERY } from '../graphql/admin-users.queries'
import type { AdminUsersListVariables, AdminUsersPayload } from '../types'

type AdminUsersData = { adminUsers: AdminUsersPayload }

/**
 * Lists users for the admin panel (read-only).
 */
export async function getAdminUsers(
  variables?: AdminUsersListVariables,
): Promise<AdminUsersPayload> {
  const data = await fetchGraphQL<AdminUsersData, AdminUsersListVariables>({
    query: ADMIN_USERS_QUERY,
    variables,
  })
  return data.adminUsers
}
