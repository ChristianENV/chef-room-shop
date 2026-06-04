import type {
  ProductCustomizationRule,
  ProductDetail,
} from '@/src/features/storefront/products/types'
import type {
  CustomizerAreaOptionAvailability,
  CustomizerProductColor,
  CustomizerProductData,
  CustomizerProductModel3d,
  CustomizerProductSize,
  CustomizerProductVariant,
} from '../types/customizer-product.types'

function mapColors(product: ProductDetail): CustomizerProductColor[] {
  const byId = new Map<string, CustomizerProductColor>()
  for (const variant of product.variants) {
    if (!variant.color) continue
    byId.set(variant.color.slug, {
      id: variant.color.slug,
      name: variant.color.name,
      hex: variant.color.hexCode,
    })
  }
  return Array.from(byId.values())
}

function mapSizes(product: ProductDetail): CustomizerProductSize[] {
  const byId = new Map<string, CustomizerProductSize>()
  for (const variant of product.variants) {
    if (!variant.size) continue
    byId.set(variant.size.slug, {
      id: variant.size.slug,
      name: variant.size.name.toUpperCase(),
    })
  }
  return Array.from(byId.values())
}

function mapVariants(product: ProductDetail): CustomizerProductVariant[] {
  return product.variants
    .filter((variant) => variant.color && variant.size)
    .map((variant) => ({
      id: variant.id,
      colorId: variant.color!.slug,
      sizeId: variant.size!.slug,
      stockQty: variant.stockQty ?? 0,
      isActive: variant.isActive,
    }))
}

function mapRuleAvailability(
  rules: ProductCustomizationRule[],
): CustomizerAreaOptionAvailability[] {
  return rules.map((rule) => ({
    areaSlug: rule.area.slug,
    optionSlug: rule.option.slug,
    enabled: rule.enabled,
  }))
}

export function mapProductToCustomizer(
  product: ProductDetail,
  rules: ProductCustomizationRule[],
): CustomizerProductData {
  const colors = mapColors(product)
  const sizes = mapSizes(product)
  const variants = mapVariants(product)

  const rawModel = product.model3d
  const model3d: CustomizerProductModel3d | null = rawModel
    ? {
        id: rawModel.id,
        url: rawModel.url,
        publicId: rawModel.publicId,
        fileName: rawModel.fileName,
        sizeBytes: rawModel.sizeBytes,
        format: rawModel.format,
        materialHintsJson: rawModel.materialHintsJson ?? null,
        meshHintsJson: rawModel.meshHintsJson ?? null,
        anchorsJson: rawModel.anchorsJson ?? null,
      }
    : null

  return {
    id: product.id,
    name: product.name,
    slug: product.slug,
    productTypeSlug: product.productType.slug,
    productTypeName: product.productType.name,
    basePriceCents: product.basePriceCents,
    images: product.images,
    colors,
    sizes,
    variants,
    rules,
    customizationAreas: Array.from(
      new Map(rules.map((rule) => [rule.area.slug, rule.area])).values(),
    ).map((area) => ({ slug: area.slug, name: area.name })),
    customizationAvailability: mapRuleAvailability(rules),
    model3d,
  }
}
