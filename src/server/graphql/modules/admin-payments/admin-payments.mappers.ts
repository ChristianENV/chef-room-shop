import { PaymentMethod, type Prisma, type User } from '@prisma/client'

import type { AdminPaymentGql } from './admin-payments.types'

export type AdminPaymentWithOrder = Prisma.PaymentGetPayload<{
  include: {
    order: {
      select: {
        id: true
        orderNumber: true
        customerEmail: true
        deletedAt: true
        user: {
          select: {
            name: true
            firstName: true
            lastName: true
            email: true
          }
        }
      }
    }
  }
}>

/**
 * Masks a provider payment id for admin display (no full Conekta ids in UI).
 */
export function maskProviderPaymentId(providerOrderId: string): string {
  const trimmed = providerOrderId.trim()
  if (!trimmed) return '—'
  if (trimmed.length <= 8) return '••••'

  return `${trimmed.slice(0, 4)}••••${trimmed.slice(-4)}`
}

function resolveCustomerName(
  email: string,
  user: Pick<User, 'name' | 'firstName' | 'lastName'> | null,
): string | null {
  const fromParts = [user?.firstName, user?.lastName].filter(Boolean).join(' ').trim()
  if (fromParts) return fromParts

  const fromName = user?.name?.trim()
  if (fromName) return fromName

  const local = email.split('@')[0]?.trim()
  return local || null
}

/**
 * Maps a Prisma payment row to a safe admin GraphQL shape.
 * Never includes payment attempt raw responses or tokens.
 */
export function mapPaymentToAdminGql(payment: AdminPaymentWithOrder): AdminPaymentGql {
  const customerEmail = payment.order.customerEmail

  return {
    id: payment.id,
    orderId: payment.order.id,
    orderNumber: payment.order.orderNumber,
    customerName: resolveCustomerName(customerEmail, payment.order.user),
    customerEmail,
    provider: payment.provider,
    method: payment.method ?? PaymentMethod.OTHER,
    status: payment.status,
    amountCents: payment.amountCents,
    currency: payment.currency,
    providerPaymentIdMasked: maskProviderPaymentId(payment.providerOrderId),
    paidAt: payment.paidAt ? payment.paidAt.toISOString() : null,
    createdAt: payment.createdAt.toISOString(),
    updatedAt: payment.updatedAt.toISOString(),
  }
}
