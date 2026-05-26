export const accountQueryKeys = {
  all: ['account'] as const,
  profile: () => [...accountQueryKeys.all, 'profile'] as const,
  summary: () => [...accountQueryKeys.all, 'summary'] as const,
  orders: (params: { limit?: number; offset?: number } = {}) =>
    [...accountQueryKeys.all, 'orders', params] as const,
  /** Prefix for invalidating every `myOrders` query variant. */
  ordersAll: () => [...accountQueryKeys.all, 'orders'] as const,
  order: (orderNumber: string) =>
    [...accountQueryKeys.all, 'order', orderNumber] as const,
  verifyPayment: (orderNumber: string) =>
    [...accountQueryKeys.order(orderNumber), 'verify-payment'] as const,
  retryPayment: (orderNumber: string) =>
    [...accountQueryKeys.order(orderNumber), 'retry-payment'] as const,
  designs: (params: { limit?: number; offset?: number; status?: string } = {}) =>
    [...accountQueryKeys.all, 'designs', params] as const,
  addresses: () => [...accountQueryKeys.all, 'addresses'] as const,
}
