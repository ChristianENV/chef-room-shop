import fs from 'node:fs'
import path from 'node:path'
import { expect, test } from '@playwright/test'
import { ensureCustomizer3DReady } from '../helpers/ensure-customizer-3d-ready'
import {
  mockCustomizerPreviewFlow,
  shouldMockCustomizerPreviews,
} from '../helpers/mock-customizer-previews'

const USE_PREVIEW_MOCK = shouldMockCustomizerPreviews()
const RESULTS_DIR = path.join(process.cwd(), 'test-results')

test.describe('chef-jacket 3D diagnostics', () => {
  test.beforeAll(() => {
    fs.mkdirSync(RESULTS_DIR, { recursive: true })
  })

  test('smoke page loads local chef-jacket model', async ({ page }) => {
    const consoleErrors: string[] = []
    const failedRequests: string[] = []

    page.on('console', (message) => {
      if (message.type() === 'error') consoleErrors.push(message.text())
    })
    page.on('requestfailed', (request) => {
      const url = request.url()
      if (/\.(gltf|bin|png|webp|jpg)(\?|$)/i.test(url)) {
        failedRequests.push(url)
      }
    })

    await page.goto('/dev/chef-jacket-3d-smoke')
    await expect(page.getByTestId('chef-jacket-smoke-page')).toBeVisible()
    await expect(page.getByTestId('chef-jacket-smoke-canvas')).toBeVisible()

    await expect(page.getByTestId('chef-jacket-smoke-loaded')).toBeVisible({
      timeout: 30_000,
    })

    await page.screenshot({
      path: path.join(RESULTS_DIR, 'chef-jacket-smoke-original.png'),
      fullPage: true,
    })

    const debugText = await page.getByTestId('chef-jacket-smoke-debug').innerText()
    const debug = JSON.parse(debugText) as {
      meshCount: number
      boundsSize: number[] | null
      radius: number | null
    }

    expect(debug.meshCount).toBeGreaterThan(0)
    expect(debug.boundsSize).not.toBeNull()
    expect(debug.radius).toBeGreaterThan(0)
    expect(debug.radius).toBeLessThan(20)

    await page.waitForTimeout(2_000)
    await page.screenshot({
      path: path.join(RESULTS_DIR, 'chef-jacket-smoke.png'),
      fullPage: true,
    })

    expect(failedRequests).toEqual([])
    expect(consoleErrors.join('\n')).not.toMatch(/GLTFLoader|Failed to load/i)
  })

  test('smoke page shows meshes with material debug enabled', async ({ page }) => {
    await page.goto('/dev/chef-jacket-3d-smoke')
    await expect(page.getByTestId('chef-jacket-smoke-loaded')).toBeVisible({
      timeout: 30_000,
    })

    await page.getByLabel('Material debug (rojo, sin texturas)').check()
    await page.waitForTimeout(1_500)

    await page.screenshot({
      path: path.join(RESULTS_DIR, 'chef-jacket-smoke-debug.png'),
      fullPage: true,
    })

    const debugText = await page.getByTestId('chef-jacket-smoke-debug').innerText()
    const debug = JSON.parse(debugText) as { meshCount: number; debugMaterial: boolean }
    expect(debug.meshCount).toBeGreaterThan(0)
    expect(debug.debugMaterial).toBe(true)
  })

  test('customize 3D viewport screenshots and local model HUD', async ({ page }) => {
    if (USE_PREVIEW_MOCK) {
      await mockCustomizerPreviewFlow(page)
    }

    const failedRequests: string[] = []
    page.on('requestfailed', (request) => {
      const url = request.url()
      if (/\.(gltf|bin|png|webp|jpg)(\?|$)/i.test(url)) {
        failedRequests.push(url)
      }
    })

    await page.goto('/customize', { waitUntil: 'domcontentloaded' })
    await expect(page.getByTestId('customizer-root')).toBeVisible()
    await ensureCustomizer3DReady(page)

    const hud = page.getByTestId('customizer-3d-debug-hud')
    if (await hud.isVisible()) {
      await expect(hud).toContainText('/models/customizer/chef-jacket/chef-jacket.gltf')
      await expect(hud).toContainText('local')
    }

    await page.waitForTimeout(2_000)
    await page.screenshot({
      path: path.join(RESULTS_DIR, 'customizer-3d-normal.png'),
      fullPage: true,
    })

    const debugToggle = page.getByTestId('customizer-3d-debug-material-toggle')
    if (await debugToggle.isVisible()) {
      await debugToggle.click()
      await page.waitForTimeout(1_500)
      await page.screenshot({
        path: path.join(RESULTS_DIR, 'customizer-3d-debug-material.png'),
        fullPage: true,
      })
    }

    const safeToggle = page.getByTestId('customizer-3d-safe-render-toggle')
    if (await safeToggle.isVisible()) {
      await safeToggle.click()
      await page.waitForTimeout(2_000)
      await page.screenshot({
        path: path.join(RESULTS_DIR, 'customizer-3d-safe-mode.png'),
        fullPage: true,
      })
    }

    await page.screenshot({
      path: path.join(RESULTS_DIR, 'customizer-3d.png'),
      fullPage: true,
    })

    await expect(page.getByTestId('customizer-3d-load-error')).not.toBeVisible()
    expect(failedRequests).toEqual([])
  })
})
