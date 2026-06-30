import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, it } from 'node:test'

import {
  KEBAB_CASE_SLUG_REGEX,
  mapAdminProductOptionMutationError,
  mapGroupFormValuesToCreateInput,
  mapValueFormValuesToCreateInput,
  slugifyProductOptionLabel,
  validateProductOptionGroupFormValues,
  validateProductOptionValueFormValues,
} from '@/src/features/admin/products/mappers/admin-product-options-ui.mapper'
import {
  ARCHIVE_ADMIN_PRODUCT_OPTION_GROUP_MUTATION,
  ARCHIVE_ADMIN_PRODUCT_OPTION_VALUE_MUTATION,
} from '@/src/features/admin/products/graphql/admin-product-options.mutations'
import { ADMIN_PRODUCT_OPTION_GROUPS_QUERY } from '@/src/features/admin/products/graphql/admin-product-options.queries'
import { adminProductOptionsQueryKeys } from '@/src/features/admin/products/api/admin-product-options.query-keys'

const productId = 'prod-abc-123'
const groupId = 'group-xyz-456'

const validGroupValues = {
  name: 'Dry fit',
  slug: 'dry-fit',
  description: '',
  inputType: 'SINGLE_SELECT' as const,
  isRequired: false,
  isActive: true,
  sortOrder: 0,
}

const validValueValues = {
  label: 'Con dry fit',
  slug: 'con-dry-fit',
  description: '',
  priceDeltaPesos: 150,
  isDefault: false,
  isActive: true,
  sortOrder: 1,
}

describe('admin product options UI mapper', () => {
  it('slugifyProductOptionLabel produces kebab-case', () => {
    assert.equal(slugifyProductOptionLabel('Dry Fit Espalda'), 'dry-fit-espalda')
    assert.equal(KEBAB_CASE_SLUG_REGEX.test('dry-fit-espalda'), true)
  })

  it('validateProductOptionGroupFormValues requires name and slug', () => {
    assert.equal(
      validateProductOptionGroupFormValues({ ...validGroupValues, name: '' }),
      'El nombre del grupo es obligatorio.',
    )
    assert.equal(
      validateProductOptionGroupFormValues({ ...validGroupValues, slug: 'Bad Slug' }),
      'El slug debe estar en minúsculas y formato kebab-case.',
    )
    assert.equal(validateProductOptionGroupFormValues(validGroupValues), null)
  })

  it('validateProductOptionValueFormValues blocks negative price', () => {
    assert.equal(
      validateProductOptionValueFormValues({ ...validValueValues, priceDeltaPesos: -1 }),
      'El precio adicional no puede ser negativo.',
    )
    assert.equal(validateProductOptionValueFormValues(validValueValues), null)
  })

  it('mapGroupFormValuesToCreateInput includes productId', () => {
    const input = mapGroupFormValuesToCreateInput(productId, validGroupValues)
    assert.equal(input.productId, productId)
    assert.equal(input.slug, 'dry-fit')
    assert.equal(input.name, 'Dry fit')
    assert.equal(input.inputType, 'SINGLE_SELECT')
  })

  it('mapValueFormValuesToCreateInput converts MXN to cents', () => {
    const input = mapValueFormValuesToCreateInput(groupId, validValueValues)
    assert.equal(input.optionGroupId, groupId)
    assert.equal(input.priceDeltaCents, 15000)
    assert.equal(input.label, 'Con dry fit')
  })

  it('mapAdminProductOptionMutationError maps default conflict message', () => {
    assert.match(
      mapAdminProductOptionMutationError(new Error('Only one default value allowed')),
      /predeterminado/i,
    )
  })
})

describe('admin product options GraphQL client', () => {
  it('query loads groups for a product', () => {
    assert.match(ADMIN_PRODUCT_OPTION_GROUPS_QUERY, /adminProductOptionGroups/)
    assert.match(ADMIN_PRODUCT_OPTION_GROUPS_QUERY, /values/)
  })

  it('archive mutations are wired', () => {
    assert.match(ARCHIVE_ADMIN_PRODUCT_OPTION_GROUP_MUTATION, /archiveAdminProductOptionGroup/)
    assert.match(ARCHIVE_ADMIN_PRODUCT_OPTION_VALUE_MUTATION, /archiveAdminProductOptionValue/)
  })

  it('hooks invalidate product-scoped query keys', () => {
    const hookSource = readFileSync(
      resolve('src/features/admin/products/api/use-admin-product-options.ts'),
      'utf8',
    )

    assert.match(hookSource, /adminProductOptionsQueryKeys\.byProduct/)
    assert.deepEqual(adminProductOptionsQueryKeys.byProduct(productId, true), [
      'admin-product-options',
      'product',
      productId,
      { includeInactive: true },
    ])
  })
})

describe('admin product options tab UI wiring', () => {
  it('product form dialog includes Opciones tab', () => {
    const formSource = readFileSync(
      resolve('src/features/admin/products/product-form-dialog.tsx'),
      'utf8',
    )

    assert.match(formSource, /value="options"/)
    assert.match(formSource, /Opciones/)
    assert.match(formSource, /ProductCommercialOptionsTab/)
    assert.match(formSource, /grid-cols-4/)
  })

  it('commercial options tab shows empty state copy', () => {
    const tabSource = readFileSync(
      resolve('src/features/admin/products/components/product-commercial-options-tab.tsx'),
      'utf8',
    )

    assert.match(tabSource, /Este producto todavía no tiene opciones comerciales/)
    assert.match(tabSource, /Agregar grupo de opciones/)
    assert.match(tabSource, /Agregar valor/)
    assert.match(tabSource, /Guarda el producto primero/)
  })
})
