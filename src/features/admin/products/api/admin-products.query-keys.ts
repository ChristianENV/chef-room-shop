import type { AdminProductsListVariables } from '../types'

export const adminProductsQueryKeys = {
  all: ['admin-products'] as const,
  list: (vars?: AdminProductsListVariables) =>
    [...adminProductsQueryKeys.all, 'list', vars ?? {}] as const,
  detail: (id: string) => [...adminProductsQueryKeys.all, 'detail', id] as const,
  bySlug: (slug: string) => [...adminProductsQueryKeys.all, 'slug', slug] as const,
  formOptions: () => [...adminProductsQueryKeys.all, 'form-options'] as const,
}
