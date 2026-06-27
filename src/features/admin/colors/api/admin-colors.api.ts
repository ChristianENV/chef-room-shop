import { fetchGraphQL } from '@/src/lib/graphql/fetch-graphql'

import {
  ARCHIVE_ADMIN_COLOR_MUTATION,
  CREATE_ADMIN_COLOR_MUTATION,
  UPDATE_ADMIN_COLOR_MUTATION,
} from '../graphql/admin-colors.mutations'
import { ADMIN_COLOR_BY_ID_QUERY, ADMIN_COLORS_QUERY } from '../graphql/admin-colors.queries'
import type {
  AdminColor,
  AdminColorsListVariables,
  CreateAdminColorInput,
  UpdateAdminColorInput,
} from '../types'

export async function getAdminColors(variables?: AdminColorsListVariables): Promise<AdminColor[]> {
  const data = await fetchGraphQL<{ adminColors: AdminColor[] }, AdminColorsListVariables>({
    query: ADMIN_COLORS_QUERY,
    variables,
  })
  return data.adminColors
}

export async function getAdminColorById(id: string): Promise<AdminColor | null> {
  const data = await fetchGraphQL<{ adminColorById: AdminColor | null }, { id: string }>({
    query: ADMIN_COLOR_BY_ID_QUERY,
    variables: { id },
  })
  return data.adminColorById
}

export async function createAdminColor(input: CreateAdminColorInput): Promise<AdminColor> {
  const data = await fetchGraphQL<
    { createAdminColor: AdminColor },
    { input: CreateAdminColorInput }
  >({
    query: CREATE_ADMIN_COLOR_MUTATION,
    variables: { input },
  })
  return data.createAdminColor
}

export async function updateAdminColor(
  id: string,
  input: UpdateAdminColorInput,
): Promise<AdminColor> {
  const data = await fetchGraphQL<
    { updateAdminColor: AdminColor },
    { id: string; input: UpdateAdminColorInput }
  >({
    query: UPDATE_ADMIN_COLOR_MUTATION,
    variables: { id, input },
  })
  return data.updateAdminColor
}

export async function archiveAdminColor(id: string): Promise<AdminColor> {
  const data = await fetchGraphQL<{ archiveAdminColor: AdminColor }, { id: string }>({
    query: ARCHIVE_ADMIN_COLOR_MUTATION,
    variables: { id },
  })
  return data.archiveAdminColor
}
