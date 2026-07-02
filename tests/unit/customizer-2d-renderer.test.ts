import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import { describe, it } from 'node:test'

import { resolveViewportRenderer } from '@/src/features/storefront/customizer/lib/customizer-viewport'
import {
  GARMENT_PART_IDS,
  GARMENT_VIEW_IDS,
  SVG_2D_RENDERER_TEST_ID,
  isGarmentViewActive,
  resolveColorZoneFill,
  resolveGarmentViewId,
} from '@/src/features/storefront/customizer/lib/svg-garment-fixtures'

const CUSTOMIZER_DIR = path.join(process.cwd(), 'src/features/storefront/customizer')

function readCustomizerFile(relativePath: string): string {
  return fs.readFileSync(path.join(CUSTOMIZER_DIR, relativePath), 'utf8')
}

describe('customizer viewport host renderer selection', () => {
  it('selects the SVG 2D renderer when viewMode = 2D', () => {
    assert.equal(resolveViewportRenderer('2D'), '2d')
  })

  it('selects the 3D renderer when viewMode = 3D', () => {
    assert.equal(resolveViewportRenderer('3D'), '3d')
  })

  it('host component branches on the resolved renderer', () => {
    const host = readCustomizerFile('components/customizer-viewport-host.tsx')
    assert.match(host, /resolveViewportRenderer\(viewMode\)/)
    assert.match(host, /renderer === '2d'/)
    assert.match(host, /<Svg2DRenderer \/>/)
    // 3D renderer is still imported and mounted for the non-2D branch.
    assert.match(host, /import\('\.\/viewport-3d'\)/)
    assert.match(host, /<Viewport3D ref=\{viewportCaptureRef\} \/>/)
  })

  it('designer layout mounts the viewport host (not Viewport3D directly)', () => {
    const layout = readCustomizerFile('components/designer-layout.tsx')
    assert.match(layout, /CustomizerViewportHost/)
    assert.doesNotMatch(layout, /<Viewport3D\b/)
  })
})

describe('svg 2D renderer contract', () => {
  it('exposes the expected renderer test id', () => {
    assert.equal(SVG_2D_RENDERER_TEST_ID, 'customizer-svg-2d-renderer')
  })

  it('renders with the renderer test id and reuses the element overlay', () => {
    const renderer = readCustomizerFile('components/svg-2d-renderer.tsx')
    assert.match(renderer, /data-testid=\{SVG_2D_RENDERER_TEST_ID\}/)
    assert.match(renderer, /ViewportElementOverlay/)
    assert.match(renderer, /ChefJacketWireframe/)
  })
})

describe('garment view switching', () => {
  it('maps the front angle to the front view group', () => {
    assert.equal(resolveGarmentViewId('front'), 'view-front')
    assert.equal(isGarmentViewActive('front', 'view-front'), true)
    assert.equal(isGarmentViewActive('front', 'view-back'), false)
  })

  it('maps the back angle to the back view group', () => {
    assert.equal(resolveGarmentViewId('back'), 'view-back')
    assert.equal(isGarmentViewActive('back', 'view-back'), true)
    assert.equal(isGarmentViewActive('back', 'view-front'), false)
  })

  it('declares both view groups', () => {
    assert.deepEqual([...GARMENT_VIEW_IDS], ['view-front', 'view-back'])
  })
})

describe('garment color zones', () => {
  it('drives the body zone from the base color', () => {
    assert.equal(
      resolveColorZoneFill('zone-color-body', { baseColor: '#123456', detailColor: '#abcdef' }),
      '#123456',
    )
  })

  it('drives the collar zone from the detail color', () => {
    assert.equal(
      resolveColorZoneFill('zone-color-collar', { baseColor: '#123456', detailColor: '#abcdef' }),
      '#abcdef',
    )
  })
})

describe('temporary wireframe asset honors the group contract', () => {
  it('includes every view group and part id', () => {
    const svg = readCustomizerFile('assets/svg/chef-jacket-wireframe.tsx')
    for (const viewId of GARMENT_VIEW_IDS) {
      assert.match(svg, new RegExp(`id="${viewId}"`), `missing view group: ${viewId}`)
    }
    for (const partId of GARMENT_PART_IDS) {
      assert.match(svg, new RegExp(`data-part="${partId}"`), `missing part: ${partId}`)
    }
  })

  it('binds color zones to the resolved fills', () => {
    const svg = readCustomizerFile('assets/svg/chef-jacket-wireframe.tsx')
    assert.match(svg, /resolveColorZoneFill\('zone-color-body', colors\)/)
    assert.match(svg, /resolveColorZoneFill\('zone-color-collar', colors\)/)
  })
})

describe('3D renderer is preserved', () => {
  it('keeps the existing Viewport3D module on disk', () => {
    const viewport3dPath = path.join(CUSTOMIZER_DIR, 'components/viewport-3d.tsx')
    assert.ok(fs.existsSync(viewport3dPath), 'viewport-3d.tsx must still exist')
    const viewport3d = fs.readFileSync(viewport3dPath, 'utf8')
    assert.match(viewport3d, /export default Viewport3D/)
    assert.match(viewport3d, /@react-three\/fiber/)
  })
})

describe('Stage 1 does not touch pricing or add-to-cart', () => {
  const stage1Files = [
    'components/customizer-viewport-host.tsx',
    'components/svg-2d-renderer.tsx',
    'assets/svg/chef-jacket-wireframe.tsx',
    'lib/customizer-viewport.ts',
    'lib/svg-garment-fixtures.ts',
  ]

  it('new renderer files do not import pricing, cart, or checkout modules', () => {
    const importLine = /^\s*import[^\n]*from\s*['"][^'"]+['"]/gm
    for (const relativePath of stage1Files) {
      const contents = readCustomizerFile(relativePath)
      const imports = contents.match(importLine) ?? []
      for (const line of imports) {
        assert.doesNotMatch(line, /pricing/i, `${relativePath} must not import pricing: ${line}`)
        assert.doesNotMatch(line, /\bcart\b/i, `${relativePath} must not import cart: ${line}`)
        assert.doesNotMatch(line, /checkout/i, `${relativePath} must not import checkout: ${line}`)
      }
    }
  })

  it('pricing constants remain intact (rules version + text rate)', () => {
    const pricing = readCustomizerFile('pricing/customizer-pricing.constants.ts')
    assert.match(pricing, /embroidery-v1/)
    assert.match(pricing, /10_000/)
  })
})
