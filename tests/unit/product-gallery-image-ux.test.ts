import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, it } from 'node:test'

import {
  getPrimaryProductImageUrl,
  getVisibleProductImages,
} from '@/src/lib/product/product-images'
import type { ProductImage } from '@/lib/types'

// ---------------------------------------------------------------------------
// Shared fixtures
// ---------------------------------------------------------------------------

const img = (id: string, overrides: Partial<ProductImage> = {}): ProductImage => ({
  id,
  url: `https://cdn.example/${id}.webp`,
  alt: `Photo ${id}`,
  isPrimary: false,
  sortOrder: 0,
  publicId: null,
  ...overrides,
})

// ---------------------------------------------------------------------------
// 1. Primary image resolver
// ---------------------------------------------------------------------------

describe('getPrimaryProductImageUrl', () => {
  it('returns the primary image url when it exists', () => {
    const images = [img('a'), img('b', { isPrimary: true }), img('c')]
    assert.equal(getPrimaryProductImageUrl(images), 'https://cdn.example/b.webp')
  })

  it('falls back to the first image when none is marked primary', () => {
    const images = [img('x'), img('y')]
    assert.equal(getPrimaryProductImageUrl(images), 'https://cdn.example/x.webp')
  })

  it('returns null for empty arrays', () => {
    assert.equal(getPrimaryProductImageUrl([]), null)
    assert.equal(getPrimaryProductImageUrl(undefined), null)
  })
})

// ---------------------------------------------------------------------------
// 2. getVisibleProductImages
// ---------------------------------------------------------------------------

describe('getVisibleProductImages', () => {
  it('returns all images sorted by sortOrder', () => {
    const images = [
      img('b', { sortOrder: 1 }),
      img('a', { sortOrder: 0 }),
      img('c', { sortOrder: 2 }),
    ]
    const visible = getVisibleProductImages(images)
    assert.deepEqual(
      visible.map((i) => i.id),
      ['a', 'b', 'c'],
    )
  })

  it('returns empty array when no images', () => {
    assert.deepEqual(getVisibleProductImages([]), [])
    assert.deepEqual(getVisibleProductImages(undefined as unknown as ProductImage[]), [])
  })
})

// ---------------------------------------------------------------------------
// 3. Gallery source — no "vista frontal / trasera" copy
// ---------------------------------------------------------------------------

describe('product gallery source — no front/back assumptions', () => {
  const gallerySource = readFileSync(
    resolve('src/features/storefront/products/product-gallery.tsx'),
    'utf8',
  )

  it('does not contain "Vista frontal" or "Vista trasera"', () => {
    assert.doesNotMatch(gallerySource, /[Vv]ista\s+frontal/)
    assert.doesNotMatch(gallerySource, /[Vv]ista\s+trasera/)
  })

  it('has neutral gallery copy (Fotografías del producto or equivalent)', () => {
    assert.match(gallerySource, /Fotografías del producto/)
  })

  it('ZoomIn button opens lightbox (not a no-op)', () => {
    assert.match(gallerySource, /openLightbox/)
    assert.match(gallerySource, /ProductLightbox/)
  })

  it('thumbnails container prevents overflow with flex-wrap', () => {
    assert.match(gallerySource, /flex-wrap/)
  })

  it('main area uses bg-muted instead of hardcoded hex', () => {
    assert.match(gallerySource, /bg-muted/)
    assert.doesNotMatch(gallerySource, /#0d1024/)
  })
})

// ---------------------------------------------------------------------------
// 4. Lightbox source — keyboard, prev/next, close
// ---------------------------------------------------------------------------

describe('product lightbox source', () => {
  const lightboxSource = readFileSync(
    resolve('src/features/storefront/products/product-lightbox.tsx'),
    'utf8',
  )

  it('handles Escape key to close', () => {
    assert.match(lightboxSource, /event\.key === 'Escape'/)
    assert.match(lightboxSource, /onClose\(\)/)
  })

  it('handles ArrowLeft and ArrowRight for navigation', () => {
    assert.match(lightboxSource, /ArrowLeft/)
    assert.match(lightboxSource, /ArrowRight/)
  })

  it('renders close button with correct aria-label', () => {
    assert.match(lightboxSource, /aria-label="Cerrar"/)
  })

  it('renders prev/next buttons with correct aria-labels', () => {
    assert.match(lightboxSource, /aria-label="Imagen anterior"/)
    assert.match(lightboxSource, /aria-label="Imagen siguiente"/)
  })

  it('has role=dialog and aria-modal', () => {
    assert.match(lightboxSource, /role="dialog"/)
    assert.match(lightboxSource, /aria-modal="true"/)
  })

  it('shows thumbnail strip only when multiple images exist', () => {
    assert.match(lightboxSource, /images\.length > 1/)
  })

  it('image uses object-contain', () => {
    assert.match(lightboxSource, /object-contain/)
  })

  it('prevents body scroll while open', () => {
    assert.match(lightboxSource, /document\.body\.style\.overflow/)
  })
})

// ---------------------------------------------------------------------------
// 5. Admin thumbnail source — object-contain
// ---------------------------------------------------------------------------

describe('admin image sortable card', () => {
  const cardSource = readFileSync(
    resolve('src/features/admin/products/components/product-image-sortable-card.tsx'),
    'utf8',
  )

  it('uses object-contain (not object-cover)', () => {
    assert.match(cardSource, /object-contain/)
    assert.doesNotMatch(cardSource, /object-cover/)
  })

  it('uses bg-muted (dark-mode-safe) background', () => {
    assert.match(cardSource, /bg-muted/)
  })
})

// ---------------------------------------------------------------------------
// 6. Shared ProductImageDisplay — object-contain default
// ---------------------------------------------------------------------------

describe('shared ProductImageDisplay', () => {
  const componentSource = readFileSync(resolve('components/shared/product-image.tsx'), 'utf8')

  it('default fill uses object-contain', () => {
    assert.match(componentSource, /object-contain/)
  })

  it('background is bg-muted', () => {
    assert.match(componentSource, /overflow-hidden bg-muted/)
  })
})
