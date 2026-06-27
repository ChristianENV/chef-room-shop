import type { Color } from '@prisma/client'

import type { AdminColorGql } from './admin-colors.types'

function toIso(date: Date): string {
  return date.toISOString()
}

export function mapAdminColorToGql(color: Color): AdminColorGql {
  return {
    id: color.id,
    slug: color.slug,
    name: color.name,
    hexCode: color.hex,
    isFabricColor: color.isFabricColor,
    isProductColor: color.isProductColor,
    isGeneralColor: color.isGeneralColor,
    isActive: color.isActive,
    sortOrder: color.sortOrder,
    createdAt: toIso(color.createdAt),
    updatedAt: toIso(color.updatedAt),
  }
}
