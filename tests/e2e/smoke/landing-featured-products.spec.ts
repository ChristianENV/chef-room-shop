import { expect, test } from '@playwright/test'

test('landing featured products section loads real cards', async ({ page }) => {
  await page.goto('/')
  const section = page.getByTestId('featured-products-section')
  await expect(section).toBeVisible()

  const cards = section.getByTestId('featured-product-card')
  await expect(cards.first()).toBeVisible({ timeout: 20_000 })
  expect(await cards.count()).toBeGreaterThanOrEqual(1)

  const firstImage = cards.first().getByTestId('featured-product-image').locator('img')
  const imgCount = await firstImage.count()
  if (imgCount > 0) {
    await expect(firstImage.first()).toBeVisible()
  }
})
