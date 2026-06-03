import { expect, type Page } from '@playwright/test'

/** Ensures 3D mode and waits until the WebGL canvas is ready for preview capture. */
export async function ensureCustomizer3DReady(page: Page): Promise<void> {
  await page.getByRole('button', { name: '3D', exact: true }).click()
  const canvas = page.locator('canvas').first()
  await expect(canvas).toBeVisible({ timeout: 30_000 })
  await page.waitForFunction(() => {
    const element = document.querySelector('canvas')
    return Boolean(element && element.width > 0 && element.height > 0)
  })
}
