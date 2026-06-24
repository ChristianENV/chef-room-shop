import type { AdminProductTypesListVariables } from '../types'

export const adminProductTypesQueryKeys = {
  all: ['admin-product-types'] as const,
  list: (vars?: AdminProductTypesListVariables) =>
    [...adminProductTypesQueryKeys.all, 'list', vars ?? {}] as const,
  detail: (id: string) => [...adminProductTypesQueryKeys.all, 'detail', id] as const,
}
