import { expect, test } from '@playwright/test'

const CUSTOMIZER_SLUG =
  process.env.E2E_CUSTOMIZER_SLUG ?? 'demo-filipina-executive-blanca'

test.describe('customizer right panel UX', () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 })
    await page.goto(`/customize/${CUSTOMIZER_SLUG}`)
    await expect(page.getByTestId('customizer-root')).toBeVisible()
  })

  test('right panel has primary scroll and fabric swatches', async ({ page }) => {
    const panel = page.getByTestId('customizer-right-panel')
    await expect(panel).toBeVisible()

    const scroll = page.getByTestId('customizer-right-panel-scroll')
    await expect(scroll).toBeVisible()

    await expect(page.getByTestId('customizer-design-elements-section')).toBeVisible()
    await expect(page.getByTestId('customizer-tools-section')).toBeVisible()
    await expect(page.getByTestId('customizer-properties-section')).toBeVisible()
    await expect(page.getByTestId('customizer-fabric-colors-section')).toBeVisible()

    const chefWhite = page.getByTestId('customizer-fabric-color-swatch-chef-white')
    await expect(chefWhite).toBeVisible()
    await chefWhite.click()
    await expect(chefWhite).toHaveAttribute('aria-pressed', 'true')

    await page.getByRole('button', { name: /texto/i }).first().click()
    await page.getByTestId('customizer-add-text-button').first().click()

    await expect(page.getByTestId('customizer-design-element').first()).toBeVisible()
    await expect(page.getByTestId('customizer-text-input')).toBeVisible()

    const scrollMetrics = await scroll.evaluate((element) => ({
      clientHeight: element.clientHeight,
      scrollHeight: element.scrollHeight,
    }))
    expect(scrollMetrics.clientHeight).toBeGreaterThan(200)
    expect(scrollMetrics.scrollHeight).toBeGreaterThan(scrollMetrics.clientHeight)

    await expect(page.getByTestId('customizer-3d-load-error')).toHaveCount(0)
  })
})
