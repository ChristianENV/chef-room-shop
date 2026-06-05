import { expect, test } from '@playwright/test'

const PRODUCT_SLUG = process.env.E2E_PRODUCT_SLUG ?? 'demo-filipina-executive-blanca'

test('product detail gallery shows main image and thumbnails', async ({ page }) => {
  await page.goto(`/products/${PRODUCT_SLUG}`)

  await expect(page.getByTestId('product-gallery-main')).toBeVisible({ timeout: 20_000 })
  await expect(page.getByTestId('product-gallery-main').locator('img').first()).toBeVisible()

  const thumbnails = page.getByTestId('product-gallery-thumbnail')
  const thumbCount = await thumbnails.count()

  if (thumbCount > 1) {
    await expect(thumbnails.first()).toBeVisible()
    await thumbnails.nth(1).click()
    await expect(page.getByTestId('product-gallery-thumbnail-active')).toBeVisible()
  }
})
