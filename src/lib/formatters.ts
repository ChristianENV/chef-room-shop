const currencyFormatter = new Intl.NumberFormat('es-MX', {
  style: 'currency',
  currency: 'MXN',
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
})

/**
 * Converts integer cents from the BFF to whole pesos for UI display.
 */
export function centsToPesos(cents: number): number {
  return Math.round(cents / 100)
}

/**
 * Formats a numeric amount as Mexican pesos (MXN).
 */
export function formatCurrencyMXN(value: number): string {
  return currencyFormatter.format(value)
}
