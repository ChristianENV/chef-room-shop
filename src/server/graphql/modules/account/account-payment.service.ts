import 'server-only'

import { PaymentStatus } from '@prisma/client'
import { GraphQLError } from 'graphql'

import { createCheckoutReturnToken } from '@/src/server/checkout/checkout-return-token'
import {
  getConektaOrder,
  mapConektaOrderResponseToPaymentStatus,
} from '@/src/server/payments/conekta/conekta.client'
import { ConektaApiError, ConektaConfigError } from '@/src/server/payments/conekta/conekta.errors'
import {
  applyConektaPaymentStatusUpdate,
  sendConektaPaymentStatusEmails,
} from '@/src/server/payments/conekta/conekta-payment-apply'
import { sanitizeConektaPayload } from '@/src/server/payments/conekta/conekta.sanitize'

import type { GraphQLContext } from '../../context'
import { requireAuthenticatedAccount } from './account.auth'
import { resolveAccountPaymentActions, type OrderWithPaymentAttempts } from './account-payment-actions'
import { isPlaceholderProviderOrderId } from '../payments/payments.mappers'
import { startConektaCheckoutForOrder } from '../payments/payments.service'
import type { AccountPaymentStatusPayloadGql } from './account.types'

const orderInclude = {
  items: { orderBy: { createdAt: 'asc' as const } },
  payments: {
    orderBy: { createdAt: 'desc' as const },
    include: {
      attempts: { orderBy: { createdAt: 'desc' as const }, take: 5 },
    },
  },
  shipments: { orderBy: { createdAt: 'asc' as const } },
  events: { orderBy: { createdAt: 'asc' as const } },
} as const

async function loadOwnedOrder(
  context: GraphQLContext,
  orderNumber: string,
): Promise<OrderWithPaymentAttempts> {
  const userId = requireAuthenticatedAccount(context)

  const order = await context.prisma.order.findFirst({
    where: {
      orderNumber: orderNumber.trim(),
      userId,
      deletedAt: null,
    },
    include: orderInclude,
  })

  if (!order) {
    throw new GraphQLError('Pedido no encontrado.', {
      extensions: { code: 'NOT_FOUND' },
    })
  }

  return order as OrderWithPaymentAttempts
}

function buildPaymentStatusMessage(params: {
  paymentStatus: PaymentStatus
  orderStatus: string
  updated: boolean
  checkedConekta: boolean
}): string {
  if (params.paymentStatus === PaymentStatus.PAID) {
    return params.updated
      ? 'Pago confirmado. Actualizamos el estado de tu pedido.'
      : 'El pago ya está confirmado.'
  }

  if (params.paymentStatus === PaymentStatus.FAILED) {
    return params.updated
      ? 'El pago no se completó.'
      : 'El pago no se completó. Puedes reintentarlo.'
  }

  if (params.paymentStatus === PaymentStatus.CANCELLED) {
    return params.updated
      ? 'El pago expiró o fue cancelado.'
      : 'El pago expiró o fue cancelado. Puedes generar un nuevo enlace.'
  }

  if (params.checkedConekta) {
    return 'Conekta todavía no confirma el pago. Si acabas de pagar, puede tardar unos minutos.'
  }

  return 'Estamos esperando confirmación de Conekta.'
}

function buildAccountPaymentStatusPayload(
  order: OrderWithPaymentAttempts,
  message: string,
  paymentRedirectUrlOverride?: string | null,
): AccountPaymentStatusPayloadGql {
  const payment = order.payments.find((p) => p.provider === 'CONEKTA') ?? order.payments[0]
  const actions = resolveAccountPaymentActions(order)

  return {
    orderNumber: order.orderNumber,
    orderStatus: order.status,
    paymentStatus: payment?.status ?? order.status,
    paymentMethod: payment?.method ?? null,
    canRetryPayment: actions.canRetryPayment,
    canContinuePayment: actions.canContinuePayment,
    paymentRedirectUrl:
      paymentRedirectUrlOverride !== undefined
        ? paymentRedirectUrlOverride
        : actions.paymentRedirectUrl,
    checkedAt: new Date().toISOString(),
    message,
  }
}

/**
 * Manually reconciles an owned order's payment status with Conekta (fallback to webhook).
 */
