import { GraphQLError } from 'graphql'

import type { GraphQLContext } from '../context'
import { requireAdminGraphQL } from '../modules/admin-products/admin-products.auth'
import {
  archiveAdminProductOptionGroup,
  archiveAdminProductOptionValue,
  createAdminProductOptionGroup,
  createAdminProductOptionValue,
  getAdminProductOptionGroupById,
  getAdminProductOptionGroups,
  updateAdminProductOptionGroup,
  updateAdminProductOptionValue,
} from '../modules/admin-product-options/admin-product-options.service'
import type {
  ArchiveAdminProductOptionGroupInput,
  ArchiveAdminProductOptionGroupPayloadGql,
  ArchiveAdminProductOptionValueInput,
  ArchiveAdminProductOptionValuePayloadGql,
  AdminProductOptionGroupPayloadGql,
  AdminProductOptionGroupsPayloadGql,
  AdminProductOptionValuePayloadGql,
  CreateAdminProductOptionGroupInput,
  CreateAdminProductOptionValueInput,
  GetAdminProductOptionGroupInput,
  GetAdminProductOptionGroupsInput,
  UpdateAdminProductOptionGroupInput,
  UpdateAdminProductOptionValueInput,
} from '../modules/admin-product-options/admin-product-options.types'

export const adminProductOptionsResolver = {
  Query: {
    adminProductOptionGroups: async (
      _: unknown,
      { input }: { input: GetAdminProductOptionGroupsInput },
      context: GraphQLContext,
    ): Promise<AdminProductOptionGroupsPayloadGql> => {
      requireAdminGraphQL(context)
      return getAdminProductOptionGroups(context.prisma, input)
    },

    adminProductOptionGroupById: async (
      _: unknown,
      { input }: { input: GetAdminProductOptionGroupInput },
      context: GraphQLContext,
    ): Promise<AdminProductOptionGroupPayloadGql> => {
      requireAdminGraphQL(context)
      return getAdminProductOptionGroupById(context.prisma, input)
    },
  },

  Mutation: {
    createAdminProductOptionGroup: async (
      _: unknown,
      { input }: { input: CreateAdminProductOptionGroupInput },
      context: GraphQLContext,
    ): Promise<AdminProductOptionGroupPayloadGql> => {
      requireAdminGraphQL(context)
      return createAdminProductOptionGroup(context.prisma, input)
    },

    updateAdminProductOptionGroup: async (
      _: unknown,
      { input }: { input: UpdateAdminProductOptionGroupInput },
      context: GraphQLContext,
    ): Promise<AdminProductOptionGroupPayloadGql> => {
      requireAdminGraphQL(context)
      return updateAdminProductOptionGroup(context.prisma, input)
    },

    archiveAdminProductOptionGroup: async (
      _: unknown,
      { input }: { input: ArchiveAdminProductOptionGroupInput },
      context: GraphQLContext,
    ): Promise<ArchiveAdminProductOptionGroupPayloadGql> => {
      requireAdminGraphQL(context)
      return archiveAdminProductOptionGroup(context.prisma, input)
    },

    createAdminProductOptionValue: async (
      _: unknown,
      { input }: { input: CreateAdminProductOptionValueInput },
      context: GraphQLContext,
    ): Promise<AdminProductOptionValuePayloadGql> => {
      requireAdminGraphQL(context)
      return createAdminProductOptionValue(context.prisma, input)
    },

    updateAdminProductOptionValue: async (
      _: unknown,
      { input }: { input: UpdateAdminProductOptionValueInput },
      context: GraphQLContext,
    ): Promise<AdminProductOptionValuePayloadGql> => {
      requireAdminGraphQL(context)
      return updateAdminProductOptionValue(context.prisma, input)
    },

    archiveAdminProductOptionValue: async (
      _: unknown,
      { input }: { input: ArchiveAdminProductOptionValueInput },
      context: GraphQLContext,
    ): Promise<ArchiveAdminProductOptionValuePayloadGql> => {
      requireAdminGraphQL(context)
      return archiveAdminProductOptionValue(context.prisma, input)
    },
  },
}
