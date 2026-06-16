import { expect, test } from '@playwright/test'

import { loginAsAdmin } from '../helpers/admin-login'

test.describe('admin settings page', () => {
  test('loads read-only settings overview for admin', async ({ page }) => {
    await loginAsAdmin(page)
    await page.goto('/admin/settings')

    await expect(page.getByRole('heading', { name: 'Configuración' })).toBeVisible()
    await expect(page.getByTestId('admin-settings-overview')).toBeVisible({ timeout: 20_000 })
    await expect(page.getByTestId('admin-settings-store-section')).toBeVisible()
    await expect(page.getByTestId('admin-settings-brand-section')).toBeVisible()
    await expect(page.getByTestId('admin-settings-notifications-section')).toBeVisible()
    await expect(page.getByTestId('admin-settings-shipping-section')).toBeVisible()
    await expect(page.getByTestId('admin-settings-environment-section')).toBeVisible()
  })
})
