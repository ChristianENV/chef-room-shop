import { expect, test } from '@playwright/test'

test('customizer smoke flow to checkout pre-payment', async ({ page }) => {
  await page.goto('/shop')
  await page.waitForLoadState('networkidle')

  const viewProductButtons = page.getByRole('button', { name: /ver producto/i })
  const productCount = await viewProductButtons.count()
  expect(productCount).toBeGreaterThan(0)

  let openedCustomizer = false
  let fallbackSlug: string | null = null
  for (let i = 0; i < Math.min(productCount, 8); i += 1) {
    await viewProductButtons.nth(i).click()
    await expect(page).toHaveURL(/\/products\//)
    if (!fallbackSlug) {
      fallbackSlug = page.url().split('/products/')[1] ?? null
    }

    const customizePdpButton = page
      .getByRole('button', { name: /personalizar( ahora)?/i })
      .first()
    if (await customizePdpButton.isVisible()) {
      await customizePdpButton.click()
      openedCustomizer = true
      break
    }

    await page.goto('/shop')
    await page.waitForLoadState('networkidle')
  }

  if (!openedCustomizer && fallbackSlug) {
    await page.goto(`/customize/${fallbackSlug}`)
    openedCustomizer = true
  }
  expect(openedCustomizer).toBeTruthy()

  await expect(page).toHaveURL(/\/customize\//)
  await expect(page.getByTestId('customizer-root')).toBeVisible()

  const colorOptions = page.getByTestId('customizer-color-option')
  const colorCount = await colorOptions.count()
  if (colorCount > 1) {
    await colorOptions.nth(1).click()
  } else if (colorCount === 1) {
    await colorOptions.first().click()
  }

  const sizeOptions = page.getByTestId('customizer-size-option')
  const sizeCount = await sizeOptions.count()
  if (sizeCount > 1) {
    await sizeOptions.nth(1).click()
  } else if (sizeCount === 1) {
    await sizeOptions.first().click()
  }

  await page.getByTestId('customizer-save-button').click()
  await expect(page.getByText(/guardado/i)).toBeVisible()

  await page.getByTestId('customizer-add-to-cart-button').click()
  await expect(page.getByText(/agregado al carrito/i)).toBeVisible()

  await page.getByRole('link', { name: /ver carrito/i }).click()
  await expect(page).toHaveURL(/\/cart/)
  await expect(page.getByTestId('cart-custom-design-badge').first()).toBeVisible()

  await page.getByRole('link', { name: /continuar al checkout/i }).click()
  await expect(page).toHaveURL(/\/checkout/)
  await expect(page.getByRole('button', { name: /continuar a env[ií]o/i })).toBeVisible()
})
