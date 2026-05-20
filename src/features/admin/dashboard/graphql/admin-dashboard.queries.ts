/**
 * GraphQL documents for admin dashboard BFF (requires ADMIN/SUPERADMIN session).
 */

export const ADMIN_DASHBOARD_METRICS_QUERY = /* GraphQL */ `
  query AdminDashboardMetrics {
    adminDashboardMetrics {
      salesTodayCents
      salesMonthCents
      pendingOrders
      designsCreated
      abandonedCarts
      averageOrderValueCents
      totalOrders
      totalCustomers
    }
  }
`

export const ADMIN_RECENT_ORDERS_QUERY = /* GraphQL */ `
  query AdminRecentOrders($limit: Int) {
    adminRecentOrders(limit: $limit) {
      id
      orderNumber
      customerName
      customerEmail
      status
      paymentStatus
      fulfillmentStatus
      totalCents
      createdAt
      itemCount
      hasCustomDesign
    }
  }
`

export const ADMIN_PRODUCTION_QUEUE_QUERY = /* GraphQL */ `
  query AdminProductionQueue($limit: Int) {
    adminProductionQueue(limit: $limit) {
      id
      orderNumber
      customerName
      productNames
      customizationTypes
      status
      fulfillmentStatus
      estimatedDeliveryDate
      createdAt
    }
  }
`

export const ADMIN_RECENT_DESIGNS_QUERY = /* GraphQL */ `
  query AdminRecentDesigns($limit: Int) {
    adminRecentDesigns(limit: $limit) {
      id
      name
      status
      previewUrl
      productName
      customerName
      customerEmail
      finalPriceCents
      updatedAt
    }
  }
`

export const ADMIN_RECENT_PAYMENTS_QUERY = /* GraphQL */ `
  query AdminRecentPayments($limit: Int) {
    adminRecentPayments(limit: $limit) {
      id
      orderNumber
      provider
      method
      status
      amountCents
      currency
      createdAt
      paidAt
    }
  }
`

export const ADMIN_TOP_PRODUCTS_QUERY = /* GraphQL */ `
  query AdminTopProducts($limit: Int) {
    adminTopProducts(limit: $limit) {
      productId
      productName
      productSlug
      orderCount
      quantitySold
      revenueCents
      customizedCount
    }
  }
`
