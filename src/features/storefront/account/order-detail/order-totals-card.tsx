import { centsToPesos, formatCurrencyMXN } from '@/src/lib/formatters'
import { isProductOptionsEnabled } from '@/src/config/features'
import type { AccountOrder } from '../types'

type OrderTotalsCardProps = {
  order: AccountOrder
}

/**
 * Order totals breakdown in MXN.
 */
export function OrderTotalsCard({ order }: OrderTotalsCardProps) {
  const showCommercialOptions = isProductOptionsEnabled()
  const customizationCents = order.customizationTotalCents ?? 0
  const optionTotalCents = showCommercialOptions
    ? order.items.reduce((sum, item) => sum + (item.optionPriceCents ?? 0) * item.quantity, 0)
    : 0
  const shippingCents = order.shippingCostCents ?? 0
  const discountCents = order.discountTotalCents ?? 0
  const taxCents = order.taxTotalCents ?? 0

  const rows = [
    { label: 'Subtotal', cents: order.subtotalCents },
    ...(customizationCents > 0 ? [{ label: 'Personalización', cents: customizationCents }] : []),
    ...(optionTotalCents > 0 ? [{ label: 'Opciones', cents: optionTotalCents }] : []),
    { label: 'Envío', cents: shippingCents },
    ...(discountCents > 0 ? [{ label: 'Descuento', cents: -discountCents }] : []),
    ...(taxCents > 0 ? [{ label: 'Impuestos', cents: taxCents }] : []),
  ]

  return (
    <section
      className="rounded-xl border border-border bg-card p-6"
      aria-labelledby="order-totals-title"
    >
      <h2 id="order-totals-title" className="font-sans text-lg font-semibold text-foreground">
        Totales
      </h2>
      <dl className="mt-4 space-y-2">
        {rows.map((row) => (
          <div key={row.label} className="flex justify-between gap-4 font-serif text-sm">
            <dt className="text-muted-foreground">{row.label}</dt>
            <dd
              className={
                row.label === 'Descuento'
                  ? 'font-sans font-medium text-success'
                  : 'font-sans font-medium text-foreground'
              }
            >
              {row.label === 'Descuento'
                ? `− ${formatCurrencyMXN(centsToPesos(row.cents))}`
                : formatCurrencyMXN(centsToPesos(row.cents))}
            </dd>
          </div>
        ))}
        <div className="flex justify-between gap-4 border-t border-border pt-3">
          <dt className="font-sans font-semibold text-foreground">Total</dt>
          <dd className="font-sans text-xl font-bold text-primary">
            {formatCurrencyMXN(centsToPesos(order.totalCents))}
          </dd>
        </div>
      </dl>
    </section>
  )
}
