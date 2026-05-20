export const checkoutQueryKeys = {
  all: ['checkout'] as const,
  orderByNumber: (orderNumber: string, email: string) =>
    [...checkoutQueryKeys.all, 'orderByNumber', orderNumber, email] as const,
  conektaCheckout: (orderNumber: string) =>
    [...checkoutQueryKeys.all, 'conektaCheckout', orderNumber] as const,
}
