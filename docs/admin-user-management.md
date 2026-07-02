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

## Invitations (Phase 3A — implemented)

Admin users with `users.write` can create, revoke, and resend invitations. Listing requires `users.read`.

### Routes

| Route                      | Description                     |
| -------------------------- | ------------------------------- |
| `/admin/users/invitations` | Invitations list and management |

Segment tabs: **Clientes** | **Equipo / Admin** | **Invitaciones**

### UserInvitation model

- `email` — normalized lowercase
- `targetRole` — `CUSTOMER` or `ADMIN` only (SUPERADMIN not allowed in v1)
- `tokenHash` — SHA-256 hex digest; **never exposed via GraphQL**
- `status` — `PENDING`, `ACCEPTED`, `REVOKED`, `EXPIRED`
- `invitedByUserId`, `expiresAt` (default 7 days), `acceptedAt`, `revokedAt`, optional `metadataJson`

### Status semantics

| Status     | Meaning                                     |
| ---------- | ------------------------------------------- |
| `PENDING`  | Sent, awaiting acceptance                   |
| `ACCEPTED` | Consumed (Phase 3B)                         |
| `REVOKED`  | Admin cancelled                             |
| `EXPIRED`  | Past `expiresAt` (lazy-marked on list read) |

### Token security

- Raw token: `randomBytes(32).base64url` — **only in email URL**
- Stored: `tokenHash` (SHA-256)
- Resend rotates token and refreshes expiry
- Duplicate pending invite for same `(email, targetRole)` is superseded (old invite revoked)

### GraphQL (Phase 3A)

```graphql
adminUserInvitations(filter, limit, offset): AdminUserInvitationsPayload!
createUserInvitation(input: CreateUserInvitationInput!): UserInvitation!
revokeUserInvitation(input: RevokeUserInvitationInput!): UserInvitation!
resendUserInvitation(input: ResendUserInvitationInput!): UserInvitation!
```

### Permissions

| Operation                | Permission           |
| ------------------------ | -------------------- |
| List invitations         | `users.read`         |
| Create / revoke / resend | `users.write`        |
| SUPERADMIN target role   | **Disallowed** in v1 |

### Email

- Template: `user_invitation`
- Link format: `/accept-invite?token=<raw>`

### Error codes

- `USER_ALREADY_HAS_ROLE` — target user already has the invited role
- `USER_BLOCKED` — target email belongs to a blocked/deleted user
- `INVALID_TARGET_ROLE` — SUPERADMIN or other disallowed role
- `INVITATION_NOT_PENDING` — revoke/resend on non-pending invite

### Auth core

Invitations do **not** modify Better Auth, login, register, session, or Verification tables.

## Public accept-invite flow (Phase 3B — implemented)

Invited users open `/accept-invite?token=<raw>` from the email link. Acceptance happens in **application code after normal signup/login** — not via Better Auth hooks.

### Route

| Route            | Description                              |
| ---------------- | ---------------------------------------- |
| `/accept-invite` | Public invitation preview and acceptance |

Query: `?token=<rawToken>`

### GraphQL (public)

```graphql
previewUserInvitation(token: String!): PublicUserInvitationPreview!
acceptUserInvitation(token: String!): AcceptUserInvitationPayload!
```

- `previewUserInvitation` — no auth required; returns masked email, role label, status, `existingUserHint` (`new` | `existing`) when valid
- `acceptUserInvitation` — requires authenticated session; email must match invitation

### User flows

**New user** (`existingUserHint: new`):

1. Preview shows role and masked email.
2. Scoped `AcceptInviteSignupForm` on the accept page calls existing `signUp.email` (email pre-filled and locked).
3. After session exists (and email verified if required), `acceptUserInvitation` runs.
4. Redirect: `CUSTOMER` → `/account`; `ADMIN` → `/admin/login` or `/admin/dashboard` if already allowed.

**Existing user** (`existingUserHint: existing`):

1. Preview shows login CTA.
2. Login uses `callbackUrl` back to `/accept-invite?token=...` (global login form unchanged).
3. After session exists, `acceptUserInvitation` runs with same redirects.

**Invalid / expired / revoked / accepted**:

- Generic safe error copy; no email enumeration.
- `tokenHash` never exposed.

### Role assignment (application layer)

- `assignRoleIfMissing(db, userId, roleSlug)` in `roles-core.ts`
- `CUSTOMER` invite → ensures `CUSTOMER` role
- `ADMIN` invite → ensures `ADMIN` + `CUSTOMER` roles
- `SUPERADMIN` invites rejected on accept (v1)
- Idempotent — safe to call if role already exists

### Security rules

| Rule                         | Enforcement                                         |
| ---------------------------- | --------------------------------------------------- |
| Token storage                | SHA-256 hash only in DB                             |
| Raw token                    | URL / client state only; never logged               |
| Email match                  | Session email must equal invitation email           |
| Blocked users                | `deletedAt` or `status = DELETED` rejected          |
| Suspended users              | Rejected with reactivation message                  |
| Expired / revoked / accepted | Rejected with status-specific message               |
| Audit                        | `acceptUserInvitation` writes `AuditLog` on success |

### Auth core (unchanged)

Phase 3B does **not** modify:

- `build-auth.ts`, Better Auth config, session/JWT payload
- Auth guards, Verification/Session/Account models
- Global `/login` or `/register` forms (only `callbackUrl` usage)
- OAuth / `social-complete` flow

OAuth invite acceptance is **deferred** to a future phase.

## Future Phases

### Phase 3C: Customer campaigns (optional)

- Bulk invites, tier metadata on accept

### Phase 4: Auth-Level Suspension Enforcement

- Enforce `status = SUSPENDED` at login time (requires Better Auth configuration changes).
- Session invalidation on status change.

### Phase 5: Role Management UI

- Assign/remove roles through admin UI.
- Granular permission management per user.
