export type PaymentStatusUiTone = 'pending' | 'success' | 'error' | 'neutral'

export type PaymentStatusUi = {
  tone: PaymentStatusUiTone
  title: string
  description: string
  badgeLabel: string
  shouldPoll: boolean
  /** Show Conekta prepare / pay CTA */
  canPay: boolean
  /** Show retry after failed or expired payment */
  canRetryPayment: boolean
}

function normalizeStatus(value: string): string {
  return value.trim().toUpperCase()
}

/**
 * Maps BFF order + payment status to storefront copy and polling rules.
 */
export function getPaymentStatusUi(input: {
  orderStatus: string
  paymentStatus: string
}): PaymentStatusUi {
  const orderStatus = normalizeStatus(input.orderStatus)
  const paymentStatus = normalizeStatus(input.paymentStatus)

  if (orderStatus === 'PAID' || paymentStatus === 'PAID') {
    return {
      tone: 'success',
      title: 'Pago confirmado',
      description: 'Recibimos tu pago. Tu pedido avanzará a producción.',
      badgeLabel: 'Pagado',
      shouldPoll: false,
      canPay: false,
      canRetryPayment: false,
    }
  }

  if (paymentStatus === 'FAILED' || orderStatus === 'PAYMENT_FAILED') {
    return {
      tone: 'error',
      title: 'Pago no completado',
      description: 'No pudimos confirmar el pago. Puedes intentarlo nuevamente.',
      badgeLabel: 'Pago fallido',
      shouldPoll: false,
      canPay: false,
      canRetryPayment: true,
    }
  }

  if (
    paymentStatus === 'CANCELLED' ||
    paymentStatus === 'EXPIRED' ||
    orderStatus === 'CANCELLED'
  ) {
    return {
      tone: 'error',
      title: 'Pago expirado',
      description:
        'La referencia o sesión de pago expiró. Genera un nuevo intento de pago.',
      badgeLabel: 'Pago expirado',
      shouldPoll: false,
      canPay: false,
      canRetryPayment: true,
    }
  }

  if (paymentStatus === 'AUTHORIZED') {
    return {
      tone: 'pending',
      title: 'Pago en proceso',
      description: 'Estamos confirmando tu pago. Esto puede tardar unos momentos.',
      badgeLabel: 'Confirmando',
      shouldPoll: true,
      canPay: false,
      canRetryPayment: false,
    }
  }

  return {
    tone: 'pending',
    title: 'Confirmando pago',
    description:
      'Estamos confirmando tu pago con Conekta. Esto puede tardar unos momentos.',
    badgeLabel: 'Confirmando',
    shouldPoll: true,
    canPay: false,
    canRetryPayment: false,
  }
}
