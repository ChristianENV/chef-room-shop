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

  type AccountOrderPaymentActions {
    canVerifyPayment: Boolean!
    canContinuePayment: Boolean!
    canRetryPayment: Boolean!
    paymentRedirectUrl: String
  }

  type AccountPaymentStatusPayload {
    orderNumber: String!
    orderStatus: String!
    paymentStatus: String!
    paymentMethod: String
    canRetryPayment: Boolean!
    canContinuePayment: Boolean!
    paymentRedirectUrl: String
    checkedAt: String!
    message: String!
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
    paymentActions: AccountOrderPaymentActions!
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

export const adminProductsTypeDefs = /* GraphQL */ `
  type AdminProductType {
    id: ID!
    slug: String!
    name: String!
    description: String
    sortOrder: Int
    isActive: Boolean
  }

  type AdminColor {
    id: ID!
    name: String!
    slug: String!
    hexCode: String!
    isActive: Boolean
    sortOrder: Int
  }

  type AdminSize {
    id: ID!
    name: String!
    slug: String!
    sortOrder: Int
    isActive: Boolean
  }

  type AdminProductImage {
    id: ID!
    url: String!
    publicId: String
    alt: String
    sortOrder: Int
    isPrimary: Boolean!
  }

  type AdminProductVariant {
    id: ID!
    sku: String!
    variantName: String
    priceCents: Int!
    stockQty: Int
    color: AdminColor!
    size: AdminSize!
    isActive: Boolean!
    createdAt: String!
    updatedAt: String!
  }

  type AdminProduct {
    id: ID!
    slug: String!
    name: String!
    shortDescription: String
    description: String
    basePriceCents: Int!
    currency: String!
    customizable: Boolean!
    status: String!
    seoTitle: String
    seoDescription: String
    deletedAt: String
    createdAt: String!
    updatedAt: String!
    productType: AdminProductType!
    images: [AdminProductImage!]!
    variants: [AdminProductVariant!]!
  }

  type AdminProductsPayload {
    items: [AdminProduct!]!
    total: Int!
  }

  type AdminProductFormOptions {
    productTypes: [AdminProductType!]!
    colors: [AdminColor!]!
    sizes: [AdminSize!]!
  }

  input AdminProductsFilterInput {
    search: String
    productTypeSlug: String
    status: String
    customizable: Boolean
    includeArchived: Boolean
  }

  input AdminProductsSortInput {
    field: String
    direction: String
  }

  input AdminProductInput {
    name: String!
    slug: String
    shortDescription: String
    description: String
    productTypeId: ID!
    basePriceCents: Int!
    currency: String
    customizable: Boolean
    status: String
    seoTitle: String
    seoDescription: String
  }

  input AdminProductVariantInput {
    id: ID
    productId: ID!
    sku: String
    variantName: String
    colorId: ID
    sizeId: ID
    priceCents: Int
    stockQty: Int
    isActive: Boolean
  }

  input AdminProductImageInput {
    id: ID
    productId: ID!
    url: String!
    publicId: String
    alt: String
    sortOrder: Int
    isPrimary: Boolean
  }
`

export const adminCustomizationTypeDefs = /* GraphQL */ `
  type AdminCustomizationArea {
    id: ID!
    slug: String!
    name: String!
    description: String
    sortOrder: Int
    isActive: Boolean!
  }

  type AdminCustomizationOption {
    id: ID!
    slug: String!
    name: String!
    basePriceCents: Int!
    pricePerCmCents: Int
    isActive: Boolean!
  }

  type AdminCustomizationProduct {
    id: ID!
    slug: String!
    name: String!
    productTypeName: String
    status: String!
    customizable: Boolean!
  }

  type AdminCustomizationRule {
    id: ID!
    productId: ID!
    areaId: ID!
    optionId: ID!
    enabled: Boolean!
    maxWidthCm: Float
    maxHeightCm: Float
    minQuantity: Int
    basePriceCents: Int!
    pricePerCmCents: Int
    extraProductionDays: Int
    allowedFileTypes: [String!]!
    validationMessage: String
    notes: String
    metadataJson: JSON
    product: AdminCustomizationProduct!
    area: AdminCustomizationArea!
    option: AdminCustomizationOption!
    createdAt: String!
    updatedAt: String!
  }

  type AdminCustomizationRulesPayload {
    items: [AdminCustomizationRule!]!
    total: Int!
  }

  type AdminCustomizationPricingPreview {
    basePriceCents: Int!
    areaPriceCents: Int!
    sizeFactorCents: Int!
    extraProductionDays: Int!
    totalExtraCents: Int!
    formulaLabel: String!
  }

  input AdminCustomizationRulesFilterInput {
    productId: ID
    productSlug: String
    areaSlug: String
    optionSlug: String
    enabled: Boolean
    search: String
  }

  input AdminCustomizationRuleInput {
    productId: ID!
    areaId: ID!
    optionId: ID!
    enabled: Boolean
    maxWidthCm: Float
    maxHeightCm: Float
    minQuantity: Int
    basePriceCents: Int
    pricePerCmCents: Int
    extraProductionDays: Int
    allowedFileTypes: [String!]
    validationMessage: String
    notes: String
    metadataJson: JSON
  }

  input DuplicateCustomizationRulesInput {
    fromProductId: ID!
    toProductId: ID!
    overwriteExisting: Boolean
  }

  input AdminCustomizationPricingPreviewInput {
    productId: ID!
    areaId: ID!
    optionId: ID!
    widthCm: Float
    heightCm: Float
    quantity: Int
  }
`

export const adminOrdersTypeDefs = /* GraphQL */ `
  type AdminOrderCustomer {
    userId: ID
    name: String
    email: String!
    phone: String
  }

  type AdminOrderAddress {
    id: ID!
    type: String!
    firstName: String
    lastName: String
    phone: String
    line1: String!
    line2: String
    label: String
    city: String!
    state: String!
    country: String!
    postalCode: String!
  }

  type AdminOrderItem {
    id: ID!
    productId: ID
    productVariantId: ID
    designId: ID
    name: String!
    sku: String
    quantity: Int!
    unitPriceCents: Int!
    customizationPriceCents: Int!
    lineTotalCents: Int!
    productSnapshotJson: JSON
    designSnapshotJson: JSON
    productionNotes: String
    hasCustomDesign: Boolean!
  }

  type AdminOrderPayment {
    id: ID!
    provider: String!
    providerOrderId: String
    method: String!
    status: String!
    amountCents: Int!
    currency: String!
    paidAt: String
    expiresAt: String
    createdAt: String!
  }

  type AdminOrderShipment {
    id: ID!
    carrier: String
    trackingNumber: String
    status: String!
    shippedAt: String
    deliveredAt: String
    createdAt: String!
  }

  type AdminOrderEvent {
    id: ID!
    type: String!
    message: String
    createdAt: String!
    actorName: String
  }

  type AdminOrder {
    id: ID!
    orderNumber: String!
    customer: AdminOrderCustomer!
    status: String!
    paymentStatus: String!
    fulfillmentStatus: String!
    currency: String!
    subtotalCents: Int!
    customizationTotalCents: Int!
    shippingCents: Int!
    discountCents: Int!
    taxCents: Int!
    totalCents: Int!
    notes: String
    placedAt: String
    createdAt: String!
    updatedAt: String!
    shippingAddress: AdminOrderAddress
    billingAddress: AdminOrderAddress
    items: [AdminOrderItem!]!
    payments: [AdminOrderPayment!]!
    shipments: [AdminOrderShipment!]!
    events: [AdminOrderEvent!]!
    hasCustomDesign: Boolean!
  }

  type AdminOrdersPayload {
    items: [AdminOrder!]!
    total: Int!
  }

  type AdminOrderStatusSummary {
    pendingPayment: Int!
    paid: Int!
    inProduction: Int!
    readyToShip: Int!
    shipped: Int!
    delivered: Int!
    cancelled: Int!
  }

  type AdminProductionSheet {
    orderNumber: String!
    customerName: String
    customerEmail: String!
    items: [AdminOrderItem!]!
    notes: String
    generatedAt: String!
  }

  input AdminOrdersFilterInput {
    search: String
    status: String
    paymentStatus: String
    fulfillmentStatus: String
    productionOnly: Boolean
    hasCustomDesign: Boolean
    dateFrom: String
    dateTo: String
  }

  input AdminOrdersSortInput {
    field: String
    direction: String
  }

  input UpdateAdminOrderStatusInput {
    orderNumber: String!
    status: String!
    message: String
  }

  input AddAdminOrderTrackingInput {
    orderNumber: String!
    carrier: String!
    trackingNumber: String!
    status: String
    shippedAt: String
  }

  input AddAdminOrderNoteInput {
    orderNumber: String!
    note: String!
  }
`

export const adminShippingTypeDefs = /* GraphQL */ `
  type AdminShipmentEvent {
    id: ID!
    status: String!
    message: String
    rawPayloadJson: JSON
    createdAt: String!
  }

  type AdminShipment {
    id: ID!
    orderNumber: String!
    provider: String
    providerShipmentId: String
    providerLabelId: String
    carrier: String
    service: String
    trackingNumber: String
    status: String!
    labelUrl: String
    labelFormat: String
    costCents: Int
    currency: String
    shippedAt: String
    deliveredAt: String
    createdAt: String!
    updatedAt: String!
    events: [AdminShipmentEvent!]!
  }

  input AdminCreateShippingLabelInput {
    orderNumber: String!
    rateId: ID
    labelFormat: String
  }

  input AdminCancelShippingLabelInput {
    orderNumber: String!
    reason: String
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

export const paymentsTypeDefs = /* GraphQL */ `
  input CreateConektaCheckoutInput {
    orderNumber: String!
    email: String
  }

  type ConektaCheckoutPayload {
    orderId: ID!
    orderNumber: String!
    paymentId: ID!
    providerOrderId: String
    checkoutId: String
    checkoutUrl: String
    status: String!
    amountCents: Int!
    currency: String!
  }
`

export const checkoutTypeDefs = /* GraphQL */ `
  input CheckoutAddressInput {
    firstName: String!
    lastName: String!
    phone: String!
    street: String!
    extNumber: String
    intNumber: String
    neighborhood: String
    city: String!
    state: String!
    country: String!
    postalCode: String!
    references: String
  }

  input CreateCheckoutOrderInput {
    email: String!
    phone: String!
    shippingAddress: CheckoutAddressInput!
    billingAddress: CheckoutAddressInput
    useSameBillingAddress: Boolean
    notes: String
    paymentMethod: String!
    """
    Selected ShippingRate id from Skydropx quote BFF.
    Required in production; optional only when ALLOW_CHECKOUT_WITHOUT_SHIPPING=true on server.
    """
    shippingRateId: ID
  }

  type CheckoutOrderPayload {
    orderNumber: String!
    orderId: ID!
    status: String!
    paymentStatus: String!
    totalCents: Int!
    shippingCents: Int!
    currency: String!
    claimUrl: String
    accountOrderUrl: String
  }

  type CompleteCheckoutPayload {
    orderNumber: String!
    orderId: ID!
    status: String!
    paymentStatus: String!
    totalCents: Int!
    shippingCents: Int!
    currency: String!
    claimUrl: String
    accountOrderUrl: String
    paymentRedirectUrl: String!
    paymentProviderOrderId: String
    paymentMethod: String!
    successUrl: String!
    returnToken: String!
  }

  type CheckoutResult {
    orderNumber: String!
    orderId: ID!
    status: String!
    paymentStatus: String!
    fulfillmentStatus: String!
    totalCents: Int!
    shippingCents: Int!
    currency: String!
    paymentMethod: String!
    createdAt: String!
    items: [PublicOrderItem!]!
    payments: [PublicOrderPayment!]!
    claimUrl: String
    accountOrderUrl: String
    canViewDetails: Boolean!
    detailUrl: String
    paymentReference: String
    paymentExpiresAt: String
    cashPaymentLocations: [String!]
    returnTokenValid: Boolean!
    tokenExpired: Boolean!
    loginUrl: String!
    registerUrl: String!
  }

  input RetryCheckoutPaymentInput {
    token: String!
  }

  type PublicOrderItem {
    id: ID!
    name: String!
    quantity: Int!
    totalPriceCents: Int!
    customizationPriceCents: Int!
    productSnapshotJson: JSON
    designSnapshotJson: JSON
  }

  type PublicOrderPayment {
    id: ID!
    provider: String!
    method: String!
    status: String!
    amountCents: Int!
    currency: String!
  }

  type PublicOrder {
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
    createdAt: String!
    items: [PublicOrderItem!]!
    payments: [PublicOrderPayment!]!
  }
`

const shippingTypeDefs = /* GraphQL */ `
  type ShippingRate {
    id: ID!
    providerRateId: String!
    carrier: String!
    service: String
    amountCents: Int!
    currency: String!
    estimatedDays: Int
    estimatedDeliveryDate: String
    expiresAt: String
    selectedAt: String
  }

  type ShippingQuote {
    id: ID!
    provider: String!
    providerQuoteId: String
    originPostalCode: String!
    destinationPostalCode: String!
    isCompleted: Boolean!
    expiresAt: String
    packageJson: JSON!
    rates: [ShippingRate!]!
    createdAt: String!
    updatedAt: String!
  }

  type ShippingQuotePayload {
    quote: ShippingQuote!
    recommendedRate: ShippingRate
  }

  input ShippingAddressQuoteInput {
    postalCode: String!
    city: String
    state: String
    country: String
  }

  input CreateShippingQuoteInput {
    destination: ShippingAddressQuoteInput!
  }
`

export const uploadsTypeDefs = /* GraphQL */ `
  type UploadKeys {
    webp: String!
    jpg: String!
    thumb: String
  }

  type UploadPublicUrls {
    webp: String!
    jpg: String!
    thumb: String
  }

  type UploadPresignedUrls {
    webp: String!
    jpg: String!
    thumb: String
  }

  type AvatarUploadPayload {
    uploadId: String!
    keys: UploadKeys!
    publicUrls: UploadPublicUrls!
    presignedUrls: UploadPresignedUrls!
    expiresAt: String!
  }

  type ProductImageUploadPayload {
    uploadId: String!
    imageId: ID!
    keys: UploadKeys!
    publicUrls: UploadPublicUrls!
    presignedUrls: UploadPresignedUrls!
    expiresAt: String!
  }

  type UserAvatarPayload {
    user: AccountUser!
    image: String
  }

  input CreateAvatarUploadInput {
    webpSizeBytes: Int!
    jpgSizeBytes: Int
    originalFileName: String
    originalContentType: String
  }

  input ConfirmAvatarUploadInput {
    uploadId: String!
  }

  input CreateProductImageUploadInput {
    productId: ID!
    imageId: ID
    webpSizeBytes: Int!
    jpgSizeBytes: Int
    thumbSizeBytes: Int
    originalFileName: String
    altText: String
  }

  input ConfirmProductImageUploadInput {
    uploadId: String!
    altText: String
    isPrimary: Boolean
    sortOrder: Int
  }
`

const orderClaimTypeDefs = /* GraphQL */ `
  type OrderClaimPreview {
    orderNumber: String!
    maskedEmail: String!
    status: String!
    paymentStatus: String!
    expiresAt: String!
    alreadyClaimed: Boolean!
  }

  type OrderClaimPayload {
    success: Boolean!
    orderNumber: String
    redirectTo: String
    message: String
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
    adminOrders(
      filter: AdminOrdersFilterInput
      sort: AdminOrdersSortInput
      limit: Int
      offset: Int
    ): AdminOrdersPayload!
    adminOrderByNumber(orderNumber: String!): AdminOrder
    adminOrderStatusSummary: AdminOrderStatusSummary!
    adminOrderProductionQueue(limit: Int): [AdminOrder!]!
    adminOrderProductionSheet(orderNumber: String!): AdminProductionSheet
    adminShipmentByOrderNumber(orderNumber: String!): AdminShipment
    adminProducts(
      filter: AdminProductsFilterInput
      sort: AdminProductsSortInput
      limit: Int
      offset: Int
    ): AdminProductsPayload!
    adminProductById(id: ID!): AdminProduct
    adminProductBySlug(slug: String!): AdminProduct
    adminProductFormOptions: AdminProductFormOptions!
    adminCustomizationAreas: [AdminCustomizationArea!]!
    adminCustomizationOptions: [AdminCustomizationOption!]!
    adminCustomizationProducts(search: String, customizable: Boolean): [AdminCustomizationProduct!]!
    adminCustomizationRules(
      filter: AdminCustomizationRulesFilterInput
      limit: Int
      offset: Int
    ): AdminCustomizationRulesPayload!
    adminCustomizationRulesByProduct(productId: ID!): [AdminCustomizationRule!]!
    adminCustomizationRuleById(id: ID!): AdminCustomizationRule
    adminCustomizationPricingPreview(
      input: AdminCustomizationPricingPreviewInput!
    ): AdminCustomizationPricingPreview!
    myCart: Cart!
    shippingQuoteById(id: ID!): ShippingQuote
    orderByNumber(orderNumber: String!, email: String!): PublicOrder
    checkoutResultByToken(token: String!): CheckoutResult
    orderClaimPreview(token: String!): OrderClaimPreview
  }

  type Mutation {
    updateMyProfile(input: UpdateMyProfileInput!): AccountUser!
    createMyAddress(input: MyAddressInput!): AccountAddress!
    updateMyAddress(id: ID!, input: MyAddressInput!): AccountAddress!
    deleteMyAddress(id: ID!): Boolean!
    setDefaultAddress(id: ID!, type: String!): AccountAddress!
    verifyMyOrderPayment(orderNumber: String!): AccountPaymentStatusPayload!
    retryMyOrderPayment(orderNumber: String!): AccountPaymentStatusPayload!
    addCartItem(input: AddCartItemInput!): Cart!
    updateCartItemQuantity(input: UpdateCartItemQuantityInput!): Cart!
    removeCartItem(itemId: ID!): Cart!
    clearCart: Cart!
    createShippingQuote(input: CreateShippingQuoteInput!): ShippingQuotePayload!
    refreshShippingQuote(id: ID!): ShippingQuotePayload!
    selectShippingRate(rateId: ID!): ShippingQuotePayload!
    createCheckoutOrder(input: CreateCheckoutOrderInput!): CheckoutOrderPayload!
    completeCheckout(input: CreateCheckoutOrderInput!): CompleteCheckoutPayload!
    retryCheckoutPayment(input: RetryCheckoutPaymentInput!): CompleteCheckoutPayload!
    createConektaCheckout(input: CreateConektaCheckoutInput!): ConektaCheckoutPayload!
    claimOrder(token: String!): OrderClaimPayload!
    updateAdminOrderStatus(input: UpdateAdminOrderStatusInput!): AdminOrder!
    moveAdminOrderToProduction(orderNumber: String!): AdminOrder!
    markAdminOrderReadyToShip(orderNumber: String!): AdminOrder!
    addAdminOrderTracking(input: AddAdminOrderTrackingInput!): AdminOrder!
    cancelAdminOrder(orderNumber: String!, reason: String): AdminOrder!
    addAdminOrderNote(input: AddAdminOrderNoteInput!): AdminOrder!
    adminCreateShippingLabel(input: AdminCreateShippingLabelInput!): AdminShipment!
    adminCancelShippingLabel(input: AdminCancelShippingLabelInput!): AdminShipment!
    adminRefreshShipmentTracking(orderNumber: String!): AdminShipment!
    createAdminProduct(input: AdminProductInput!): AdminProduct!
    updateAdminProduct(id: ID!, input: AdminProductInput!): AdminProduct!
    archiveAdminProduct(id: ID!): AdminProduct!
    duplicateAdminProduct(id: ID!): AdminProduct!
    updateAdminProductStatus(id: ID!, status: String!): AdminProduct!
    upsertAdminProductVariant(input: AdminProductVariantInput!): AdminProductVariant!
    deleteAdminProductVariant(id: ID!): Boolean!
    upsertAdminProductImage(input: AdminProductImageInput!): AdminProductImage!
    deleteAdminProductImage(id: ID!): Boolean!
    createAdminCustomizationRule(input: AdminCustomizationRuleInput!): AdminCustomizationRule!
    updateAdminCustomizationRule(id: ID!, input: AdminCustomizationRuleInput!): AdminCustomizationRule!
    deleteAdminCustomizationRule(id: ID!): Boolean!
    toggleAdminCustomizationRule(id: ID!, enabled: Boolean!): AdminCustomizationRule!
    duplicateCustomizationRulesToProduct(
      input: DuplicateCustomizationRulesInput!
    ): [AdminCustomizationRule!]!
    createAvatarUpload(input: CreateAvatarUploadInput!): AvatarUploadPayload!
    confirmAvatarUpload(input: ConfirmAvatarUploadInput!): UserAvatarPayload!
    createProductImageUpload(input: CreateProductImageUploadInput!): ProductImageUploadPayload!
    confirmProductImageUpload(input: ConfirmProductImageUploadInput!): ProductImage!
  }

  ${catalogTypeDefs}
  ${accountTypeDefs}
  ${cartTypeDefs}
  ${checkoutTypeDefs}
  ${shippingTypeDefs}
  ${orderClaimTypeDefs}
  ${paymentsTypeDefs}
  ${adminDashboardTypeDefs}
  ${adminOrdersTypeDefs}
  ${adminShippingTypeDefs}
  ${adminProductsTypeDefs}
  ${adminCustomizationTypeDefs}
  ${uploadsTypeDefs}
`
