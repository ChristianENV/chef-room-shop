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

export const accountTypeDefs = /* GraphQL */ `
  scalar JSON

  type AccountUser {
    id: ID!
    email: String!
    name: String
    firstName: String
    lastName: String
    phone: String
    image: String
    marketingOptIn: Boolean!
    roles: [String!]!
    createdAt: String!
  }

  type AccountAddress {
    id: ID!
    type: String!
    firstName: String
    lastName: String
    phone: String
    street: String!
    extNumber: String
    intNumber: String
    neighborhood: String
    city: String!
    state: String!
    country: String!
    postalCode: String!
    references: String
    isDefault: Boolean!
    createdAt: String!
    updatedAt: String!
  }

  type AccountOrderItem {
    id: ID!
    name: String!
    sku: String
    quantity: Int!
    unitPriceCents: Int!
    customizationPriceCents: Int!
    totalPriceCents: Int!
    productSnapshotJson: JSON
    designSnapshotJson: JSON
    productionNotes: String
  }

  type AccountPayment {
    id: ID!
    provider: String!
    method: String!
    status: String!
    amountCents: Int!
    currency: String!
    paidAt: String
    expiresAt: String
  }

  type AccountShipment {
    id: ID!
    carrier: String
    trackingNumber: String
    status: String!
    shippedAt: String
    deliveredAt: String
  }

  type AccountOrderEvent {
    id: ID!
    type: String!
    message: String!
    createdAt: String!
  }

  type AccountOrder {
    id: ID!
    orderNumber: String!
    status: String!
    paymentStatus: String!
    fulfillmentStatus: String!
    customerEmail: String!
    customerPhone: String
    currency: String!
    subtotalCents: Int!
    customizationTotalCents: Int!
    shippingCostCents: Int!
    discountTotalCents: Int!
    taxTotalCents: Int!
    totalCents: Int!
    placedAt: String
    createdAt: String!
    items: [AccountOrderItem!]!
    payments: [AccountPayment!]!
    shipments: [AccountShipment!]!
    events: [AccountOrderEvent!]!
  }

  type AccountDesign {
    id: ID!
    name: String
    status: String!
    previewUrl: String
    previewPublicId: String
    finalPriceCents: Int!
    currency: String!
    configJson: JSON!
    createdAt: String!
    updatedAt: String!
    purchasedAt: String
    product: Product
  }

  input UpdateMyProfileInput {
    firstName: String
    lastName: String
    phone: String
    marketingOptIn: Boolean
  }

  input MyAddressInput {
    type: String!
    firstName: String
    lastName: String
    phone: String
    street: String!
    extNumber: String
    intNumber: String
    neighborhood: String
    city: String!
    state: String!
    country: String
    postalCode: String!
    references: String
    isDefault: Boolean
  }

  type AccountDashboardSummary {
    totalOrders: Int!
    activeOrders: Int!
    savedDesigns: Int!
    defaultShippingAddress: AccountAddress
    recentOrders: [AccountOrder!]!
    recentDesigns: [AccountDesign!]!
  }
`

export const cartTypeDefs = /* GraphQL */ `
  type CartProductSnapshot {
    productId: ID!
    variantId: ID
    slug: String!
    name: String!
    sku: String
    imageUrl: String
    productType: String
    colorName: String
    colorHex: String
    sizeName: String
  }

  type CartCustomizationSnapshot {
    designId: ID
    previewUrl: String
    summary: [String!]!
    areas: [String!]!
    hasLogo: Boolean!
    hasEmbroidery: Boolean!
    embroideredName: String
  }

  type CartItem {
    id: ID!
    productId: ID!
    productVariantId: ID
    designId: ID
    quantity: Int!
    unitPriceCents: Int!
    customizationPriceCents: Int!
    totalPriceCents: Int!
    product: Product
    design: AccountDesign
    productSnapshot: CartProductSnapshot!
    customizationSnapshot: CartCustomizationSnapshot!
    createdAt: String!
    updatedAt: String!
  }

  type Cart {
    id: ID!
    status: String!
    currency: String!
    subtotalCents: Int!
    customizationTotalCents: Int!
    shippingCostCents: Int!
    discountTotalCents: Int!
    totalCents: Int!
    totalItems: Int!
    items: [CartItem!]!
    createdAt: String!
    updatedAt: String!
  }

  input AddCartItemInput {
    productId: ID!
    productVariantId: ID
    designId: ID
    quantity: Int!
  }

  input UpdateCartItemQuantityInput {
    itemId: ID!
    quantity: Int!
  }
`

