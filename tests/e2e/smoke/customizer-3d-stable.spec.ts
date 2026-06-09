import { expect, test } from '@playwright/test'
import { ensureCustomizer3DReady } from '../helpers/ensure-customizer-3d-ready'
import {
  mockCustomizerPreviewFlow,
  shouldMockCustomizerPreviews,
} from '../helpers/mock-customizer-previews'

const CUSTOMIZER_SLUG =
  process.env.E2E_CUSTOMIZER_SLUG ?? 'demo-filipina-executive-blanca'
const USE_PREVIEW_MOCK = shouldMockCustomizerPreviews()

test('customizer 3D viewport stays interactable without load fallback', async ({ page }) => {
  if (USE_PREVIEW_MOCK) {
    await mockCustomizerPreviewFlow(page)
  }

  await page.goto(`/customize/${CUSTOMIZER_SLUG}`)
  await expect(page.getByTestId('customizer-root')).toBeVisible()

  await ensureCustomizer3DReady(page)

  await expect(page.getByTestId('customizer-3d-load-error')).not.toBeVisible()
  await page.waitForTimeout(3_000)
  await expect(page.getByTestId('customizer-3d-load-error')).not.toBeVisible()

  const viewport = page.getByTestId('customizer-3d-viewport')
  const canvas = viewport.locator('canvas').first()
  await expect(canvas).toBeVisible()

  const box = await canvas.boundingBox()
  expect(box).not.toBeNull()
  if (box) {
    await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2)
    await page.mouse.down()
    await page.mouse.move(box.x + box.width / 2 + 40, box.y + box.height / 2 + 20)
    await page.mouse.up()
  }

  await expect(canvas).toBeVisible()
  await expect(page.getByTestId('customizer-3d-load-error')).not.toBeVisible()
})
