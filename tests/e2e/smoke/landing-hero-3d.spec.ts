import fs from 'node:fs'
import path from 'node:path'
import { expect, test } from '@playwright/test'

const RESULTS_DIR = path.join(process.cwd(), 'test-results')
const SCREENSHOT_PATH = path.join(RESULTS_DIR, 'landing-hero-3d.png')

test.describe('landing hero 3D showcase', () => {
  test.beforeAll(() => {
    fs.mkdirSync(RESULTS_DIR, { recursive: true })
  })

  test('desktop hero shows 3D jacket or static fallback', async ({ page }) => {
    const consoleErrors: string[] = []
    const failedRequests: string[] = []

    page.on('console', (message) => {
      if (message.type() === 'error') consoleErrors.push(message.text())
    })
    page.on('requestfailed', (request) => {
      const failure = request.failure()
      if (failure?.errorText?.includes('ABORTED')) return
      const url = request.url()
      if (/\.(gltf|bin|png)(\?|$)/i.test(url)) {
        failedRequests.push(url)
      }
    })

    await page.setViewportSize({ width: 1440, height: 900 })
    await page.goto('/')
    await expect(page.getByTestId('landing-hero-3d-showcase')).toBeVisible()

    const loaded = page.getByTestId('landing-hero-3d-loaded')
    const fallback = page.getByTestId('landing-hero-3d-fallback')

    await expect(loaded.or(fallback)).toBeVisible({ timeout: 30_000 })

    const used3d = await loaded.isVisible()
    const usedFallback = await fallback.isVisible()

    expect(used3d || usedFallback).toBe(true)

    if (used3d) {
      await expect(page.getByTestId('landing-hero-3d-canvas')).toBeVisible()
    } else {
      await expect(page.getByTestId('landing-hero-3d-fallback')).toBeVisible()
    }

    await page.waitForTimeout(1_500)

    await page.getByTestId('landing-hero-3d-showcase').screenshot({
      path: SCREENSHOT_PATH,
    })

    const debugHud = page.getByTestId('landing-hero-3d-debug')
    if (await debugHud.isVisible()) {
      const debugText = await debugHud.innerText()
      if (used3d) {
        expect(debugText).toContain('renderMode: 3d')
        expect(debugText).toMatch(/meshCount: [1-9]/)
      } else {
        expect(debugText).toContain('renderMode: static-fallback')
        expect(debugText).toMatch(/fallbackReason:/)
      }
    }

    expect(failedRequests).toEqual([])
    expect(consoleErrors.join('\n')).not.toMatch(/GLTFLoader|Failed to load/i)

    test.info().annotations.push({
      type: 'hero-render-mode',
      description: used3d ? '3d' : 'static-fallback',
    })
  })
})
