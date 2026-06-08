/**
 * QA script for guest order claim + transfer authorization flow.
 * Runs against DATABASE_URL from .env.local (shared dev/test DB).
 *
 * Usage: pnpm exec tsx scripts/orders/qa-order-claim-transfer-flow.ts
 */
import { config } from 'dotenv'
import { resolve } from 'node:path'

config({ path: resolve(process.cwd(), '.env.local') })

import {
  EmailStatus,
  OrderClaimTransferRequestStatus,
  OrderStatus,
} from '@prisma/client'

import { createPrismaClient } from '@/src/server/db/create-prisma'

const prisma = createPrismaClient()

type ScenarioResult = {
  scenario: string
  pass: boolean
  evidence: string
}

const results: ScenarioResult[] = []
const cleanup: {
  orderIds: string[]
  userIds: string[]
  transferIds: string[]
} = { orderIds: [], userIds: [], transferIds: [] }

function record(scenario: string, pass: boolean, evidence: string) {
  results.push({ scenario, pass, evidence })
  const icon = pass ? 'PASS' : 'FAIL'
  console.log(`[${icon}] ${scenario}`)
  console.log(`       ${evidence}\n`)
}

function extractTokenFromAuthorizeUrl(url: string | undefined): string | null {
  if (!url) return null
  try {
    return new URL(url).searchParams.get('token')
  } catch {
    return null
  }
}

function label() {
  return Math.random().toString(36).slice(2, 6)
}

async function createUser(userLabel: string, email: string) {
  const user = await prisma.user.create({
    data: {
      name: `QA ${userLabel}`,
      email,
      emailVerified: true,
    },
  })
  cleanup.userIds.push(user.id)
  return user
}

async function countUserOrders(userId: string) {
  return prisma.order.count({
    where: { userId, deletedAt: null },
  })
}

