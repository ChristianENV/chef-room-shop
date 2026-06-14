import {
  AddressType,
  CartStatus,
  FulfillmentStatus,
  OrderEventType,
  OrderStatus,
  PaymentProvider,
  PaymentStatus,
  type Order,
  type Payment,
  type PaymentMethod,
  type Prisma,
} from '@prisma/client'
import { mapAddressInputToPrisma } from '../account/account.mappers'
import {
  buildCustomizationSnapshot,
  buildProductSnapshot,
} from '../cart/cart.mappers'
import type { CartConfigSnapshotJson, CartItemWithRelations } from '../cart/cart.types'
import type { GraphQLContext } from '../../context'
import { getActiveCartForCheckout, resolveCheckoutOwner } from './checkout.auth'
import { enrichProductSnapshotWithConfig } from '@/src/lib/customization/build-customization-snapshot'
import { resolveCheckoutShippingRate } from './checkout-shipping'
import {
  mapOrderToCheckoutPayload,
  mapOrderToPublicOrder,
} from './checkout.mappers'
import { generateOrderNumberWithRetry } from './order-number'
import type {
  CheckoutOrderPayloadGql,
  CheckoutOwner,
  CreateCheckoutOrderInput,
  PublicOrderGql,
} from './checkout.types'
import {
  createCheckoutOrderInputSchema,
  toPaymentMethod,
} from './checkout.validation'
import {
  buildOrderEmailTrackingLinks,
} from '@/src/server/email/email.links'
import { safeSendTransactionalEmail } from '@/src/server/email/email.service'
import { createOrderClaimToken } from '@/src/server/orders/order-claim-token'

function parseConfigSnapshot(value: unknown): CartConfigSnapshotJson {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return {}
  }
  const record = value as Record<string, unknown>
  return {
    productSnapshot:
      record.productSnapshot && typeof record.productSnapshot === 'object'
        ? (record.productSnapshot as CartConfigSnapshotJson['productSnapshot'])
        : undefined,
    customizationSnapshot:
      record.customizationSnapshot &&
      typeof record.customizationSnapshot === 'object'
        ? (record.customizationSnapshot as CartConfigSnapshotJson['customizationSnapshot'])
        : undefined,
  }
}

/**
 * Computes order totals from cart line items (server-side only).
 */
export function computeCheckoutTotalsFromCartItems(
  items: CartItemWithRelations[],
  shippingCents = 0,
): {
  subtotalCents: number
  customizationTotalCents: number
  shippingCents: number
  discountCents: number
  taxCents: number
  totalCents: number
} {
  let subtotalCents = 0
  let customizationTotalCents = 0

  for (const item of items) {
    subtotalCents += item.unitPriceCents * item.quantity
    customizationTotalCents += item.customizationPriceCents * item.quantity
  }
  const discountCents = 0
  const taxCents = 0
  const totalCents =
    subtotalCents + customizationTotalCents + shippingCents + taxCents - discountCents

  return {
    subtotalCents,
    customizationTotalCents,
    shippingCents,
    discountCents,
    taxCents,
    totalCents,
  }
}

function buildOrderProductSnapshot(
  item: CartItemWithRelations,
): Prisma.InputJsonValue {
  const parsed = parseConfigSnapshot(item.configSnapshotJson)
  const fromConfig = parsed.productSnapshot
  if (fromConfig) {
    return enrichProductSnapshotWithConfig(
      fromConfig,
      item.design?.configJson ?? parsed.designSnapshot?.configJson,
    ) as Prisma.InputJsonValue
  }
  return buildProductSnapshot(item, item.design?.configJson) as Prisma.InputJsonValue
}

function buildOrderDesignSnapshot(
  item: CartItemWithRelations,
): Prisma.InputJsonValue | undefined {
  const fromConfig = parseConfigSnapshot(item.configSnapshotJson).customizationSnapshot
  if (fromConfig) {
    return fromConfig as Prisma.InputJsonValue
  }
  if (!item.design) return undefined
  return buildCustomizationSnapshot(item.design, item.design.configJson, {
    variant: item.productVariant,
    customizationPriceCents: item.customizationPriceCents,
  }) as Prisma.InputJsonValue
}

export type CreateCheckoutOrderCoreResult = {
  order: Order
  payments: Payment[]
  owner: CheckoutOwner
  cartId: string
  customerEmail: string
  paymentMethod: PaymentMethod
}

type CreateCheckoutOrderCoreOptions = {
  convertCart?: boolean
}

/**
 * Creates a PENDING_PAYMENT order from the active cart (optional cart conversion).
 */
