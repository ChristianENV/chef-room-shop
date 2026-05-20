import type { AccountOrder } from '../types'
import { OrderDetailHeader } from './order-detail-header'
import { OrderEventsCard } from './order-events-card'
import { OrderItemsCard } from './order-items-card'
import { OrderNextActionsCard } from './order-next-actions-card'
import { OrderPaymentCard } from './order-payment-card'
import { OrderProgressTimeline } from './order-progress-timeline'
import { OrderShippingCard } from './order-shipping-card'
import { OrderStatusHero } from './order-status-hero'
import { OrderSupportCard } from './order-support-card'
import { OrderTotalsCard } from './order-totals-card'

type OrderDetailPageContentProps = {
  order: AccountOrder
}

/**
 * Full order detail layout (main + sidebar columns).
 */
export function OrderDetailPageContent({ order }: OrderDetailPageContentProps) {
  return (
    <div className="space-y-6">
      <OrderDetailHeader orderNumber={order.orderNumber} />
      <OrderStatusHero order={order} />

      <div className="grid gap-6 lg:grid-cols-3 lg:items-start">
        <div className="space-y-6 lg:col-span-2">
          <OrderProgressTimeline order={order} />
          <OrderItemsCard order={order} />
          <OrderEventsCard order={order} />
        </div>

        <aside className="space-y-6 lg:sticky lg:top-24">
          <OrderNextActionsCard order={order} />
          <OrderPaymentCard order={order} />
          <OrderShippingCard order={order} />
          <OrderTotalsCard order={order} />
          <OrderSupportCard orderNumber={order.orderNumber} />
        </aside>
      </div>
    </div>
  )
}
