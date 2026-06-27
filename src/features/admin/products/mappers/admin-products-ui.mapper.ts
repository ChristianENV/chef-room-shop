import { centsToPesos, formatCurrencyMXN } from '@/src/lib/formatters'

import type {
  AdminProduct,
  AdminProductFormOptions,
  AdminProductImage,
  AdminProductInput,
  AdminProductVariant,
  AdminProductVariantBatchInput,
  AdminProductsListVariables,
} from '../types'
import {
  resolveAdminProductsListFilter,
  type AdminProductsVisibilityFilter,
} from '../lib/admin-products-list-filters'
import type {
  AdminProductStatusUi,
  AdminProductImageUi,
  AdminProductTableRow,
  AdminProductVariantUi,
  ProductFormValues,
  SelectOption,
  StatusBadgeVariant,
} from '../types/admin-products-ui.types'
import { resolveProductTypeLabel } from '../types/admin-products-ui.types'

const BFF_STATUS_BY_UI: Record<AdminProductStatusUi, string> = {
  DRAFT: 'DRAFT',
  ACTIVE: 'ACTIVE',
  ARCHIVED: 'ARCHIVED',
}

const UI_STATUS_BY_BFF: Record<string, AdminProductStatusUi> = {
  DRAFT: 'DRAFT',
  ACTIVE: 'ACTIVE',
  ARCHIVED: 'ARCHIVED',
}

const STATUS_LABELS: Record<AdminProductStatusUi, string> = {
  DRAFT: 'Borrador',
  ACTIVE: 'Activo',
  ARCHIVED: 'Archivado',
}

/**
 * Human-readable product status label in Spanish.
 */
export function mapAdminProductStatusToLabel(status: string): string {
  const ui = UI_STATUS_BY_BFF[status.toUpperCase()]
  return ui ? STATUS_LABELS[ui] : status
}

/**
 * Maps BFF status to badge variant for shadcn Badge.
 */
export function mapAdminProductStatusToBadgeVariant(status: string): StatusBadgeVariant {
  const normalized = status.toUpperCase()
  if (normalized === 'ARCHIVED') return 'outline'
  if (normalized === 'DRAFT') return 'secondary'
  return 'default'
}

/**
 * Maps product type fields to Spanish label (dynamic ProductType.nameEs).
 */
export function mapAdminProductTypeToLabel(
  slug: string,
  name?: string,
  nameEs?: string | null,
): string {
  return resolveProductTypeLabel({ nameEs, name, slug })
}

