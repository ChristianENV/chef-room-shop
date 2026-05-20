import {
  OrderEventType,
  PaymentMethod,
  PaymentStatus,
  type Prisma,
} from '@prisma/client'
import { GraphQLError } from 'graphql'

import { createConektaCheckoutForOrder } from '@/src/server/payments/conekta/conekta.client'
import { ConektaConfigError } from '@/src/server/payments/conekta/conekta.errors'
import { sanitizeConektaPayload } from '@/src/server/payments/conekta/conekta.sanitize'
import { getAppBaseUrl } from '@/src/server/payments/app-url'
import { conektaCheckoutRedirectUrls } from '@/src/lib/checkout-redirect-urls'

import type { GraphQLContext } from '../../context'
import {
  assertCanStartConektaCheckout,
  assertOrderPendingPayment,
  notFound,
} from './payments.auth'
import {
  getCachedCheckoutFromAttempts,
  isPlaceholderProviderOrderId,
  mapOrderItemsToConektaLineItems,
  mapToConektaCheckoutPayload,
} from './payments.mappers'
import type {
  ConektaCheckoutPayloadGql,
  CreateConektaCheckoutInput,
  OrderWithPaymentsAndItems,
} from './payments.types'
import { createConektaCheckoutInputSchema } from './payments.validation'

const orderInclude = {
  items: { orderBy: { createdAt: 'asc' as const } },
  payments: {
    orderBy: { createdAt: 'desc' as const },
    include: {
      attempts: { orderBy: { createdAt: 'desc' as const }, take: 3 },
    },
  },
} satisfies Prisma.OrderInclude

function mapAllowedConektaMethods(
  method: PaymentMethod | null,
): Array<'card' | 'cash' | 'bank_transfer'> {
  switch (method) {
    case PaymentMethod.CARD:
      return ['card']
    case PaymentMethod.OXXO:
      return ['cash']
    case PaymentMethod.SPEI:
      return ['bank_transfer']
    default:
      return ['card', 'cash', 'bank_transfer']
  }
}

function buildCustomerName(order: OrderWithPaymentsAndItems): string {
  const firstItem = order.items[0]?.productSnapshotJson
  if (firstItem && typeof firstItem === 'object' && !Array.isArray(firstItem)) {
    const name = (firstItem as { name?: string }).name
    if (name) return `Cliente ${name}`.slice(0, 120)
  }
  return 'Cliente Chef Room'
}

/**
 * Starts Conekta HostedPayment checkout for an existing local order.
 */
export async function createConektaCheckout(
  context: GraphQLContext,
  input: CreateConektaCheckoutInput,
): Promise<ConektaCheckoutPayloadGql> {
  const parsed = createConektaCheckoutInputSchema.parse(input)

  const order = await context.prisma.order.findFirst({
    where: {
      orderNumber: parsed.orderNumber.trim(),
      deletedAt: null,
    },
    include: orderInclude,
  })

  if (!order) {
    throw notFound()
  }

  const orderView = order as OrderWithPaymentsAndItems

  await assertCanStartConektaCheckout(context, orderView, parsed.email)
  assertOrderPendingPayment(orderView)

  const payment = orderView.payments[0]
  if (!payment) {
    throw new GraphQLError('No hay un pago asociado a este pedido.', {
      extensions: { code: 'BAD_REQUEST' },
    })
  }

  if (
    !isPlaceholderProviderOrderId(payment.providerOrderId) &&
    payment.status === PaymentStatus.PENDING
  ) {
    const cached = getCachedCheckoutFromAttempts(payment.attempts)
    if (cached.checkoutUrl) {
      return mapToConektaCheckoutPayload({
        orderId: order.id,
        orderNumber: order.orderNumber,
        payment,
        checkoutId: cached.checkoutId,
        checkoutUrl: cached.checkoutUrl,
      })
    }
  }

  const { successUrl, failureUrl } = conektaCheckoutRedirectUrls(
    order.orderNumber,
    getAppBaseUrl(),
  )

  let conektaResult
  try {
    conektaResult = await createConektaCheckoutForOrder({
      currency: order.currency,
      customerName: buildCustomerName(orderView),
      customerEmail: order.customerEmail,
      customerPhone: order.customerPhone,
      lineItems: mapOrderItemsToConektaLineItems(orderView.items),
      shippingCents: order.shippingCents,
      successUrl,
      failureUrl,
      allowedPaymentMethods: mapAllowedConektaMethods(
        payment.method as PaymentMethod | null,
      ),
      metadata: {
        chef_room_order_id: order.id,
        chef_room_order_number: order.orderNumber,
      },
    })
  } catch (error) {
    if (error instanceof ConektaConfigError) {
      throw new GraphQLError(error.message, {
        extensions: { code: 'CONEKTA_NOT_CONFIGURED' },
      })
    }
    throw new GraphQLError(
      'No pudimos iniciar el pago con Conekta. Intenta de nuevo en unos minutos.',
      { extensions: { code: 'CONEKTA_ERROR' } },
    )
  }

  const sanitized = sanitizeConektaPayload({
    ...conektaResult.sanitizedResponse,
    checkoutUrl: conektaResult.checkoutUrl,
    checkoutId: conektaResult.checkoutId,
    conektaOrderId: conektaResult.conektaOrderId,
  })

  const updated = await context.prisma.$transaction(async (tx) => {
    const updatedPayment = await tx.payment.update({
      where: { id: payment.id },
      data: {
        providerOrderId: conektaResult.conektaOrderId,
        status: PaymentStatus.PENDING,
        amountCents: order.totalCents,
      },
    })

    await tx.paymentAttempt.create({
      data: {
        paymentId: payment.id,
        status: PaymentStatus.PENDING,
        amountCents: order.totalCents,
        rawResponseJson: sanitized as Prisma.InputJsonValue,
      },
    })

    await tx.orderEvent.create({
      data: {
        orderId: order.id,
        type: OrderEventType.PAYMENT_UPDATED,
        message: 'Pago Conekta iniciado (checkout alojado).',
        metadataJson: {
          conektaOrderId: conektaResult.conektaOrderId,
          checkoutId: conektaResult.checkoutId,
          source: 'createConektaCheckout',
        },
      },
    })

    return updatedPayment
  })

  return mapToConektaCheckoutPayload({
    orderId: order.id,
    orderNumber: order.orderNumber,
    payment: updated,
    checkoutId: conektaResult.checkoutId,
    checkoutUrl: conektaResult.checkoutUrl,
  })
}
