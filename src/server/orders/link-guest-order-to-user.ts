import 'server-only'

import { OrderEventType, type Order, type Prisma } from '@prisma/client'

type OrderLinkInput = Pick<Order, 'id' | 'shippingAddressId' | 'billingAddressId' | 'guestSessionId'>

/**
 * Links a guest order (and related addresses/session) to an authenticated user inside a transaction.
 */
export async function linkGuestOrderToUser(
  tx: Prisma.TransactionClient,
  input: {
    order: OrderLinkInput
    userId: string
    eventMessage?: string
  },
): Promise<void> {
  const { order, userId } = input

  await tx.order.update({
    where: { id: order.id },
    data: { userId },
  })

  const addressIds = [order.shippingAddressId, order.billingAddressId].filter(
    (id): id is string => Boolean(id),
  )

  if (addressIds.length > 0) {
    await tx.address.updateMany({
      where: {
        id: { in: addressIds },
        userId: null,
      },
      data: { userId },
    })
  }

  if (order.guestSessionId) {
    await tx.guestSession.updateMany({
      where: {
        id: order.guestSessionId,
        mergedToUserId: null,
      },
      data: { mergedToUserId: userId },
    })
  }

  await tx.orderEvent.create({
    data: {
      orderId: order.id,
      type: OrderEventType.STATUS_CHANGED,
      message: input.eventMessage ?? 'Orden vinculada a cuenta de cliente.',
    },
  })
}
