export const adminColorsQueryKeys = {
  all: ['admin-colors'] as const,
  list: (includeInactive: boolean) => ['admin-colors', 'list', includeInactive] as const,
  detail: (id: string) => ['admin-colors', 'detail', id] as const,
}
