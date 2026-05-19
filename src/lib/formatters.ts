const currencyFormatter = new Intl.NumberFormat('es-MX', {
  style: 'currency',
  currency: 'MXN',
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
})

/**
 * Formats a numeric amount as Mexican pesos (MXN).
 */
export function formatCurrencyMXN(value: number): string {
  return currencyFormatter.format(value)
}
