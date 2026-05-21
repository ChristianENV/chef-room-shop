import { fetchGraphQL } from '@/src/lib/graphql/fetch-graphql'

import {
  CREATE_ADMIN_CUSTOMIZATION_RULE_MUTATION,
  DELETE_ADMIN_CUSTOMIZATION_RULE_MUTATION,
  DUPLICATE_CUSTOMIZATION_RULES_TO_PRODUCT_MUTATION,
  TOGGLE_ADMIN_CUSTOMIZATION_RULE_MUTATION,
  UPDATE_ADMIN_CUSTOMIZATION_RULE_MUTATION,
} from '../graphql/admin-customization.mutations'
import {
  ADMIN_CUSTOMIZATION_AREAS_QUERY,
  ADMIN_CUSTOMIZATION_OPTIONS_QUERY,
  ADMIN_CUSTOMIZATION_PRICING_PREVIEW_QUERY,
  ADMIN_CUSTOMIZATION_PRODUCTS_QUERY,
  ADMIN_CUSTOMIZATION_RULE_BY_ID_QUERY,
  ADMIN_CUSTOMIZATION_RULES_BY_PRODUCT_QUERY,
  ADMIN_CUSTOMIZATION_RULES_QUERY,
} from '../graphql/admin-customization.queries'
import type {
  AdminCustomizationArea,
  AdminCustomizationOption,
  AdminCustomizationPricingPreview,
  AdminCustomizationPricingPreviewInput,
  AdminCustomizationProduct,
  AdminCustomizationRule,
  AdminCustomizationRuleInput,
  AdminCustomizationRulesListVariables,
  AdminCustomizationRulesPayload,
  AdminCustomizationProductsVariables,
  DuplicateCustomizationRulesInput,
} from '../types'

export async function getAdminCustomizationAreas(): Promise<AdminCustomizationArea[]> {
  const data = await fetchGraphQL<{ adminCustomizationAreas: AdminCustomizationArea[] }>({
    query: ADMIN_CUSTOMIZATION_AREAS_QUERY,
  })
  return data.adminCustomizationAreas
}

export async function getAdminCustomizationOptions(): Promise<AdminCustomizationOption[]> {
  const data = await fetchGraphQL<{ adminCustomizationOptions: AdminCustomizationOption[] }>({
    query: ADMIN_CUSTOMIZATION_OPTIONS_QUERY,
  })
  return data.adminCustomizationOptions
}

export async function getAdminCustomizationProducts(
  variables?: AdminCustomizationProductsVariables,
): Promise<AdminCustomizationProduct[]> {
  const data = await fetchGraphQL<
    { adminCustomizationProducts: AdminCustomizationProduct[] },
    AdminCustomizationProductsVariables
  >({
    query: ADMIN_CUSTOMIZATION_PRODUCTS_QUERY,
    variables,
  })
  return data.adminCustomizationProducts
}

export async function getAdminCustomizationRules(
  variables?: AdminCustomizationRulesListVariables,
): Promise<AdminCustomizationRulesPayload> {
  const data = await fetchGraphQL<
    { adminCustomizationRules: AdminCustomizationRulesPayload },
    AdminCustomizationRulesListVariables
  >({
    query: ADMIN_CUSTOMIZATION_RULES_QUERY,
    variables,
  })
  return data.adminCustomizationRules
}

export async function getAdminCustomizationRulesByProduct(
  productId: string,
): Promise<AdminCustomizationRule[]> {
  const data = await fetchGraphQL<
    { adminCustomizationRulesByProduct: AdminCustomizationRule[] },
    { productId: string }
  >({
    query: ADMIN_CUSTOMIZATION_RULES_BY_PRODUCT_QUERY,
    variables: { productId },
  })
  return data.adminCustomizationRulesByProduct
}

export async function getAdminCustomizationRuleById(
  id: string,
): Promise<AdminCustomizationRule | null> {
  const data = await fetchGraphQL<
    { adminCustomizationRuleById: AdminCustomizationRule | null },
    { id: string }
  >({
    query: ADMIN_CUSTOMIZATION_RULE_BY_ID_QUERY,
    variables: { id },
  })
  return data.adminCustomizationRuleById
}

export async function getAdminCustomizationPricingPreview(
  input: AdminCustomizationPricingPreviewInput,
): Promise<AdminCustomizationPricingPreview> {
  const data = await fetchGraphQL<
    { adminCustomizationPricingPreview: AdminCustomizationPricingPreview },
    { input: AdminCustomizationPricingPreviewInput }
  >({
    query: ADMIN_CUSTOMIZATION_PRICING_PREVIEW_QUERY,
    variables: { input },
  })
  return data.adminCustomizationPricingPreview
}

export async function createAdminCustomizationRule(
  input: AdminCustomizationRuleInput,
): Promise<AdminCustomizationRule> {
  const data = await fetchGraphQL<
    { createAdminCustomizationRule: AdminCustomizationRule },
    { input: AdminCustomizationRuleInput }
  >({
    query: CREATE_ADMIN_CUSTOMIZATION_RULE_MUTATION,
    variables: { input },
  })
  return data.createAdminCustomizationRule
}

export async function updateAdminCustomizationRule(
  id: string,
  input: AdminCustomizationRuleInput,
): Promise<AdminCustomizationRule> {
  const data = await fetchGraphQL<
    { updateAdminCustomizationRule: AdminCustomizationRule },
    { id: string; input: AdminCustomizationRuleInput }
  >({
    query: UPDATE_ADMIN_CUSTOMIZATION_RULE_MUTATION,
    variables: { id, input },
  })
  return data.updateAdminCustomizationRule
}

export async function deleteAdminCustomizationRule(id: string): Promise<boolean> {
  const data = await fetchGraphQL<{ deleteAdminCustomizationRule: boolean }, { id: string }>({
    query: DELETE_ADMIN_CUSTOMIZATION_RULE_MUTATION,
    variables: { id },
  })
  return data.deleteAdminCustomizationRule
}

export async function toggleAdminCustomizationRule(
  id: string,
  enabled: boolean,
): Promise<AdminCustomizationRule> {
  const data = await fetchGraphQL<
    { toggleAdminCustomizationRule: AdminCustomizationRule },
    { id: string; enabled: boolean }
  >({
    query: TOGGLE_ADMIN_CUSTOMIZATION_RULE_MUTATION,
    variables: { id, enabled },
  })
  return data.toggleAdminCustomizationRule
}

export async function duplicateCustomizationRulesToProduct(
  input: DuplicateCustomizationRulesInput,
): Promise<AdminCustomizationRule[]> {
  const data = await fetchGraphQL<
    { duplicateCustomizationRulesToProduct: AdminCustomizationRule[] },
    { input: DuplicateCustomizationRulesInput }
  >({
    query: DUPLICATE_CUSTOMIZATION_RULES_TO_PRODUCT_MUTATION,
    variables: { input },
  })
  return data.duplicateCustomizationRulesToProduct
}
