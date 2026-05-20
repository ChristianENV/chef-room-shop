export const checkoutQueryKeys = {
  all: ['checkout'] as const,
  orderByNumber: (orderNumber: string, email: string) =>
    [...checkoutQueryKeys.all, 'orderByNumber', orderNumber, email] as const,
}
