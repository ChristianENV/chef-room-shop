import { expect, test } from '@playwright/test'

const CUSTOMIZER_SLUG =
  process.env.E2E_CUSTOMIZER_SLUG ?? 'demo-filipina-clasica'

test.describe('customizer left accordion', () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 })
    await page.goto(`/customize/${CUSTOMIZER_SLUG}`)
    await expect(page.getByTestId('customizer-root')).toBeVisible()
  })

  test('sections can expand and collapse while keeping content in the panel', async ({ page }) => {
    const colorsAccordion = page.getByTestId('customizer-accordion-colors')
    await expect(colorsAccordion).toBeVisible()

    await colorsAccordion.getByRole('button').click()
    await expect(page.getByTestId('customizer-base-colors')).toBeVisible()

    const tallaAccordion = page.getByTestId('customizer-accordion-size')
    await tallaAccordion.getByRole('button').click()
    await expect(page.getByTestId('customizer-size-options')).toBeVisible()

    await page.getByRole('button', { name: /colores/i }).first().click()
    await expect(page.getByTestId('customizer-base-colors')).toBeVisible()
  })

  test('rail extras opens talla section for size selection', async ({ page }) => {
    await page.getByRole('button', { name: /extras/i }).first().click()
    await expect(page.getByTestId('customizer-size-options')).toBeVisible()
  })
})
