import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import { STRUCTURAL_LAYERS } from '@/src/features/storefront/customizer/lib/customizer-defaults'
import {
  buildCustomizerBaseline,
  hasMeaningfulCustomization,
  shouldAutosaveDraft,
  shouldCreateDesignInDatabase,
  shouldUpdateExistingDesign,
} from '@/src/features/storefront/customizer/lib/customizer-save-intent'
import type { CustomizerProductData } from '@/src/features/storefront/customizer/types/customizer-product.types'

const product: CustomizerProductData = {
  id: 'prod-1',
  slug: 'demo-filipina-clasica',
  name: 'Filipina clásica',
  productTypeSlug: 'filipina',
  productTypeName: 'Filipina',
  basePriceCents: 129900,
  images: [],
  colors: [
    { id: 'chef-room-blue', name: 'Azul Chef Room', hex: '#1E3A5F' },
    { id: 'white', name: 'Blanco', hex: '#FFFFFF' },
  ],
  sizes: [
    { id: 'size-m', name: 'M' },
    { id: 'size-l', name: 'L' },
  ],
  variants: [
    {
      id: 'variant-m-white',
      colorId: 'white',
      sizeId: 'size-m',
      stockQty: 10,
      isActive: true,
    },
    {
      id: 'variant-l-blue',
      colorId: 'chef-room-blue',
      sizeId: 'size-l',
      stockQty: 10,
      isActive: true,
    },
  ],
  rules: [],
  customizationAreas: [],
  customizationAvailability: [],
  model3d: null,
}

describe('customizer save intent', () => {
  it('does not create a design for guests unless forced', () => {
    assert.equal(
      shouldCreateDesignInDatabase({
        isAuthenticated: false,
        force: false,
        interactionCount: 5,
        meaningful: true,
      }),
      false,
    )
    assert.equal(
      shouldCreateDesignInDatabase({
        isAuthenticated: false,
        force: true,
        interactionCount: 0,
        meaningful: false,
      }),
      true,
    )
  })

  it('does not create a design on open-equivalent state for auth users', () => {
    const baseline = buildCustomizerBaseline(product)
    assert.equal(
      hasMeaningfulCustomization(
        {
          ...baseline,
          layers: STRUCTURAL_LAYERS,
        },
        baseline,
      ),
      false,
    )
    assert.equal(
      shouldCreateDesignInDatabase({
        isAuthenticated: true,
        force: false,
        interactionCount: 0,
        meaningful: false,
      }),
      false,
    )
    assert.equal(
      shouldAutosaveDraft({
        isDirty: true,
        interactionCount: 1,
        meaningful: false,
      }),
      false,
    )
  })

  it('creates a design when auth user has meaningful customization or enough interactions', () => {
    const baseline = buildCustomizerBaseline(product)

    assert.equal(
      shouldCreateDesignInDatabase({
        isAuthenticated: true,
        force: false,
        interactionCount: 1,
        meaningful: true,
      }),
      true,
    )
    assert.equal(
      shouldCreateDesignInDatabase({
        isAuthenticated: true,
        force: false,
        interactionCount: 2,
        meaningful: false,
      }),
      true,
    )
    assert.equal(
      hasMeaningfulCustomization(
        {
          ...baseline,
          baseColor: '#1E3A5F',
          layers: STRUCTURAL_LAYERS,
        },
        baseline,
      ),
      true,
    )
  })

  it('updates existing designs only when dirty and intent is met', () => {
    assert.equal(
      shouldUpdateExistingDesign({
        isAuthenticated: true,
        force: false,
        isDirty: false,
        interactionCount: 3,
        meaningful: true,
      }),
      false,
    )
    assert.equal(
      shouldUpdateExistingDesign({
        isAuthenticated: true,
        force: true,
        isDirty: false,
        interactionCount: 0,
        meaningful: false,
      }),
      true,
    )
  })
})
