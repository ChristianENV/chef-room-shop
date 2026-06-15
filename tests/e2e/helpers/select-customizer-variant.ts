import { expect, type Page } from '@playwright/test'

/** Selects the first in-stock size without changing the product default color. */
export async function selectCustomizerSize(page: Page, sizeLabel?: string): Promise<void> {
  await page.getByRole('button', { name: /extras/i }).first().click()
  await expect(page.getByTestId('customizer-size-options')).toBeVisible()

  if (sizeLabel) {
    const target = page.getByTestId(`customizer-size-option-${sizeLabel.toLowerCase()}`)
    await expect(target).toBeVisible()
    await target.click()
    return
  }

  const sizeOptions = page.locator('[data-testid^="customizer-size-option-"]')
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

/** Selects a catalog/fabric color swatch by id slug (e.g. chef-blue, white). */
export async function selectCustomizerFabricColor(
  page: Page,
  colorId: string,
  options?: { openPanel?: boolean },
): Promise<void> {
  if (options?.openPanel !== false) {
    await page.getByRole('button', { name: /colores/i }).first().click()
    await expect(page.getByTestId('customizer-base-colors')).toBeVisible()
  }

  const swatch = page.getByTestId(`customizer-fabric-color-swatch-${colorId}`)
  await expect(swatch).toBeVisible()
  await swatch.click()
}

/** Selects color and size for products where explicit variant choice is required. */
export async function selectCustomizerColorAndSize(
  page: Page,
  options?: { colorId?: string; sizeLabel?: string },
): Promise<void> {
  await page.getByRole('button', { name: /colores/i }).first().click()
  await expect(page.getByTestId('customizer-base-colors')).toBeVisible()

  if (options?.colorId) {
    const swatch = page.getByTestId(`customizer-fabric-color-swatch-${options.colorId}`)
    await expect(swatch).toBeVisible()
    await swatch.click()
  } else {
    const colorOptions = page.getByTestId(/^customizer-fabric-color-swatch-/)
    const colorCount = await colorOptions.count()
    if (colorCount > 1) {
      await colorOptions.nth(1).click()
    } else if (colorCount === 1) {
      await colorOptions.first().click()
    }
  }

  await selectCustomizerSize(page, options?.sizeLabel)
}
