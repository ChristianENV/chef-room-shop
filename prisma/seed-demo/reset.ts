import type { PrismaClient } from '@prisma/client'

import {
  DEMO_ORDER_PREFIX,
  DEMO_PRODUCT_SLUG_PREFIX,
} from './constants'

/**
 * Deletes demo-scoped rows when ALLOW_DEMO_SEED_RESET=true.
 * Never removes base roles, permissions, or non-demo users.
 */
export async function resetDemoData(prisma: PrismaClient): Promise<void> {
  if (process.env.ALLOW_DEMO_SEED_RESET !== 'true') {
    return
  }

  console.log('ALLOW_DEMO_SEED_RESET=true — removing prior demo data...')

  const demoUsers = await prisma.user.findMany({
    where: {
      OR: [
        { email: { contains: 'cnoriega+', mode: 'insensitive' } },
        { email: { endsWith: '@chefroom.test', mode: 'insensitive' } },
      ],
    },
    select: { id: true },
  })
  const demoUserIds = demoUsers.map((u) => u.id)

  const demoProducts = await prisma.product.findMany({
    where: { slug: { startsWith: DEMO_PRODUCT_SLUG_PREFIX } },
    select: { id: true },
  })
  const demoProductIds = demoProducts.map((p) => p.id)

  const demoOrders = await prisma.order.findMany({
    where: { orderNumber: { startsWith: DEMO_ORDER_PREFIX } },
    select: { id: true },
  })
  const demoOrderIds = demoOrders.map((o) => o.id)

  await prisma.$transaction(async (tx) => {
    if (demoOrderIds.length > 0) {
      await tx.emailMessage.deleteMany({
        where: { orderId: { in: demoOrderIds } },
      })
      await tx.shipmentEvent.deleteMany({
        where: { shipment: { orderId: { in: demoOrderIds } } },
      })
      await tx.shipment.deleteMany({ where: { orderId: { in: demoOrderIds } } })
      await tx.paymentAttempt.deleteMany({
        where: { payment: { orderId: { in: demoOrderIds } } },
      })
      await tx.payment.deleteMany({ where: { orderId: { in: demoOrderIds } } })
      await tx.orderEvent.deleteMany({ where: { orderId: { in: demoOrderIds } } })
      await tx.orderItem.deleteMany({ where: { orderId: { in: demoOrderIds } } })
      await tx.order.deleteMany({ where: { id: { in: demoOrderIds } } })
    }

    await tx.conektaWebhookEvent.deleteMany({
      where: { eventId: { startsWith: 'demo-conekta-' } },
    })

    if (demoUserIds.length > 0) {
      await tx.cartItem.deleteMany({
        where: { cart: { userId: { in: demoUserIds } } },
      })
      await tx.cart.deleteMany({ where: { userId: { in: demoUserIds } } })
      await tx.designEvent.deleteMany({
        where: { design: { userId: { in: demoUserIds } } },
      })
      await tx.designAsset.deleteMany({
        where: { design: { userId: { in: demoUserIds } } },
      })
      await tx.design.deleteMany({ where: { userId: { in: demoUserIds } } })
      await tx.address.deleteMany({ where: { userId: { in: demoUserIds } } })
      await tx.auditLog.deleteMany({ where: { userId: { in: demoUserIds } } })
      await tx.session.deleteMany({ where: { userId: { in: demoUserIds } } })
      await tx.account.deleteMany({ where: { userId: { in: demoUserIds } } })
      await tx.userRole.deleteMany({ where: { userId: { in: demoUserIds } } })
      await tx.user.deleteMany({ where: { id: { in: demoUserIds } } })
    }

    if (demoProductIds.length > 0) {
      await tx.productCustomizationRule.deleteMany({
        where: { productId: { in: demoProductIds } },
      })
      await tx.productImage.deleteMany({
        where: { productId: { in: demoProductIds } },
      })
      await tx.productVariant.deleteMany({
        where: { productId: { in: demoProductIds } },
      })
      await tx.product.deleteMany({ where: { id: { in: demoProductIds } } })
    }
  })

  console.log('Demo data reset complete.')
}
