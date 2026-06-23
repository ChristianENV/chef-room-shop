import type { AdminOrdersListVariables } from '../types'

export const adminOrdersQueryKeys = {
  all: ['admin-orders'] as const,
  list: (vars?: AdminOrdersListVariables) =>
    [...adminOrdersQueryKeys.all, 'list', vars ?? {}] as const,
  detail: (orderNumber: string) => [...adminOrdersQueryKeys.all, 'detail', orderNumber] as const,
  statusSummary: () => [...adminOrdersQueryKeys.all, 'status-summary'] as const,
  productionQueue: (limit?: number) =>
    [...adminOrdersQueryKeys.all, 'production-queue', { limit }] as const,
  productionSheet: (orderNumber: string) =>
    [...adminOrdersQueryKeys.all, 'production-sheet', orderNumber] as const,
  designConfig: (designId: string) =>
    [...adminOrdersQueryKeys.all, 'design-config', designId] as const,
}
