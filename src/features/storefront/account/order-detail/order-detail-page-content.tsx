import { OrderDetailLayout } from '@/src/features/storefront/orders/components/order-detail-layout'
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
    <div data-testid="account-order-detail-page" className="space-y-6">
      <OrderDetailLayout
        header={<OrderDetailHeader orderNumber={order.orderNumber} />}
        hero={<OrderStatusHero order={order} />}
        timeline={<OrderProgressTimeline order={order} />}
        items={<OrderItemsCard order={order} />}
        events={<OrderEventsCard order={order} />}
        sidebar={
          <>
            <OrderNextActionsCard order={order} />
            <OrderPaymentCard order={order} />
            <OrderShippingCard order={order} />
            <OrderTotalsCard order={order} />
            <OrderSupportCard orderNumber={order.orderNumber} />
          </>
        }
      />
    </div>
  )
}
