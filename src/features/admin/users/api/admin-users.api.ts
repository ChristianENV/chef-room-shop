import { fetchGraphQL } from '@/src/lib/graphql/fetch-graphql'

import { ADMIN_USER_QUERY, ADMIN_USERS_QUERY } from '../graphql/admin-users.queries'
import {
  BLOCK_ADMIN_USER_MUTATION,
  PAUSE_ADMIN_USER_MUTATION,
  REACTIVATE_ADMIN_USER_MUTATION,
  UPDATE_ADMIN_USER_MUTATION,
} from '../graphql/admin-users.mutations'
import type {
  AdminUser,
  AdminUsersListVariables,
  AdminUsersPayload,
  UpdateAdminUserInput,
} from '../types'

type AdminUsersData = { adminUsers: AdminUsersPayload }
type AdminUserData = { adminUser: AdminUser | null }
type UpdateAdminUserData = { updateAdminUser: AdminUser }
type PauseAdminUserData = { pauseAdminUser: AdminUser }
type BlockAdminUserData = { blockAdminUser: AdminUser }
type ReactivateAdminUserData = { reactivateAdminUser: AdminUser }

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

/**
 * Fetches a single admin user by ID.
 */
export async function getAdminUser(id: string): Promise<AdminUser | null> {
  const data = await fetchGraphQL<AdminUserData, { id: string }>({
    query: ADMIN_USER_QUERY,
    variables: { id },
  })
  return data.adminUser
}

/**
 * Updates basic profile fields of a user.
 */
export async function updateAdminUser(input: UpdateAdminUserInput): Promise<AdminUser> {
  const data = await fetchGraphQL<UpdateAdminUserData, { input: UpdateAdminUserInput }>({
    query: UPDATE_ADMIN_USER_MUTATION,
    variables: { input },
  })
  return data.updateAdminUser
}

/**
 * Pauses a user (sets status = SUSPENDED).
 */
export async function pauseAdminUser(id: string): Promise<AdminUser> {
  const data = await fetchGraphQL<PauseAdminUserData, { id: string }>({
    query: PAUSE_ADMIN_USER_MUTATION,
    variables: { id },
  })
  return data.pauseAdminUser
}

/**
 * Blocks a user (sets status = DELETED + deletedAt = now).
 */
export async function blockAdminUser(id: string): Promise<AdminUser> {
  const data = await fetchGraphQL<BlockAdminUserData, { id: string }>({
    query: BLOCK_ADMIN_USER_MUTATION,
    variables: { id },
  })
  return data.blockAdminUser
}

/**
 * Reactivates a suspended or blocked user (sets status = ACTIVE, clears deletedAt).
 */
export async function reactivateAdminUser(id: string): Promise<AdminUser> {
  const data = await fetchGraphQL<ReactivateAdminUserData, { id: string }>({
    query: REACTIVATE_ADMIN_USER_MUTATION,
    variables: { id },
  })
  return data.reactivateAdminUser
}
