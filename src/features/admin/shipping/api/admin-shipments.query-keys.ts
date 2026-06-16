import type { AdminShipmentsListVariables } from '../types'

export const adminShipmentsQueryKeys = {
  all: ['admin-shipments'] as const,
  list: (variables?: AdminShipmentsListVariables) =>
    [...adminShipmentsQueryKeys.all, 'list', variables ?? {}] as const,
}
