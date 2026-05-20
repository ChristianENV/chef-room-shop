import type { Payment } from '@prisma/client'

import { maskCustomerEmail } from '@/src/server/orders/order-claim-token'

import type { OrderClaimPreviewGql } from './order-claim.types'

type OrderPreviewSource = {
  orderNumber: string
  customerEmail: string
  status: string
  userId: string | null
  payments: Payment[]
}

function derivePaymentStatus(payments: Payment[]): string {
  return payments[0]?.status ?? 'PENDING'
}

/**
 * Maps order + claim metadata to the public claim preview shape.
 */
export function mapOrderClaimPreview(
  order: OrderPreviewSource,
  expiresAt: Date,
): OrderClaimPreviewGql {
  return {
    orderNumber: order.orderNumber,
    maskedEmail: maskCustomerEmail(order.customerEmail),
    status: order.status,
    paymentStatus: derivePaymentStatus(order.payments),
    expiresAt: expiresAt.toISOString(),
    alreadyClaimed: order.userId !== null,
  }
}
