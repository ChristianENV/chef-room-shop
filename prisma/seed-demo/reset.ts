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
        { email: { equals: 'cnoriegava@gmail.com', mode: 'insensitive' } },
        { email: { contains: 'cnoriegava+', mode: 'insensitive' } },
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

  if (demoOrderIds.length > 0) {
    await prisma.emailMessage.deleteMany({
      where: { orderId: { in: demoOrderIds } },
    })
    await prisma.shipmentEvent.deleteMany({
      where: { shipment: { orderId: { in: demoOrderIds } } },
    })
    await prisma.shipment.deleteMany({ where: { orderId: { in: demoOrderIds } } })
    await prisma.paymentAttempt.deleteMany({
      where: { payment: { orderId: { in: demoOrderIds } } },
    })
    await prisma.payment.deleteMany({ where: { orderId: { in: demoOrderIds } } })
    await prisma.orderEvent.deleteMany({ where: { orderId: { in: demoOrderIds } } })
    await prisma.orderItem.deleteMany({ where: { orderId: { in: demoOrderIds } } })
    await prisma.order.deleteMany({ where: { id: { in: demoOrderIds } } })
  }

  await prisma.conektaWebhookEvent.deleteMany({
    where: { eventId: { startsWith: 'demo-conekta-' } },
  })

  if (demoUserIds.length > 0) {
    await prisma.cartItem.deleteMany({
      where: { cart: { userId: { in: demoUserIds } } },
    })
    await prisma.cart.deleteMany({ where: { userId: { in: demoUserIds } } })
    await prisma.designEvent.deleteMany({
      where: { design: { userId: { in: demoUserIds } } },
    })
    await prisma.designAsset.deleteMany({
      where: { design: { userId: { in: demoUserIds } } },
    })
    await prisma.design.deleteMany({ where: { userId: { in: demoUserIds } } })
    await prisma.address.deleteMany({ where: { userId: { in: demoUserIds } } })
    await prisma.auditLog.deleteMany({ where: { userId: { in: demoUserIds } } })
    await prisma.session.deleteMany({ where: { userId: { in: demoUserIds } } })
    await prisma.account.deleteMany({ where: { userId: { in: demoUserIds } } })
    await prisma.userRole.deleteMany({ where: { userId: { in: demoUserIds } } })
    await prisma.user.deleteMany({ where: { id: { in: demoUserIds } } })
  }

  if (demoProductIds.length > 0) {
    await prisma.productCustomizationRule.deleteMany({
      where: { productId: { in: demoProductIds } },
    })
    await prisma.productImage.deleteMany({
      where: { productId: { in: demoProductIds } },
    })
    await prisma.productVariant.deleteMany({
      where: { productId: { in: demoProductIds } },
    })
    await prisma.product.deleteMany({ where: { id: { in: demoProductIds } } })
  }

  console.log('Demo data reset complete.')
}