function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleDateString('es-MX', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

function getPrimaryImage(product: AdminProduct): AdminProduct['images'][0] | null {
  if (product.images.length === 0) return null
  return product.images.find((img) => img.isPrimary) ?? product.images[0]
}

/**
 * Maps BFF admin product to table row for the products list.
 */
export function mapAdminProductToTableRow(product: AdminProduct): AdminProductTableRow {
  const primary = getPrimaryImage(product)
  const basePricePesos = centsToPesos(product.basePriceCents)
  const status = (UI_STATUS_BY_BFF[product.status] ?? 'DRAFT') as AdminProductStatusUi

  return {
    id: product.id,
    name: product.name,
    slug: product.slug,
    identifier: product.variants[0]?.sku ?? product.slug,
    productTypeSlug: product.productType.slug,
    productTypeLabel: mapAdminProductTypeToLabel(
      product.productType.slug,
      product.productType.name,
      product.productType.nameEs,
    ),
    basePricePesos,
    basePriceFormatted: formatCurrencyMXN(basePricePesos),
    variantCount: product.variants.length,
    customizable: product.customizable,
    status,
    statusLabel: mapAdminProductStatusToLabel(product.status),
    statusBadgeVariant: mapAdminProductStatusToBadgeVariant(product.status),
    imageUrl: primary?.url ?? null,
    imageAlt: primary?.alt ?? product.name,
    updatedAt: product.updatedAt,
    updatedAtFormatted: formatDateTime(product.updatedAt),
    product,
  }
}

/**
 * Maps BFF variant to UI form shape.
 */
export function mapAdminProductVariantToUi(variant: AdminProductVariant): AdminProductVariantUi {
  return {
    id: variant.id,
    sku: variant.sku,
    variantName: variant.variantName,
    colorId: variant.color.id,
    sizeId: variant.size.id,
    colorName: variant.color.name,
    sizeName: variant.size.name,
    pricePesos: centsToPesos(variant.priceCents),
    stockQty: variant.stockQty ?? 0,
    isActive: variant.isActive,
    isPersisted: true,
  }
}

/**
 * Maps BFF image to UI form shape.
 */
export function mapAdminProductImageToUi(image: AdminProductImage): AdminProductImageUi {
  return {
    id: image.id,
    url: image.url,
    publicId: image.publicId,
    alt: image.alt ?? '',
    sortOrder: image.sortOrder ?? 0,
    isPrimary: image.isPrimary,
    isPersisted: true,
  }
}

/**
 * Maps BFF product to form values for create/edit drawer.
 */
export function mapAdminProductToFormValues(
  product: AdminProduct | null,
  formOptions?: AdminProductFormOptions,
): ProductFormValues {
  const defaultTypeId =
    formOptions?.productTypes.find((type) => type.isActive)?.id ??
    formOptions?.productTypes[0]?.id ??
    ''

  if (!product) {
    return {
      name: '',
      slug: '',
      shortDescription: '',
      description: '',
      productTypeId: defaultTypeId,
      basePricePesos: 0,
      customizable: true,
      status: 'DRAFT',
      seoTitle: '',
      seoDescription: '',
      seoImageId: null,
      variants: [],
      images: [],
    }
  }

  return {
    name: product.name,
    slug: product.slug,
    shortDescription: product.shortDescription ?? '',
    description: product.description ?? '',
    productTypeId: product.productType.id,
    basePricePesos: centsToPesos(product.basePriceCents),
    customizable: product.customizable,
    status: (UI_STATUS_BY_BFF[product.status] ?? 'DRAFT') as AdminProductStatusUi,
    seoTitle: product.seoTitle ?? '',
    seoDescription: product.seoDescription ?? '',
    seoImageId: product.seoImageId ?? null,
    variants: product.variants.map(mapAdminProductVariantToUi),
    images: product.images.map(mapAdminProductImageToUi),
  }
}

/**
 * Maps form values to BFF AdminProductInput (pesos → centavos).
 */
export function mapFormValuesToAdminProductInput(values: ProductFormValues): AdminProductInput {
  return {
    name: values.name.trim(),
    slug: values.slug.trim() || null,
    shortDescription: values.shortDescription.trim() || null,
    description: values.description.trim() || null,
    productTypeId: values.productTypeId,
    basePriceCents: Math.round(values.basePricePesos * 100),
    customizable: values.customizable,
    status: BFF_STATUS_BY_UI[values.status],
    seoTitle: values.seoTitle.trim() || null,
    seoDescription: values.seoDescription.trim() || null,
    seoImageId: values.seoImageId,
  }
}

/**
 * Maps local form variants to a single batch input for syncAdminProductVariants.
 * Only variants with a color and size are included. New variants omit id.
 */
export function mapFormVariantsToBatchInput(
  variants: readonly AdminProductVariantUi[],
): AdminProductVariantBatchInput[] {
  return variants
    .filter((variant) => Boolean(variant.colorId) && Boolean(variant.sizeId))
    .map((variant) => ({
      id: variant.isPersisted ? variant.id : null,
      colorId: variant.colorId,
      sizeId: variant.sizeId,
      sku: variant.sku.trim() || null,
      variantName: variant.variantName?.trim() || null,
      priceCents: Math.round(variant.pricePesos * 100),
      stockQty: variant.stockQty,
      isActive: variant.isActive,
    }))
}

/**
 * Builds GraphQL list variables from UI filter state.
 */
export function buildAdminProductsListVariables(input: {
  search: string
  productTypeSlug: string
  statusFilter: string
  visibilityFilter: AdminProductsVisibilityFilter
  customizableOnly: boolean
  sortBy: string
}): AdminProductsListVariables {
  const filter: AdminProductsListVariables['filter'] = {}

  if (input.search.trim()) {
    filter.search = input.search.trim()
  }
  if (input.productTypeSlug !== 'all') {
    filter.productTypeSlug = input.productTypeSlug
  }

  const resolved = resolveAdminProductsListFilter({
    visibilityFilter: input.visibilityFilter,
    statusFilter: input.statusFilter,
  })

  if (resolved.status) {
    filter.status = resolved.status
  }
  if (resolved.includeArchived) {
    filter.includeArchived = true
  }

  if (input.customizableOnly) {
    filter.customizable = true
  }

  const sort: AdminProductsListVariables['sort'] = { direction: 'desc' }
  switch (input.sortBy) {
    case 'name':
      sort.field = 'name'
      sort.direction = 'asc'
      break
    case 'name-desc':
      sort.field = 'name'
      sort.direction = 'desc'
      break
    case 'price':
      sort.field = 'basePriceCents'
      sort.direction = 'asc'
      break
    case 'price-desc':
      sort.field = 'basePriceCents'
      sort.direction = 'desc'
      break
    case 'updated':
    default:
      sort.field = 'updatedAt'
      sort.direction = 'desc'
  }

  return {
    filter: Object.keys(filter).length > 0 ? filter : undefined,
    sort,
    limit: 100,
    offset: 0,
  }
}

/**
 * Product type options for list filters (value = slug).
 */
export function mapFormOptionsToProductTypeSlugOptions(
  options: AdminProductFormOptions,
): SelectOption[] {
  return [...options.productTypes]
    .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0))
    .map((type) => ({
      value: type.slug,
      label: resolveProductTypeLabel({
        nameEs: type.nameEs,
        name: type.name,
        slug: type.slug,
      }),
    }))
}
export { UI_STATUS_BY_BFF, BFF_STATUS_BY_UI, STATUS_LABELS }
export { ADMIN_PRODUCTS_VISIBILITY_LABELS } from '../lib/admin-products-list-filters'
export type { AdminProductsVisibilityFilter } from '../lib/admin-products-list-filters'
