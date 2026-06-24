import { format } from 'date-fns'
import { es } from 'date-fns/locale'

import {
  mapShipmentStatusToBadgeVariant,
  mapShipmentStatusToLabel,
} from './admin-shipping-ui.mapper'

import type {
  AdminShipmentListItem,
  AdminShipmentsListVariables,
  AdminShipmentStatusFilter,
  AdminShipmentsUiTableRow,
} from '../types'

function formatAdminDate(iso: string): string {
  try {
    return format(new Date(iso), 'd MMM yyyy, HH:mm', { locale: es })
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

export function buildAdminShipmentsListVariables(input: {
  search: string
  statusFilter: AdminShipmentStatusFilter
  limit?: number
  offset?: number
}): AdminShipmentsListVariables {
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

export function mapAdminShipmentListItemToTableRow(
  shipment: AdminShipmentListItem,
): AdminShipmentsUiTableRow {
  const customerName =
    shipment.customerName?.trim() || shipment.customerEmail.split('@')[0]?.trim() || 'Cliente'

  return {
    id: shipment.id,
    orderNumber: shipment.orderNumber,
    customerName,
    customerEmail: shipment.customerEmail,
    status: shipment.status,
    statusLabel: mapShipmentStatusToLabel(shipment.status),
    carrier: shipment.carrier?.trim() || '—',
    trackingNumber: shipment.trackingNumber?.trim() || '—',
    labelStatus: shipment.labelStatus,
    costLabel:
      shipment.costCents != null ? formatMoney(shipment.costCents, shipment.currency) : '—',
    currency: shipment.currency,
    createdAtLabel: formatAdminDate(shipment.createdAt),
    trackingUpdatedAtLabel: formatAdminDate(shipment.trackingUpdatedAt ?? shipment.updatedAt),
  }
}

export { mapShipmentStatusToBadgeVariant }
