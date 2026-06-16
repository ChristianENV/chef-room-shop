import { expect, test } from '@playwright/test'

import { loginAsAdmin } from '../helpers/admin-login'

test.describe('admin payments page', () => {
  test('loads read-only payments table for admin', async ({ page }) => {
    await loginAsAdmin(page)
    await page.goto('/admin/payments')

    await expect(page.getByRole('heading', { name: 'Pagos' })).toBeVisible()
    await expect(page.getByTestId('admin-payments-search')).toBeVisible()
    await expect(page.getByTestId('admin-payments-status-filter')).toBeVisible()

    const table = page.getByTestId('admin-payments-table')
    const empty = page.getByText('Sin pagos')

    await expect(table.or(empty)).toBeVisible({ timeout: 20_000 })
  })
})
