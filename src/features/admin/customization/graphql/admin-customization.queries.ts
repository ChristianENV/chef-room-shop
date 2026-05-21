import {
  ADMIN_CUSTOMIZATION_AREA_FIELDS,
  ADMIN_CUSTOMIZATION_OPTION_FIELDS,
  ADMIN_CUSTOMIZATION_PRICING_PREVIEW_FIELDS,
  ADMIN_CUSTOMIZATION_PRODUCT_FIELDS,
  ADMIN_CUSTOMIZATION_RULE_FIELDS,
} from './admin-customization.fragments'

export const ADMIN_CUSTOMIZATION_AREAS_QUERY = /* GraphQL */ `
  query AdminCustomizationAreas {
    adminCustomizationAreas {
      ${ADMIN_CUSTOMIZATION_AREA_FIELDS}
    }
  }
`

export const ADMIN_CUSTOMIZATION_OPTIONS_QUERY = /* GraphQL */ `
  query AdminCustomizationOptions {
    adminCustomizationOptions {
      ${ADMIN_CUSTOMIZATION_OPTION_FIELDS}
    }
  }
`

export const ADMIN_CUSTOMIZATION_PRODUCTS_QUERY = /* GraphQL */ `
  query AdminCustomizationProducts($search: String, $customizable: Boolean) {
    adminCustomizationProducts(search: $search, customizable: $customizable) {
      ${ADMIN_CUSTOMIZATION_PRODUCT_FIELDS}
    }
  }
`

export const ADMIN_CUSTOMIZATION_RULES_QUERY = /* GraphQL */ `
  query AdminCustomizationRules(
    $filter: AdminCustomizationRulesFilterInput
    $limit: Int
    $offset: Int
  ) {
    adminCustomizationRules(filter: $filter, limit: $limit, offset: $offset) {
      total
      items {
        ${ADMIN_CUSTOMIZATION_RULE_FIELDS}
      }
    }
  }
`

export const ADMIN_CUSTOMIZATION_RULES_BY_PRODUCT_QUERY = /* GraphQL */ `
  query AdminCustomizationRulesByProduct($productId: ID!) {
    adminCustomizationRulesByProduct(productId: $productId) {
      ${ADMIN_CUSTOMIZATION_RULE_FIELDS}
    }
  }
`

export const ADMIN_CUSTOMIZATION_RULE_BY_ID_QUERY = /* GraphQL */ `
  query AdminCustomizationRuleById($id: ID!) {
    adminCustomizationRuleById(id: $id) {
      ${ADMIN_CUSTOMIZATION_RULE_FIELDS}
    }
  }
`

export const ADMIN_CUSTOMIZATION_PRICING_PREVIEW_QUERY = /* GraphQL */ `
  query AdminCustomizationPricingPreview($input: AdminCustomizationPricingPreviewInput!) {
    adminCustomizationPricingPreview(input: $input) {
      ${ADMIN_CUSTOMIZATION_PRICING_PREVIEW_FIELDS}
    }
  }
`
