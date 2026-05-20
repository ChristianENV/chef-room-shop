import type { AccountOrder } from '../types'
import { OrderItemRow } from './order-item-row'

type OrderItemsCardProps = {
  order: AccountOrder
}

/**
 * Lists purchased products and customization details.
 */
export function OrderItemsCard({ order }: OrderItemsCardProps) {
  return (
    <section
      className="rounded-xl border border-border bg-card p-6"
      aria-labelledby="order-items-title"
    >
      <h2 id="order-items-title" className="font-sans text-lg font-semibold text-foreground">
        Productos
      </h2>
      <ul className="mt-4">
        {order.items.map((item) => (
          <OrderItemRow key={item.id} item={item} />
        ))}
      </ul>
    </section>
  )
}
