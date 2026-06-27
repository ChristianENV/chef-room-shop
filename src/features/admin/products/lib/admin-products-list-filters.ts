export type AdminProductsVisibilityFilter = 'active' | 'hidden' | 'all'

export const ADMIN_PRODUCTS_VISIBILITY_LABELS: Record<AdminProductsVisibilityFilter, string> = {
  active: 'Activos',
  hidden: 'Ocultos',
  all: 'Todos',
}

/**
 * Resolves GraphQL list filter flags from UI visibility + status controls.
 */
export function resolveAdminProductsListFilter(input: {
  visibilityFilter: AdminProductsVisibilityFilter
  statusFilter: string
}): { status?: string; includeArchived: boolean } {
  if (input.visibilityFilter === 'hidden') {
    return { status: 'ARCHIVED', includeArchived: true }
  }

  if (input.visibilityFilter === 'all') {
    return {
      status: input.statusFilter !== 'all' ? input.statusFilter : undefined,
      includeArchived: true,
    }
  }

  // Active catalog (default): ACTIVE products, drafts via status filter only.
  if (input.statusFilter === 'DRAFT') {
    return { status: 'DRAFT', includeArchived: false }
  }

  if (input.statusFilter === 'ACTIVE' || input.statusFilter === 'all') {
    return { status: 'ACTIVE', includeArchived: false }
  }

  return { status: input.statusFilter, includeArchived: false }
}
