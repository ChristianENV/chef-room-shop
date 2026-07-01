export const adminUsersQueryKeys = {
  all: ['adminUsers'] as const,
  list: (variables?: unknown) => [...adminUsersQueryKeys.all, 'list', variables] as const,
  detail: (id: string) => [...adminUsersQueryKeys.all, 'detail', id] as const,
}
