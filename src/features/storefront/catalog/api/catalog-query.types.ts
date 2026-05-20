/** Parameters passed to the catalog products TanStack Query. */
export type ProductsQueryParams = {
  productTypeSlug?: string
  colorSlug?: string
  sizeSlug?: string
  isCustomizable?: boolean
  search?: string
  sortField?: string
  sortDirection?: 'asc' | 'desc'
  limit?: number
  offset?: number
}
