export const orderClaimQueryKeys = {
  all: ['order-claim'] as const,
  preview: (token: string) => [...orderClaimQueryKeys.all, 'preview', token] as const,
}
