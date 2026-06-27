import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, it } from 'node:test'

import { resolveProductFormPendingState } from '@/src/features/admin/products/lib/product-form-dialog-guards'
import { mapFormVariantsToBatchInput } from '@/src/features/admin/products/mappers/admin-products-ui.mapper'
import type { AdminProductVariantUi } from '@/src/features/admin/products/types/admin-products-ui.types'

function makeVariant(overrides: Partial<AdminProductVariantUi>): AdminProductVariantUi {
  return {
    id: overrides.id ?? 'temp-1',
    sku: overrides.sku ?? 'CR-A',
    variantName: overrides.variantName ?? null,
    colorId: overrides.colorId ?? 'color-1',
    sizeId: overrides.sizeId ?? 'size-1',
    colorName: '',
    sizeName: '',
    pricePesos: overrides.pricePesos ?? 199,
    stockQty: overrides.stockQty ?? 5,
    isActive: overrides.isActive ?? true,
    isPersisted: overrides.isPersisted ?? false,
  }
}

describe('resolveProductFormPendingState', () => {
  it('is busy while batch variant save is pending', () => {
    assert.equal(
      resolveProductFormPendingState({
        isSaving: false,
        isSavingVariantsBatch: true,
        isImageUploadBusy: false,
        isModel3dBusy: false,
      }),
      true,
    )
  })

  it('is idle when nothing is pending', () => {
    assert.equal(
      resolveProductFormPendingState({
        isSaving: false,
        isSavingVariantsBatch: false,
        isImageUploadBusy: false,
        isModel3dBusy: false,
      }),
      false,
    )
  })
})

describe('mapFormVariantsToBatchInput', () => {
  it('maps persisted variants with id and new variants without id', () => {
    const batch = mapFormVariantsToBatchInput([
      makeVariant({ id: 'v1', isPersisted: true, pricePesos: 100, stockQty: 3 }),
      makeVariant({ id: 'temp-2', isPersisted: false, colorId: 'color-2', stockQty: 8 }),
    ])

    assert.equal(batch.length, 2)
    assert.equal(batch[0]?.id, 'v1')
    assert.equal(batch[0]?.priceCents, 10000)
    assert.equal(batch[0]?.stockQty, 3)
    assert.equal(batch[1]?.id, null)
    assert.equal(batch[1]?.stockQty, 8)
  })

  it('skips variants missing color or size', () => {
    const batch = mapFormVariantsToBatchInput([
      makeVariant({ id: 'v1', colorId: '', sizeId: 'size-1' }),
    ])
    assert.equal(batch.length, 0)
  })
})

describe('product form save flow source', () => {
  const dialogSource = readFileSync(
    resolve('src/features/admin/products/product-form-dialog.tsx'),
    'utf8',
  )

  it('saves variants through the single batch mutation', () => {
    assert.match(dialogSource, /useSyncAdminProductVariantsMutation/)
    assert.match(dialogSource, /syncVariants\.mutateAsync/)
    assert.match(dialogSource, /mapFormVariantsToBatchInput/)
  })

  it('no longer performs per-variant upsert calls in the save flow', () => {
    assert.doesNotMatch(dialogSource, /upsertVariant\.mutateAsync/)
    assert.doesNotMatch(dialogSource, /useUpsertAdminProductVariantMutation/)
  })

  it('renders a full-dialog saving overlay and blocks close while pending', () => {
    assert.match(dialogSource, /ProductFormSavingOverlay/)
    assert.match(dialogSource, /formPending \? <ProductFormSavingOverlay/)
    assert.match(dialogSource, /showCloseButton=\{!formPending\}/)
  })
})

describe('saving overlay source', () => {
  it('exposes the overlay test id and stage message', () => {
    const overlaySource = readFileSync(
      resolve('src/features/admin/products/components/product-form-saving-overlay.tsx'),
      'utf8',
    )
    assert.match(overlaySource, /admin-product-form-saving-overlay/)
    assert.match(overlaySource, /admin-product-form-saving-stage/)
  })
})

describe('admin products api source', () => {
  it('exposes a single batch sync operation', () => {
    const apiSource = readFileSync(
      resolve('src/features/admin/products/api/admin-products.api.ts'),
      'utf8',
    )
    assert.match(apiSource, /export async function syncAdminProductVariants/)
  })
})
