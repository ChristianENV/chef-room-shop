import type { Prisma, PrismaClient } from '@prisma/client'

type OrderNumberDb = PrismaClient | Prisma.TransactionClient

const ORDER_PREFIX = 'CR'
const MAX_GENERATION_ATTEMPTS = 5

/**
 * Generates a unique order number: `CR-YYYY-000001`.
 * Counts existing orders for the current year inside the caller transaction when possible.
 */
export async function generateOrderNumber(prisma: OrderNumberDb): Promise<string> {
  const year = new Date().getFullYear()
  const prefix = `${ORDER_PREFIX}-${year}-`

  const latest = await prisma.order.findFirst({
    where: { orderNumber: { startsWith: prefix } },
    orderBy: { orderNumber: 'desc' },
    select: { orderNumber: true },
  })

  let sequence = 1
  if (latest?.orderNumber) {
    const match = latest.orderNumber.match(/-(\d{6})$/)
    if (match) {
      sequence = Number.parseInt(match[1] ?? '0', 10) + 1
    }
  }

  return `${prefix}${String(sequence).padStart(6, '0')}`
}

/**
 * Generates an order number, retrying on unique constraint collisions.
 */
export async function generateOrderNumberWithRetry(prisma: OrderNumberDb): Promise<string> {
  let candidate = await generateOrderNumber(prisma)

  for (let attempt = 0; attempt < MAX_GENERATION_ATTEMPTS; attempt += 1) {
    const exists = await prisma.order.findUnique({
      where: { orderNumber: candidate },
      select: { id: true },
    })
    if (!exists) return candidate

    const match = candidate.match(/^(CR-\d{4}-)(\d{6})$/)
    if (!match) {
      candidate = await generateOrderNumber(prisma)
      continue
    }
    const next = Number.parseInt(match[2] ?? '0', 10) + 1
    candidate = `${match[1]}${String(next).padStart(6, '0')}`
  }

  return candidate
}
