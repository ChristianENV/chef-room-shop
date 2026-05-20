import {
  AddressType,
  CartStatus,
  FulfillmentStatus,
  OrderEventType,
  OrderStatus,
  PaymentProvider,
  PaymentStatus,
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
import {
  mapOrderToCheckoutPayload,
  mapOrderToPublicOrder,
} from './checkout.mappers'
import { generateOrderNumberWithRetry } from './order-number'
import type {
  CheckoutOrderPayloadGql,
  CreateCheckoutOrderInput,
  PublicOrderGql,
} from './checkout.types'
import {
  createCheckoutOrderInputSchema,
  toPaymentMethod,
} from './checkout.validation'
import { buildOrderEmailLinks } from '@/src/server/email/email.links'
import { safeSendTransactionalEmail } from '@/src/server/email/email.service'

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

  const shippingCents = 0
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
  const fromConfig = parseConfigSnapshot(item.configSnapshotJson).productSnapshot
  if (fromConfig) {
    return fromConfig as Prisma.InputJsonValue
  }
  return buildProductSnapshot(item) as Prisma.InputJsonValue
}

function buildOrderDesignSnapshot(
  item: CartItemWithRelations,
): Prisma.InputJsonValue | undefined {
  const fromConfig = parseConfigSnapshot(item.configSnapshotJson).customizationSnapshot
  if (fromConfig) {
    return fromConfig as Prisma.InputJsonValue
  }
  if (!item.design) return undefined
  return buildCustomizationSnapshot(
    item.design,
    item.design.configJson,
  ) as Prisma.InputJsonValue
}

/**
 * Converts the active cart into a PENDING_PAYMENT order (no Conekta charge).
 */
export async function createCheckoutOrder(
  context: GraphQLContext,
  input: CreateCheckoutOrderInput,
): Promise<CheckoutOrderPayloadGql> {
  const parsed = createCheckoutOrderInputSchema.parse(input)
  const owner = await resolveCheckoutOwner(context)
  const cart = await getActiveCartForCheckout(context, owner)
  const totals = computeCheckoutTotalsFromCartItems(cart.items)
  const paymentMethod = toPaymentMethod(parsed.paymentMethod)
  const useSameBilling = parsed.useSameBillingAddress ?? true

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
          message: 'Pago pendiente — Conekta no conectado en v1',
        },
      },
    })

    await tx.orderEvent.create({
      data: {
        orderId: order.id,
        type: OrderEventType.CREATED,
        message: 'Orden creada desde checkout.',
        metadataJson: { source: 'checkout_bff_v1' },
      },
    })

    await tx.cart.update({
      where: { id: cart.id },
      data: { status: CartStatus.CONVERTED },
    })

    return { order, payments: [payment] }
  })

  const { order, payments } = result

  void safeSendTransactionalEmail({
    to: parsed.email,
    templateKey: 'order_created',
    subject: '',
    orderId: order.id,
    userId: owner.userId,
    guestSessionId: owner.guestSessionId,
    payload: {
      orderNumber: order.orderNumber,
      totalCents: order.totalCents,
      currency: order.currency,
      paymentStatus: payments[0]?.status ?? PaymentStatus.PENDING,
      orderStatus: order.status,
      paymentMethod: payments[0]?.method ?? paymentMethod,
      links: buildOrderEmailLinks(order.orderNumber),
    },
  })

  return mapOrderToCheckoutPayload(order, payments)
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
