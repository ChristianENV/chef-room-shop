import fs from 'node:fs'
import path from 'node:path'
import { expect, test } from '@playwright/test'

const RESULTS_DIR = path.join(process.cwd(), 'test-results')
const COMPOSITION_SCREENSHOT = path.join(RESULTS_DIR, 'landing-hero-3d-composition.png')
const CALIBRATION_SCREENSHOT = path.join(RESULTS_DIR, 'landing-hero-3d-calibration.png')
const LEGACY_SCREENSHOT = path.join(RESULTS_DIR, 'landing-hero-3d.png')

async function loadHeroShowcase(page: import('@playwright/test').Page) {
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

  if (await fallback.isVisible()) {
    try {
      await expect(loaded).toBeVisible({ timeout: 20_000 })
    } catch {
      // Static fallback remains active (mobile, reduced motion, or WebGL unavailable).
    }
  }

  const used3d = await loaded.isVisible()
  const usedFallback = await fallback.isVisible()

  expect(used3d || usedFallback).toBe(true)

  if (used3d) {
    await expect(page.getByTestId('landing-hero-3d-canvas')).toBeVisible()
  } else {
    await expect(page.getByTestId('landing-hero-3d-fallback')).toBeVisible()
  }

  await page.waitForTimeout(1_500)

  return { used3d, usedFallback, consoleErrors, failedRequests }
}

async function readModelRotationY(page: import('@playwright/test').Page): Promise<number | null> {
  const value = await page.getByTestId('landing-hero-3d-loaded').getAttribute('data-hero-rotation-y')
  if (value == null) return null
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : null
}

test.describe('landing hero 3D showcase', () => {
  test.beforeAll(() => {
    fs.mkdirSync(RESULTS_DIR, { recursive: true })
  })

  test('desktop hero composition is proportional with no debug UI', async ({ page }) => {
    const { used3d, consoleErrors, failedRequests } = await loadHeroShowcase(page)

    await expect(page.getByTestId('landing-hero-3d-debug')).toHaveCount(0)
    await expect(page.getByTestId('landing-hero-3d-calibration')).toHaveCount(0)

    if (used3d) {
      await expect(page.getByTestId('landing-hero-3d-error')).toHaveCount(0)
    }

    await page.locator('section').first().screenshot({
      path: COMPOSITION_SCREENSHOT,
    })

    await page.getByTestId('landing-hero-3d-showcase').screenshot({
      path: LEGACY_SCREENSHOT,
    })

    expect(failedRequests).toEqual([])
    expect(consoleErrors.join('\n')).not.toMatch(/GLTFLoader|Failed to load/i)

    test.info().annotations.push({
      type: 'hero-render-mode',
      description: used3d ? '3d' : 'static-fallback',
    })
  })

  test('desktop does not hit model load timeout', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 })
    await page.goto('/')
    await expect(page.getByTestId('landing-hero-3d-showcase')).toBeVisible()

    const loaded = page.getByTestId('landing-hero-3d-loaded')
    const fallback = page.getByTestId('landing-hero-3d-fallback')

    await expect(loaded.or(fallback)).toBeVisible({ timeout: 30_000 })

    if (await fallback.isVisible()) {
      test.skip(true, '3D canvas not active in this environment')
    }

    await expect(page.getByTestId('landing-hero-3d-error')).toHaveCount(0)
    await expect(page.getByTestId('landing-hero-3d-canvas')).toBeVisible()
    await page.waitForTimeout(3_000)
    await expect(page.getByTestId('landing-hero-3d-error')).toHaveCount(0)
    await expect(page.getByTestId('landing-hero-3d-canvas')).toBeVisible()
  })

  test('static backdrop stays hidden after 3D is ready', async ({ page }) => {
    const { used3d } = await loadHeroShowcase(page)
    test.skip(!used3d, '3D canvas not active in this environment')

    const canvas = page.getByTestId('landing-hero-3d-canvas')
    const backdrop = page.getByTestId('landing-hero-3d-static-backdrop')

    await expect(canvas).toBeVisible()
    await page.waitForTimeout(3_000)
    await expect(canvas).toBeVisible()
    await expect(backdrop).toHaveCSS('opacity', '0')
  })

  test('idle rotation changes over time on desktop', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'no-preference' })
    const { used3d } = await loadHeroShowcase(page)
    test.skip(!used3d, '3D canvas not active in this environment')

    const rotationA = await readModelRotationY(page)
    expect(rotationA).not.toBeNull()

    await page.waitForTimeout(3_000)

    const rotationB = await readModelRotationY(page)
    expect(rotationB).not.toBeNull()
    expect(Math.abs((rotationB as number) - (rotationA as number))).toBeGreaterThan(0.01)
  })

  test('mobile viewport uses static fallback', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 })
    await page.goto('/')
    await expect(page.getByTestId('landing-hero-3d-showcase')).toBeVisible()
    await expect(page.getByTestId('landing-hero-3d-fallback')).toBeVisible({ timeout: 15_000 })
    await expect(page.getByTestId('landing-hero-3d-loaded')).toHaveCount(0)
  })

  test('calibration panel visible when calibrate env enabled', async ({ page }) => {
    test.skip(
      process.env.NEXT_PUBLIC_LANDING_HERO_3D_CALIBRATE !== 'true',
      'Set NEXT_PUBLIC_LANDING_HERO_3D_CALIBRATE=true to capture calibration screenshot',
    )

    await loadHeroShowcase(page)

    const calibrationPanel = page.getByTestId('landing-hero-3d-calibration')
    await expect(calibrationPanel).toBeVisible()
    await expect(page.getByTestId('landing-hero-3d-calibration-copy')).toBeVisible()

    await page.locator('section').first().screenshot({
      path: CALIBRATION_SCREENSHOT,
    })
  })
})
