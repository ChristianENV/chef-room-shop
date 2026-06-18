# In-app notifications

Persistent in-app notifications for authenticated users and admins. Covers database storage, server services, GraphQL operations, customer/admin UI, and commerce event hooks.

## Model overview

`Notification` rows are stored in the `notifications` table.

| Field | Purpose |
| --- | --- |
| `userId` | Target user when the notification is user-specific |
| `audience` | `USER` (storefront) or `ADMIN` (admin panel) |
| `type` | Semantic category (`ORDER_CREATED`, `ADMIN_NEW_ORDER`, `SYSTEM`, …) |
| `title` / `message` | Display copy |
| `href` | Optional deep link |
| `metadataJson` | Safe, non-sensitive context (order numbers, ids) |
| `dedupeKey` | Optional unique key to prevent duplicate event notifications |
| `readAt` | Set when the recipient marks the notification read |
| `expiresAt` | Optional TTL; expired rows are hidden by default |

Visibility rules:

- Customers see only `USER` audience notifications where `userId` matches their account.
- `ADMIN` / `SUPERADMIN` users also see `ADMIN` audience notifications targeted to them (`userId`) or broadcast (`userId` null).
- Customers never see `ADMIN` audience notifications.

## GraphQL operations

Queries (session required):

```graphql
query MyNotifications($input: MyNotificationsInput) {
  myNotifications(input: $input) {
    nodes {
      id
      audience
      type
      title
      message
      href
      metadataJson
      readAt
      expiresAt
      createdAt
    }
    totalCount
  }
}

query MyUnreadNotificationCount($audience: NotificationAudience) {
  myUnreadNotificationCount(audience: $audience)
}
```

Mutations:

```graphql
mutation MarkNotificationRead($id: ID!) {
  markNotificationRead(id: $id) {
    id
    readAt
  }
}

mutation MarkAllNotificationsRead($audience: NotificationAudience) {
  markAllNotificationsRead(audience: $audience) {
    updatedCount
  }
}
```

`MyNotificationsInput`:

- `first` (default `20`, max `100`)
- `unreadOnly` (default `false`)
- `audience` (optional `USER` or `ADMIN` filter)

## Service usage examples

Create helpers live in `src/server/notifications/notification.service.ts` and accept a `PrismaClient` so order/payment hooks can call them without GraphQL context.

```ts
import { prisma } from '@/src/server/db/prisma'
import {
  createUserNotification,
  createAdminNotification,
} from '@/src/server/notifications/notification.service'
import { NotificationType } from '@prisma/client'

await createUserNotification(prisma, {
  userId: customerId,
  type: NotificationType.ORDER_CREATED,
  title: 'Pedido registrado',
  message: `Tu pedido ${orderNumber} fue creado.`,
  href: `/account/orders/${orderNumber}`,
  metadataJson: { orderNumber },
})

await createAdminNotification(prisma, {
  userId: null, // broadcast to all admins
  type: NotificationType.ADMIN_NEW_ORDER,
  title: 'Nuevo pedido',
  message: `Pedido ${orderNumber} listo para revisión.`,
  metadataJson: { orderNumber },
})
```

Read/update operations use `GraphQLContext` and enforce ownership in the service layer.

## Client hooks

Typed fetch helpers and TanStack Query hooks are under `src/features/notifications/`:

- `useMyNotificationsQuery`
- `useMyUnreadNotificationCountQuery`
- `useMarkNotificationReadMutation`
- `useMarkAllNotificationsReadMutation`

Customer UI: navbar bell + `/account/notifications`. Admin UI: topbar bell + `/admin/notifications`.

## Event hooks

### `ORDER_CREATED`

Hook location: `finalizeCheckoutOrderSideEffects` in `src/server/graphql/modules/checkout/checkout.service.ts`, called after the checkout order transaction succeeds (`createCheckoutOrder` and `completeCheckout`).

Implementation: `src/server/notifications/notify-order-created.ts`

| Audience | When | Type | Notes |
| --- | --- | --- | --- |
| `USER` | `order.userId` is set | `ORDER_CREATED` | Skipped for guest checkout (`userId` null) |
| `ADMIN` | Always | `ADMIN_NEW_ORDER` | Broadcast (`userId: null`) |

Copy:

- User: title `Pedido creado`, message `Recibimos tu pedido {orderNumber}.`, href `/account/orders/{orderNumber}`
- Admin: title `Nuevo pedido`, message `Pedido {orderNumber} recibido.`, href `/admin/orders/{orderNumber}`

Metadata allowed: `{ orderId, orderNumber }` only.

Dedupe keys (unique `dedupeKey` column):

