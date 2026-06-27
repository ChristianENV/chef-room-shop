'use client'

import { useMemo, useState } from 'react'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

import { ProductVariantColorSelector } from './product-variant-color-selector'
import { ProductVariantList } from './product-variant-list'
import { ProductVariantMatrix } from './product-variant-matrix'
import type { AdminProductFormOptions } from '../types'
import type {
  AdminProductFormSelectOptions,
  AdminProductVariantUi,
} from '../types/admin-products-ui.types'
import { resolveProductTypeSlugById } from '../lib/variant-color-options'
import {
  applyBasePriceToEmptyVariants,
  applyInitialStockToNewVariants,
  buildVariantMatrixSizeColumns,
  createVariantForCell,
  findVariantAt,
  generateMissingVariants,
  removeVariantAt,
  resolveProductSlugForVariants,
  sortVariantsForDisplay,
  upsertVariantPatch,
} from '../lib/variant-matrix'
import {
  buildVariantColorPoolOptions,
  buildVisibleMatrixColorRows,
  canRemoveColorFromMatrix,
  resolveDefaultMatrixColorIds,
  resolveVariantColorIds,
  resolveVisibleMatrixColorIds,
} from '../lib/variant-matrix-colors'
import {
  VARIANT_MATRIX_APPLY_BASE_PRICE,
  VARIANT_MATRIX_EMPTY_PRODUCT_TYPE,
  VARIANT_MATRIX_EMPTY_SIZES,
  VARIANT_MATRIX_GENERATE_MISSING,
  VARIANT_MATRIX_INITIAL_STOCK,
} from '../lib/variant-matrix-messages'

type ProductVariantEditorProps = {
  variants: AdminProductVariantUi[]
  productName: string
  productSlug: string
  productTypeId: string
  basePricePesos: number
  selectOptions: AdminProductFormSelectOptions
  formOptions: AdminProductFormOptions
  disabled?: boolean
  newTempId: () => string
  onVariantsChange: (variants: AdminProductVariantUi[]) => void
  onRemovePersistedVariant: (variant: AdminProductVariantUi) => Promise<boolean>
}

