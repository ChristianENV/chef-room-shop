import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, it } from 'node:test'

import {
  resolveAdminProductsListFilter,
  ADMIN_PRODUCTS_VISIBILITY_LABELS,
} from '@/src/features/admin/products/lib/admin-products-list-filters'
import { buildAdminProductsListVariables } from '@/src/features/admin/products/mappers/admin-products-ui.mapper'
import {
  PRODUCT_FORM_CLOSE_BLOCKED_MESSAGE,
  PRODUCT_FORM_SAVE_STATUS_MESSAGE,
  resolveProductFormPendingState,
  shouldBlockProductFormDialogClose,
} from '@/src/features/admin/products/lib/product-form-dialog-guards'

describe('admin products list visibility filters', () => {
  it('defaults active catalog to ACTIVE without archived rows', () => {
    assert.deepEqual(
      resolveAdminProductsListFilter({ visibilityFilter: 'active', statusFilter: 'ACTIVE' }),
      { status: 'ACTIVE', includeArchived: false },
    )
    assert.deepEqual(
      resolveAdminProductsListFilter({ visibilityFilter: 'active', statusFilter: 'all' }),
      { status: 'ACTIVE', includeArchived: false },
    )
  })

  it('keeps drafts accessible from active visibility with status filter', () => {
    assert.deepEqual(
      resolveAdminProductsListFilter({ visibilityFilter: 'active', statusFilter: 'DRAFT' }),
      { status: 'DRAFT', includeArchived: false },
    )
  })

  it('shows hidden products with ARCHIVED status and includeArchived', () => {
    assert.deepEqual(
      resolveAdminProductsListFilter({ visibilityFilter: 'hidden', statusFilter: 'ARCHIVED' }),
      { status: 'ARCHIVED', includeArchived: true },
    )
  })

  it('allows all products when visibility is all', () => {
    const resolved = resolveAdminProductsListFilter({
      visibilityFilter: 'all',
      statusFilter: 'all',
    })
    assert.equal(resolved.includeArchived, true)
    assert.equal(resolved.status, undefined)

    assert.deepEqual(
      resolveAdminProductsListFilter({ visibilityFilter: 'all', statusFilter: 'DRAFT' }),
      { status: 'DRAFT', includeArchived: true },
    )
  })

  it('builds list variables for default active products page', () => {
    const variables = buildAdminProductsListVariables({
      search: '',
      productTypeSlug: 'all',
      statusFilter: 'ACTIVE',
      visibilityFilter: 'active',
      customizableOnly: false,
      sortBy: 'updated',
    })

    assert.deepEqual(variables.filter, { status: 'ACTIVE' })
    assert.equal('includeArchived' in (variables.filter ?? {}), false)
  })

  it('builds list variables for hidden products page', () => {
    const variables = buildAdminProductsListVariables({
      search: '',
      productTypeSlug: 'all',
      statusFilter: 'ARCHIVED',
      visibilityFilter: 'hidden',
      customizableOnly: false,
      sortBy: 'updated',
    })

    assert.deepEqual(variables.filter, { status: 'ARCHIVED', includeArchived: true })
  })

  it('exposes Spanish visibility labels', () => {
    assert.equal(ADMIN_PRODUCTS_VISIBILITY_LABELS.active, 'Activos')
    assert.equal(ADMIN_PRODUCTS_VISIBILITY_LABELS.hidden, 'Ocultos')
    assert.equal(ADMIN_PRODUCTS_VISIBILITY_LABELS.all, 'Todos')
  })
})

describe('product form dialog pending guards', () => {
  it('blocks close while save or uploads are pending', () => {
    assert.equal(shouldBlockProductFormDialogClose(true, false), true)
    assert.equal(shouldBlockProductFormDialogClose(false, false), false)
    assert.equal(shouldBlockProductFormDialogClose(true, true), false)
  })

  it('aggregates pending state from save and uploaders', () => {
    assert.equal(
      resolveProductFormPendingState({
        isSaving: false,
        isImageUploadBusy: false,
        isModel3dBusy: false,
      }),
      false,
    )
    assert.equal(
      resolveProductFormPendingState({
        isSaving: true,
        isImageUploadBusy: false,
        isModel3dBusy: false,
      }),
      true,
    )
    assert.equal(
      resolveProductFormPendingState({
        isSaving: false,
        isImageUploadBusy: true,
        isModel3dBusy: false,
      }),
      true,
    )
  })

  it('includes Spanish save and close-blocked messages', () => {
    assert.match(PRODUCT_FORM_SAVE_STATUS_MESSAGE, /Guardando producto/i)
    assert.match(PRODUCT_FORM_CLOSE_BLOCKED_MESSAGE, /Espera a que termine el guardado/i)
  })
})

describe('product form dialog UI wiring', () => {
  it('disables submit and shows Guardando while saving', () => {
    const source = readFileSync(
      resolve('src/features/admin/products/product-form-dialog.tsx'),
      'utf8',
    )

    assert.match(source, /data-testid="admin-product-form-submit"/)
    assert.match(source, /disabled=\{isFormPending\}/)
    assert.match(source, /Guardando\.\.\./)
    assert.match(source, /showCloseButton=\{!formPending\}/)
    assert.match(source, /onPointerDownOutside/)
    assert.match(source, /onEscapeKeyDown/)
  })
})

describe('product model 3d uploader theme', () => {
  it('uses theme-aware classes instead of hardcoded light backgrounds', () => {
    const source = readFileSync(
      resolve('src/features/admin/products/components/product-model-3d-uploader.tsx'),
      'utf8',
    )

    assert.doesNotMatch(source, /#fafaf8/)
    assert.doesNotMatch(source, /bg-white/)
    assert.match(source, /bg-card|bg-muted/)
    assert.match(source, /border-border/)
    assert.match(source, /onBusyChange/)
  })
})

describe('admin products page default filters', () => {
  it('defaults list page to active visibility and ACTIVE status', () => {
    const source = readFileSync(
      resolve('src/app/(admin)/admin/(protected)/products/page.tsx'),
      'utf8',
    )

    assert.match(source, /useState<AdminProductsVisibilityFilter>\('active'\)/)
    assert.match(source, /useState\('ACTIVE'\)/)
    assert.match(source, /visibilityFilter/)
  })
})
