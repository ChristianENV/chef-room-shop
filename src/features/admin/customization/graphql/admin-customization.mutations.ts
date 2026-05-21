import { ADMIN_CUSTOMIZATION_RULE_FIELDS } from './admin-customization.fragments'

export const CREATE_ADMIN_CUSTOMIZATION_RULE_MUTATION = /* GraphQL */ `
  mutation CreateAdminCustomizationRule($input: AdminCustomizationRuleInput!) {
    createAdminCustomizationRule(input: $input) {
      ${ADMIN_CUSTOMIZATION_RULE_FIELDS}
    }
  }
`

export const UPDATE_ADMIN_CUSTOMIZATION_RULE_MUTATION = /* GraphQL */ `
  mutation UpdateAdminCustomizationRule($id: ID!, $input: AdminCustomizationRuleInput!) {
    updateAdminCustomizationRule(id: $id, input: $input) {
      ${ADMIN_CUSTOMIZATION_RULE_FIELDS}
    }
  }
`

export const DELETE_ADMIN_CUSTOMIZATION_RULE_MUTATION = /* GraphQL */ `
  mutation DeleteAdminCustomizationRule($id: ID!) {
    deleteAdminCustomizationRule(id: $id)
  }
`

export const TOGGLE_ADMIN_CUSTOMIZATION_RULE_MUTATION = /* GraphQL */ `
  mutation ToggleAdminCustomizationRule($id: ID!, $enabled: Boolean!) {
    toggleAdminCustomizationRule(id: $id, enabled: $enabled) {
      ${ADMIN_CUSTOMIZATION_RULE_FIELDS}
    }
  }
`

export const DUPLICATE_CUSTOMIZATION_RULES_TO_PRODUCT_MUTATION = /* GraphQL */ `
  mutation DuplicateCustomizationRulesToProduct($input: DuplicateCustomizationRulesInput!) {
    duplicateCustomizationRulesToProduct(input: $input) {
      ${ADMIN_CUSTOMIZATION_RULE_FIELDS}
    }
  }
`
