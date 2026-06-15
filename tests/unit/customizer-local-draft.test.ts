import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import {
  CUSTOMIZER_DRAFT_STORAGE_KEY,
  clearCustomizerLocalDraft,
  loadCustomizerLocalDraft,
  saveCustomizerLocalDraft,
} from '@/src/features/storefront/customizer/lib/customizer-local-draft'

describe('customizer local draft storage', () => {
  it('persists and restores draft by product slug', () => {
    const storage = new Map<string, string>()
    const originalWindow = globalThis.window

    Object.defineProperty(globalThis, 'window', {
      configurable: true,
      value: {
        localStorage: {
          getItem: (key: string) => storage.get(key) ?? null,
          setItem: (key: string, value: string) => {
            storage.set(key, value)
          },
          removeItem: (key: string) => {
            storage.delete(key)
          },
        },
      },
    })

    try {
      saveCustomizerLocalDraft({
        productId: 'prod-1',
        productSlug: 'demo-filipina-clasica',
        savedAt: '2026-06-13T12:00:00.000Z',
        configJson: { size: 'L', baseColor: '#1E3A5F' },
      })

      const restored = loadCustomizerLocalDraft('demo-filipina-clasica')
      assert.ok(restored)
      assert.equal(restored?.productId, 'prod-1')
      assert.deepEqual(restored?.configJson, { size: 'L', baseColor: '#1E3A5F' })

      assert.equal(loadCustomizerLocalDraft('other-slug'), null)

      clearCustomizerLocalDraft()
      assert.equal(storage.has(CUSTOMIZER_DRAFT_STORAGE_KEY), false)
    } finally {
      Object.defineProperty(globalThis, 'window', {
        configurable: true,
        value: originalWindow,
      })
    }
  })
})
