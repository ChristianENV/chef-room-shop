import type { AccountOrder, AccountOrderPaymentActions } from '../types'

/**
 * Uses BFF paymentActions when present; otherwise derives safe flags from order status.
 */
export function resolvePaymentActionsForOrder(
  order: Pick<AccountOrder, 'status' | 'paymentStatus' | 'paymentActions'>,
): AccountOrderPaymentActions {
  if (order.paymentActions) {
    return order.paymentActions
  }

  const isPaid = order.paymentStatus === 'PAID' || order.status === 'PAID'
  const isPending =
    order.status === 'PENDING_PAYMENT' ||
    order.paymentStatus === 'PENDING' ||
    order.paymentStatus === 'AUTHORIZED'

  return {
    canVerifyPayment:
      !isPaid &&
      (isPending ||
        order.paymentStatus === 'FAILED' ||
        order.paymentStatus === 'CANCELLED' ||
        order.status === 'PAYMENT_FAILED'),
    canContinuePayment: false,
    canRetryPayment:
      !isPaid &&
      (order.paymentStatus === 'FAILED' ||
        order.paymentStatus === 'CANCELLED' ||
        order.status === 'PAYMENT_FAILED' ||
        isPending),
    paymentRedirectUrl: null,
  }
}