- User: `order-created:user:{orderId}`
- Admin: `order-created:admin:{orderId}`

Error handling: `safeNotifyOrderCreated` logs failures and never throws, so checkout/order creation is not blocked.

### `PAYMENT_CONFIRMED`

Hook location: `sendConektaPaymentStatusEmails` in `src/server/payments/conekta/conekta-payment-apply.ts`, called after `applyConektaPaymentStatusUpdate` from:

- Conekta webhook processor (`conekta.webhook-processor.ts`)
- Manual payment verification (`syncOrderPaymentWithConekta` in `verify-order-payment.service.ts`)

Implementation: `src/server/notifications/notify-payment-confirmed.ts`

Notifications are created **only on transition** into `PaymentStatus.PAID` (`previousPaymentStatus !== PAID`). Repeated webhooks, manual verify clicks, or already-paid orders do not create new rows.

| Audience | When | Type | Notes |
| --- | --- | --- | --- |
| `USER` | Transition to PAID and `order.userId` is set | `PAYMENT_CONFIRMED` | Skipped for guest orders |
| `ADMIN` | Transition to PAID | `ADMIN_PAYMENT_RECEIVED` | Broadcast (`userId: null`) |

Copy:

- User: title `Pago confirmado`, message `Tu pago del pedido {orderNumber} fue confirmado.`, href `/account/orders/{orderNumber}`
- Admin: title `Pago recibido`, message `Pago confirmado para el pedido {orderNumber}.`, href `/admin/orders/{orderNumber}`

Metadata allowed: `{ orderId, orderNumber, paymentId }` only. Raw Conekta payloads, card data, tokens, and webhook bodies are never stored.

Dedupe keys:

- User: `payment-confirmed:user:{orderId}`
- Admin: `payment-confirmed:admin:{orderId}`

Error handling: `safeNotifyPaymentConfirmed` logs failures and never throws, so webhooks and payment verification are not blocked.

### `ORDER_IN_PRODUCTION`

Hook location: `admin-orders.service.ts`, called after successful status persistence from:

- `updateAdminOrderStatus`
- `moveAdminOrderToProduction`

Implementation: `src/server/notifications/notify-order-status-changed.ts`

Notifications are created **only on transition** into `OrderStatus.IN_PRODUCTION` (`previousStatus !== IN_PRODUCTION`). Repeated saves or already-in-production orders do not create new rows.

| Audience | When | Type | Notes |
| --- | --- | --- | --- |
| `USER` | Transition to `IN_PRODUCTION` and `order.userId` is set | `ORDER_IN_PRODUCTION` | Skipped for guest orders |

Copy:

- User: title `Tu pedido está en producción`, message `Tu pedido {orderNumber} ya entró a producción.`, href `/account/orders/{orderNumber}`

Metadata allowed: `{ orderId, orderNumber, status }` only.

Dedupe key: `order-status:in-production:{orderId}`

Error handling: `safeNotifyOrderStatusChanged` logs failures and never throws, so admin status updates are not blocked.

### `ORDER_READY_TO_SHIP`

Hook location: `admin-orders.service.ts`, called after successful status persistence from:

- `updateAdminOrderStatus`
- `markAdminOrderReadyToShip`

Implementation: `src/server/notifications/notify-order-status-changed.ts`

Notifications are created **only on transition** into `OrderStatus.READY_TO_SHIP` (`previousStatus !== READY_TO_SHIP`).

| Audience | When | Type | Notes |
| --- | --- | --- | --- |
| `USER` | Transition to `READY_TO_SHIP` and `order.userId` is set | `ORDER_READY_TO_SHIP` | Skipped for guest orders |

Copy:

- User: title `Tu pedido está listo para envío`, message `Tu pedido {orderNumber} ya está listo para envío.`, href `/account/orders/{orderNumber}`

Metadata allowed: `{ orderId, orderNumber, status }` only.

Dedupe key: `order-status:ready-to-ship:{orderId}`

Error handling: `safeNotifyOrderStatusChanged` logs failures and never throws, so admin status updates are not blocked.

No admin notifications, emails, or realtime delivery are part of this phase.

## v1 limitations

- No WebSockets, SSE, or push notifications (polling/refetch in UI)
- Simple `first` pagination only (no cursor/`after`)
- Metadata is filtered server-side for obvious sensitive keys but is not a full PII scrubber
- Payment pending/failed, shipping carrier events, delivered, and other commerce events are not hooked yet

## Future phases

1. **More event hooks** — shipping carrier updates, delivered, design saves
2. **Realtime / push** — optional subscriptions or mobile push after MVP polling proves out
