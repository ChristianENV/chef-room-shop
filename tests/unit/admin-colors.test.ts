import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, it } from 'node:test'

import { SEED_FABRIC_ONLY_COLORS, SEED_PRODUCT_COLORS } from '@/prisma/seed-colors.data'
import { buildVariantColorSelectOptions } from '@/src/features/admin/products/lib/variant-color-options'
import {
  createAdminColorInputSchema,
  HEX_COLOR_REGEX,
  KEBAB_CASE_SLUG_REGEX,
} from '@/src/server/graphql/modules/admin-colors/admin-colors.validation'
import {
  filterActiveFabricColors,
  filterActiveProductColors,
  hasAtLeastOneColorScope,
  isFabricColor,
  isProductColor,
} from '@/src/lib/color-scopes'
import { getCatalogColorSlugForFabricColor } from '@/src/features/storefront/customizer/constants/fabric-colors'
import { getAllowedVariantColorSlugsForProductType } from '@/src/config/catalog-colors'

describe('seed color data', () => {
  it('backfills product colors with fabric and product scopes', () => {
    const black = SEED_PRODUCT_COLORS.find((color) => color.slug === 'black')
    const white = SEED_PRODUCT_COLORS.find((color) => color.slug === 'white')

    assert.ok(black)
    assert.equal(black.isFabricColor, true)
    assert.equal(black.isProductColor, true)
    assert.equal(black.isGeneralColor, true)

    assert.ok(white)
    assert.equal(white.isFabricColor, true)
    assert.equal(white.isProductColor, true)
    assert.equal(white.isGeneralColor, false)
  })

  it('seeds fabric-only customizer colors without product scope', () => {
    assert.ok(SEED_FABRIC_ONLY_COLORS.length >= 10)

    for (const color of SEED_FABRIC_ONLY_COLORS) {
      assert.equal(color.isFabricColor, true)
      assert.equal(color.isProductColor, false)
      assert.equal(color.isGeneralColor, false)
    }

    const chefRoomBlue = SEED_FABRIC_ONLY_COLORS.find((color) => color.slug === 'chef-room-blue')
    assert.ok(chefRoomBlue)
    assert.equal(chefRoomBlue.isProductColor, false)
  })

  it('does not duplicate product color slugs in fabric-only seed rows', () => {
    const productSlugs = new Set(SEED_PRODUCT_COLORS.map((color) => color.slug))
    for (const color of SEED_FABRIC_ONLY_COLORS) {
      assert.equal(productSlugs.has(color.slug), false)
    }
  })
})

describe('color scope helpers', () => {
  it('identifies fabric, product and general scopes', () => {
    assert.equal(isFabricColor({ isFabricColor: true }), true)
    assert.equal(isProductColor({ isProductColor: true }), true)
    assert.equal(
      hasAtLeastOneColorScope({
        isFabricColor: false,
        isProductColor: true,
        isGeneralColor: false,
      }),
      true,
    )
    assert.equal(
      hasAtLeastOneColorScope({
        isFabricColor: false,
        isProductColor: false,
        isGeneralColor: false,
      }),
      false,
    )
  })

  it('filters active product and fabric colors', () => {
    const rows = [
      { isFabricColor: true, isProductColor: false, isGeneralColor: false, isActive: true },
      { isFabricColor: true, isProductColor: true, isGeneralColor: false, isActive: false },
      { isFabricColor: false, isProductColor: true, isGeneralColor: true, isActive: true },
    ]

    assert.equal(filterActiveFabricColors(rows).length, 1)
    assert.equal(filterActiveProductColors(rows).length, 1)
  })
})

describe('admin color validation', () => {
  it('validates slug format', () => {
    assert.equal(KEBAB_CASE_SLUG_REGEX.test('olive-green'), true)
    assert.equal(KEBAB_CASE_SLUG_REGEX.test('Olive Green'), false)
  })

  it('validates hex format', () => {
    assert.equal(HEX_COLOR_REGEX.test('#AABBCC'), true)
    assert.equal(HEX_COLOR_REGEX.test('AABBCC'), false)
  })

  it('requires at least one scope on create', () => {
    assert.throws(() =>
      createAdminColorInputSchema.parse({
        slug: 'test-color',
        name: 'Test',
        hex: '#112233',
        isFabricColor: false,
        isProductColor: false,
        isGeneralColor: false,
      }),
    )
  })

  it('accepts valid create input', () => {
    const parsed = createAdminColorInputSchema.parse({
      slug: 'olive-green',
      name: 'Verde olivo',
      hex: '#4B5A3C',
      isFabricColor: true,
      isProductColor: false,
      isGeneralColor: false,
    })

    assert.equal(parsed.slug, 'olive-green')
    assert.equal(parsed.hex, '#4B5A3C')
    assert.equal(parsed.isFabricColor, true)
  })
})

