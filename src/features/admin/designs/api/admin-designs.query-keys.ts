import type { AdminDesignsListVariables } from '../types'

export const adminDesignsQueryKeys = {
  all: ['admin-designs'] as const,
  list: (variables?: AdminDesignsListVariables) =>
    [...adminDesignsQueryKeys.all, 'list', variables ?? {}] as const,
  detail: (id: string) => [...adminDesignsQueryKeys.all, 'detail', id] as const,
}
