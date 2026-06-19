import { fetchGraphQL } from '@/src/lib/graphql/fetch-graphql'

import {
  ARCHIVE_ADMIN_PRODUCT_MUTATION,
  CREATE_ADMIN_PRODUCT_MUTATION,
  DELETE_ADMIN_PRODUCT_IMAGE_MUTATION,
  DELETE_ADMIN_PRODUCT_VARIANT_MUTATION,
  DUPLICATE_ADMIN_PRODUCT_MUTATION,
  REORDER_ADMIN_PRODUCT_IMAGES_MUTATION,
  UPDATE_ADMIN_PRODUCT_MUTATION,
  UPDATE_ADMIN_PRODUCT_STATUS_MUTATION,
  UPSERT_ADMIN_PRODUCT_IMAGE_MUTATION,
  UPSERT_ADMIN_PRODUCT_VARIANT_MUTATION,
} from '../graphql/admin-products.mutations'
import {
  ADMIN_PRODUCT_BY_ID_QUERY,
  ADMIN_PRODUCT_BY_SLUG_QUERY,
  ADMIN_PRODUCT_FORM_OPTIONS_QUERY,
  ADMIN_PRODUCTS_QUERY,
} from '../graphql/admin-products.queries'
import type {
  AdminProduct,
  AdminProductFormOptions,
  AdminProductImage,
  AdminProductImageInput,
  AdminProductInput,
  AdminProductsListVariables,
  AdminProductsPayload,
  AdminProductVariant,
  AdminProductVariantInput,
} from '../types'

export async function getAdminProducts(
  variables?: AdminProductsListVariables,
): Promise<AdminProductsPayload> {
  const data = await fetchGraphQL<
    { adminProducts: AdminProductsPayload },
    AdminProductsListVariables
  >({
    query: ADMIN_PRODUCTS_QUERY,
    variables,
  })
  return data.adminProducts
}

export async function getAdminProductById(id: string): Promise<AdminProduct | null> {
  const data = await fetchGraphQL<{ adminProductById: AdminProduct | null }, { id: string }>({
    query: ADMIN_PRODUCT_BY_ID_QUERY,
    variables: { id },
  })
  return data.adminProductById
}

export async function getAdminProductBySlug(slug: string): Promise<AdminProduct | null> {
  const data = await fetchGraphQL<{ adminProductBySlug: AdminProduct | null }, { slug: string }>({
    query: ADMIN_PRODUCT_BY_SLUG_QUERY,
    variables: { slug },
  })
  return data.adminProductBySlug
}

export async function getAdminProductFormOptions(): Promise<AdminProductFormOptions> {
  const data = await fetchGraphQL<{ adminProductFormOptions: AdminProductFormOptions }>({
    query: ADMIN_PRODUCT_FORM_OPTIONS_QUERY,
  })
  return data.adminProductFormOptions
}

export async function createAdminProduct(input: AdminProductInput): Promise<AdminProduct> {
  const data = await fetchGraphQL<
    { createAdminProduct: AdminProduct },
    { input: AdminProductInput }
  >({
    query: CREATE_ADMIN_PRODUCT_MUTATION,
    variables: { input },
  })
  return data.createAdminProduct
}

export async function updateAdminProduct(
  id: string,
  input: AdminProductInput,
): Promise<AdminProduct> {
  const data = await fetchGraphQL<
    { updateAdminProduct: AdminProduct },
    { id: string; input: AdminProductInput }
  >({
    query: UPDATE_ADMIN_PRODUCT_MUTATION,
    variables: { id, input },
  })
  return data.updateAdminProduct
}

export async function archiveAdminProduct(id: string): Promise<AdminProduct> {
  const data = await fetchGraphQL<{ archiveAdminProduct: AdminProduct }, { id: string }>({
    query: ARCHIVE_ADMIN_PRODUCT_MUTATION,
    variables: { id },
  })
  return data.archiveAdminProduct
}

export async function duplicateAdminProduct(id: string): Promise<AdminProduct> {
  const data = await fetchGraphQL<{ duplicateAdminProduct: AdminProduct }, { id: string }>({
    query: DUPLICATE_ADMIN_PRODUCT_MUTATION,
    variables: { id },
  })
  return data.duplicateAdminProduct
}

export async function updateAdminProductStatus(id: string, status: string): Promise<AdminProduct> {
  const data = await fetchGraphQL<
    { updateAdminProductStatus: AdminProduct },
    { id: string; status: string }
  >({
    query: UPDATE_ADMIN_PRODUCT_STATUS_MUTATION,
    variables: { id, status },
  })
  return data.updateAdminProductStatus
}

export async function upsertAdminProductVariant(
  input: AdminProductVariantInput,
): Promise<AdminProductVariant> {
  const data = await fetchGraphQL<
    { upsertAdminProductVariant: AdminProductVariant },
    { input: AdminProductVariantInput }
  >({
    query: UPSERT_ADMIN_PRODUCT_VARIANT_MUTATION,
    variables: { input },
  })
  return data.upsertAdminProductVariant
}

export async function deleteAdminProductVariant(id: string): Promise<boolean> {
  const data = await fetchGraphQL<{ deleteAdminProductVariant: boolean }, { id: string }>({
    query: DELETE_ADMIN_PRODUCT_VARIANT_MUTATION,
    variables: { id },
  })
  return data.deleteAdminProductVariant
}

export async function upsertAdminProductImage(
  input: AdminProductImageInput,
): Promise<AdminProductImage> {
  const data = await fetchGraphQL<
    { upsertAdminProductImage: AdminProductImage },
    { input: AdminProductImageInput }
  >({
    query: UPSERT_ADMIN_PRODUCT_IMAGE_MUTATION,
    variables: { input },
  })
  return data.upsertAdminProductImage
}

export async function deleteAdminProductImage(id: string): Promise<boolean> {
  const data = await fetchGraphQL<{ deleteAdminProductImage: boolean }, { id: string }>({
    query: DELETE_ADMIN_PRODUCT_IMAGE_MUTATION,
    variables: { id },
  })
  return data.deleteAdminProductImage
}

export async function reorderAdminProductImages(
  productId: string,
  imageIds: string[],
): Promise<AdminProductImage[]> {
  const data = await fetchGraphQL<
    { reorderAdminProductImages: AdminProductImage[] },
    { productId: string; imageIds: string[] }
  >({
    query: REORDER_ADMIN_PRODUCT_IMAGES_MUTATION,
    variables: { productId, imageIds },
  })
  return data.reorderAdminProductImages
}
