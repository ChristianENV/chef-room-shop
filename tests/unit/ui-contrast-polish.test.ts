import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, it } from 'node:test'

function read(path: string): string {
  return readFileSync(resolve(path), 'utf8')
}

describe('product gallery — theme-safe image containers', () => {
  const gallery = read('src/features/storefront/products/product-gallery.tsx')

  it('uses bg-muted for main gallery frame (not hardcoded hex)', () => {
    assert.match(gallery, /bg-muted/)
    assert.doesNotMatch(gallery, /#0d1024/)
  })

  it('ProductImageDisplay still uses object-contain', () => {
    assert.match(gallery, /object-contain/)
  })
})

describe('admin product image thumbnails — object-contain', () => {
  const card = read('src/features/admin/products/components/product-image-sortable-card.tsx')

  it('thumbnail uses object-contain', () => {
    assert.match(card, /object-contain/)
    assert.doesNotMatch(card, /object-cover/)
  })

  it('uses bg-muted background', () => {
    assert.match(card, /bg-muted/)
  })
})

describe('variant matrix — status labels and states', () => {
  const cell = read('src/features/admin/products/components/product-variant-matrix-cell.tsx')

  it('renders status badge with data-testid', () => {
    assert.match(cell, /admin-product-variant-cell-status/)
    assert.match(cell, /statusLabel\(state\)/)
  })

  it('uses theme tokens for cell states (not hardcoded white backgrounds)', () => {
    assert.match(cell, /bg-primary\/10/)
    assert.match(cell, /bg-destructive\/10/)
    assert.match(cell, /ring-offset-background/)
    assert.doesNotMatch(cell, /bg-white/)
  })
})

describe('color picker — selected state visibility', () => {
  const picker = read('src/features/admin/products/components/product-variant-color-selector.tsx')

  it('selected card uses ring-offset-background', () => {
    assert.match(picker, /ring-offset-background/)
  })

  it('selected card uses primary tokens', () => {
    assert.match(picker, /border-primary/)
    assert.match(picker, /bg-primary\/10/)
  })
})

describe('product form saving overlay', () => {
  const overlay = read('src/features/admin/products/components/product-form-saving-overlay.tsx')

  it('renders title and stage message', () => {
    assert.match(overlay, /PRODUCT_FORM_SAVING_TITLE/)
    assert.match(overlay, /admin-product-form-saving-overlay/)
    assert.match(overlay, /admin-product-form-saving-stage/)
  })

  it('uses bg-background overlay (theme token)', () => {
    assert.match(overlay, /bg-background/)
    assert.doesNotMatch(overlay, /bg-white/)
  })
})

describe('SEO image picker — no hardcoded black badge', () => {
  const picker = read('src/features/admin/products/components/product-seo-image-picker.tsx')

  it('primary badge uses theme tokens', () => {
    assert.match(picker, /bg-primary/)
    assert.match(picker, /text-primary-foreground/)
    assert.doesNotMatch(picker, /bg-black\/60/)
  })
})

describe('globals.css — muted foreground contrast tokens', () => {
  const css = read('src/app/globals.css')

  it('defines light and dark muted-foreground', () => {
    assert.match(css, /--muted-foreground:/)
    assert.match(css, /\.dark[\s\S]*--muted-foreground:/)
  })
})
