import { expect, type Page } from '@playwright/test'

/** Selects the first in-stock size without changing the product default color. */
export async function selectCustomizerSize(page: Page): Promise<void> {
  await page.getByRole('button', { name: /extras/i }).first().click()
  await expect(page.getByTestId('customizer-size-options')).toBeVisible()

  const sizeOptions = page.getByTestId('customizer-size-option')
  const sizeCount = await sizeOptions.count()
  expect(sizeCount).toBeGreaterThan(0)

  for (let index = 0; index < sizeCount; index += 1) {
    const option = sizeOptions.nth(index)
    if (await option.isEnabled()) {
      await option.click()
      return
    }
  }

  throw new Error('No enabled customizer size option found')
}

/** Selects color and size for products where explicit variant choice is required. */
export async function selectCustomizerColorAndSize(page: Page): Promise<void> {
  await page.getByRole('button', { name: /colores/i }).first().click()
  await expect(page.getByTestId('customizer-base-colors')).toBeVisible()

  const colorOptions = page.getByTestId(/^customizer-fabric-color-swatch-/)
  const colorCount = await colorOptions.count()
  if (colorCount > 1) {
    await colorOptions.nth(1).click()
  } else if (colorCount === 1) {
    await colorOptions.first().click()
  }

  await selectCustomizerSize(page)
}
