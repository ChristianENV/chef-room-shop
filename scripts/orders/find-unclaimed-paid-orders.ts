/**
 * Lists paid guest orders without an associated user account.
 *
 * Usage:
 *   pnpm exec tsx scripts/orders/find-unclaimed-paid-orders.ts
 *   pnpm exec tsx scripts/orders/find-unclaimed-paid-orders.ts --limit 50
 */
import { PaymentStatus } from '@prisma/client'

import { createPrismaClient } from '../../src/server/db/create-prisma'

const prisma = createPrismaClient()

function parseLimit(argv: string[]): number {
  const index = argv.indexOf('--limit')
  if (index === -1 || !argv[index + 1]) {
    return 100
  }
  const value = Number(argv[index + 1])
  return Number.isFinite(value) && value > 0 ? value : 100
}

async function main() {
  const limit = parseLimit(process.argv.slice(2))

  const orders = await prisma.order.findMany({
    where: {
      deletedAt: null,
      userId: null,
      payments: {
        some: {
          status: PaymentStatus.PAID,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
    take: limit,
    select: {
      orderNumber: true,
      customerEmail: true,
      status: true,
      createdAt: true,
      userId: true,
      payments: {
        orderBy: { createdAt: 'desc' },
        take: 1,
        select: { status: true, paidAt: true },
      },
      checkoutReturnToken: {
        select: { expiresAt: true, usedAt: true },
      },
    },
  })

  if (orders.length === 0) {
    console.log('No unclaimed paid guest orders found.')
    return
  }

  console.log(`Found ${orders.length} unclaimed paid guest order(s):\n`)

  for (const order of orders) {
    const payment = order.payments[0]
    console.log(
      [
        order.orderNumber,
        order.customerEmail,
        `payment=${payment?.status ?? 'UNKNOWN'}`,
        `orderStatus=${order.status}`,
        `createdAt=${order.createdAt.toISOString()}`,
        `userId=${order.userId ?? 'null'}`,
        `checkoutTokenExpires=${order.checkoutReturnToken?.expiresAt?.toISOString() ?? 'none'}`,
      ].join(' | '),
    )
  }
}

main()
  .catch((error) => {
    console.error(error)
    process.exitCode = 1
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
