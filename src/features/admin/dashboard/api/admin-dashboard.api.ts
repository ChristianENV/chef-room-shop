import { fetchGraphQL } from '@/src/lib/graphql/fetch-graphql'

import {
  ADMIN_DASHBOARD_METRICS_QUERY,
  ADMIN_PRODUCTION_QUEUE_QUERY,
  ADMIN_RECENT_DESIGNS_QUERY,
  ADMIN_RECENT_ORDERS_QUERY,
  ADMIN_RECENT_PAYMENTS_QUERY,
  ADMIN_TOP_PRODUCTS_QUERY,
} from '../graphql/admin-dashboard.queries'
import type {
  AdminDashboardMetrics,
  AdminProductionQueueItem,
  AdminRecentDesign,
  AdminRecentOrder,
  AdminRecentPayment,
  AdminTopProduct,
} from '../types'

type MetricsData = { adminDashboardMetrics: AdminDashboardMetrics }
type RecentOrdersData = { adminRecentOrders: AdminRecentOrder[] }
type ProductionQueueData = { adminProductionQueue: AdminProductionQueueItem[] }
type RecentDesignsData = { adminRecentDesigns: AdminRecentDesign[] }
type RecentPaymentsData = { adminRecentPayments: AdminRecentPayment[] }
type TopProductsData = { adminTopProducts: AdminTopProduct[] }

/**
 * Fetches admin dashboard KPI metrics.
 */
export async function getAdminDashboardMetrics(): Promise<AdminDashboardMetrics> {
  const data = await fetchGraphQL<MetricsData>({
    query: ADMIN_DASHBOARD_METRICS_QUERY,
  })
  return data.adminDashboardMetrics
}

/**
 * Fetches recent orders for the admin dashboard.
 */
export async function getAdminRecentOrders(
  limit?: number,
): Promise<AdminRecentOrder[]> {
  const data = await fetchGraphQL<RecentOrdersData, { limit?: number }>({
    query: ADMIN_RECENT_ORDERS_QUERY,
    variables: { limit },
  })
  return data.adminRecentOrders
}

/**
 * Fetches production queue orders for the admin dashboard.
 */
export async function getAdminProductionQueue(
  limit?: number,
): Promise<AdminProductionQueueItem[]> {
  const data = await fetchGraphQL<ProductionQueueData, { limit?: number }>({
    query: ADMIN_PRODUCTION_QUEUE_QUERY,
    variables: { limit },
  })
  return data.adminProductionQueue
}

/**
 * Fetches recent designs for the admin dashboard.
 */
export async function getAdminRecentDesigns(
  limit?: number,
): Promise<AdminRecentDesign[]> {
  const data = await fetchGraphQL<RecentDesignsData, { limit?: number }>({
    query: ADMIN_RECENT_DESIGNS_QUERY,
    variables: { limit },
  })
  return data.adminRecentDesigns
}

/**
 * Fetches recent payments for the admin dashboard.
 */
export async function getAdminRecentPayments(
  limit?: number,
): Promise<AdminRecentPayment[]> {
  const data = await fetchGraphQL<RecentPaymentsData, { limit?: number }>({
    query: ADMIN_RECENT_PAYMENTS_QUERY,
    variables: { limit },
  })
  return data.adminRecentPayments
}

/**
 * Fetches top products by revenue for the admin dashboard.
 */
export async function getAdminTopProducts(
  limit?: number,
): Promise<AdminTopProduct[]> {
  const data = await fetchGraphQL<TopProductsData, { limit?: number }>({
    query: ADMIN_TOP_PRODUCTS_QUERY,
    variables: { limit },
  })
  return data.adminTopProducts
}
