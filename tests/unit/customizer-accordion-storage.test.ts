import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import {
  CUSTOMIZER_ACCORDION_STORAGE_KEY,
  loadCustomizerAccordionOpen,
  saveCustomizerAccordionOpen,
} from '@/src/features/storefront/customizer/lib/customizer-accordion-storage'

describe('customizer accordion storage', () => {
  it('persists open sections in sessionStorage', () => {
    const storage = new Map<string, string>()
    const originalWindow = globalThis.window

    Object.defineProperty(globalThis, 'window', {
      configurable: true,
      value: {
        sessionStorage: {
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
      saveCustomizerAccordionOpen(['colores', 'talla'])
      const restored = loadCustomizerAccordionOpen()
      assert.deepEqual(restored, ['colores', 'talla'])
      assert.equal(storage.get(CUSTOMIZER_ACCORDION_STORAGE_KEY)?.includes('colores'), true)
    } finally {
      Object.defineProperty(globalThis, 'window', {
        configurable: true,
        value: originalWindow,
      })
    }
  })
})