describe('variant color selector by product type scopes', () => {
  const colors = [
    {
      id: 'color-black',
      name: 'Negro',
      slug: 'black',
      hexCode: '#111111',
      isFabricColor: true,
      isProductColor: true,
      isGeneralColor: true,
      isActive: true,
      sortOrder: 10,
    },
    {
      id: 'color-olive',
      name: 'Verde olivo',
      slug: 'olive-green',
      hexCode: '#4B5A3C',
      isFabricColor: true,
      isProductColor: false,
      isGeneralColor: false,
      isActive: true,
      sortOrder: 100,
    },
    {
      id: 'color-inactive-white',
      name: 'Blanco',
      slug: 'white',
      hexCode: '#FFFFFF',
      isFabricColor: true,
      isProductColor: true,
      isGeneralColor: false,
      isActive: false,
      sortOrder: 20,
    },
  ] as const

  it('includes active fabric-only colors for chef-jacket variant dropdown', () => {
    const options = buildVariantColorSelectOptions({
      colors,
      productTypeSlug: 'chef-jacket',
    })

    assert.deepEqual(options.map((row) => row.value).sort(), ['color-black', 'color-olive'])
  })

  it('excludes fabric-only colors from apron variant dropdown', () => {
    const options = buildVariantColorSelectOptions({
      colors,
      productTypeSlug: 'apron',
    })

    assert.deepEqual(
      options.map((row) => row.value),
      ['color-black'],
    )
  })

  it('excludes inactive product colors for new variants', () => {
    const options = buildVariantColorSelectOptions({
      colors,
      productTypeSlug: 'chef-jacket',
    })

    assert.equal(
      options.some((row) => row.value === 'color-inactive-white'),
      false,
    )
  })

  it('keeps legacy inactive selection visible when editing', () => {
    const options = buildVariantColorSelectOptions({
      colors,
      productTypeSlug: 'chef-jacket',
      existingVariantColorIds: ['color-inactive-white'],
    })

    assert.ok(options.some((row) => row.value === 'color-inactive-white'))
  })
})

describe('product type variant rules unchanged', () => {
  it('keeps canonical allowed slugs per product type', () => {
    assert.deepEqual(getAllowedVariantColorSlugsForProductType('chef-jacket'), [
      'black',
      'white',
      'chef-blue',
      'warm-gray',
    ])
    assert.deepEqual(getAllowedVariantColorSlugsForProductType('apron'), ['black', 'white'])
    assert.deepEqual(getAllowedVariantColorSlugsForProductType('pants'), ['black'])
    assert.deepEqual(getAllowedVariantColorSlugsForProductType('shoes'), ['black'])
  })
})

describe('customizer fabric mapping unchanged', () => {
  it('maps chef-room-blue to chef-blue catalog slug', () => {
    assert.equal(getCatalogColorSlugForFabricColor('chef-room-blue'), 'chef-blue')
  })
})

describe('admin colors GraphQL wiring', () => {
  it('uses archiveAdminColor mutation and admin auth guard', () => {
    const serviceSource = readFileSync(
      resolve('src/server/graphql/modules/admin-colors/admin-colors.service.ts'),
      'utf8',
    )
    const resolverSource = readFileSync(
      resolve('src/server/graphql/resolvers/admin-colors.resolver.ts'),
      'utf8',
    )

    assert.match(serviceSource, /requireAdminGraphQL/)
    assert.match(serviceSource, /archiveAdminColor/)
    assert.match(serviceSource, /assertCanArchiveColor/)
    assert.match(resolverSource, /adminColors/)
    assert.match(resolverSource, /createAdminColor/)
  })

  it('blocks archive when color is used by active variants', () => {
    const guardSource = readFileSync(
      resolve('src/server/graphql/modules/admin-colors/admin-colors.guards.ts'),
      'utf8',
    )

    assert.match(guardSource, /deletedAt: null/)
    assert.match(guardSource, /ProductStatus.ACTIVE/)
  })
})

describe('admin colors UI route', () => {
  it('registers /admin/colors nav item', () => {
    const navSource = readFileSync(resolve('src/config/navigation.admin.ts'), 'utf8')
    assert.match(navSource, /Colores/)
    assert.match(navSource, /adminColors/)
  })
})