export const adminDashboardTypeDefs = /* GraphQL */ `
  type AdminDashboardMetrics {
    salesTodayCents: Int!
    salesMonthCents: Int!
    pendingOrders: Int!
    designsCreated: Int!
    abandonedCarts: Int!
    averageOrderValueCents: Int!
    totalOrders: Int!
    totalCustomers: Int!
  }

  type AdminRecentOrder {
    id: ID!
    orderNumber: String!
    customerName: String
    customerEmail: String!
    status: String!
    paymentStatus: String!
    fulfillmentStatus: String!
    totalCents: Int!
    createdAt: String!
    itemCount: Int!
    hasCustomDesign: Boolean!
  }

  type AdminProductionQueueItem {
    id: ID!
    orderNumber: String!
    customerName: String
    productNames: [String!]!
    customizationTypes: [String!]!
    status: String!
    fulfillmentStatus: String!
    estimatedDeliveryDate: String
    createdAt: String!
  }

  type AdminRecentDesign {
    id: ID!
    name: String
    status: String!
    previewUrl: String
    productName: String!
    customerName: String
    customerEmail: String
    finalPriceCents: Int!
    updatedAt: String!
  }

  type AdminRecentPayment {
    id: ID!
    orderNumber: String!
    provider: String!
    method: String!
    status: String!
    amountCents: Int!
    currency: String!
    createdAt: String!
    paidAt: String
  }

  type AdminTopProduct {
    productId: ID!
    productName: String!
    productSlug: String!
    orderCount: Int!
    quantitySold: Int!
    revenueCents: Int!
    customizedCount: Int!
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
    meProfile: AccountUser!
    myAccountSummary: AccountDashboardSummary!
    myOrders(limit: Int, offset: Int): [AccountOrder!]!
    myOrderByNumber(orderNumber: String!): AccountOrder
    myDesigns(limit: Int, offset: Int, status: String): [AccountDesign!]!
    myAddresses: [AccountAddress!]!
    adminDashboardMetrics: AdminDashboardMetrics!
    adminRecentOrders(limit: Int): [AdminRecentOrder!]!
    adminProductionQueue(limit: Int): [AdminProductionQueueItem!]!
    adminRecentDesigns(limit: Int): [AdminRecentDesign!]!
    adminRecentPayments(limit: Int): [AdminRecentPayment!]!
    adminTopProducts(limit: Int): [AdminTopProduct!]!
    myCart: Cart!
  }

  type Mutation {
    updateMyProfile(input: UpdateMyProfileInput!): AccountUser!
    createMyAddress(input: MyAddressInput!): AccountAddress!
    updateMyAddress(id: ID!, input: MyAddressInput!): AccountAddress!
    deleteMyAddress(id: ID!): Boolean!
    setDefaultAddress(id: ID!, type: String!): AccountAddress!
    addCartItem(input: AddCartItemInput!): Cart!
    updateCartItemQuantity(input: UpdateCartItemQuantityInput!): Cart!
    removeCartItem(itemId: ID!): Cart!
    clearCart: Cart!
  }

  ${catalogTypeDefs}
  ${accountTypeDefs}
  ${cartTypeDefs}
  ${adminDashboardTypeDefs}
`
