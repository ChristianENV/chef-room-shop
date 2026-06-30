import type { ProductOptionGroup, ProductOptionValue } from '@prisma/client'

import type { ProductOptionGroupWithValues } from '@/src/server/product-options'

type PrismaOptionGroup = ProductOptionGroup & { values: ProductOptionValue[] }

export function mapPrismaProductOptionGroups(
  groups: PrismaOptionGroup[],
): ProductOptionGroupWithValues[] {
  return groups.map((group) => ({
    id: group.id,
    productId: group.productId,
    productTypeId: group.productTypeId,
    slug: group.slug,
    name: group.name,
    description: group.description,
    inputType: group.inputType,
    isRequired: group.isRequired,
    isActive: group.isActive,
    sortOrder: group.sortOrder,
    configJson: group.configJson,
    values: group.values.map((value) => ({
      id: value.id,
      optionGroupId: value.optionGroupId,
      slug: value.slug,
      label: value.label,
      description: value.description,
      priceDeltaCents: value.priceDeltaCents,
      isDefault: value.isDefault,
      isActive: value.isActive,
      sortOrder: value.sortOrder,
      configJson: value.configJson,
    })),
  }))
}

export function collectProductOptionGroupsForValidation(product: {
  optionGroups?: PrismaOptionGroup[]
  productType: {
    optionGroups?: PrismaOptionGroup[]
  }
}): ProductOptionGroupWithValues[] {
  return mapPrismaProductOptionGroups([
    ...(product.optionGroups ?? []),
    ...(product.productType.optionGroups ?? []),
  ])
}
