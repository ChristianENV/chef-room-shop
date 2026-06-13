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

    // Fabric colors now live in the left "Colores" category, not the right panel.
    await page.getByRole('button', { name: /colores/i }).first().click()
    await expect(page.getByTestId('customizer-fabric-colors-section')).toBeVisible()
    const swatches = page.getByTestId(/^customizer-fabric-color-swatch-/)
    await expect(swatches.first()).toBeVisible()
    await swatches.first().click()
    await expect(swatches.first()).toHaveAttribute('aria-pressed', 'true')

    // Unified "Texto y nombres" opens the editor modal with the input ready.
    await page.getByRole('button', { name: /texto/i }).first().click()
    await page.getByTestId('customizer-add-text-button').first().click()

    await expect(page.getByTestId('customizer-text-editor-dialog')).toBeVisible()
    await expect(page.getByTestId('customizer-text-input')).toBeVisible()
    await page.getByTestId('customizer-text-input').fill('Chef Ana')
    await page.getByTestId('customizer-text-done-button').click()

    await expect(page.getByTestId('customizer-design-element').first()).toBeVisible()

    const scrollMetrics = await scroll.evaluate((element) => ({
      clientHeight: element.clientHeight,
      scrollHeight: element.scrollHeight,
    }))
    expect(scrollMetrics.clientHeight).toBeGreaterThan(200)

    await expect(page.getByTestId('customizer-3d-load-error')).toHaveCount(0)
  })
})
