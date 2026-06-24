import 'server-only'

import {
  OrderStatus,
  PaymentStatus,
  type Order,
  type Payment,
  type PaymentAttempt,
} from '@prisma/client'

import {
  getCachedCheckoutFromAttempts,
  isPlaceholderProviderOrderId,
} from '../payments/payments.mappers'
import type { AccountOrderPaymentActionsGql } from './account.types'

export type OrderWithPaymentAttempts = Order & {
  payments: Array<Payment & { attempts: PaymentAttempt[] }>
}

function getLatestConektaPayment(order: OrderWithPaymentAttempts):
  | (Payment & {
      attempts: PaymentAttempt[]
    })
  | null {
  const conekta = order.payments.find((payment) => payment.provider === 'CONEKTA')
  return conekta ?? order.payments[0] ?? null
}

/**
 * Derives safe payment action flags for account UI (no raw Conekta payloads).
 */
export function resolveAccountPaymentActions(
  order: OrderWithPaymentAttempts,
): AccountOrderPaymentActionsGql {
  const payment = getLatestConektaPayment(order)
  const paymentStatus = payment?.status ?? PaymentStatus.PENDING
  const orderStatus = order.status

  const isPaid = paymentStatus === PaymentStatus.PAID || orderStatus === OrderStatus.PAID

  const canVerifyPayment =
    !isPaid &&
    (orderStatus === OrderStatus.PENDING_PAYMENT ||
      orderStatus === OrderStatus.PAYMENT_FAILED ||
      paymentStatus === PaymentStatus.PENDING ||
      paymentStatus === PaymentStatus.AUTHORIZED ||
      paymentStatus === PaymentStatus.FAILED ||
      paymentStatus === PaymentStatus.CANCELLED)

  let paymentRedirectUrl: string | null = null
  if (payment && canVerifyPayment) {
    const cached = getCachedCheckoutFromAttempts(payment.attempts ?? [])
    if (
      cached.checkoutUrl &&
      payment.providerOrderId &&
      !isPlaceholderProviderOrderId(payment.providerOrderId)
    ) {
      paymentRedirectUrl = cached.checkoutUrl
    }
  }

  const canContinuePayment =
    Boolean(paymentRedirectUrl) &&
    (paymentStatus === PaymentStatus.PENDING ||
      paymentStatus === PaymentStatus.AUTHORIZED ||
      orderStatus === OrderStatus.PENDING_PAYMENT)

  const canRetryPayment =
    !isPaid &&
    (paymentStatus === PaymentStatus.FAILED ||
      paymentStatus === PaymentStatus.CANCELLED ||
      orderStatus === OrderStatus.PAYMENT_FAILED ||
      (canVerifyPayment && !canContinuePayment))

  return {
    canVerifyPayment,
    canContinuePayment,
    canRetryPayment,
    paymentRedirectUrl: canContinuePayment ? paymentRedirectUrl : null,
  }
}
