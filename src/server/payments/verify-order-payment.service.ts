import 'server-only'

import { PaymentStatus } from '@prisma/client'

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

import type { GraphQLContext } from '../graphql/context'
import {
  resolveAccountPaymentActions,
  type OrderWithPaymentAttempts,
} from '../graphql/modules/account/account-payment-actions'
import { isPlaceholderProviderOrderId } from '../graphql/modules/payments/payments.mappers'
import type { AccountPaymentStatusPayloadGql } from '../graphql/modules/account/account.types'

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

export function buildAccountPaymentStatusPayload(
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
 * Reconciles an order's Conekta payment status (shared by account verify + checkout token verify).
 */
export async function syncOrderPaymentWithConekta(
  context: GraphQLContext,
  order: OrderWithPaymentAttempts,
): Promise<{
  order: OrderWithPaymentAttempts
  payload: AccountPaymentStatusPayloadGql
}> {
  const payment = order.payments.find((p) => p.provider === 'CONEKTA') ?? order.payments[0]

  if (!payment) {
    return {
      order,
      payload: buildAccountPaymentStatusPayload(
        order,
        'No encontramos un pago asociado a este pedido.',
      ),
    }
  }

  if (payment.status === PaymentStatus.PAID) {
    return {
      order,
      payload: buildAccountPaymentStatusPayload(order, 'El pago ya está confirmado.'),
    }
  }

  if (
    isPlaceholderProviderOrderId(payment.providerOrderId) ||
    !payment.providerOrderId.startsWith('ord_')
  ) {
    return {
      order,
      payload: buildAccountPaymentStatusPayload(
        order,
        'Aún no hay un enlace de pago activo con Conekta.',
      ),
    }
  }

  let conektaOrder
  try {
    conektaOrder = await getConektaOrder(payment.providerOrderId)
  } catch (error) {
    if (error instanceof ConektaConfigError) {
      return {
        order,
        payload: buildAccountPaymentStatusPayload(
          order,
          'El servicio de pagos no está disponible en este momento.',
        ),
      }
    }
    if (error instanceof ConektaApiError && error.status === 404) {
      return {
        order,
        payload: buildAccountPaymentStatusPayload(
          order,
          'No encontramos este pago en Conekta. Puedes reintentar el pago.',
        ),
      }
    }
    return {
      order,
      payload: buildAccountPaymentStatusPayload(
        order,
        'No pudimos consultar el estado del pago. Intenta de nuevo en unos minutos.',
      ),
    }
  }

  const mappedStatus = mapConektaOrderResponseToPaymentStatus(conektaOrder)
  const sanitized = sanitizeConektaPayload(conektaOrder)

  if (mappedStatus === payment.status) {
    return {
      order,
      payload: buildAccountPaymentStatusPayload(
        order,
        buildPaymentStatusMessage({
          paymentStatus: payment.status,
          orderStatus: order.status,
          updated: false,
          checkedConekta: true,
        }),
      ),
    }
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

  const refreshed = await context.prisma.order.findFirst({
    where: { id: order.id, deletedAt: null },
    include: {
      items: { orderBy: { createdAt: 'asc' as const } },
      payments: {
        orderBy: { createdAt: 'desc' as const },
        include: {
          attempts: { orderBy: { createdAt: 'desc' as const }, take: 5 },
        },
      },
      shipments: { orderBy: { createdAt: 'asc' as const } },
      events: { orderBy: { createdAt: 'asc' as const } },
    },
  })

  const nextOrder = (refreshed ?? order) as OrderWithPaymentAttempts
  const refreshedPayment =
    nextOrder.payments.find((p) => p.provider === 'CONEKTA') ?? nextOrder.payments[0]

  return {
    order: nextOrder,
    payload: buildAccountPaymentStatusPayload(
      nextOrder,
      buildPaymentStatusMessage({
        paymentStatus: refreshedPayment?.status ?? mappedStatus,
        orderStatus: nextOrder.status,
        updated,
        checkedConekta: true,
      }),
    ),
  }
}
