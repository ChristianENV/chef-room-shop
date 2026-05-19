export const catalogTypeDefs = /* GraphQL */ `
  type ProductType {
    id: ID!
    slug: String!
    name: String!
    description: String
    sortOrder: Int
  }

  type ProductImage {
    id: ID!
    url: String!
    publicId: String
    alt: String
    sortOrder: Int
    isPrimary: Boolean!
  }

  type Color {
    id: ID!
    name: String!
    slug: String!
    hexCode: String!
    sortOrder: Int
  }

  type Size {
    id: ID!
    name: String!
    slug: String!
    sortOrder: Int
  }

  type ProductVariant {
    id: ID!
    sku: String!
    variantName: String
    priceCents: Int!
    stockQty: Int
    color: Color
    size: Size
    isActive: Boolean!
  }

  type CustomizationArea {
    id: ID!
    slug: String!
    name: String!
    description: String
  }

  type CustomizationOption {
    id: ID!
    slug: String!
    name: String!
    basePriceCents: Int!
    pricePerCmCents: Int
  }

  type ProductCustomizationRule {
    id: ID!
    enabled: Boolean!
    maxWidthCm: Float
    maxHeightCm: Float
    minQuantity: Int
    basePriceCents: Int!
    pricePerCmCents: Int
    extraProductionDays: Int
    allowedFileTypes: [String!]!
    validationMessage: String
    area: CustomizationArea!
    option: CustomizationOption!
  }

  type Product {
    id: ID!
    slug: String!
    name: String!
    shortDescription: String
    description: String
    basePriceCents: Int!
    currency: String!
    productionTimeDays: Int
    isCustomizable: Boolean!
    status: String!
    seoTitle: String
    seoDescription: String
    productType: ProductType!
    images: [ProductImage!]!
    variants: [ProductVariant!]!
    customizationRules: [ProductCustomizationRule!]!
  }

  input ProductsFilterInput {
    productTypeSlug: String
    colorSlug: String
    sizeSlug: String
    isCustomizable: Boolean
    search: String
  }

  input ProductsSortInput {
    field: String
    direction: String
  }

  type ProductsPayload {
    items: [Product!]!
    total: Int!
  }
`

export const typeDefs = /* GraphQL */ `
  """
  Business BFF — authentication is handled by Better Auth at /api/auth/*.
  """
  type Query {
    health: String!
    products(
      filter: ProductsFilterInput
      sort: ProductsSortInput
      limit: Int
      offset: Int
    ): ProductsPayload!
    productBySlug(slug: String!): Product
    productTypes: [ProductType!]!
    colors: [Color!]!
    sizes: [Size!]!
    customizationRulesByProduct(productId: ID!): [ProductCustomizationRule!]!
  }

  ${catalogTypeDefs}
`
