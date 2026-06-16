import { expect, test } from '@playwright/test'

import { loginAsAdmin } from '../helpers/admin-login'

test.describe('admin designs page', () => {
  test('loads read-only designs table for admin', async ({ page }) => {
    await loginAsAdmin(page)
    await page.goto('/admin/designs')

    await expect(page.getByRole('heading', { name: 'Diseños' })).toBeVisible()
    await expect(page.getByTestId('admin-designs-search')).toBeVisible()
    await expect(page.getByTestId('admin-designs-status-filter')).toBeVisible()
    await expect(page.getByTestId('admin-designs-owner-filter')).toBeVisible()

    const table = page.getByTestId('admin-designs-table')
    const empty = page.getByText('Sin diseños')

    await expect(table.or(empty)).toBeVisible({ timeout: 20_000 })
  })
})
