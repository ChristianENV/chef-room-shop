import type { CartItem, PrismaClient } from '@prisma/client'

import { createPrismaClient } from '@/src/server/db/create-prisma'

const prisma = createPrismaClient()

import { EMPTY_GUEST_MERGE_RESULT, type GuestMergeResult } from './guest-merge.types'

type CartItemIdentity = Pick<CartItem, 'productId' | 'productVariantId' | 'designId'>

/**
 * Stable key for deduplicating cart lines during guest merge.
 */
function cartItemIdentityKey(item: CartItemIdentity): string {
  return [item.productId, item.productVariantId ?? '', item.designId ?? ''].join(':')
}

/**
 * Merges guest-owned designs, addresses, and active cart into a registered user.
 * Does not claim orders (V1). Uses a single Prisma transaction.
 */
export async function mergeGuestSessionIntoUser(input: {
  userId: string
  guestSessionId: string
}): Promise<GuestMergeResult> {
  const { userId, guestSessionId } = input

  return prisma.$transaction(async (tx) => {
    const user = await tx.user.findFirst({
      where: { id: userId, deletedAt: null },
    })
    if (!user) {
      return { ...EMPTY_GUEST_MERGE_RESULT }
    }

    const guestSession = await tx.guestSession.findUnique({
      where: { id: guestSessionId },
    })
    if (!guestSession) {
      return { ...EMPTY_GUEST_MERGE_RESULT }
    }

    if (guestSession.mergedToUserId) {
      if (guestSession.mergedToUserId === userId) {
        return {
          merged: true,
          conflict: false,
          designsMerged: 0,
          addressesMerged: 0,
          cartItemsMerged: 0,
          ordersMerged: 0,
        }
      }
      return {
        merged: false,
        conflict: true,
        designsMerged: 0,
        addressesMerged: 0,
        cartItemsMerged: 0,
        ordersMerged: 0,
      }
    }

    const designsResult = await tx.design.updateMany({
      where: {
        guestSessionId,
        userId: null,
        deletedAt: null,
      },
      data: { userId },
    })

    const addressesResult = await tx.address.updateMany({
      where: {
        guestSessionId,
        userId: null,
        deletedAt: null,
      },
      data: { userId },
    })

    const cartItemsMerged = await mergeGuestCart(tx, guestSessionId, userId)

    await tx.guestSession.update({
      where: { id: guestSessionId },
      data: { mergedToUserId: userId },
    })

    await tx.auditLog.create({
      data: {
        userId,
        action: 'UPDATE',
        entityType: 'GuestSession',
        entityId: guestSessionId,
        metadataJson: {
          designsMerged: designsResult.count,
          addressesMerged: addressesResult.count,
          cartItemsMerged,
          ordersMerged: 0,
        },
      },
    })

    return {
      merged: true,
      conflict: false,
      designsMerged: designsResult.count,
      addressesMerged: addressesResult.count,
      cartItemsMerged,
      ordersMerged: 0,
    }
  })
}

async function mergeGuestCart(
  tx: Omit<PrismaClient, '$connect' | '$disconnect' | '$on' | '$transaction' | '$extends'>,
  guestSessionId: string,
  userId: string,
): Promise<number> {
  const guestCart = await tx.cart.findFirst({
    where: {
      guestSessionId,
      status: 'ACTIVE',
      deletedAt: null,
    },
    include: { items: true },
  })

  if (!guestCart || guestCart.items.length === 0) {
    return 0
  }

  const userCart = await tx.cart.findFirst({
    where: {
      userId,
      status: 'ACTIVE',
      deletedAt: null,
    },
    include: { items: true },
  })

  if (!userCart) {
    await tx.cart.update({
      where: { id: guestCart.id },
      data: {
        userId,
        guestSessionId: null,
      },
    })
    return guestCart.items.length
  }

  const userItemsByKey = new Map<string, CartItem>()
  for (const item of userCart.items) {
    userItemsByKey.set(cartItemIdentityKey(item), item)
  }

  let mergedCount = 0

  for (const guestItem of guestCart.items) {
    const key = cartItemIdentityKey(guestItem)
    const existing = userItemsByKey.get(key)

    if (existing) {
      await tx.cartItem.update({
        where: { id: existing.id },
        data: { quantity: existing.quantity + guestItem.quantity },
      })
      await tx.cartItem.delete({ where: { id: guestItem.id } })
    } else {
      await tx.cartItem.update({
        where: { id: guestItem.id },
        data: { cartId: userCart.id },
      })
      userItemsByKey.set(key, guestItem)
    }

    mergedCount += 1
  }

  await tx.cart.update({
    where: { id: guestCart.id },
    data: { status: 'MERGED' },
  })

  return mergedCount
}
