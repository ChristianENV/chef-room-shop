import { test, expect } from '@playwright/test'

import {
  addFirstProductToCart,
  createPendingOrder,
  fillCheckoutAddress,
  selectShippingRate,
} from '../helpers/checkout'
import { routes } from '../../src/config/routes'

test.describe('Storefront cart → checkout', () => {
  test('adds product, checks out, and lands on success with order number', async ({
    page,
  }) => {
    await addFirstProductToCart(page)

    await page.getByTestId('cart-link').click()
    await expect(page).toHaveURL(/\/cart/)
    await expect(page.getByRole('heading', { name: /carrito/i })).toBeVisible()

    await page.goto(routes.checkout)
    await fillCheckoutAddress(page)
    await selectShippingRate(page)
    const orderNumber = await createPendingOrder(page)

    expect(orderNumber.length).toBeGreaterThan(3)
    await expect(page.getByText(orderNumber)).toBeVisible()
  })
})
