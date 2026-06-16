import { expect, test } from '@playwright/test'

import { loginAsAdmin } from '../helpers/admin-login'

test.describe('admin users page', () => {
  test('loads read-only users table for admin', async ({ page }) => {
    await loginAsAdmin(page)
    await page.goto('/admin/users')

    await expect(page.getByRole('heading', { name: 'Usuarios' })).toBeVisible()
    await expect(page.getByTestId('admin-users-search')).toBeVisible()
    await expect(page.getByTestId('admin-users-role-filter')).toBeVisible()
    await expect(page.getByTestId('admin-users-status-filter')).toBeVisible()

    const table = page.getByTestId('admin-users-table')
    const empty = page.getByText('Sin usuarios')

    await expect(table.or(empty)).toBeVisible({ timeout: 20_000 })
  })
})
