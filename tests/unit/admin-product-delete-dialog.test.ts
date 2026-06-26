import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, it } from 'node:test'

import {
  isProductDeleteConfirmationValid,
  PRODUCT_DELETE_DIALOG_DESCRIPTION,
} from '@/src/features/admin/products/lib/product-delete-dialog'
import { ARCHIVE_ADMIN_PRODUCT_MUTATION } from '@/src/features/admin/products/graphql/admin-products.mutations'
import { adminProductsQueryKeys } from '@/src/features/admin/products/api/admin-products.query-keys'

const productName = 'Zapato STICO Real Safety'

describe('product delete confirmation', () => {
  it('disables confirm until product name matches exactly', () => {
    assert.equal(isProductDeleteConfirmationValid('', productName), false)
    assert.equal(isProductDeleteConfirmationValid('zapato stico real safety', productName), false)
    assert.equal(isProductDeleteConfirmationValid(`${productName} `, productName), false)
    assert.equal(isProductDeleteConfirmationValid(productName, productName), true)
  })

  it('includes order history preservation copy', () => {
    assert.match(PRODUCT_DELETE_DIALOG_DESCRIPTION, /historial de órdenes se conservará/i)
    assert.match(PRODUCT_DELETE_DIALOG_DESCRIPTION, /ocultará de la tienda/i)
  })
})

describe('admin product archive mutation wiring', () => {
  it('uses archiveAdminProduct GraphQL mutation, not hard delete', () => {
    assert.match(ARCHIVE_ADMIN_PRODUCT_MUTATION, /archiveAdminProduct/)
    assert.doesNotMatch(ARCHIVE_ADMIN_PRODUCT_MUTATION, /deleteAdminProduct/)
  })

  it('archive API module calls archiveAdminProduct mutation', () => {
    const apiSource = readFileSync(
      resolve('src/features/admin/products/api/admin-products.api.ts'),
      'utf8',
    )

    assert.match(apiSource, /export async function archiveAdminProduct/)
    assert.match(apiSource, /query: ARCHIVE_ADMIN_PRODUCT_MUTATION/)
  })

  it('archive hook invalidates admin product list and detail queries', () => {
    const hookSource = readFileSync(
      resolve('src/features/admin/products/api/use-archive-admin-product-mutation.ts'),
      'utf8',
    )

    assert.match(hookSource, /archiveAdminProduct/)
    assert.match(hookSource, /adminProductsQueryKeys\.all/)
    assert.match(hookSource, /adminProductsQueryKeys\.detail\(id\)/)
    assert.deepEqual(adminProductsQueryKeys.detail('prod-1'), [
      'admin-products',
      'detail',
      'prod-1',
    ])
  })
})

describe('storefront archived product exclusion', () => {
  it('catalog service filters active non-deleted products only', () => {
    const catalogSource = readFileSync(
      resolve('src/server/graphql/modules/catalog/catalog.service.ts'),
      'utf8',
    )

    assert.match(catalogSource, /status: ProductStatus\.ACTIVE/)
    assert.match(catalogSource, /deletedAt: null/)
  })

  it('archiveAdminProduct sets ARCHIVED status and deletedAt without hard delete', () => {
    const serviceSource = readFileSync(
      resolve('src/server/graphql/modules/admin-products/admin-products.service.ts'),
      'utf8',
    )

    assert.match(serviceSource, /export async function archiveAdminProduct/)
    assert.match(serviceSource, /status: ProductStatus\.ARCHIVED/)
    assert.match(serviceSource, /deletedAt: new Date\(\)/)
    assert.doesNotMatch(serviceSource, /product\.delete\(/)
    assert.doesNotMatch(serviceSource, /deleteMany\(\{\s*where: \{ productId/)
  })
})
