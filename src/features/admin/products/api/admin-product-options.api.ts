import { fetchGraphQL } from '@/src/lib/graphql/fetch-graphql'

import {
  ARCHIVE_ADMIN_PRODUCT_OPTION_GROUP_MUTATION,
  ARCHIVE_ADMIN_PRODUCT_OPTION_VALUE_MUTATION,
  CREATE_ADMIN_PRODUCT_OPTION_GROUP_MUTATION,
  CREATE_ADMIN_PRODUCT_OPTION_VALUE_MUTATION,
  UPDATE_ADMIN_PRODUCT_OPTION_GROUP_MUTATION,
  UPDATE_ADMIN_PRODUCT_OPTION_VALUE_MUTATION,
} from '../graphql/admin-product-options.mutations'
import { ADMIN_PRODUCT_OPTION_GROUPS_QUERY } from '../graphql/admin-product-options.queries'
import type {
  AdminProductOptionGroup,
  AdminProductOptionGroupsPayload,
  AdminProductOptionValue,
  ArchiveAdminProductOptionGroupInput,
  ArchiveAdminProductOptionPayload,
  ArchiveAdminProductOptionValueInput,
  CreateAdminProductOptionGroupInput,
  CreateAdminProductOptionValueInput,
  GetAdminProductOptionGroupsInput,
  UpdateAdminProductOptionGroupInput,
  UpdateAdminProductOptionValueInput,
} from '../types/admin-product-options.types'

export async function getAdminProductOptionGroups(
  input: GetAdminProductOptionGroupsInput,
): Promise<AdminProductOptionGroupsPayload> {
  const data = await fetchGraphQL<
    { adminProductOptionGroups: AdminProductOptionGroupsPayload },
    { input: GetAdminProductOptionGroupsInput }
  >({
    query: ADMIN_PRODUCT_OPTION_GROUPS_QUERY,
    variables: { input },
  })
  return data.adminProductOptionGroups
}

export async function createAdminProductOptionGroup(
  input: CreateAdminProductOptionGroupInput,
): Promise<AdminProductOptionGroup> {
  const data = await fetchGraphQL<
    { createAdminProductOptionGroup: { group: AdminProductOptionGroup } },
    { input: CreateAdminProductOptionGroupInput }
  >({
    query: CREATE_ADMIN_PRODUCT_OPTION_GROUP_MUTATION,
    variables: { input },
  })
  return data.createAdminProductOptionGroup.group
}

export async function updateAdminProductOptionGroup(
  input: UpdateAdminProductOptionGroupInput,
): Promise<AdminProductOptionGroup> {
  const data = await fetchGraphQL<
    { updateAdminProductOptionGroup: { group: AdminProductOptionGroup } },
    { input: UpdateAdminProductOptionGroupInput }
  >({
    query: UPDATE_ADMIN_PRODUCT_OPTION_GROUP_MUTATION,
    variables: { input },
  })
  return data.updateAdminProductOptionGroup.group
}

export async function archiveAdminProductOptionGroup(
  input: ArchiveAdminProductOptionGroupInput,
): Promise<ArchiveAdminProductOptionPayload> {
  const data = await fetchGraphQL<
    { archiveAdminProductOptionGroup: ArchiveAdminProductOptionPayload },
    { input: ArchiveAdminProductOptionGroupInput }
  >({
    query: ARCHIVE_ADMIN_PRODUCT_OPTION_GROUP_MUTATION,
    variables: { input },
  })
  return data.archiveAdminProductOptionGroup
}

export async function createAdminProductOptionValue(
  input: CreateAdminProductOptionValueInput,
): Promise<AdminProductOptionValue> {
  const data = await fetchGraphQL<
    { createAdminProductOptionValue: { value: AdminProductOptionValue } },
    { input: CreateAdminProductOptionValueInput }
  >({
    query: CREATE_ADMIN_PRODUCT_OPTION_VALUE_MUTATION,
    variables: { input },
  })
  return data.createAdminProductOptionValue.value
}

export async function updateAdminProductOptionValue(
  input: UpdateAdminProductOptionValueInput,
): Promise<AdminProductOptionValue> {
  const data = await fetchGraphQL<
    { updateAdminProductOptionValue: { value: AdminProductOptionValue } },
    { input: UpdateAdminProductOptionValueInput }
  >({
    query: UPDATE_ADMIN_PRODUCT_OPTION_VALUE_MUTATION,
    variables: { input },
  })
  return data.updateAdminProductOptionValue.value
}

export async function archiveAdminProductOptionValue(
  input: ArchiveAdminProductOptionValueInput,
): Promise<ArchiveAdminProductOptionPayload> {
  const data = await fetchGraphQL<
    { archiveAdminProductOptionValue: ArchiveAdminProductOptionPayload },
    { input: ArchiveAdminProductOptionValueInput }
  >({
    query: ARCHIVE_ADMIN_PRODUCT_OPTION_VALUE_MUTATION,
    variables: { input },
  })
  return data.archiveAdminProductOptionValue
}
