# In-app notifications (foundation)

Persistent in-app notifications for authenticated users. This phase covers database storage, server services, and GraphQL operations only — no UI, realtime delivery, or commerce event hooks yet.

## Model overview

`Notification` rows are stored in the `notifications` table.

| Field | Purpose |
| --- | --- |
| `userId` | Target user when the notification is user-specific |
| `audience` | `USER` (storefront) or `ADMIN` (admin panel) |
| `type` | Semantic category (`ORDER_CREATED`, `ADMIN_NEW_ORDER`, `SYSTEM`, …) |
| `title` / `message` | Display copy |
| `href` | Optional deep link for a future UI |
| `metadataJson` | Safe, non-sensitive context (order numbers, ids) |
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

query MyUnreadNotificationCount {
  myUnreadNotificationCount
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

mutation MarkAllNotificationsRead {
  markAllNotificationsRead {
    updatedCount
  }
}
```

`MyNotificationsInput`:

- `first` (default `20`, max `100`)
- `unreadOnly` (default `false`)

## Service usage examples

Create helpers live in `src/server/notifications/notification.service.ts` and accept a `PrismaClient` so future order/payment hooks can call them without GraphQL context.

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
  href: `/cuenta/pedidos/${orderNumber}`,
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

## Client hooks (foundation)

Typed fetch helpers and TanStack Query hooks are under `src/features/notifications/`:

- `useMyNotificationsQuery`
- `useMyUnreadNotificationCountQuery`
- `useMarkNotificationReadMutation`
- `useMarkAllNotificationsReadMutation`

No UI components consume these yet.

## v1 limitations

- No navbar bell or notification drawer UI
- No order/payment/shipping event integration
- No WebSockets, SSE, or push notifications (polling/refetch in a later UI phase)
- Simple `first` pagination only (no cursor/`after`)
- Metadata is filtered server-side for obvious sensitive keys but is not a full PII scrubber

## Future phases

1. **Customer UI** — bell icon, list panel, unread badge using existing hooks
2. **Admin UI** — admin notification center for `ADMIN` audience rows
3. **Event hooks** — emit notifications from checkout, payments, fulfillment, design saves
4. **Realtime / push** — optional subscriptions or mobile push after MVP polling proves out