export async function verifyMyOrderPayment(
  context: GraphQLContext,
  orderNumber: string,
): Promise<AccountPaymentStatusPayloadGql> {
  const order = await loadOwnedOrder(context, orderNumber)
  const payment = order.payments.find((p) => p.provider === 'CONEKTA') ?? order.payments[0]

  if (!payment) {
    return buildAccountPaymentStatusPayload(
      order,
      'No encontramos un pago asociado a este pedido.',
    )
  }

  if (payment.status === PaymentStatus.PAID) {
    return buildAccountPaymentStatusPayload(order, 'El pago ya está confirmado.')
  }

  if (
    isPlaceholderProviderOrderId(payment.providerOrderId) ||
    !payment.providerOrderId.startsWith('ord_')
  ) {
    return buildAccountPaymentStatusPayload(
      order,
      'Aún no hay un enlace de pago activo con Conekta.',
    )
  }

  let conektaOrder
  try {
    conektaOrder = await getConektaOrder(payment.providerOrderId)
  } catch (error) {
    if (error instanceof ConektaConfigError) {
      return buildAccountPaymentStatusPayload(
        order,
        'El servicio de pagos no está disponible en este momento.',
      )
    }
    if (error instanceof ConektaApiError && error.status === 404) {
      return buildAccountPaymentStatusPayload(
        order,
        'No encontramos este pago en Conekta. Puedes reintentar el pago.',
      )
    }
    return buildAccountPaymentStatusPayload(
      order,
      'No pudimos consultar el estado del pago. Intenta de nuevo en unos minutos.',
    )
  }

  const mappedStatus = mapConektaOrderResponseToPaymentStatus(conektaOrder)
  const sanitized = sanitizeConektaPayload(conektaOrder)

  if (mappedStatus === payment.status) {
    return buildAccountPaymentStatusPayload(
      order,
      buildPaymentStatusMessage({
        paymentStatus: payment.status,
        orderStatus: order.status,
        updated: false,
        checkedConekta: true,
      }),
    )
  }

  const chargeId =
    conektaOrder.charges?.data?.find((charge) => typeof charge.id === 'string')?.id ?? null

  const { updated, previousPaymentStatus } = await context.prisma.$transaction((tx) =>
    applyConektaPaymentStatusUpdate(tx, {
      payment: { ...payment, order },
      paymentStatus: mappedStatus,
      source: 'manual_sync',
      eventType: 'manual_verify',
      chargeId,
      conektaOrderId: payment.providerOrderId,
      sanitizedPayload: sanitized,
    }),
  )

  if (updated) {
    void sendConektaPaymentStatusEmails(
      { ...payment, order },
      mappedStatus,
      previousPaymentStatus,
    )
  }

  const refreshed = await loadOwnedOrder(context, orderNumber)
  const refreshedPayment =
    refreshed.payments.find((p) => p.provider === 'CONEKTA') ?? refreshed.payments[0]

  return buildAccountPaymentStatusPayload(
    refreshed,
    buildPaymentStatusMessage({
      paymentStatus: refreshedPayment?.status ?? mappedStatus,
      orderStatus: refreshed.status,
      updated,
      checkedConekta: true,
    }),
  )
}

/**
 * Retries Conekta checkout for an owned order without creating a new order.
 */
export async function retryMyOrderPayment(
  context: GraphQLContext,
  orderNumber: string,
): Promise<AccountPaymentStatusPayloadGql> {
  const order = await loadOwnedOrder(context, orderNumber)
  const actions = resolveAccountPaymentActions(order)

  if (!actions.canRetryPayment) {
    throw new GraphQLError('Este pedido no admite un nuevo intento de pago.', {
      extensions: { code: 'BAD_REQUEST' },
    })
  }

  const { token: returnToken } = await createCheckoutReturnToken({
    orderId: order.id,
  })

  let conekta
  try {
    conekta = await startConektaCheckoutForOrder(context, {
      orderId: order.id,
      returnToken,
      source: 'retryMyOrderPayment',
    })
  } catch (error) {
    if (error instanceof GraphQLError) {
      throw error
    }
    throw new GraphQLError('No pudimos preparar el pago. Intenta nuevamente.', {
      extensions: { code: 'CONEKTA_ERROR' },
    })
  }

  if (!conekta.checkoutUrl) {
    throw new GraphQLError('No pudimos preparar el pago. Intenta nuevamente.', {
      extensions: { code: 'CONEKTA_ERROR' },
    })
  }

  const refreshed = await loadOwnedOrder(context, orderNumber)

  return buildAccountPaymentStatusPayload(
    refreshed,
    'Preparamos un nuevo enlace de pago. Serás redirigido a Conekta.',
    conekta.checkoutUrl,
  )
}
