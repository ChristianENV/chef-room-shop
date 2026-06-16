import { expect, test } from '@playwright/test'

import { loginAsAdmin } from '../helpers/admin-login'

test.describe('admin shipping page', () => {
  test('loads read-only shipments table for admin', async ({ page }) => {
    await loginAsAdmin(page)
    await page.goto('/admin/shipping')

    await expect(page.getByRole('heading', { name: 'Envíos' })).toBeVisible()
    await expect(page.getByTestId('admin-shipments-search')).toBeVisible()
    await expect(page.getByTestId('admin-shipments-status-filter')).toBeVisible()

    const table = page.getByTestId('admin-shipments-table')
    const empty = page.getByText('Sin envíos')

    await expect(table.or(empty)).toBeVisible({ timeout: 20_000 })
  })
})
