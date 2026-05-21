import { test, expect } from '@playwright/test'

import { loginAsCustomer } from '../helpers/auth'
import { routes } from '../../src/config/routes'

test.describe('Account order detail', () => {
  test('lists orders and opens detail with summary sections', async ({ page }) => {
    await loginAsCustomer(page)

    await page.goto(`${routes.account}/orders`)
    await expect(page.getByRole('heading', { name: /mis pedidos/i })).toBeVisible({
      timeout: 20_000,
    })

    const detailLink = page.getByRole('link', { name: 'Ver detalle' }).first()
    await expect(detailLink).toBeVisible({ timeout: 20_000 })
    await detailLink.click()

    await expect(page).toHaveURL(/\/account\/orders\//)
    await expect(page.getByText(/CR-/)).toBeVisible()
    await expect(page.locator('main')).toBeVisible()
  })
})
