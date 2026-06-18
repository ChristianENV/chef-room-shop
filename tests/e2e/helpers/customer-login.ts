import type { Page } from '@playwright/test'

const CUSTOMER_EMAIL =
  process.env.E2E_CUSTOMER_EMAIL ?? 'cliente.demo+1@chefroom.test'
const CUSTOMER_PASSWORD = process.env.E2E_CUSTOMER_PASSWORD ?? '12345678'

/**
 * Logs in as a storefront customer and waits for redirect away from /login.
 */
export async function loginAsCustomer(page: Page): Promise<void> {
  await page.goto('/login')

  const emailInput = page.locator('#email')
  await emailInput.waitFor({ state: 'visible' })

  await emailInput.fill(CUSTOMER_EMAIL)
  await page.locator('#password').fill(CUSTOMER_PASSWORD)
  await page.getByRole('button', { name: 'Iniciar sesión', exact: true }).click()

  await page.waitForURL((url) => !url.pathname.startsWith('/login'), {
    timeout: 20_000,
  })

  await page.waitForLoadState('networkidle', { timeout: 10_000 }).catch(() => {
    // networkidle may never fire on polling apps; continue regardless.
  })
}
