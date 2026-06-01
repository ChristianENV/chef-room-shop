export const uploadsMutationKeys = {
  all: ['uploads'] as const,
  avatar: () => [...uploadsMutationKeys.all, 'avatar'] as const,
  productImage: (productId?: string) =>
    [...uploadsMutationKeys.all, 'product-image', productId ?? 'new'] as const,
}
