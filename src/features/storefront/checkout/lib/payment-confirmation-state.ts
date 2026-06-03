import { CHECKOUT_CONFIRMATION_VISUAL_MS } from './checkout-polling.config'

export type PaymentConfirmationUxState =
  | 'loading'
  | 'confirming'
  | 'paid'
  | 'failed'
  | 'expired'
  | 'cancelled'
  | 'pendingAfterTimeout'

export type PaymentConfirmationCopy = {
  title: string
  description: string
  note?: string
  badgeLabel: string
  tone: 'pending' | 'success' | 'error' | 'neutral'
}

export type PaymentConfirmationActions = {
  disableViewOrder: boolean
  disableContinueShopping: boolean
  showConfirmingProgress: boolean
  showVerifyAgain: boolean
  showWaitingNote: boolean
  viewOrderPendingBadge: boolean
  shouldPoll: boolean
}

function normalizeStatus(value: string): string {
  return value.trim().toUpperCase()
}

function isPaid(orderStatus: string, paymentStatus: string): boolean {
  return orderStatus === 'PAID' || paymentStatus === 'PAID'
}

function isFailed(orderStatus: string, paymentStatus: string): boolean {
  return (
    paymentStatus === 'FAILED' ||
    paymentStatus === 'DECLINED' ||
    orderStatus === 'PAYMENT_FAILED'
  )
}

function isExpired(paymentStatus: string): boolean {
  return paymentStatus === 'EXPIRED'
}

function isCancelled(orderStatus: string, paymentStatus: string): boolean {
  return (
    paymentStatus === 'CANCELLED' ||
    orderStatus === 'CANCELLED'
  )
}

function isConfirming(orderStatus: string, paymentStatus: string): boolean {
  return (
    orderStatus === 'PENDING_PAYMENT' ||
    paymentStatus === 'PENDING' ||
    paymentStatus === 'AUTHORIZED' ||
    paymentStatus === 'PROCESSING'
  )
}

export type ResolvePaymentConfirmationInput = {
  orderStatus: string
  paymentStatus: string
  isQueryLoading?: boolean
  hasOrderData?: boolean
  elapsedMs?: number
}

/**
 * Maps BFF payment/order status to success-page UX groups.
 */
export function resolvePaymentConfirmationUxState(
  input: ResolvePaymentConfirmationInput,
): PaymentConfirmationUxState {
  const orderStatus = normalizeStatus(input.orderStatus)
  const paymentStatus = normalizeStatus(input.paymentStatus)
  const elapsedMs = input.elapsedMs ?? 0

  if (input.isQueryLoading && !input.hasOrderData) {
    return 'loading'
  }

  if (isPaid(orderStatus, paymentStatus)) {
    return 'paid'
  }

  if (isFailed(orderStatus, paymentStatus)) {
    return 'failed'
  }

  if (isCancelled(orderStatus, paymentStatus)) {
    return 'cancelled'
  }

  if (isExpired(paymentStatus)) {
    return 'expired'
  }

  if (isConfirming(orderStatus, paymentStatus)) {
    if (elapsedMs >= CHECKOUT_CONFIRMATION_VISUAL_MS) {
      return 'pendingAfterTimeout'
    }
    return 'confirming'
  }

  if (elapsedMs >= CHECKOUT_CONFIRMATION_VISUAL_MS) {
    return 'pendingAfterTimeout'
  }

  return 'confirming'
}

/**
 * Spanish copy for each confirmation UX state.
 */