export function ProductVariantEditor({
  variants,
  productName,
  productSlug,
  productTypeId,
  basePricePesos,
  selectOptions,
  formOptions,
  disabled = false,
  newTempId,
  onVariantsChange,
  onRemovePersistedVariant,
}: ProductVariantEditorProps) {
  const productTypeSlug = resolveProductTypeSlugById(formOptions.productTypes, productTypeId)
  const [selectedColorIds, setSelectedColorIds] = useState<string[]>([])

  const colorPool = useMemo(
    () =>
      buildVariantColorPoolOptions({
        colors: formOptions.colors,
        productTypeSlug,
      }),
    [formOptions.colors, productTypeSlug],
  )

  const defaultColorIds = useMemo(() => {
    if (!productTypeSlug) return []
    return resolveDefaultMatrixColorIds(productTypeSlug, formOptions.colors)
  }, [productTypeSlug, formOptions.colors])

  const variantColorIds = useMemo(() => resolveVariantColorIds(variants), [variants])

  const visibleColorIds = useMemo(() => {
    if (!productTypeSlug) return []
    return resolveVisibleMatrixColorIds({
      productTypeSlug,
      colors: formOptions.colors,
      variants,
      selectedColorIds,
    })
  }, [productTypeSlug, formOptions.colors, variants, selectedColorIds])

  const matrixColors = useMemo(() => {
    if (!productTypeSlug) return []
    return buildVisibleMatrixColorRows({
      visibleColorIds,
      colors: formOptions.colors,
      productTypeSlug,
    })
  }, [visibleColorIds, formOptions.colors, productTypeSlug])

  const matrixSizes = useMemo(
    () => buildVariantMatrixSizeColumns(selectOptions.sizes, formOptions.sizes),
    [selectOptions.sizes, formOptions.sizes],
  )

  const sizeMeta = useMemo(() => {
    const map: Record<string, { name: string; slug: string }> = {}
    formOptions.sizes.forEach((size) => {
      map[size.id] = { name: size.name, slug: size.slug }
    })
    return map
  }, [formOptions.sizes])

  const invalidColorIds = useMemo(
    () =>
      new Set(
        matrixColors.filter((color) => color.isInvalidForProductType).map((color) => color.value),
      ),
    [matrixColors],
  )

  const sortedVariants = useMemo(
    () =>
      sortVariantsForDisplay(
        variants,
        matrixColors.map((color) => color.value),
        matrixSizes.map((size) => size.value),
      ),
    [variants, matrixColors, matrixSizes],
  )

  const resolvedProductSlug = resolveProductSlugForVariants(productSlug, productName)

  const setVariants = (next: AdminProductVariantUi[]) => {
    onVariantsChange(next)
  }

  const handleApplySelectedColors = (nextSelectedColorIds: string[]) => {
    setSelectedColorIds(nextSelectedColorIds)
  }

  const handleRemoveVisibleColor = (colorId: string) => {
    if (!canRemoveColorFromMatrix({ colorId, variants })) return
    if (!selectedColorIds.includes(colorId)) return
    setSelectedColorIds((current) => current.filter((id) => id !== colorId))
  }

  const canRemoveVisibleColor = (colorId: string) => {
    if (!canRemoveColorFromMatrix({ colorId, variants })) return false
    return selectedColorIds.includes(colorId)
  }

  const handleToggleCell = async (colorId: string, sizeId: string, enabled: boolean) => {
    const existing = findVariantAt(variants, colorId, sizeId)

    if (enabled) {
      if (existing) {
        setVariants(upsertVariantPatch(variants, colorId, sizeId, { isActive: true }))
        return
      }

      const color = selectOptions.colorMeta[colorId]
      const size = sizeMeta[sizeId]
      if (!color || !size) return

      setVariants([
        ...variants,
        createVariantForCell({
          colorId,
          sizeId,
          colorName: color.name,
          sizeName: size.name,
          colorSlug: color.slug,
          sizeSlug: size.slug,
          productSlug: resolvedProductSlug,
          basePricePesos,
          newId: newTempId,
        }),
      ])
      return
    }

    if (!existing) return

    if (existing.isPersisted) {
      setVariants(upsertVariantPatch(variants, colorId, sizeId, { isActive: false }))
      return
    }

    setVariants(removeVariantAt(variants, colorId, sizeId))
  }

  const handleChangeCell = (
    colorId: string,
    sizeId: string,
    patch: Partial<AdminProductVariantUi>,
  ) => {
    setVariants(upsertVariantPatch(variants, colorId, sizeId, patch))
  }

  const handleChangeById = (variantId: string, patch: Partial<AdminProductVariantUi>) => {
    setVariants(
      variants.map((variant) => (variant.id === variantId ? { ...variant, ...patch } : variant)),
    )
  }

  const handleRemoveById = async (variantId: string) => {
    const index = variants.findIndex((variant) => variant.id === variantId)
    if (index < 0) return

    const variant = variants[index]!
    if (variant.isPersisted) {
      const ok = await onRemovePersistedVariant(variant)
      if (!ok) return
    }

    setVariants(variants.filter((item) => item.id !== variantId))
  }

  const handleGenerateMissing = () => {
    setVariants(
      generateMissingVariants({
        variants,
        colors: matrixColors.filter((row) => !row.isInvalidForProductType),
        sizes: matrixSizes,
        colorMeta: selectOptions.colorMeta,
        sizeMeta,
        productSlug: resolvedProductSlug,
        basePricePesos,
        newId: newTempId,
      }),
    )
  }

  const handleApplyBasePrice = () => {
    setVariants(applyBasePriceToEmptyVariants(variants, basePricePesos))
  }

  const handleApplyInitialStock = () => {
    setVariants(applyInitialStockToNewVariants(variants, 0))
  }

  if (!selectOptions.hasProductTypeSelected || !productTypeSlug) {
    return (
      <Card className="border-dashed" data-testid="admin-product-variant-empty">
        <CardContent className="py-8 text-center">
          <p className="font-serif text-sm text-muted-foreground">
            {VARIANT_MATRIX_EMPTY_PRODUCT_TYPE}
          </p>
        </CardContent>
      </Card>
    )
  }

  if (matrixSizes.length === 0) {
    return (
      <Card className="border-dashed">
        <CardContent className="py-8 text-center">
          <p className="font-serif text-sm text-muted-foreground">{VARIANT_MATRIX_EMPTY_SIZES}</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4" data-testid="admin-product-variant-editor">
      <ProductVariantColorSelector
        pool={colorPool}
        visibleColorIds={visibleColorIds}
        defaultColorIds={defaultColorIds}
        variantColorIds={variantColorIds}
        disabled={disabled}
        onApplySelectedColors={handleApplySelectedColors}
        onRemoveVisibleColor={handleRemoveVisibleColor}
        canRemoveVisibleColor={canRemoveVisibleColor}
      />

      <div className="flex flex-wrap gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={disabled || matrixColors.length === 0}
          onClick={handleGenerateMissing}
          data-testid="admin-product-variant-generate-missing"
        >
          {VARIANT_MATRIX_GENERATE_MISSING}
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={disabled}
          onClick={handleApplyBasePrice}
          data-testid="admin-product-variant-apply-base-price"
        >
          {VARIANT_MATRIX_APPLY_BASE_PRICE}
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={disabled}
          onClick={handleApplyInitialStock}
          data-testid="admin-product-variant-apply-initial-stock"
        >
          {VARIANT_MATRIX_INITIAL_STOCK}
        </Button>
      </div>

      {matrixColors.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="py-6 text-center">
            <p className="font-serif text-sm text-muted-foreground">
              Selecciona colores para mostrar filas en la matriz.
            </p>
          </CardContent>
        </Card>
      ) : (
        <ProductVariantMatrix
          colors={matrixColors}
          sizes={matrixSizes}
          variants={variants}
          disabled={disabled}
          onToggleCell={(colorId, sizeId, enabled) =>
            void handleToggleCell(colorId, sizeId, enabled)
          }
          onChangeCell={handleChangeCell}
        />
      )}

      <ProductVariantList
        variants={sortedVariants}
        colorMeta={selectOptions.colorMeta}
        invalidColorIds={invalidColorIds}
        disabled={disabled}
        onChange={handleChangeById}
        onRemove={(variantId) => void handleRemoveById(variantId)}
      />

      {variants.length === 0 ? (
        <Card className="border-dashed lg:hidden">
          <CardContent className="py-6 text-center">
            <p className="font-serif text-sm text-muted-foreground">
              Usa la matriz en escritorio o genera variantes faltantes.
            </p>
          </CardContent>
        </Card>
      ) : null}
    </div>
  )
}
