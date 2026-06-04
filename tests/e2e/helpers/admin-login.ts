import type { Page } from '@playwright/test'

const ADMIN_EMAIL = process.env.E2E_ADMIN_EMAIL ?? 'cnoriegava+1@gmail.com'
const ADMIN_PASSWORD = process.env.E2E_ADMIN_PASSWORD ?? '12345678'

/**
 * Logs in as admin and waits for the admin dashboard to load.
 * Navigates to /admin/login, fills credentials, submits.
 */
export async function loginAsAdmin(page: Page): Promise<void> {
  await page.goto('/admin/login')

  // Wait for the email input to be visible.
  const emailInput = page.locator('#email')
  await emailInput.waitFor({ state: 'visible' })

  await emailInput.fill(ADMIN_EMAIL)
  await page.locator('#password').fill(ADMIN_PASSWORD)
  // Use exact name to avoid matching "Iniciar sesión con Google".
  await page.getByRole('button', { name: 'Iniciar sesión', exact: true }).click()

  // Wait for redirect to admin dashboard (any /admin/* page that is not /login).
  await page.waitForURL(/\/admin(?!.*\/login)/, { timeout: 20_000 })
  // Let the page settle (auth cookie is available, hydration completes).
  await page.waitForLoadState('networkidle', { timeout: 10_000 }).catch(() => {
    // networkidle may never fire on long-polling apps; continue regardless.
  })
}
