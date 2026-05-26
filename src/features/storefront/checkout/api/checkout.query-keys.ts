export const checkoutQueryKeys = {
  all: ['checkout'] as const,
  orderByNumber: (orderNumber: string, email: string) =>
    [...checkoutQueryKeys.all, 'orderByNumber', orderNumber, email] as const,
  checkoutResultByToken: (token: string) =>
    [...checkoutQueryKeys.all, 'checkoutResultByToken', token] as const,
  conektaCheckout: (orderNumber: string) =>
    [...checkoutQueryKeys.all, 'conektaCheckout', orderNumber] as const,
}
