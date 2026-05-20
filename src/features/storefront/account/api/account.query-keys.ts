export const accountQueryKeys = {
  all: ['account'] as const,
  profile: () => [...accountQueryKeys.all, 'profile'] as const,
  summary: () => [...accountQueryKeys.all, 'summary'] as const,
  orders: (params: { limit?: number; offset?: number } = {}) =>
    [...accountQueryKeys.all, 'orders', params] as const,
  order: (orderNumber: string) =>
    [...accountQueryKeys.all, 'order', orderNumber] as const,
  designs: (params: { limit?: number; offset?: number; status?: string } = {}) =>
    [...accountQueryKeys.all, 'designs', params] as const,
  addresses: () => [...accountQueryKeys.all, 'addresses'] as const,
}
