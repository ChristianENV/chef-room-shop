import { format } from 'date-fns'
import { es } from 'date-fns/locale'

import type {
  AdminDesignListItem,
  AdminDesignOwnerFilter,
  AdminDesignsListVariables,
  AdminDesignStatusFilter,
  AdminDesignsUiTableRow,
} from '../types'

const DESIGN_STATUS_LABELS: Record<string, string> = {
  DRAFT: 'Borrador',
  SAVED: 'Guardado',
  IN_CART: 'En carrito',
  PURCHASED: 'Comprado',
  ABANDONED: 'Abandonado',
  ARCHIVED: 'Archivado',
}

const OWNER_TYPE_LABELS: Record<string, string> = {
  USER: 'Usuario',
  GUEST: 'Invitado',
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

export function mapDesignStatusToLabel(status: string): string {
  return DESIGN_STATUS_LABELS[status.toUpperCase()] ?? status
}

export function mapDesignOwnerTypeToLabel(ownerType: string): string {
  return OWNER_TYPE_LABELS[ownerType.toUpperCase()] ?? ownerType
}

export function buildAdminDesignsListVariables(input: {
  search: string
  statusFilter: AdminDesignStatusFilter
  ownerFilter: AdminDesignOwnerFilter
  limit?: number
  offset?: number
}): AdminDesignsListVariables {
  const search = input.search.trim()

  return {
    filter: {
      ...(search ? { search } : {}),
      ...(input.statusFilter !== 'all' ? { status: input.statusFilter } : {}),
      ...(input.ownerFilter !== 'all' ? { ownerType: input.ownerFilter } : {}),
    },
    limit: input.limit ?? 50,
    offset: input.offset ?? 0,
  }
}

export function mapAdminDesignListItemToTableRow(
  design: AdminDesignListItem,
): AdminDesignsUiTableRow {
  const isGuest = design.ownerType.toUpperCase() === 'GUEST'
  const customerName = isGuest
    ? 'Invitado'
    : design.customerName?.trim() ||
      design.customerEmail?.split('@')[0]?.trim() ||
      'Cliente'

  const relatedCartLabel = design.relatedCartId
    ? `Carrito ${design.relatedCartId.slice(0, 8)}…`
    : null

  return {
    id: design.id,
    shortId: design.shortId,
    previewUrl: design.previewUrl,
    productName: design.productName,
    ownerLabel: mapDesignOwnerTypeToLabel(design.ownerType),
    customerName,
    customerEmail: isGuest ? null : design.customerEmail,
    status: design.status,
    statusLabel: mapDesignStatusToLabel(design.status),
    finalPriceLabel:
      design.finalPriceCents != null
        ? formatMoney(design.finalPriceCents, design.currency)
        : '—',
    currency: design.currency,
    createdAtLabel: formatAdminDate(design.createdAt),
    updatedAtLabel: formatAdminDate(design.updatedAt),
    relatedOrderNumber: design.relatedOrderNumber,
    relatedCartId: design.relatedCartId,
    relatedCartLabel,
  }
}
