import { fetchGraphQL } from '@/src/lib/graphql/fetch-graphql'

import {
  ARCHIVE_ADMIN_PRODUCT_TYPE_MUTATION,
  CREATE_ADMIN_PRODUCT_TYPE_MUTATION,
  REMOVE_ADMIN_PRODUCT_TYPE_IMAGE_MUTATION,
  UPDATE_ADMIN_PRODUCT_TYPE_MUTATION,
} from '../graphql/admin-product-types.mutations'
import {
  ADMIN_PRODUCT_TYPE_BY_ID_QUERY,
  ADMIN_PRODUCT_TYPES_QUERY,
} from '../graphql/admin-product-types.queries'
import type {
  AdminProductType,
  AdminProductTypesListVariables,
  CreateAdminProductTypeInput,
  UpdateAdminProductTypeInput,
} from '../types'

export async function getAdminProductTypes(
  variables?: AdminProductTypesListVariables,
): Promise<AdminProductType[]> {
  const data = await fetchGraphQL<
    { adminProductTypes: AdminProductType[] },
    AdminProductTypesListVariables
  >({
    query: ADMIN_PRODUCT_TYPES_QUERY,
    variables,
  })
  return data.adminProductTypes
}

export async function getAdminProductTypeById(id: string): Promise<AdminProductType | null> {
  const data = await fetchGraphQL<
    { adminProductTypeById: AdminProductType | null },
    { id: string }
  >({
    query: ADMIN_PRODUCT_TYPE_BY_ID_QUERY,
    variables: { id },
  })
  return data.adminProductTypeById
}

export async function createAdminProductType(
  input: CreateAdminProductTypeInput,
): Promise<AdminProductType> {
  const data = await fetchGraphQL<
    { createAdminProductType: AdminProductType },
    { input: CreateAdminProductTypeInput }
  >({
    query: CREATE_ADMIN_PRODUCT_TYPE_MUTATION,
    variables: { input },
  })
  return data.createAdminProductType
}

export async function updateAdminProductType(
  id: string,
  input: UpdateAdminProductTypeInput,
): Promise<AdminProductType> {
  const data = await fetchGraphQL<
    { updateAdminProductType: AdminProductType },
    { id: string; input: UpdateAdminProductTypeInput }
  >({
    query: UPDATE_ADMIN_PRODUCT_TYPE_MUTATION,
    variables: { id, input },
  })
  return data.updateAdminProductType
}

export async function archiveAdminProductType(id: string): Promise<AdminProductType> {
  const data = await fetchGraphQL<{ archiveAdminProductType: AdminProductType }, { id: string }>({
    query: ARCHIVE_ADMIN_PRODUCT_TYPE_MUTATION,
    variables: { id },
  })
  return data.archiveAdminProductType
}

export async function removeAdminProductTypeImage(id: string): Promise<AdminProductType> {
  const data = await fetchGraphQL<
    { removeAdminProductTypeImage: AdminProductType },
    { id: string }
  >({
    query: REMOVE_ADMIN_PRODUCT_TYPE_IMAGE_MUTATION,
    variables: { id },
  })
  return data.removeAdminProductTypeImage
}
