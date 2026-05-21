import { defineConfig, devices } from '@playwright/test'

const baseURL = process.env.PLAYWRIGHT_BASE_URL ?? 'http://localhost:3000'
const allowNoShipping = process.env.E2E_ALLOW_NO_SHIPPING === 'true'

/**
 * Chef Room E2E — critical MVP flows (see docs/qa-e2e.md).
 */
export default defineConfig({
  testDir: './e2e/specs',
  fullyParallel: false,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 1 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [['list'], ['html', { open: 'never' }]],
  timeout: 90_000,
  expect: { timeout: 15_000 },
  use: {
    baseURL,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    actionTimeout: 20_000,
    navigationTimeout: 45_000,
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  webServer: {
    command: 'npm run dev',
    url: baseURL,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
    env: {
      ...process.env,
      ALLOW_CHECKOUT_WITHOUT_SHIPPING: allowNoShipping ? 'true' : (process.env.ALLOW_CHECKOUT_WITHOUT_SHIPPING ?? 'false'),
      NEXT_PUBLIC_ALLOW_CHECKOUT_WITHOUT_SHIPPING: allowNoShipping
        ? 'true'
        : (process.env.NEXT_PUBLIC_ALLOW_CHECKOUT_WITHOUT_SHIPPING ?? 'false'),
    },
  },
})
