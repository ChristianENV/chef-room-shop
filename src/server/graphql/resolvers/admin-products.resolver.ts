import type { GraphQLContext } from '../context'
import {
  archiveAdminProduct,
  createAdminProduct,
  deleteAdminProductImage,
  deleteAdminProductVariant,
  duplicateAdminProduct,
  getAdminProductById,
  getAdminProductBySlug,
  getAdminProductFormOptions,
  getAdminProducts,
  updateAdminProduct,
  updateAdminProductStatus,
  upsertAdminProductImage,
  upsertAdminProductVariant,
} from '../modules/admin-products/admin-products.service'
import type {
  AdminProductImageInput,
  AdminProductInput,
  AdminProductVariantInput,
  AdminProductsListInput,
} from '../modules/admin-products/admin-products.types'

type ListArgs = AdminProductsListInput

type IdArgs = { id: string }

type SlugArgs = { slug: string }

type UpdateProductArgs = { id: string; input: AdminProductInput }

type StatusArgs = { id: string; status: string }

type VariantInputArgs = { input: AdminProductVariantInput }

type ImageInputArgs = { input: AdminProductImageInput }

type VariantIdArgs = { id: string }

type ImageIdArgs = { id: string }

type CreateProductArgs = { input: AdminProductInput }

export const adminProductsResolvers = {
  Query: {
    adminProducts: (
      _parent: unknown,
      args: ListArgs,
      context: GraphQLContext,
    ) => getAdminProducts(context, args),

    adminProductById: (
      _parent: unknown,
      args: IdArgs,
      context: GraphQLContext,
    ) => getAdminProductById(context, args.id),

    adminProductBySlug: (
      _parent: unknown,
      args: SlugArgs,
      context: GraphQLContext,
    ) => getAdminProductBySlug(context, args.slug),

    adminProductFormOptions: (
      _parent: unknown,
      _args: Record<string, never>,
      context: GraphQLContext,
    ) => getAdminProductFormOptions(context),
  },

  Mutation: {
    createAdminProduct: (
      _parent: unknown,
      args: CreateProductArgs,
      context: GraphQLContext,
    ) => createAdminProduct(context, args.input),

    updateAdminProduct: (
      _parent: unknown,
      args: UpdateProductArgs,
      context: GraphQLContext,
    ) => updateAdminProduct(context, args.id, args.input),

    archiveAdminProduct: (
      _parent: unknown,
      args: IdArgs,
      context: GraphQLContext,
    ) => archiveAdminProduct(context, args.id),

    duplicateAdminProduct: (
      _parent: unknown,
      args: IdArgs,
      context: GraphQLContext,
    ) => duplicateAdminProduct(context, args.id),

    updateAdminProductStatus: (
      _parent: unknown,
      args: StatusArgs,
      context: GraphQLContext,
    ) => updateAdminProductStatus(context, args.id, args.status),

    upsertAdminProductVariant: (
      _parent: unknown,
      args: VariantInputArgs,
      context: GraphQLContext,
    ) => upsertAdminProductVariant(context, args.input),

    deleteAdminProductVariant: (
      _parent: unknown,
      args: VariantIdArgs,
      context: GraphQLContext,
    ) => deleteAdminProductVariant(context, args.id),

    upsertAdminProductImage: (
      _parent: unknown,
      args: ImageInputArgs,
      context: GraphQLContext,
    ) => upsertAdminProductImage(context, args.input),

    deleteAdminProductImage: (
      _parent: unknown,
      args: ImageIdArgs,
      context: GraphQLContext,
    ) => deleteAdminProductImage(context, args.id),
  },
}
