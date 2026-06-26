import type {
  Color,
  CustomizationArea,
  CustomizationOption,
  Product,
  ProductCustomizationRule,
  ProductImage,
  ProductModelAsset,
  ProductType,
  ProductVariant,
  Size,
} from '@prisma/client'

import type {
  CatalogColorGql,
  CatalogProductCustomizationRuleGql,
  CatalogProductGql,
  CatalogProductImageGql,
  CatalogProductModel3dGql,
  CatalogProductTypeGql,
  CatalogProductVariantGql,
  CatalogSizeGql,
} from './catalog.types'

type ProductWithRelations = Product & {
  productType: ProductType
  images: ProductImage[]
  variants: (ProductVariant & { color: Color; size: Size })[]
  customizationRules: (ProductCustomizationRule & {
    area: CustomizationArea
    option: CustomizationOption
  })[]
  modelAssets?: ProductModelAsset[]
}

type RuleConfigJson = {
  priceCents?: number
  maxDimensionsCm?: { width?: number; height?: number }
  allowedFileTypes?: string[]
  pricePerCmCents?: number
  minQuantity?: number
  extraProductionDays?: number
  validationMessage?: string
}

function parseRuleConfig(config: unknown): RuleConfigJson {
  if (!config || typeof config !== 'object') return {}
  return config as RuleConfigJson
}

function parseAllowedFileTypes(value: unknown): string[] {
  if (!Array.isArray(value)) return []
  return value.filter((item): item is string => typeof item === 'string')
}

/**
 * Maps a Prisma color row to the catalog GraphQL shape.
 */
export function mapColorToGql(color: Color): CatalogColorGql {
  return {
    id: color.id,
    name: color.name,
    slug: color.slug,
    hexCode: color.hex,
    sortOrder: null,
  }
}

/**
 * Maps a Prisma size row to the catalog GraphQL shape.
 */
export function mapSizeToGql(size: Size): CatalogSizeGql {
  return {
    id: size.id,
    name: size.name,
    slug: size.slug,
    sortOrder: size.sortOrder,
  }
}

/**
 * Maps a Prisma product type to the catalog GraphQL shape.
 */
export function mapProductTypeToGql(productType: ProductType): CatalogProductTypeGql {
  return {
    id: productType.id,
    slug: productType.slug,
    shopSlug: productType.shopSlug,
    name: productType.nameEs,
    nameEs: productType.nameEs,
    nameEn: productType.nameEn,
    description: productType.description,
    sortOrder: productType.sortOrder,
    isActive: productType.isActive,
    showInNav: productType.showInNav,
    cardImageUrl: productType.cardImageUrl,
    cardImageAlt: productType.cardImageAlt,
  }
}

/**
 * Maps a Prisma product image to the catalog GraphQL shape.
 */
export function mapProductImageToGql(image: ProductImage): CatalogProductImageGql {
  return {
    id: image.id,
    url: image.url,
    publicId: image.publicId,
    alt: image.alt,
    sortOrder: image.sortOrder,
    isPrimary: image.isPrimary,
  }
}

/**
 * Maps a Prisma variant (with color/size) to the catalog GraphQL shape.
 */
export function mapProductVariantToGql(
  variant: ProductVariant & { color: Color; size: Size },
  productBasePriceCents: number,
): CatalogProductVariantGql {
  const priceCents = variant.priceCents ?? productBasePriceCents

  return {
    id: variant.id,
    sku: variant.sku,
    variantName: `${variant.color.name} / ${variant.size.name}`,
    priceCents,
    stockQty: variant.stockQty,
    color: mapColorToGql(variant.color),
    size: mapSizeToGql(variant.size),
    isActive: variant.deletedAt === null,
  }
}

/**
 * Maps a customization rule with relations to the catalog GraphQL shape.
 */
export function mapCustomizationRuleToGql(
  rule: ProductCustomizationRule & {
    area: CustomizationArea
    option: CustomizationOption
  },
): CatalogProductCustomizationRuleGql {
  const config = parseRuleConfig(rule.configJson)
  const basePriceCents = config.priceCents ?? rule.option.priceCents

  return {
    id: rule.id,
    enabled: rule.isEnabled,
    maxWidthCm: config.maxDimensionsCm?.width ?? null,
    maxHeightCm: config.maxDimensionsCm?.height ?? null,
    minQuantity: config.minQuantity ?? null,
    basePriceCents,
    pricePerCmCents: config.pricePerCmCents ?? null,
    extraProductionDays: config.extraProductionDays ?? null,
    allowedFileTypes: parseAllowedFileTypes(config.allowedFileTypes),
    validationMessage: config.validationMessage ?? null,
    area: {
      id: rule.area.id,
      slug: rule.area.slug,
      name: rule.area.nameEs,
      description: rule.area.nameEn,
    },
    option: {
      id: rule.option.id,
      slug: rule.option.slug,
      name: rule.option.nameEs,
      basePriceCents: rule.option.priceCents,
      pricePerCmCents: config.pricePerCmCents ?? null,
    },
  }
}

/**
 * Maps the active (non-deleted) model asset to the catalog GraphQL type.
 */
export function mapProductModel3dToGql(asset: ProductModelAsset): CatalogProductModel3dGql {
  return {
    id: asset.id,
    url: asset.url,
    publicId: asset.publicId,
    fileName: asset.fileName,
    originalFileName: asset.originalFileName,
    sizeBytes: asset.sizeBytes,
    originalSizeBytes: asset.originalSizeBytes,
    compressionRatio: asset.compressionRatio,
    format: asset.format,
    metadataJson: asset.metadataJson ?? null,
    materialHintsJson: asset.materialHintsJson ?? null,
    meshHintsJson: asset.meshHintsJson ?? null,
    anchorsJson: asset.anchorsJson ?? null,
  }
}

/**
 * Maps a Prisma product graph to the catalog GraphQL product type.
 */
export function mapProductToGql(product: ProductWithRelations): CatalogProductGql {
  const activeModel = (product.modelAssets ?? []).find((a) => a.isActive && !a.deletedAt) ?? null
  return {
    id: product.id,
    slug: product.slug,
    name: product.name,
    shortDescription: product.shortDescription,
    description: product.description,
    basePriceCents: product.basePriceCents,
    currency: 'MXN',
    productionTimeDays: null,
    isCustomizable: product.customizable,
    status: product.status,
    seoTitle: product.seoTitle,
    seoDescription: product.seoDescription,
    seoImageId: product.seoImageId,
    productType: mapProductTypeToGql(product.productType),
    images: product.images.map(mapProductImageToGql),
    variants: product.variants.map((variant) =>
      mapProductVariantToGql(variant, product.basePriceCents),
    ),
    customizationRules: product.customizationRules.map(mapCustomizationRuleToGql),
    model3d: activeModel ? mapProductModel3dToGql(activeModel) : null,
  }
}
