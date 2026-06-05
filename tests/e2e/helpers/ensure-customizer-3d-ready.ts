import { expect, type Page } from '@playwright/test'

/** Ensures 3D mode and waits until the WebGL canvas is ready for preview capture. */
export async function ensureCustomizer3DReady(page: Page): Promise<void> {
  const mode3d = page.getByTestId('customizer-render-mode-3d')
  if (await mode3d.isVisible()) {
    await mode3d.click()
  } else {
    await page.getByRole('button', { name: '3D', exact: true }).click()
  }

  const viewport = page.getByTestId('customizer-3d-viewport')
  await expect(viewport).toBeVisible({ timeout: 30_000 })

  const canvas = viewport.locator('canvas').first()
  await expect(canvas).toBeVisible({ timeout: 30_000 })
  await page.waitForFunction(() => {
    const element = document.querySelector('[data-testid="customizer-3d-viewport"] canvas')
    return Boolean(element && element instanceof HTMLCanvasElement && element.width > 0 && element.height > 0)
  })

  await page.waitForTimeout(5_000)
  await expect(canvas).toBeVisible()
  await expect(viewport).toBeVisible()
}
