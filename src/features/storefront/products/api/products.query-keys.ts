export const productQueryKeys = {
  all: ['products'] as const,
  detail: (slug: string) => [...productQueryKeys.all, 'detail', slug] as const,
  customizationRules: (productId: string) =>
    [...productQueryKeys.all, 'customization-rules', productId] as const,
}
