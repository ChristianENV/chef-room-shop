import type { AccountOrder } from '../types'

type OrderEventsCardProps = {
  order: AccountOrder
}

/**
 * Chronological order event history from BFF.
 */
export function OrderEventsCard({ order }: OrderEventsCardProps) {
  if (order.events.length === 0) return null

  return (
    <section
      className="rounded-xl border border-border bg-card p-6"
      aria-labelledby="order-events-title"
    >
      <h2 id="order-events-title" className="font-sans text-lg font-semibold text-foreground">
        Historial
      </h2>
      <ul className="mt-4 space-y-3">
        {order.events.map((event) => (
          <li
            key={event.id}
            className="border-l-2 border-primary/20 pl-4 font-serif text-sm"
          >
            <time className="text-xs text-muted-foreground">
              {new Date(event.createdAt).toLocaleString('es-MX', {
                dateStyle: 'medium',
                timeStyle: 'short',
              })}
            </time>
            <p className="mt-0.5 text-foreground">{event.message}</p>
          </li>
        ))}
      </ul>
    </section>
  )
}
