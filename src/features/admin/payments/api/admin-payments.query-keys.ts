export const adminPaymentsQueryKeys = {
  all: ['adminPayments'] as const,
  list: (variables?: unknown) => [...adminPaymentsQueryKeys.all, 'list', variables] as const,
}
