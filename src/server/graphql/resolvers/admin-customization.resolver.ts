import type { GraphQLContext } from '../context'
import {
  createAdminCustomizationRule,
  deleteAdminCustomizationRule,
  duplicateCustomizationRulesToProduct,
  getAdminCustomizationAreas,
  getAdminCustomizationOptions,
  getAdminCustomizationPricingPreview,
  getAdminCustomizationProducts,
  getAdminCustomizationRuleById,
  getAdminCustomizationRules,
  getAdminCustomizationRulesByProduct,
  toggleAdminCustomizationRule,
  updateAdminCustomizationRule,
} from '../modules/admin-customization/admin-customization.service'
import type {
  AdminCustomizationPricingPreviewInput,
  AdminCustomizationProductsInput,
  AdminCustomizationRuleInput,
  AdminCustomizationRulesListInput,
  DuplicateCustomizationRulesInput,
} from '../modules/admin-customization/admin-customization.types'

type RulesListArgs = AdminCustomizationRulesListInput

type ProductIdArgs = { productId: string }

type IdArgs = { id: string }

type RuleInputArgs = { input: AdminCustomizationRuleInput }

type UpdateRuleArgs = { id: string; input: AdminCustomizationRuleInput }

type ToggleArgs = { id: string; enabled: boolean }

type DuplicateArgs = { input: DuplicateCustomizationRulesInput }

type PricingPreviewArgs = { input: AdminCustomizationPricingPreviewInput }

type ProductsArgs = AdminCustomizationProductsInput

export const adminCustomizationResolvers = {
  Query: {
    adminCustomizationAreas: (
      _parent: unknown,
      _args: Record<string, never>,
      context: GraphQLContext,
    ) => getAdminCustomizationAreas(context),

    adminCustomizationOptions: (
      _parent: unknown,
      _args: Record<string, never>,
      context: GraphQLContext,
    ) => getAdminCustomizationOptions(context),

    adminCustomizationProducts: (_parent: unknown, args: ProductsArgs, context: GraphQLContext) =>
      getAdminCustomizationProducts(context, args),

    adminCustomizationRules: (_parent: unknown, args: RulesListArgs, context: GraphQLContext) =>
      getAdminCustomizationRules(context, args),

    adminCustomizationRulesByProduct: (
      _parent: unknown,
      args: ProductIdArgs,
      context: GraphQLContext,
    ) => getAdminCustomizationRulesByProduct(context, args.productId),

    adminCustomizationRuleById: (_parent: unknown, args: IdArgs, context: GraphQLContext) =>
      getAdminCustomizationRuleById(context, args.id),

    adminCustomizationPricingPreview: (
      _parent: unknown,
      args: PricingPreviewArgs,
      context: GraphQLContext,
    ) => getAdminCustomizationPricingPreview(context, args.input),
  },

  Mutation: {
    createAdminCustomizationRule: (
      _parent: unknown,
      args: RuleInputArgs,
      context: GraphQLContext,
    ) => createAdminCustomizationRule(context, args.input),

    updateAdminCustomizationRule: (
      _parent: unknown,
      args: UpdateRuleArgs,
      context: GraphQLContext,
    ) => updateAdminCustomizationRule(context, args.id, args.input),

    deleteAdminCustomizationRule: (_parent: unknown, args: IdArgs, context: GraphQLContext) =>
      deleteAdminCustomizationRule(context, args.id),

    toggleAdminCustomizationRule: (_parent: unknown, args: ToggleArgs, context: GraphQLContext) =>
      toggleAdminCustomizationRule(context, args.id, args.enabled),

    duplicateCustomizationRulesToProduct: (
      _parent: unknown,
      args: DuplicateArgs,
      context: GraphQLContext,
    ) => duplicateCustomizationRulesToProduct(context, args.input),
  },
}
