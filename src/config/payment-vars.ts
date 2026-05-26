/**
 * Non-secret payment UX constants (safe to import from client).
 */

export const CASH_PAYMENT_LOCATIONS = [
  'Practicajas BBVA',
  '7-Eleven',
  'Farmacias del Ahorro',
  'Tiendas Extra',
  'Círculo K',
  'Farmacia Benavides',
  'Soriana',
  "Waldo's",
  'Eleczion',
  'Super Kiosko',
  'Farmacias Bazar',
  'Woolworth',
  'Del Sol',
  'Yepas',
  'Al Súper',
] as const

export const PAYMENT_METHOD_LABELS = {
  CARD: 'Tarjeta',
  OXXO: 'Pago en efectivo',
  SPEI: 'SPEI',
  card: 'Tarjeta',
  oxxo: 'Pago en efectivo',
  spei: 'SPEI',
} as const

export function resolvePaymentMethodLabel(method: string | undefined | null): string {
  if (!method) return '—'
  const key = method as keyof typeof PAYMENT_METHOD_LABELS
  return PAYMENT_METHOD_LABELS[key] ?? method
}
