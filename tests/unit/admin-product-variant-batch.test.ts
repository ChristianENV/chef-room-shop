import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import { GraphQLError } from 'graphql'

import {
  assertNoDuplicateBatchCells,
  assertNoDuplicateBatchSkus,
  summarizeVariantBatch,
  variantBatchCellKey,
  VARIANT_BATCH_DUPLICATE_CELL_MESSAGE,
  VARIANT_BATCH_DUPLICATE_SKU_MESSAGE,
  type VariantBatchInputRecord,
} from '@/src/server/graphql/modules/admin-products/admin-products.variant-batch'

function assertBadUserInput(error: unknown, message: string): void {
  assert.ok(error instanceof GraphQLError)
  assert.equal(error.message, message)
  assert.equal(error.extensions?.code, 'BAD_USER_INPUT')
}

describe('assertNoDuplicateBatchCells', () => {
  it('passes when every color/size cell is unique', () => {
    assert.doesNotThrow(() =>
      assertNoDuplicateBatchCells([
        { colorId: 'c1', sizeId: 's1' },
        { colorId: 'c1', sizeId: 's2' },
        { colorId: 'c2', sizeId: 's1' },
      ]),
    )
  })

  it('fails the whole batch on a duplicate cell', () => {
    assert.throws(
      () =>
        assertNoDuplicateBatchCells([
          { colorId: 'c1', sizeId: 's1' },
          { colorId: 'c1', sizeId: 's1' },
        ]),
      (error) => {
        assertBadUserInput(error, VARIANT_BATCH_DUPLICATE_CELL_MESSAGE)
        return true
      },
    )
  })
})

describe('assertNoDuplicateBatchSkus', () => {
  it('detects duplicates case-insensitively', () => {
    assert.throws(
      () => assertNoDuplicateBatchSkus(['CR-A', 'cr-a']),
      (error) => {
        assertBadUserInput(error, VARIANT_BATCH_DUPLICATE_SKU_MESSAGE)
        return true
      },
    )
  })

  it('ignores empty SKUs', () => {
    assert.doesNotThrow(() => assertNoDuplicateBatchSkus(['', '', 'CR-A']))
  })
})

describe('summarizeVariantBatch', () => {
  it('counts created, updated and archived intents', () => {
    const variants: VariantBatchInputRecord[] = [
      { colorId: 'c1', sizeId: 's1' }, // create
      { id: 'v1', colorId: 'c1', sizeId: 's2', isActive: true }, // update
      { id: 'v2', colorId: 'c2', sizeId: 's1', isActive: false }, // archive
      { id: 'v3', colorId: 'c3', sizeId: 's1' }, // update (default active)
    ]
    assert.deepEqual(summarizeVariantBatch(variants), {
      createdCount: 1,
      updatedCount: 2,
      archivedCount: 1,
    })
  })
})

describe('variantBatchCellKey', () => {
  it('builds a stable key', () => {
    assert.equal(variantBatchCellKey('c', 's'), 'c::s')
  })
})
