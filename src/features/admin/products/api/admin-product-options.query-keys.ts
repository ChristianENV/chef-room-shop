export const adminProductOptionsQueryKeys = {
  all: ['admin-product-options'] as const,
  byProduct: (productId: string, includeInactive: boolean) =>
    [...adminProductOptionsQueryKeys.all, 'product', productId, { includeInactive }] as const,
  byProductType: (productTypeId: string, includeInactive: boolean) =>
    [
      ...adminProductOptionsQueryKeys.all,
      'productType',
      productTypeId,
      { includeInactive },
    ] as const,
}
