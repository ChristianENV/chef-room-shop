import type { Page } from '@playwright/test'

import { routes } from '../../src/config/routes'

const DEMO_PRODUCT_SLUG =
  process.env.E2E_PRODUCT_SLUG ?? 'filipina-azul-chef-room'

const allowNoShipping = process.env.E2E_ALLOW_NO_SHIPPING === 'true'

/**
 * Opens a known catalog product and adds one unit to cart.
 */
export async function addFirstProductToCart(page: Page): Promise<void> {
  await page.goto(routes.productDetail(DEMO_PRODUCT_SLUG))

  const sizeLabel = page.getByText('Talla', { exact: true })
  if (await sizeLabel.isVisible().catch(() => false)) {
    const sizeButton = sizeLabel.locator('..').locator('button').first()
    if (await sizeButton.isVisible().catch(() => false)) {
      await sizeButton.click()
    }
  }

  const addButton = page.getByTestId('add-to-cart-button')
  await addButton.click()
  await page.getByText('Producto agregado al carrito', { exact: false }).waitFor({
    timeout: 20_000,
  })
}

/**
 * Fills checkout contact + shipping address (Puebla CP for Skydropx origin).
 */
export async function fillCheckoutAddress(
  page: Page,
  contact?: { email?: string; phone?: string },
): Promise<void> {
  const unique = Date.now()
  const email = contact?.email ?? `e2e.checkout+${unique}@chefroom.test`

  await page.locator('#email').first().fill(email)
  await page.locator('#phone').fill(contact?.phone ?? '2221234567')
  await page.getByRole('button', { name: 'Continuar a envío' }).click()

  await page.locator('#firstName').fill('E2E')
  await page.locator('#lastName').fill('Checkout')
  await page.locator('#street').fill('Av Reforma')
  await page.locator('#exteriorNumber').fill('100')
  await page.locator('#neighborhood').fill('Centro')
  await page.locator('#city').fill('Puebla')
  await page.locator('#postalCode').fill('72000')

  const stateTrigger = page.locator('#state')
  if (await stateTrigger.isVisible()) {
    await stateTrigger.click()
    await page.getByRole('option', { name: 'Puebla' }).click()
  }
}

/**
 * Waits for shipping rates and selects the first card if Skydropx is available.
 */
export async function selectShippingRate(page: Page): Promise<void> {
  if (allowNoShipping) {
    return
  }

  const rateCard = page.getByTestId('shipping-rate-card').first()
  try {
    await rateCard.waitFor({ state: 'visible', timeout: 45_000 })
    await rateCard.click()
  } catch {
    const devAlert = page.getByText('Modo desarrollo: puedes continuar sin cotizar', {
      exact: false,
    })
    if (await devAlert.isVisible().catch(() => false)) {
      return
    }
    throw new Error(
      'No shipping rates visible. Set E2E_ALLOW_NO_SHIPPING=true or configure Skydropx.',
    )
  }
}

/**
 * Completes checkout through payment step and creates a pending order.
 */
export async function createPendingOrder(page: Page): Promise<string> {
  await page.getByRole('button', { name: 'Continuar a pago' }).click()
  await page.getByTestId('checkout-submit').click()

  await page.waitForURL(/\/checkout\/success/, { timeout: 60_000 })

  const orderLabel = page.getByText('Número de pedido:', { exact: false })
  await orderLabel.waitFor({ timeout: 15_000 })
  const paragraph = orderLabel.locator('..')
  const orderNumber = (await paragraph.locator('span').last().textContent())?.trim()
  if (!orderNumber) {
    throw new Error('Order number not found on success page')
  }
  return orderNumber
}
