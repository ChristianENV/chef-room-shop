# Admin User Management

This document describes the admin user management feature — Phase 1 and Phase 2.

## Routes

| Route                    | Description                                              |
| ------------------------ | -------------------------------------------------------- |
| `/admin/users`           | Redirects to `/admin/users/customers`                    |
| `/admin/users/customers` | Customer segment (users with no ADMIN/SUPERADMIN role)   |
| `/admin/users/admins`    | Admin/team segment (users with ADMIN or SUPERADMIN role) |

## Segmentation Rules

- **Customers view** (`/admin/users/customers`): Shows users that have **no** `ADMIN` or `SUPERADMIN` role.
- **Admins/team view** (`/admin/users/admins`): Shows users that have **at least one** `ADMIN` or `SUPERADMIN` role.
- A user with **both** `CUSTOMER` and `ADMIN` roles appears in the **Admins/team** view, not the Customers view.
- Deleted/blocked users (those with `deletedAt != null`) are **excluded** from normal lists unless the status filter is explicitly set to `DELETED`.

## Status Semantics

### Pause (Suspend)

- Sets `status = SUSPENDED`.
- Does **not** modify `deletedAt`.
- Reversible by calling `reactivateAdminUser`.
- Does **not** affect login sessions (not enforced at auth level — by design for Phase 1).

### Block

- Sets `status = DELETED` **and** `deletedAt = now()`.
- Uses the existing soft-delete mechanism.
- Because `getCurrentUser()` filters `deletedAt: null`, a blocked user's active sessions become invalid immediately.
- Reversible by calling `reactivateAdminUser`.

### Reactivate

- For `SUSPENDED` users: sets `status = ACTIVE` (leaves `deletedAt = null`).
- For `DELETED` (blocked) users: sets `status = ACTIVE` **and** clears `deletedAt = null`.

## Permission Rules

| Operation             | Required Permission                                                   |
| --------------------- | --------------------------------------------------------------------- |
| List users            | `users.read` (enforced in GraphQL resolver via `requireAdminGraphQL`) |
| `adminUser(id)`       | `users.read` (requires ADMIN or SUPERADMIN role)                      |
| `updateAdminUser`     | `users.write`                                                         |
| `pauseAdminUser`      | `users.write`                                                         |
| `blockAdminUser`      | `users.write`                                                         |
| `reactivateAdminUser` | `users.write`                                                         |

**SUPERADMIN** implicitly has all permissions.  
**ADMIN** has `users.read` by default (seeded). Must be explicitly granted `users.write` to mutate.

## Safety Rules

1. **Cannot act on self**: A user cannot pause or block their own account.
2. **ADMIN cannot target SUPERADMIN**: A user without `SUPERADMIN` role cannot pause, block, or edit a user who has the `SUPERADMIN` role.
3. **Last SUPERADMIN protection**: The system prevents pausing or blocking the last active SUPERADMIN (counted by `status = ACTIVE` and `deletedAt = null`).
4. **Allowed edit fields**: `name`, `firstName`, `lastName`, `phone`, `customerTier` (for customers only). All other fields — including `email`, `password`, `emailVerified`, and auth provider data — cannot be edited through this interface.

## GraphQL API

### Queries

```graphql
adminUser(id: ID!): AdminUser
adminUsers(filter: AdminUsersFilterInput, limit: Int, offset: Int): AdminUsersPayload!
```

### Mutations

```graphql
updateAdminUser(input: UpdateAdminUserInput!): AdminUser!
pauseAdminUser(id: ID!): AdminUser!
blockAdminUser(id: ID!): AdminUser!
reactivateAdminUser(id: ID!): AdminUser!
```

### Inputs

```graphql
input AdminUsersFilterInput {
  search: String
  role: String
  status: String
  segment: String # "CUSTOMERS" | "ADMINS"
}

input UpdateAdminUserInput {
  id: ID!
  name: String
  firstName: String
  lastName: String
  phone: String
  customerTier: String
}
```

## Audit Logging

All mutations write an `AuditLog` entry with:

- `action: UPDATE`
- `entityType: 'User'`
- `entityId: <target user id>`
- `userId: <acting admin id>`
- `metadataJson: { action: 'pause' | 'block' | 'reactivate' | 'update_profile', previousStatus? }`

## What Is Intentionally NOT Handled at Auth Level

- **SUSPENDED users can still log in.** The `UserStatus.SUSPENDED` value is not enforced at the Better Auth / session creation level. Only `deletedAt != null` (i.e., blocked users) is enforced through the existing `getCurrentUser()` filter. This is by design for Phase 1 — auth-level enforcement for SUSPENDED users requires changes to the Better Auth session flow, which is explicitly out of scope.

## Future Phases

### Phase 3: Invitation System

- Invite model and Prisma table.
- Admin invite flow: send invite email → user registers via token → auto-assign role.
- Customer invite flow (marketing campaigns).
- Invite token expiry and revocation.
- Email sending (SMTP/SendGrid/Resend).

### Phase 4: Auth-Level Suspension Enforcement

- Enforce `status = SUSPENDED` at login time (requires Better Auth configuration changes).
- Session invalidation on status change.

### Phase 5: Role Management UI

- Assign/remove roles through admin UI.
- Granular permission management per user.
