import type {
  AdminCustomizationPricingPreviewInput,
  AdminCustomizationProductsVariables,
  AdminCustomizationRulesListVariables,
} from '../types'

export const adminCustomizationQueryKeys = {
  all: ['admin-customization'] as const,
  areas: () => [...adminCustomizationQueryKeys.all, 'areas'] as const,
  options: () => [...adminCustomizationQueryKeys.all, 'options'] as const,
  products: (vars?: AdminCustomizationProductsVariables) =>
    [...adminCustomizationQueryKeys.all, 'products', vars ?? {}] as const,
  rules: (vars?: AdminCustomizationRulesListVariables) =>
    [...adminCustomizationQueryKeys.all, 'rules', vars ?? {}] as const,
  rulesByProduct: (productId: string) =>
    [...adminCustomizationQueryKeys.all, 'rules-by-product', productId] as const,
  ruleDetail: (id: string) => [...adminCustomizationQueryKeys.all, 'rule', id] as const,
  pricingPreview: (input: AdminCustomizationPricingPreviewInput) =>
    [...adminCustomizationQueryKeys.all, 'pricing-preview', input] as const,
}
