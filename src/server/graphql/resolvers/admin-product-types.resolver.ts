import type { GraphQLContext } from '../context'
import {
  archiveAdminProductType,
  createAdminProductType,
  getAdminProductTypeById,
  getAdminProductTypes,
  updateAdminProductType,
} from '../modules/admin-product-types/admin-product-types.service'
import type {
  AdminProductTypesListInput,
  CreateAdminProductTypeInput,
  UpdateAdminProductTypeInput,
} from '../modules/admin-product-types/admin-product-types.service'

type ListArgs = AdminProductTypesListInput

type IdArgs = { id: string }

type CreateArgs = { input: CreateAdminProductTypeInput }

type UpdateArgs = { id: string; input: UpdateAdminProductTypeInput }

export const adminProductTypesResolvers = {
  Query: {
    adminProductTypes: (_parent: unknown, args: ListArgs, context: GraphQLContext) =>
      getAdminProductTypes(context, args),

    adminProductTypeById: (_parent: unknown, args: IdArgs, context: GraphQLContext) =>
      getAdminProductTypeById(context, args.id),
  },
  Mutation: {
    createAdminProductType: (_parent: unknown, args: CreateArgs, context: GraphQLContext) =>
      createAdminProductType(context, args.input),

    updateAdminProductType: (_parent: unknown, args: UpdateArgs, context: GraphQLContext) =>
      updateAdminProductType(context, args.id, args.input),

    archiveAdminProductType: (_parent: unknown, args: IdArgs, context: GraphQLContext) =>
      archiveAdminProductType(context, args.id),
  },
}