export async function createCheckoutOrderCore(
  context: GraphQLContext,
  input: CreateCheckoutOrderInput,
  options: CreateCheckoutOrderCoreOptions = {},
): Promise<CreateCheckoutOrderCoreResult> {
  const { convertCart = true } = options
  const parsed = createCheckoutOrderInputSchema.parse(input)
  const owner = await resolveCheckoutOwner(context)
  const cart = await getActiveCartForCheckout(context, owner)

  const resolvedShipping = await resolveCheckoutShippingRate(
    context,
    owner,
    cart.id,
    parsed.shippingRateId,
  )

  const totals = computeCheckoutTotalsFromCartItems(
    cart.items,
    resolvedShipping?.shippingCents ?? 0,
  )
  const paymentMethod = toPaymentMethod(parsed.paymentMethod)
  const useSameBilling = parsed.useSameBillingAddress ?? true

  const orderEventMessage = resolvedShipping
    ? `Orden creada con envío seleccionado (${resolvedShipping.rate.carrier}${
        resolvedShipping.rate.service ? ` · ${resolvedShipping.rate.service}` : ''
      }).`
    : 'Orden creada desde checkout.'

  const result = await context.prisma.$transaction(async (tx) => {
    const orderNumber = await generateOrderNumberWithRetry(tx)

    const shippingData = mapAddressInputToPrisma({
      ...parsed.shippingAddress,
      phone: parsed.shippingAddress.phone || parsed.phone,
    })

    const shippingAddress = await tx.address.create({
      data: {
        ...shippingData,
        type: AddressType.SHIPPING,
        userId: owner.userId,
        guestSessionId: owner.guestSessionId,
      },
    })

    let billingAddressId = shippingAddress.id

    if (!useSameBilling && parsed.billingAddress) {
      const billingData = mapAddressInputToPrisma({
        ...parsed.billingAddress,
        phone: parsed.billingAddress.phone || parsed.phone,
      })
      const billingAddress = await tx.address.create({
        data: {
          ...billingData,
          type: AddressType.BILLING,
          userId: owner.userId,
          guestSessionId: owner.guestSessionId,
        },
      })
      billingAddressId = billingAddress.id
    } else if (!useSameBilling) {
      const billingCopy = await tx.address.create({
        data: {
          ...shippingData,
          type: AddressType.BILLING,
          userId: owner.userId,
          guestSessionId: owner.guestSessionId,
        },
      })
      billingAddressId = billingCopy.id
    }

    const order = await tx.order.create({
      data: {
        orderNumber,
        userId: owner.userId,
        guestSessionId: owner.guestSessionId,
        status: OrderStatus.PENDING_PAYMENT,
        fulfillmentStatus: FulfillmentStatus.UNFULFILLED,
        customerEmail: parsed.email.toLowerCase(),
        customerPhone: parsed.phone,
        subtotalCents: totals.subtotalCents,
        customizationTotalCents: totals.customizationTotalCents,
        shippingCents: totals.shippingCents,
        discountCents: totals.discountCents,
        taxCents: totals.taxCents,
        totalCents: totals.totalCents,
        currency: cart.currency,
        shippingAddressId: shippingAddress.id,
        billingAddressId,
        notes: parsed.notes ?? null,
      },
    })

    for (const item of cart.items) {
      const lineUnitTotal = item.unitPriceCents + item.customizationPriceCents
      await tx.orderItem.create({
        data: {
          orderId: order.id,
          designId: item.designId,
          quantity: item.quantity,
          unitPriceCents: item.unitPriceCents,
          customizationPriceCents: item.customizationPriceCents,
          lineTotalCents: lineUnitTotal * item.quantity,
          productSnapshotJson: buildOrderProductSnapshot(item),
          designSnapshotJson: buildOrderDesignSnapshot(item),
        },
      })
    }

    const providerOrderId = `checkout_pending_${order.id}`

    const payment = await tx.payment.create({
      data: {
        orderId: order.id,
        provider: PaymentProvider.CONEKTA,
        providerOrderId,
        status: PaymentStatus.PENDING,
        amountCents: totals.totalCents,
        currency: cart.currency,
        method: paymentMethod,
      },
    })

    await tx.paymentAttempt.create({
      data: {
        paymentId: payment.id,
        status: PaymentStatus.PENDING,
        amountCents: totals.totalCents,
        rawResponseJson: {
          placeholder: true,
          provider: PaymentProvider.CONEKTA,
          method: paymentMethod,
          message: 'Pago pendiente — esperando checkout Conekta',
        },
      },
    })

    await tx.orderEvent.create({
      data: {
        orderId: order.id,
        type: OrderEventType.CREATED,
        message: orderEventMessage,
        metadataJson: {
          source: convertCart ? 'checkout_bff_v1' : 'complete_checkout_bff',
          ...(resolvedShipping
            ? {
                shippingRateId: resolvedShipping.rate.id,
                providerRateId: resolvedShipping.rate.providerRateId,
                carrier: resolvedShipping.rate.carrier,
                service: resolvedShipping.rate.service,
                shippingCents: resolvedShipping.shippingCents,
              }
            : {}),
        },
      },
    })

    if (resolvedShipping) {
      await tx.shippingQuote.update({
        where: { id: resolvedShipping.quoteId },
        data: { orderId: order.id },
      })
    }

    if (convertCart) {
      await tx.cart.update({
        where: { id: cart.id },
        data: { status: CartStatus.CONVERTED },
      })
    }

    return { order, payments: [payment], cartId: cart.id }
  })

  return {
    order: result.order,
    payments: result.payments,
    owner,
    cartId: result.cartId,
    customerEmail: parsed.email.toLowerCase(),
    paymentMethod,
  }
}

