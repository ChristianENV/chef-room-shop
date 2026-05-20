# Account BFF (GraphQL v1)

Authenticated account operations at `POST /api/graphql`. Requires a valid **Better Auth** session cookie (`credentials: 'include'`).

## Security

- All account queries and mutations call `requireAuthenticatedAccount(context)`.
- **Never** pass `userId` from the client — data is scoped to `context.currentUser.id` only.
- Cross-user access returns `null` (orders) or `Dirección no encontrada` (addresses), never another user's data.
- Not exposed: `rawResponseJson`, Conekta webhooks, Better Auth `Account`/`Session` tables, audit logs.

## Queries

| Query | Description |
|-------|-------------|
| `meProfile` | User profile + roles |
| `myAccountSummary` | Dashboard counts + recent orders/designs |
| `myOrders(limit, offset)` | Order list with items, payments, shipments, events |
| `myOrderByNumber(orderNumber)` | Single order or `null` |
| `myDesigns(limit, offset, status)` | Saved designs + optional product |
| `myAddresses` | Shipping/billing addresses |

## Mutations

| Mutation | Description |
|----------|-------------|
| `updateMyProfile` | firstName, lastName, phone, marketingOptIn only |
| `createMyAddress` | New address |
| `updateMyAddress` | Update owned address |
| `deleteMyAddress` | Soft delete |
| `setDefaultAddress` | Default for type (`SHIPPING`, `BILLING`, `BOTH`) |

## Smoke examples

### MeProfile

```graphql
query MeProfile {
  meProfile {
    id
    email
    firstName
    lastName
    roles
  }
}
```

### MyOrders

```graphql
query MyOrders {
  myOrders(limit: 5) {
    orderNumber
    status
    paymentStatus
    totalCents
    items { name quantity totalPriceCents }
    payments { method status amountCents }
    shipments { carrier trackingNumber status }
  }
}
```

### MyDesigns

```graphql
query MyDesigns {
  myDesigns(limit: 5) {
    id
    name
    status
    previewUrl
    finalPriceCents
    product { name slug }
  }
}
```

### MyAddresses

```graphql
query MyAddresses {
  myAddresses {
    id
    type
    street
    city
    state
    postalCode
    isDefault
  }
}
```

## Testing with session cookie

1. Log in via Better Auth (`/login` or `/api/auth/sign-in/email`).
2. In the same browser, call `POST /api/graphql` with the session cookie (browser DevTools → Network, or curl with `Cookie:` header from Application tab).

### Demo users (seed)

| User | Password |
|------|----------|
| `cliente.demo+1@chefroom.test` | `12345678` |
| `cnoriegava+2@gmail.com` | `12345678` |

## Frontend (prepared, UI not wired)

- Documents: `src/features/storefront/account/graphql/`
- API: `src/features/storefront/account/api/account.api.ts`
- Hooks: `useMeProfileQuery`, `useMyOrdersQuery`, etc.

## Pendientes

- Conectar páginas `/account/*` (reemplazar mocks)
- Guest order claim
- Email verification / password reset
- Tracking público por token
- Order mutations (cancel, etc.)
