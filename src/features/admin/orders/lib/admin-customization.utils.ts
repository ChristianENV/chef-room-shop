import {
  parseDesignSnapshot,
  parseProductSnapshot,
} from '@/src/features/storefront/account/order-detail/order-detail.utils'
import { centsToPesos } from '@/src/lib/formatters'

import type { AdminOrderItem } from '../types'
import type {
  AdminOrdersUiCustomization,
  AdminOrdersUiCustomizationElement,
} from '../types/admin-orders-ui.types'

function parseRecord(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return {}
  return value as Record<string, unknown>
}

function parseString(value: unknown): string | null {
  return typeof value === 'string' && value.trim() ? value.trim() : null
}

function parseElements(value: unknown): AdminOrdersUiCustomizationElement[] {
  if (!Array.isArray(value)) return []
  return value
    .filter(
      (element): element is Record<string, unknown> =>
        Boolean(element) && typeof element === 'object' && !Array.isArray(element),
    )
    .map((element, index) => ({
      id: parseString(element.id) ?? `element-${index}`,
      type: parseString(element.type) ?? 'personalización',
      name: parseString(element.name) ?? undefined,
      text: parseString(element.text) ?? undefined,
      zone: parseString(element.zone) ?? undefined,
      assetUrl: parseString(element.assetUrl) ?? undefined,
    }))
}

function formatColorLabel(name: string | null | undefined, hex: string | null | undefined): string {
  if (name && hex) return `${name} (${hex})`
  return name ?? hex ?? '—'
}

/** Builds admin-readable customization summary from order line snapshots. */
export function buildAdminCustomizationFromItem(
  item: AdminOrderItem,
): AdminOrdersUiCustomization | undefined {
  if (!item.hasCustomDesign) return undefined

  const product = parseProductSnapshot(item.productSnapshotJson)
  const design = parseDesignSnapshot(item.designSnapshotJson)
  const designRecord = parseRecord(item.designSnapshotJson)
  const elements = parseElements(designRecord.elements)

  const size = design?.selectedSize?.label ?? design?.selectedSize?.name ?? product.sizeName ?? '—'

  const fabricName =
    design?.fabricColor?.name ??
    product.fabricColorName ??
    product.colorName ??
    design?.selectedColor?.name ??
    null

  const fabricHex =
    design?.fabricColor?.hex ?? product.colorHex ?? design?.selectedColor?.hex ?? null

  const detailName = design?.detailColor?.name ?? product.detailColorName ?? null
  const detailHex = design?.detailColor?.hex ?? null

  const previewUrl = design?.previewUrl ?? null
  const previewBackUrl = design?.previewBackUrl ?? null

  const summaryLines =
    design?.summary && design.summary.length > 0
      ? design.summary
      : elements.filter((element) => element.text).map((element) => element.text as string)

  if (!previewUrl && elements.length === 0 && !design && item.customizationPriceCents === 0) {
    return undefined
  }

  return {
    designId: item.designId ?? design?.designId ?? '—',
    previewUrl: previewUrl ?? '',
    previewBackUrl: previewBackUrl ?? undefined,
    size,
    fabricColor: formatColorLabel(fabricName, fabricHex),
    fabricColorHex: fabricHex ?? undefined,
    detailColor: formatColorLabel(detailName, detailHex),
    detailColorHex: detailHex ?? undefined,
    customizationPrice: centsToPesos(item.customizationPriceCents),
    elements,
    areas: [],
    summaryLines,
    productionNotes: item.productionNotes ?? undefined,
    rawSnapshots: {
      productSnapshotJson: item.productSnapshotJson,
      designSnapshotJson: item.designSnapshotJson,
      designId: item.designId,
    },
  }
}

/** Reconstructs cart-style config snapshot JSON from persisted order item snapshots. */
export function buildReconstructedCartConfigSnapshot(input: {
  productSnapshotJson: unknown
  designSnapshotJson: unknown
  designConfigJson?: unknown | null
}): Record<string, unknown> | null {
  const hasProduct = hasJsonValue(input.productSnapshotJson)
  const hasDesign = hasJsonValue(input.designSnapshotJson)
  const hasConfig = hasJsonValue(input.designConfigJson)

  if (!hasProduct && !hasDesign && !hasConfig) return null

  return {
    productSnapshot: input.productSnapshotJson ?? null,
    customizationSnapshot: input.designSnapshotJson ?? null,
    ...(hasConfig
      ? {
          designSnapshot: {
            configJson: input.designConfigJson,
          },
        }
      : {}),
  }
}

function hasJsonValue(value: unknown): boolean {
  if (value === null || value === undefined) return false
  if (typeof value === 'object' && !Array.isArray(value)) {
    return Object.keys(value as Record<string, unknown>).length > 0
  }
  return true
}