/**
 * Converts cart, sends order_created email, and creates guest claim token when applicable.
 */
export async function finalizeCheckoutOrderSideEffects(
  context: GraphQLContext,
  params: {
    order: Order
    payments: Payment[]
    owner: CheckoutOwner
    cartId: string
    customerEmail: string
    paymentMethod: PaymentMethod
  },
): Promise<{ claimUrl: string | null; accountOrderUrl: string | null }> {
  await context.prisma.cart.update({
    where: { id: params.cartId },
    data: { status: CartStatus.CONVERTED },
  })

  let claimToken: string | null = null
  if (!params.owner.userId) {
    try {
      const created = await createOrderClaimToken({
        orderId: params.order.id,
        sentToEmail: params.customerEmail,
      })
      claimToken = created.token
    } catch (error) {
      console.error('[checkout] Failed to create order claim token', {
        orderId: params.order.id,
        error: error instanceof Error ? error.message : 'unknown',
      })
    }
  }

  const trackingLinks = buildOrderEmailTrackingLinks({
    orderNumber: params.order.orderNumber,
    userId: params.owner.userId,
    claimToken,
  })

  void safeSendTransactionalEmail({
    to: params.customerEmail,
    templateKey: 'order_created',
    subject: '',
    orderId: params.order.id,
    userId: params.owner.userId,
    guestSessionId: params.owner.guestSessionId,
    payload: {
      orderNumber: params.order.orderNumber,
      totalCents: params.order.totalCents,
      currency: params.order.currency,
      paymentStatus: params.payments[0]?.status ?? PaymentStatus.PENDING,
      orderStatus: params.order.status,
      paymentMethod: params.payments[0]?.method ?? params.paymentMethod,
      links: trackingLinks,
      claimUrl: trackingLinks.claimUrl,
      accountOrderUrl: trackingLinks.accountOrderUrl,
    },
  })

  return {
    claimUrl: trackingLinks.claimUrl ?? null,
    accountOrderUrl: trackingLinks.accountOrderUrl ?? null,
  }
}

/**
 * Converts the active cart into a PENDING_PAYMENT order (no Conekta charge).
 */
export async function createCheckoutOrder(
  context: GraphQLContext,
  input: CreateCheckoutOrderInput,
): Promise<CheckoutOrderPayloadGql> {
  const core = await createCheckoutOrderCore(context, input, { convertCart: true })
  const tracking = await finalizeCheckoutOrderSideEffects(context, core)

  return mapOrderToCheckoutPayload(core.order, core.payments, {
    claimUrl: tracking.claimUrl,
    accountOrderUrl: tracking.accountOrderUrl,
  })
}

/**
 * Public order lookup by order number + customer email (guest-friendly).
 */
export async function getPublicOrderByNumber(
  context: GraphQLContext,
  orderNumber: string,
  email: string,
): Promise<PublicOrderGql | null> {
  const normalizedEmail = email.trim().toLowerCase()
  if (!normalizedEmail) return null

  const order = await context.prisma.order.findFirst({
    where: {
      orderNumber: orderNumber.trim(),
      customerEmail: { equals: normalizedEmail, mode: 'insensitive' },
      deletedAt: null,
    },
    include: {
      items: { orderBy: { createdAt: 'asc' } },
      payments: { orderBy: { createdAt: 'desc' } },
    },
  })

  if (!order) return null

  return mapOrderToPublicOrder(order)
}
