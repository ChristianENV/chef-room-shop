export const shippingQueryKeys = {
  all: ['shipping'] as const,
  quoteById: (id: string) => [...shippingQueryKeys.all, 'quote', id] as const,
}
