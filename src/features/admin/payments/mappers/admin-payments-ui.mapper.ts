import { format } from 'date-fns'
import { es } from 'date-fns/locale'

import {
  mapPaymentMethodToLabel,
  mapPaymentStatusToLabel,
} from '@/src/features/admin/orders/mappers/admin-orders-ui.mapper'

import type {
  AdminPayment,
  AdminPaymentsListVariables,
  AdminPaymentStatusFilter,
  AdminPaymentsUiTableRow,
} from '../types'

const PROVIDER_LABELS: Record<string, string> = {
  CONEKTA: 'Conekta',
  MANUAL: 'Manual',
  OTHER: 'Otro',
}

function formatAdminDate(iso: string): string {
  try {
    return format(new Date(iso), "d MMM yyyy, HH:mm", { locale: es })
  } catch {
    return iso
  }
}

function formatMoney(amountCents: number, currency: string): string {
  const pesos = amountCents / 100
  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(pesos)
}

export function buildAdminPaymentsListVariables(input: {
  search: string
  statusFilter: AdminPaymentStatusFilter
  limit?: number
  offset?: number
}): AdminPaymentsListVariables {
  const search = input.search.trim()

  return {
    filter: {
      ...(search ? { search } : {}),
      ...(input.statusFilter !== 'all' ? { status: input.statusFilter } : {}),
    },
    limit: input.limit ?? 50,
    offset: input.offset ?? 0,
  }
}

export function mapAdminPaymentToTableRow(payment: AdminPayment): AdminPaymentsUiTableRow {
  const paymentDate = payment.paidAt ?? payment.createdAt
  const customerName =
    payment.customerName?.trim() ||
    payment.customerEmail.split('@')[0]?.trim() ||
    payment.customerEmail

  return {
    id: payment.id,
    orderId: payment.orderId,
    orderNumber: payment.orderNumber,
    customerName,
    customerEmail: payment.customerEmail,
    providerLabel: PROVIDER_LABELS[payment.provider] ?? payment.provider,
    methodLabel: mapPaymentMethodToLabel(payment.method),
    status: payment.status,
    statusLabel: mapPaymentStatusToLabel(payment.status),
    amountLabel: formatMoney(payment.amountCents, payment.currency),
    currency: payment.currency,
    providerPaymentIdMasked: payment.providerPaymentIdMasked,
    paymentDateLabel: formatAdminDate(paymentDate),
    updatedAtLabel: formatAdminDate(payment.updatedAt),
  }
}