async function main() {
  await import('../../tests/unit/helpers/mock-server-only.ts')

  const { createCheckoutReturnToken } = await import('@/src/server/checkout/checkout-return-token')
  const { claimGuestOrderByCheckoutToken } = await import(
    '@/src/server/orders/claim-guest-order-by-checkout-token.service'
  )
  const {
    approveOrderClaimTransfer,
    cancelOrderClaimTransfer,
    getOrderClaimTransferPreview,
    requestOrderClaimTransfer,
  } = await import('@/src/server/orders/order-claim-transfer.service')
  const { hashOrderClaimToken } = await import('@/src/server/orders/order-claim-token')

  async function createGuestOrder(customerEmail: string) {
    const order = await prisma.order.create({
      data: {
        orderNumber: `QA-${label()}-${Date.now()}`,
        customerEmail,
        status: OrderStatus.PAID,
        subtotalCents: 15000,
        totalCents: 15000,
      },
    })
    cleanup.orderIds.push(order.id)
    const { token } = await createCheckoutReturnToken({ orderId: order.id })
    return { order, checkoutToken: token }
  }

  console.log('=== QA: order claim transfer flow ===\n')
  console.log(
    'Entorno: DB dev/pruebas compartida (local + Vercel preview). Producción formal: N/A.\n',
  )

  const migrationRows = await prisma.$queryRaw<Array<{ migration_name: string }>>`
    SELECT migration_name FROM "_prisma_migrations"
    WHERE migration_name = '20260604120000_order_claim_transfer_requests'
  `

  record(
    'Migración en DB dev/pruebas compartidas',
    migrationRows.length > 0,
    migrationRows.length > 0
      ? 'Migración 20260604120000_order_claim_transfer_requests presente en _prisma_migrations'
      : 'Migración no encontrada',
  )

  const emailA1 = `qa-claim-a-${Date.now()}@example.com`
  const userA1 = await createUser('A1', emailA1)
  const { order: order1, checkoutToken: token1 } = await createGuestOrder(emailA1)

  const claimSame = await claimGuestOrderByCheckoutToken({
    orderNumber: order1.orderNumber,
    token: token1,
    userId: userA1.id,
    userEmail: userA1.email,
    emailVerified: true,
  })

  const order1After = await prisma.order.findUnique({ where: { id: order1.id } })
  const ordersForA1 = await countUserOrders(userA1.id)

  record(
    'Claim mismo email',
    claimSame.status === 'CLAIMED' &&
      order1After?.userId === userA1.id &&
      ordersForA1 >= 1,
    `status=${claimSame.status}, order.userId=${order1After?.userId ?? 'null'}, userOrders=${ordersForA1}`,
  )

  const emailA2 = `qa-order-a-${Date.now()}@example.com`
  const emailB2 = `qa-user-b-${Date.now()}@example.com`
  const userB2 = await createUser('B2', emailB2)
  const { order: order2, checkoutToken: token2 } = await createGuestOrder(emailA2)

  const claimMismatch = await claimGuestOrderByCheckoutToken({
    orderNumber: order2.orderNumber,
    token: token2,
    userId: userB2.id,
    userEmail: userB2.email,
    emailVerified: true,
  })

  const order2AfterMismatch = await prisma.order.findUnique({ where: { id: order2.id } })
  const ordersForB2Before = await countUserOrders(userB2.id)
  const order2ListedForB = await prisma.order.findFirst({
    where: { id: order2.id, userId: userB2.id },
  })

  record(
    'Email mismatch',
    claimMismatch.status === 'EMAIL_MISMATCH' &&
      order2AfterMismatch?.userId == null &&
      !order2ListedForB &&
      ordersForB2Before === 0,
    `status=${claimMismatch.status}, order.userId=${order2AfterMismatch?.userId ?? 'null'}, listedForB=${Boolean(order2ListedForB)}`,
  )

  const requestTransfer = await requestOrderClaimTransfer({
    orderNumber: order2.orderNumber,
    checkoutToken: token2,
    requestedByUserId: userB2.id,
    requestedByEmail: userB2.email,
  })

  const transferPending = await prisma.orderClaimTransferRequest.findFirst({
    where: {
      orderId: order2.id,
      requestedByUserId: userB2.id,
      status: OrderClaimTransferRequestStatus.PENDING,
    },
    orderBy: { createdAt: 'desc' },
  })

  if (transferPending) {
    cleanup.transferIds.push(transferPending.id)
  }

  const emailSent = await prisma.emailMessage.findFirst({
    where: {
      orderId: order2.id,
      templateKey: 'order_claim_transfer_authorization',
      status: EmailStatus.SENT,
      toEmail: emailA2.toLowerCase(),
    },
    orderBy: { createdAt: 'desc' },
  })

  const metadata = emailSent?.metadataJson as Record<string, unknown> | null
  const claimUrl =
    (metadata?.claimUrl as string | undefined) ??
    ((metadata?.links as Record<string, string> | undefined)?.claimUrl)
  const plainToken = extractTokenFromAuthorizeUrl(claimUrl)

  const tokenStoredHashed =
    Boolean(transferPending) &&
    Boolean(plainToken) &&
    transferPending!.tokenHash === hashOrderClaimToken(plainToken!) &&
    transferPending!.tokenHash !== plainToken

  const noPlainTokenInDb = plainToken
    ? !(await prisma.orderClaimTransferRequest.findFirst({
        where: { tokenHash: plainToken },
      }))
    : false

  record(
    'Solicitud enviada',
    requestTransfer.status === 'SENT' &&
      Boolean(transferPending) &&
      Boolean(emailSent) &&
      emailSent?.toEmail === emailA2.toLowerCase() &&
      tokenStoredHashed &&
      noPlainTokenInDb,
    `request=${requestTransfer.status}, transfer=PENDING, emailTo=${emailSent?.toEmail ?? 'none'}, tokenHashed=${tokenStoredHashed}, noPlainInDb=${noPlainTokenInDb}`,
  )

  const previewBefore =
    plainToken != null ? await getOrderClaimTransferPreview(plainToken) : null

  const transferAfterPreview = transferPending
    ? await prisma.orderClaimTransferRequest.findUnique({ where: { id: transferPending.id } })
    : null

  record(
    'GET no consume token',
    Boolean(previewBefore) &&
      previewBefore!.status === OrderClaimTransferRequestStatus.PENDING &&
      transferAfterPreview?.status === OrderClaimTransferRequestStatus.PENDING &&
      transferAfterPreview?.consumedAt == null,
    `preview.status=${previewBefore?.status ?? 'null'}, db.status=${transferAfterPreview?.status ?? 'null'}, consumedAt=${transferAfterPreview?.consumedAt ?? 'null'}`,
  )

  const approveResult =
    plainToken != null
      ? await approveOrderClaimTransfer(plainToken)
      : { success: false, status: 'ERROR' as const }

  const order2AfterApprove = await prisma.order.findUnique({ where: { id: order2.id } })
  const transferAfterApprove = transferPending
    ? await prisma.orderClaimTransferRequest.findUnique({ where: { id: transferPending.id } })
    : null
  const ordersForB2After = await countUserOrders(userB2.id)
  const order2ListedForBAfter = await prisma.order.findFirst({
    where: { id: order2.id, userId: userB2.id },
  })

  record(
    'Aprobación vincula orden',
    approveResult.status === 'APPROVED' &&
      order2AfterApprove?.userId === userB2.id &&
      transferAfterApprove?.status === OrderClaimTransferRequestStatus.APPROVED &&
      Boolean(transferAfterApprove?.consumedAt) &&
      Boolean(order2ListedForBAfter) &&
      ordersForB2After >= 1,
    `approve=${approveResult.status}, order.userId=${order2AfterApprove?.userId ?? 'null'}, transfer=${transferAfterApprove?.status}, userBOrders=${ordersForB2After}`,
  )

  const reuseApprove =
    plainToken != null
      ? await approveOrderClaimTransfer(plainToken)
      : { success: false, status: 'ERROR' as const }
  const reusePreview =
    plainToken != null ? await getOrderClaimTransferPreview(plainToken) : null
  const order2AfterReuse = await prisma.order.findUnique({ where: { id: order2.id } })

  record(
    'Token usado no reutilizable',
    (reuseApprove.status === 'ALREADY_USED' || reuseApprove.status === 'TOKEN_INVALID') &&
      order2AfterReuse?.userId === userB2.id &&
      (reusePreview == null || reusePreview.status === OrderClaimTransferRequestStatus.APPROVED),
    `reuseApprove=${reuseApprove.status}, order.userId unchanged=${order2AfterReuse?.userId === userB2.id}, preview=${reusePreview?.status ?? 'null'}`,
  )

  const emailA3 = `qa-cancel-a-${Date.now()}@example.com`
  const emailB3 = `qa-cancel-b-${Date.now()}@example.com`
  const userB3 = await createUser('B3', emailB3)
  const { order: order3, checkoutToken: token3 } = await createGuestOrder(emailA3)

  await claimGuestOrderByCheckoutToken({
    orderNumber: order3.orderNumber,
    token: token3,
    userId: userB3.id,
    userEmail: userB3.email,
    emailVerified: true,
  })

  const requestCancel = await requestOrderClaimTransfer({
    orderNumber: order3.orderNumber,
    checkoutToken: token3,
    requestedByUserId: userB3.id,
    requestedByEmail: userB3.email,
  })

  const emailCancel = await prisma.emailMessage.findFirst({
    where: {
      orderId: order3.id,
      templateKey: 'order_claim_transfer_authorization',
      status: EmailStatus.SENT,
    },
    orderBy: { createdAt: 'desc' },
  })

  const metaCancel = emailCancel?.metadataJson as Record<string, unknown> | null
  const cancelUrl =
    (metaCancel?.claimUrl as string | undefined) ??
    ((metaCancel?.links as Record<string, string> | undefined)?.claimUrl)
  const cancelToken = extractTokenFromAuthorizeUrl(cancelUrl)

  const transferCancelRow = await prisma.orderClaimTransferRequest.findFirst({
    where: { orderId: order3.id, requestedByUserId: userB3.id },
    orderBy: { createdAt: 'desc' },
  })

  if (transferCancelRow) {
    cleanup.transferIds.push(transferCancelRow.id)
  }

  const cancelResult =
    cancelToken != null
      ? await cancelOrderClaimTransfer(cancelToken)
      : { success: false, status: 'ERROR' as const }

  const order3AfterCancel = await prisma.order.findUnique({ where: { id: order3.id } })
  const transferAfterCancel = transferCancelRow
    ? await prisma.orderClaimTransferRequest.findUnique({ where: { id: transferCancelRow.id } })
    : null

  record(
    'Cancelación',
    requestCancel.status === 'SENT' &&
      cancelResult.status === 'CANCELLED' &&
      transferAfterCancel?.status === OrderClaimTransferRequestStatus.CANCELLED &&
      order3AfterCancel?.userId == null,
    `request=${requestCancel.status}, cancel=${cancelResult.status}, order.userId=${order3AfterCancel?.userId ?? 'null'}`,
  )

  const emailA4 = `qa-admin-a-${Date.now()}@example.com`
  const emailB4 = `qa-admin-b-${Date.now()}@example.com`
  const userB4 = await createUser('B4', emailB4)
  const { order: order4, checkoutToken: token4 } = await createGuestOrder(emailA4)

  const adminGuest = await prisma.order.findFirst({
    where: { id: order4.id, deletedAt: null },
    select: { id: true, orderNumber: true, userId: true },
  })

  await claimGuestOrderByCheckoutToken({
    orderNumber: order4.orderNumber,
    token: token4,
    userId: userB4.id,
    userEmail: userB4.email,
    emailVerified: true,
  })

  await requestOrderClaimTransfer({
    orderNumber: order4.orderNumber,
    checkoutToken: token4,
    requestedByUserId: userB4.id,
    requestedByEmail: userB4.email,
  })

  const transfer4 = await prisma.orderClaimTransferRequest.findFirst({
    where: { orderId: order4.id },
    orderBy: { createdAt: 'desc' },
  })

  if (transfer4) {
    cleanup.transferIds.push(transfer4.id)
  }

  const adminPending = await prisma.order.findFirst({
    where: { id: order4.id, deletedAt: null },
    select: { id: true, orderNumber: true, userId: true },
  })

  const emailAdmin = await prisma.emailMessage.findFirst({
    where: { orderId: order4.id, templateKey: 'order_claim_transfer_authorization' },
    orderBy: { createdAt: 'desc' },
  })
  const metaAdmin = emailAdmin?.metadataJson as Record<string, unknown> | null
  const adminToken = extractTokenFromAuthorizeUrl(
    (metaAdmin?.claimUrl as string | undefined) ??
      ((metaAdmin?.links as Record<string, string> | undefined)?.claimUrl),
  )

  if (adminToken) {
    await approveOrderClaimTransfer(adminToken)
  }

  const adminLinked = await prisma.order.findFirst({
    where: { id: order4.id, deletedAt: null },
    select: { id: true, orderNumber: true, userId: true },
  })

  record(
    'Admin sigue viendo orden',
    Boolean(adminGuest?.orderNumber) &&
      adminGuest?.userId == null &&
      Boolean(adminPending?.orderNumber) &&
      adminPending?.userId == null &&
      Boolean(transfer4?.id) &&
      Boolean(adminLinked?.orderNumber) &&
      adminLinked?.userId === userB4.id,
    `guest=${adminGuest?.orderNumber}, pending=${adminPending?.orderNumber}, linked=${adminLinked?.orderNumber}, finalUserId=${adminLinked?.userId ?? 'null'}`,
  )
}

main()
  .catch((error) => {
    console.error(error)
    process.exitCode = 1
  })
  .finally(async () => {
    if (cleanup.transferIds.length > 0) {
      await prisma.orderClaimTransferRequest.deleteMany({
        where: { id: { in: cleanup.transferIds } },
      })
    }

    if (cleanup.orderIds.length > 0) {
      await prisma.emailMessage.deleteMany({ where: { orderId: { in: cleanup.orderIds } } })
      await prisma.checkoutReturnToken.deleteMany({
        where: { orderId: { in: cleanup.orderIds } },
      })
      await prisma.order.deleteMany({ where: { id: { in: cleanup.orderIds } } })
    }

    if (cleanup.userIds.length > 0) {
      await prisma.user.deleteMany({ where: { id: { in: cleanup.userIds } } })
    }

    await prisma.$disconnect()

    const failed = results.filter((row) => !row.pass)
    console.log('=== RESUMEN ===')
    console.log(JSON.stringify(results, null, 2))

    if (failed.length > 0) {
      process.exitCode = 1
    }
  })
