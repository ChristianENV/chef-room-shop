export const adminShippingQueryKeys = {
  all: ['admin', 'shipping'] as const,
  detail: (orderNumber: string) =>
    [...adminShippingQueryKeys.all, 'shipment', orderNumber] as const,
}
