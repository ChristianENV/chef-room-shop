import { expect, test } from '@playwright/test'
import { ensureCustomizer3DReady } from '../helpers/ensure-customizer-3d-ready'
import {
  mockCustomizerPreviewFlow,
  shouldMockCustomizerPreviews,
} from '../helpers/mock-customizer-previews'
import { selectCustomizerColorAndSize } from '../helpers/select-customizer-variant'

const CUSTOMIZER_SLUG = process.env.E2E_CUSTOMIZER_SLUG ?? 'demo-filipina-executive-blanca'

test('customizer smoke flow to checkout pre-payment', async ({ page }) => {
  if (shouldMockCustomizerPreviews()) {
    await mockCustomizerPreviewFlow(page)
  }

  await page.goto('/shop')
  await page.waitForLoadState('networkidle')
  await expect(page.getByRole('button', { name: /ver producto/i }).first()).toBeVisible()

  // Use a slug with variantes demo válidas (ver E2E_CUSTOMIZER_SLUG en docs/qa-e2e.md).
  await page.goto(`/customize/${CUSTOMIZER_SLUG}`)
  await expect(page.getByTestId('customizer-root')).toBeVisible()

  await selectCustomizerColorAndSize(page)
  await ensureCustomizer3DReady(page)

  await page.getByTestId('customizer-save-button').click()
  await expect(
    page.getByText(/dise[ñn]o guardado con vistas frontal y trasera/i).first(),
  ).toBeVisible({ timeout: 60_000 })

  await page.getByTestId('customizer-add-to-cart-button').click()
  await expect(page.getByText(/tu dise[ñn]o se agreg[oó] al carrito/i)).toBeVisible({
    timeout: 60_000,
  })

  await page.getByRole('link', { name: /ver carrito/i }).click()
  await expect(page).toHaveURL(/\/cart/)
  await expect(page.getByTestId('cart-custom-design-badge').first()).toBeVisible()

  await page.getByRole('link', { name: /continuar al checkout/i }).click()
  await expect(page).toHaveURL(/\/checkout/)
  await expect(page.getByRole('button', { name: /continuar a env[ií]o/i })).toBeVisible()
})
