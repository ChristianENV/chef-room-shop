import {
  OrderEventType,
  PaymentMethod,
  PaymentStatus,
  type Payment,
  type Prisma,
} from '@prisma/client'
import { GraphQLError } from 'graphql'

import {
  conektaCheckoutRedirectUrls,
  conektaCheckoutRedirectUrlsLegacy,
} from '@/src/lib/checkout-redirect-urls'
import { createConektaCheckoutForOrder } from '@/src/server/payments/conekta/conekta.client'
import { ConektaConfigError } from '@/src/server/payments/conekta/conekta.errors'
import { sanitizeConektaPayload } from '@/src/server/payments/conekta/conekta.sanitize'
import { getAppBaseUrl } from '@/src/server/payments/app-url'

import type { GraphQLContext } from '../../context'
import { assertCanStartConektaCheckout, assertOrderPendingPayment, notFound } from './payments.auth'
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

export type StartConektaCheckoutResult = {
  checkoutUrl: string | null
  checkoutId: string | null
  providerOrderId: string
  payment: Payment
}

type StartConektaCheckoutOptions = {
  orderId: string
  returnToken?: string
  source: string
  skipAuth?: boolean
}

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

function buildConektaMetadata(order: OrderWithPaymentsAndItems): Record<string, string> {
  const payment = order.payments[0]
  return {
    chef_room_order_id: order.id,
    chef_room_order_number: order.orderNumber,
    internalOrderId: order.id,
    orderNumber: order.orderNumber,
    ...(order.userId ? { userId: order.userId } : {}),
    ...(order.guestSessionId ? { guestSessionId: order.guestSessionId } : {}),
    ...(payment?.method ? { paymentMethod: payment.method } : {}),
    environment: process.env.NODE_ENV ?? 'development',
  }
}

/**
 * Shared Conekta HostedPayment bootstrap for an existing local order.
 */
export async function startConektaCheckoutForOrder(
  context: GraphQLContext,
  options: StartConektaCheckoutOptions,
): Promise<StartConektaCheckoutResult> {
  const order = await context.prisma.order.findFirst({
    where: {
      id: options.orderId,
      deletedAt: null,
    },
    include: orderInclude,
  })

  if (!order) {
    throw notFound()
  }

  const orderView = order as OrderWithPaymentsAndItems

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
      return {
        checkoutUrl: cached.checkoutUrl,
        checkoutId: cached.checkoutId,
        providerOrderId: payment.providerOrderId,
        payment: payment as unknown as Payment,
      }
    }
  }

  const baseUrl = getAppBaseUrl()
  const { successUrl, failureUrl } = options.returnToken
    ? conektaCheckoutRedirectUrls(options.returnToken, baseUrl)
    : conektaCheckoutRedirectUrlsLegacy(order.orderNumber, baseUrl)

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
      allowedPaymentMethods: mapAllowedConektaMethods(payment.method as PaymentMethod | null),
      metadata: buildConektaMetadata(orderView),
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

  const updatedPayment = await context.prisma.$transaction(async (tx) => {
    const updated = await tx.payment.update({
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
          source: options.source,
        },
      },
    })

    return updated
  })

  return {
    checkoutUrl: conektaResult.checkoutUrl,
    checkoutId: conektaResult.checkoutId,
    providerOrderId: conektaResult.conektaOrderId,
    payment: updatedPayment,
  }
}

/**
 * Starts Conekta HostedPayment checkout for an existing local order (legacy email auth).
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

  const result = await startConektaCheckoutForOrder(context, {
    orderId: order.id,
    source: 'createConektaCheckout',
  })

  if (!result.checkoutUrl) {
    throw new GraphQLError('No pudimos preparar el pago. Intenta nuevamente.', {
      extensions: { code: 'CONEKTA_ERROR' },
    })
  }

  return mapToConektaCheckoutPayload({
    orderId: order.id,
    orderNumber: order.orderNumber,
    payment: result.payment,
    checkoutId: result.checkoutId,
    checkoutUrl: result.checkoutUrl,
  })
}
