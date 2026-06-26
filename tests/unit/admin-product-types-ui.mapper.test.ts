import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import {
  buildDefaultCategoryFormValues,
  mapAdminProductTypeToTableRow,
  mapCategoryFormValuesToCreateInput,
  mapProductTypeNavLabel,
  mapProductTypeStatusLabel,
  validateCategoryFormValues,
} from '@/src/features/admin/product-types/mappers/admin-product-types-ui.mapper'
import type { AdminProductType } from '@/src/features/admin/product-types/types'

const sampleProductType: AdminProductType = {
  id: '11111111-1111-4111-8111-111111111111',
  slug: 'chef-jacket',
  shopSlug: 'filipinas',
  name: 'Filipinas',
  nameEs: 'Filipinas',
  nameEn: 'Chef Jackets',
  description: 'Uniformes superiores',
  sortOrder: 10,
  isActive: true,
  showInNav: true,
  productCount: 4,
  activeProductCount: 2,
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-02T00:00:00.000Z',
}

describe('admin product types ui mapper', () => {
  it('maps AdminProductType to table row labels', () => {
    const row = mapAdminProductTypeToTableRow(sampleProductType)

    assert.equal(row.name, 'Filipinas')
    assert.equal(row.shopSlugLabel, 'filipinas')
    assert.equal(row.productCount, 4)
    assert.equal(row.activeProductCount, 2)
    assert.equal(row.statusLabel, 'Activa')
    assert.equal(row.showInNavLabel, 'Sí')
    assert.equal(row.sortOrderLabel, '10')
  })

  it('maps inactive and hidden nav labels', () => {
    assert.equal(mapProductTypeStatusLabel(false), 'Inactiva')
    assert.equal(mapProductTypeNavLabel(false), 'No')
  })

  it('builds create mutation input from form values', () => {
    const input = mapCategoryFormValuesToCreateInput({
      nameEs: 'Zapatos',
      nameEn: 'Shoes',
      slug: 'shoes',
      shopSlug: 'zapatos',
      description: 'Calzado profesional',
      sortOrder: 40,
      isActive: true,
      showInNav: true,
    })

    assert.deepEqual(input, {
      slug: 'shoes',
      shopSlug: 'zapatos',
      nameEs: 'Zapatos',
      nameEn: 'Shoes',
      description: 'Calzado profesional',
      sortOrder: 40,
      isActive: true,
      showInNav: true,
    })
  })

  it('validates slug and shopSlug format', () => {
    const invalid = validateCategoryFormValues({
      nameEs: 'Zapatos',
      nameEn: '',
      slug: 'Zapatos',
      shopSlug: 'Slug Inválido',
      description: '',
      sortOrder: 0,
      isActive: true,
      showInNav: true,
    })

    assert.equal(invalid.success, false)
    if (!invalid.success) {
      assert.match(invalid.errors.slug ?? '', /kebab-case/)
      assert.match(invalid.errors.shopSlug ?? '', /kebab-case/)
    }
  })

  it('defaults next sort order for new categories', () => {
    const defaults = buildDefaultCategoryFormValues([
      sampleProductType,
      { ...sampleProductType, id: '2', sortOrder: 30 },
    ])

    assert.equal(defaults.sortOrder, 40)
    assert.equal(defaults.isActive, true)
    assert.equal(defaults.showInNav, true)
  })
})
