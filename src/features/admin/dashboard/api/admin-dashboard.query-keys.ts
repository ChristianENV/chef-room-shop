export const adminDashboardQueryKeys = {
  all: ['admin-dashboard'] as const,
  metrics: () => [...adminDashboardQueryKeys.all, 'metrics'] as const,
  recentOrders: (limit?: number) =>
    [...adminDashboardQueryKeys.all, 'recent-orders', { limit }] as const,
  productionQueue: (limit?: number) =>
    [...adminDashboardQueryKeys.all, 'production-queue', { limit }] as const,
  recentDesigns: (limit?: number) =>
    [...adminDashboardQueryKeys.all, 'recent-designs', { limit }] as const,
  recentPayments: (limit?: number) =>
    [...adminDashboardQueryKeys.all, 'recent-payments', { limit }] as const,
  topProducts: (limit?: number) =>
    [...adminDashboardQueryKeys.all, 'top-products', { limit }] as const,
}
