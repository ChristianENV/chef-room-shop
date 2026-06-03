import { expect, test } from '@playwright/test'
import { ensureCustomizer3DReady } from '../helpers/ensure-customizer-3d-ready'
import {
  mockCustomizerPreviewFlow,
  shouldMockCustomizerPreviews,
} from '../helpers/mock-customizer-previews'
import { selectCustomizerColorAndSize } from '../helpers/select-customizer-variant'

const CUSTOMIZER_SLUG =
  process.env.E2E_CUSTOMIZER_SLUG ?? 'demo-filipina-executive-blanca'
const USE_PREVIEW_MOCK = shouldMockCustomizerPreviews()

test('customize -> add to cart smoke', async ({ page }) => {
  if (USE_PREVIEW_MOCK) {
    await mockCustomizerPreviewFlow(page)
  }

  await page.goto(`/customize/${CUSTOMIZER_SLUG}`)
  await expect(page.getByTestId('customizer-root')).toBeVisible()

  await selectCustomizerColorAndSize(page)

  await page.getByRole('button', { name: /texto/i }).first().click()
  const addTextButton = page.getByTestId('customizer-add-text-button').first()
  await expect(addTextButton).toBeVisible()
  await addTextButton.click()

  const textInput = page.getByTestId('customizer-text-input')
  await expect(textInput).toBeVisible()
  await textInput.fill('Chef Carlos')
  await expect(textInput).toHaveValue('Chef Carlos')
  await expect(page.getByText('Chef Carlos').first()).toBeVisible()

  await ensureCustomizer3DReady(page)

  await page.getByTestId('customizer-add-to-cart-button').click()
  await expect(page.getByText(/tu dise[ñn]o se agreg[oó] al carrito/i)).toBeVisible({
    timeout: 60_000,
  })

  await page.getByRole('link', { name: /ver carrito/i }).click()
  await expect(page).toHaveURL(/\/cart/)

  const cartItems = page.getByTestId('cart-item-card')
  await expect(cartItems.first()).toBeVisible()
  await expect(page.getByTestId('cart-custom-design-badge').first()).toBeVisible()
  await expect(page.getByTestId('cart-customization-summary').first()).toContainText('Chef Carlos')

  if (!USE_PREVIEW_MOCK) {
    await expect(cartItems.first().locator('img').first()).toBeVisible()
  }
})
