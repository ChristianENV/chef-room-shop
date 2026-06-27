import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import { GraphQLError } from 'graphql'

import {
  VARIANT_COLOR_NOT_ALLOWED_MESSAGE,
  VARIANT_COLOR_UNKNOWN_MESSAGE,
  PRODUCT_TYPE_VARIANT_CONFLICT_MESSAGE,
} from '@/src/config/catalog-color-messages'
import {
  assertActiveVariantsMatchProductType,
  assertVariantColorAllowedForProductType,
} from '@/src/server/graphql/modules/admin-products/admin-products.variant-colors'

function assertGraphQLError(error: unknown, message: string): void {
  assert.ok(error instanceof GraphQLError)
  assert.equal(error.message, message)
  assert.equal(error.extensions?.code, 'BAD_USER_INPUT')
}

const chefBlue = {
  slug: 'chef-blue',
  name: 'Azul Chef Room',
  hexCode: '#2B3280',
  isFabricColor: true,
  isProductColor: true,
  isActive: true,
}

const oliveGreen = {
  slug: 'olive-green',
  name: 'Verde olivo',
  hexCode: '#4B5A3C',
  isFabricColor: true,
  isProductColor: false,
  isActive: true,
}

describe('assertVariantColorAllowedForProductType', () => {
  it('allows chef-jacket + chef-blue', () => {
    assert.doesNotThrow(() =>
      assertVariantColorAllowedForProductType({
        productTypeSlug: 'chef-jacket',
        color: chefBlue,
      }),
    )
  })

  it('allows chef-jacket + active fabric-only color', () => {
    assert.doesNotThrow(() =>
      assertVariantColorAllowedForProductType({
        productTypeSlug: 'chef-jacket',
        color: oliveGreen,
      }),
    )
  })

  it('rejects apron + chef-blue', () => {
    assert.throws(
      () =>
        assertVariantColorAllowedForProductType({
          productTypeSlug: 'apron',
          color: chefBlue,
        }),
      (error) => {
        assertGraphQLError(error, VARIANT_COLOR_NOT_ALLOWED_MESSAGE)
        return true
      },
    )
  })

  it('rejects apron + fabric-only color', () => {
    assert.throws(
      () =>
        assertVariantColorAllowedForProductType({
          productTypeSlug: 'apron',
          color: oliveGreen,
        }),
      (error) => {
        assertGraphQLError(error, VARIANT_COLOR_NOT_ALLOWED_MESSAGE)
        return true
      },
    )
  })

  it('rejects shoes + warm-gray', () => {
    assert.throws(
      () =>
        assertVariantColorAllowedForProductType({
          productTypeSlug: 'shoes',
          color: {
            slug: 'warm-gray',
            name: 'Gris cálido',
            hexCode: '#E2E0DB',
            isFabricColor: true,
            isProductColor: true,
            isActive: true,
          },
        }),
      (error) => {
        assertGraphQLError(error, VARIANT_COLOR_NOT_ALLOWED_MESSAGE)
        return true
      },
    )
  })

  it('rejects pants + white', () => {
    assert.throws(
      () =>
        assertVariantColorAllowedForProductType({
          productTypeSlug: 'pants',
          color: {
            slug: 'white',
            name: 'Blanco',
            hexCode: '#FFFFFF',
            isFabricColor: true,
            isProductColor: true,
            isActive: true,
          },
        }),
      (error) => {
        assertGraphQLError(error, VARIANT_COLOR_NOT_ALLOWED_MESSAGE)
        return true
      },
    )
  })

  it('rejects unknown product types for all colors', () => {
    assert.throws(
      () =>
        assertVariantColorAllowedForProductType({
          productTypeSlug: 'unknown-type',
          color: {
            slug: 'black',
            name: 'Negro',
            hexCode: '#111111',
            isFabricColor: true,
            isProductColor: true,
            isActive: true,
          },
        }),
      (error) => {
        assertGraphQLError(error, VARIANT_COLOR_NOT_ALLOWED_MESSAGE)
        return true
      },
    )
  })

  it('rejects invalid color records', () => {
    assert.throws(
      () =>
        assertVariantColorAllowedForProductType({
          productTypeSlug: 'chef-jacket',
          color: {
            slug: 'olive-green',
            name: '',
            hexCode: '#4B5A3C',
            isFabricColor: true,
            isProductColor: false,
            isActive: true,
          },
        }),
      (error) => {
        assertGraphQLError(error, VARIANT_COLOR_UNKNOWN_MESSAGE)
        return true
      },
    )
  })
})

describe('assertActiveVariantsMatchProductType', () => {
  it('rejects product type change when variants conflict', async () => {
    const prisma = {
      productVariant: {
        findMany: async () => [
          {
            color: {
              slug: 'chef-blue',
              name: 'Azul Chef Room',
              hex: '#2B3280',
              isFabricColor: true,
              isProductColor: true,
              isActive: true,
            },
          },
        ],
      },
    }

    await assert.rejects(
      () =>
        assertActiveVariantsMatchProductType(
          prisma as unknown as Pick<import('@prisma/client').PrismaClient, 'productVariant'>,
          'prod-1',
          'apron',
        ),
      (error) => {
        assertGraphQLError(error, PRODUCT_TYPE_VARIANT_CONFLICT_MESSAGE)
        return true
      },
    )
  })
})
