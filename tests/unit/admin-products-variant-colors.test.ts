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

describe('assertVariantColorAllowedForProductType', () => {
  it('allows chef-jacket + chef-blue', () => {
    assert.doesNotThrow(() =>
      assertVariantColorAllowedForProductType({
        productTypeSlug: 'chef-jacket',
        colorSlug: 'chef-blue',
      }),
    )
  })

  it('rejects apron + chef-blue', () => {
    assert.throws(
      () =>
        assertVariantColorAllowedForProductType({
          productTypeSlug: 'apron',
          colorSlug: 'chef-blue',
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
          colorSlug: 'warm-gray',
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
          colorSlug: 'white',
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
          colorSlug: 'black',
        }),
      (error) => {
        assertGraphQLError(error, VARIANT_COLOR_NOT_ALLOWED_MESSAGE)
        return true
      },
    )
  })

  it('rejects unknown catalog color slugs', () => {
    assert.throws(
      () =>
        assertVariantColorAllowedForProductType({
          productTypeSlug: 'chef-jacket',
          colorSlug: 'olive-green',
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
            color: { slug: 'chef-blue' },
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
