import { expect, test } from '@playwright/test'

const CUSTOMIZER_SLUG = process.env.E2E_CUSTOMIZER_SLUG ?? 'demo-filipina-clasica'

test.describe('customizer section navigation', () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 })
    await page.goto(`/customize/${CUSTOMIZER_SLUG}`)
    await expect(page.getByTestId('customizer-root')).toBeVisible()
  })

  test('left nav shows one isolated section at a time', async ({ page }) => {
    const product = page.getByTestId('customizer-section-product')
    const colors = page.getByTestId('customizer-section-colors')
    const text = page.getByTestId('customizer-section-text')
    const logos = page.getByTestId('customizer-section-logos')
    const extras = page.getByTestId('customizer-section-extras')
    const designs = page.getByTestId('customizer-section-designs')

    await expect(page.locator('[data-slot="accordion-trigger"]')).toHaveCount(0)

    await page.getByTestId('customizer-left-nav-product').click()
    await expect(product).toBeVisible()
    await expect(colors).toHaveCount(0)
    await expect(text).toHaveCount(0)
    await expect(logos).toHaveCount(0)

    await page.getByTestId('customizer-left-nav-colors').click()
    await expect(colors).toBeVisible()
    await expect(page.getByTestId('customizer-base-colors')).toBeVisible()
    await expect(product).toHaveCount(0)
    await expect(text).toHaveCount(0)
    await expect(logos).toHaveCount(0)

    await page.getByTestId('customizer-left-nav-text').click()
    await expect(text).toBeVisible()
    await expect(page.getByTestId('customizer-add-text-button')).toBeVisible()
    await expect(colors).toHaveCount(0)
    await expect(product).toHaveCount(0)
    await expect(logos).toHaveCount(0)

    await page.getByTestId('customizer-left-nav-logos').click()
    await expect(logos).toBeVisible()
    await expect(text).toHaveCount(0)
    await expect(colors).toHaveCount(0)

    await page.getByTestId('customizer-left-nav-extras').click()
    await expect(extras).toBeVisible()
    await expect(page.getByTestId('customizer-size-options')).toBeVisible()
    await expect(product).toHaveCount(0)
    await expect(colors).toHaveCount(0)
    await expect(text).toHaveCount(0)
    await expect(logos).toHaveCount(0)

    await page.getByTestId('customizer-left-nav-designs').click()
    await expect(designs).toBeVisible()
    await expect(page.getByTestId('customizer-recent-designs-section')).toBeVisible()
    await expect(product).toHaveCount(0)
    await expect(colors).toHaveCount(0)
    await expect(text).toHaveCount(0)
    await expect(logos).toHaveCount(0)
    await expect(extras).toHaveCount(0)
  })
})