export function getPaymentConfirmationCopy(
  state: PaymentConfirmationUxState,
): PaymentConfirmationCopy {
  switch (state) {
    case 'loading':
    case 'confirming':
      return {
        title: 'Confirmando tu pago',
        description:
          'Estamos validando la respuesta de Conekta. Esto puede tardar unos segundos.',
        note: 'No cierres esta página mientras confirmamos el estado.',
        badgeLabel: 'Confirmando',
        tone: 'pending',
      }
    case 'paid':
      return {
        title: 'Pago confirmado',
        description:
          'Tu pedido fue recibido correctamente y comenzará el proceso de preparación.',
        badgeLabel: 'Pagado',
        tone: 'success',
      }
    case 'failed':
      return {
        title: 'No pudimos confirmar el pago',
        description:
          'Conekta no aprobó el pago o la operación fue rechazada. Puedes intentarlo nuevamente.',
        badgeLabel: 'Pago fallido',
        tone: 'error',
      }
    case 'expired':
      return {
        title: 'El pago expiró',
        description:
          'El enlace o referencia de pago ya no está disponible. Genera un nuevo intento de pago para continuar.',
        badgeLabel: 'Pago expirado',
        tone: 'error',
      }
    case 'cancelled':
      return {
        title: 'Pago cancelado',
        description:
          'La operación fue cancelada. Puedes generar un nuevo intento de pago.',
        badgeLabel: 'Cancelado',
        tone: 'error',
      }
    case 'pendingAfterTimeout':
      return {
        title: 'Seguimos esperando confirmación',
        description:
          'Tu pedido fue creado, pero Conekta aún no confirma el pago. Puedes verificar nuevamente en unos segundos.',
        note: 'Tu pedido fue creado, pero el pago aún no aparece confirmado.',
        badgeLabel: 'Pago pendiente',
        tone: 'pending',
      }
    default:
      return getPaymentConfirmationCopy('confirming')
  }
}

/**
 * Button and polling rules per confirmation UX state.
 */
export function getPaymentConfirmationActions(
  state: PaymentConfirmationUxState,
  _options?: { canRetryPayment?: boolean },
): PaymentConfirmationActions {
  switch (state) {
    case 'loading':
    case 'confirming':
      return {
        disableViewOrder: true,
        disableContinueShopping: true,
        showConfirmingProgress: true,
        showVerifyAgain: false,
        showWaitingNote: true,
        viewOrderPendingBadge: false,
        shouldPoll: true,
      }
    case 'paid':
      return {
        disableViewOrder: false,
        disableContinueShopping: false,
        showConfirmingProgress: false,
        showVerifyAgain: false,
        showWaitingNote: false,
        viewOrderPendingBadge: false,
        shouldPoll: false,
      }
    case 'failed':
      return {
        disableViewOrder: false,
        disableContinueShopping: false,
        showConfirmingProgress: false,
        showVerifyAgain: true,
        showWaitingNote: false,
        viewOrderPendingBadge: false,
        shouldPoll: false,
      }
    case 'expired':
    case 'cancelled':
      return {
        disableViewOrder: false,
        disableContinueShopping: false,
        showConfirmingProgress: false,
        showVerifyAgain: true,
        showWaitingNote: false,
        viewOrderPendingBadge: false,
        shouldPoll: false,
      }
    case 'pendingAfterTimeout':
      return {
        disableViewOrder: false,
        disableContinueShopping: false,
        showConfirmingProgress: false,
        showVerifyAgain: true,
        showWaitingNote: false,
        viewOrderPendingBadge: true,
        shouldPoll: false,
      }
    default:
      return getPaymentConfirmationActions('confirming')
  }
}

/**
 * User-facing message after manual verify refetch on success page.
 */
export function getVerifyAgainResultMessage(
  orderStatus: string,
  paymentStatus: string,
): string {
  if (isPaid(normalizeStatus(orderStatus), normalizeStatus(paymentStatus))) {
    return 'Pago confirmado.'
  }
  if (isFailed(normalizeStatus(orderStatus), normalizeStatus(paymentStatus))) {
    return 'No pudimos confirmar el pago.'
  }
  if (
    isCancelled(normalizeStatus(orderStatus), normalizeStatus(paymentStatus)) ||
    isExpired(normalizeStatus(paymentStatus))
  ) {
    return 'El pago expiró o fue cancelado.'
  }
  return 'Conekta aún no confirma el pago.'
}
