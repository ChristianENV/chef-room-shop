# GraphQL Admin Dashboard BFF v1

Read-only admin queries for `/admin/dashboard`. Authentication via Better Auth session cookie (`credentials: include`).

## Authorization

All queries call `requireAdminGraphQL(context)`:

- Requires `context.currentUser` from the session.
- Role must be **ADMIN** or **SUPERADMIN** (`canAccessAdmin`).
- **CUSTOMER** receives `FORBIDDEN`.
- Never accepts `userId` from the client.

## Queries

| Query | Default limit | Max limit |
|-------|---------------|-----------|
| `adminDashboardMetrics` | — | — |
| `adminRecentOrders` | 8 | 50 |
| `adminProductionQueue` | 8 | 50 |
| `adminRecentDesigns` | 8 | 50 |
| `adminRecentPayments` | 8 | 50 |
| `adminTopProducts` | 5 | 20 |

### Metrics semantics

- **salesTodayCents / salesMonthCents**: Sum of `totalCents` for paid orders (`PAID`, `IN_PRODUCTION`, `READY_TO_SHIP`, `SHIPPED`, `DELIVERED`) using `placedAt`, or `createdAt` when `placedAt` is null.
- **pendingOrders**: `OrderStatus.PENDING_PAYMENT`.
- **designsCreated**: Designs created in the **current calendar month** (server local time).
- **abandonedCarts**: `CartStatus.ABANDONED`.
- **averageOrderValueCents**: Average `totalCents` of paid orders.
- **totalCustomers**: Users with role `CUSTOMER`.

### Production queue

Orders with status `PAID`, `IN_PRODUCTION`, or `READY_TO_SHIP`, oldest first.

`estimatedDeliveryDate` is a placeholder: `createdAt + 7 days` (no dedicated field in schema).

### Not exposed

- Better Auth accounts/sessions
- `PaymentAttempt.rawResponseJson` / webhook payloads
- Full `Design.configJson`
- Conekta secrets

## Example — metrics

```graphql
query Metrics {
  adminDashboardMetrics {
    salesTodayCents
    salesMonthCents
    pendingOrders
    designsCreated
    abandonedCarts
    averageOrderValueCents
    totalOrders
    totalCustomers
  }
}
```

## Example — lists

```graphql
query AdminDashboardLists {
  adminRecentOrders(limit: 5) {
    orderNumber
    customerEmail
    totalCents
    status
    paymentStatus
    itemCount
    hasCustomDesign
  }
  adminProductionQueue(limit: 5) {
    orderNumber
    productNames
    customizationTypes
    status
    estimatedDeliveryDate
  }
  adminRecentDesigns(limit: 5) {
    name
    status
    productName
    customerEmail
    finalPriceCents
  }
  adminRecentPayments(limit: 5) {
    orderNumber
    provider
    method
    status
    amountCents
  }
  adminTopProducts(limit: 5) {
    productName
    orderCount
    revenueCents
  }
}
```

## Demo seed

After `prisma db seed` (demo commerce):

- ~25 demo orders across statuses (5 pending, paid, in production, shipped, etc.)
- Payments linked to orders (no raw payloads in API)
- Designs for first 15 demo customers
- Abandoned carts for demo users

**Admin login (smoke):** `cnoriega+2@gmail.com` / `12345678`

**Customer (must fail):** `cliente.demo+1@chefroom.test` / `12345678`

## Frontend hooks (UI not wired yet)

- `useAdminDashboardMetricsQuery`
- `useAdminRecentOrdersQuery`
- `useAdminProductionQueueQuery`
- `useAdminRecentDesignsQuery`
- `useAdminRecentPaymentsQuery`
- `useAdminTopProductsQuery`

Documents: `src/features/admin/dashboard/graphql/admin-dashboard.queries.ts`

## Pending

- Wire `/admin/dashboard` UI (replace mocks)
- Admin mutations (order status, refunds, etc.)
- Charts / exports / realtime
