# Configuration — `.env` vs `vars.ts`

Chef Room splits configuration by sensitivity and whether a value changes per environment.

## `src/config/vars.ts` (versioned, non-secret)

Static business and product constants safe to commit:

| Group | Examples |
|-------|----------|
| `BUSINESS_VARS` | Legal name, public email/phone, address shown in footer/contact, social URLs |
| `BRAND_VARS` | Tagline, primary color `#2B3280`, palette tokens |
| `SHIPPING_VARS` | Origin defaults (Puebla `72000`), package tiers, `extraItemWeightKg` |
| `APP_LIMITS` | Cart max quantity, quote reuse window, rate expiration hours |

Import in client or server:

```ts
import { VARS, BUSINESS_VARS, SHIPPING_VARS } from '@/src/config/vars'
```

**Do not put here:** API keys, database URLs, OAuth secrets, webhook secrets, private keys.

## `.env` / `.env.local` (not committed, secrets & environment)

| Category | Examples |
|----------|----------|
| Database | `DATABASE_URL` |
| Auth | `BETTER_AUTH_SECRET`, `BETTER_AUTH_URL`, `GOOGLE_CLIENT_*` |
| Payments | `CONEKTA_PRIVATE_KEY`, `NEXT_PUBLIC_CONEKTA_PUBLIC_KEY` |
| Shipping API | `SKYDROPX_CLIENT_ID`, `SKYDROPX_CLIENT_SECRET`, `SKYDROPX_WEBHOOK_SECRET` |
| Email | `RESEND_API_KEY`, `EMAIL_FROM` |
| App URL | `NEXT_PUBLIC_APP_URL` |

### Shipping origin overrides (optional)

Warehouse address for Skydropx labels can be overridden per environment:

```env
SHIPPING_ORIGIN_STREET=Calle Ejemplo
SHIPPING_ORIGIN_EXT_NUMBER=123
SHIPPING_ORIGIN_NEIGHBORHOOD=Centro
SHIPPING_ORIGIN_CITY=Puebla
SHIPPING_ORIGIN_STATE=Puebla
SHIPPING_ORIGIN_POSTAL_CODE=72000
SHIPPING_ORIGIN_PHONE=9981234567
SHIPPING_ORIGIN_EMAIL=bodega@chefroom.mx
SHIPPING_ORIGIN_REFERENCE="Entre calles o punto de referencia del local"
SKYDROPX_DEFAULT_CONSIGNMENT_NOTE="53102400"
SKYDROPX_DEFAULT_PACKAGE_TYPE="4G"
# Teléfono: 10 dígitos MX (sin +52). Ej: 9981234567, no +529981234567
# SHIPPING_ORIGIN_NAME, SHIPPING_ORIGIN_COMPANY optional overrides
```

Defaults in `SHIPPING_VARS.origin` (`vars.ts`) only set city/state/CP — **admin label generation requires** full origin via env before calling Skydropx.

### Package dimension overrides (optional, deprecated for daily use)

Defaults live in `SHIPPING_VARS.defaultPackage` and `SHIPPING_VARS.packageTiers`.

```env
# Optional override. Defaults live in src/config/vars.ts
# SHIPPING_DEFAULT_PACKAGE_LENGTH_CM=
# SHIPPING_DEFAULT_PACKAGE_WIDTH_CM=
# SHIPPING_DEFAULT_PACKAGE_HEIGHT_CM=
# SHIPPING_DEFAULT_PACKAGE_WEIGHT_KG=
```

Server reads overrides in `getDefaultPackageConfig()` (`src/server/shipping/shipping.config.ts`).

## Related modules

| Module | Role |
|--------|------|
| `src/config/shipping.ts` | Re-exports `SHIPPING_COUNTRY_MX`, `SHIPPING_PACKAGE_TIERS` from `vars` |
| `src/server/shipping/shipping.config.ts` | Env overrides + `vars` defaults for origin/package |
| `lib/brand.ts` | Back-compat re-exports from `BRAND_VARS` / `BUSINESS_VARS` |

## Rules of thumb

- **Public storefront copy, contact, package math** → `vars.ts`
- **Anything that must stay secret or differ DEV/PROD** → `.env`
- **Never** move `SKYDROPX_CLIENT_SECRET`, `CONEKTA_PRIVATE_KEY`, or `BETTER_AUTH_SECRET` to `vars.ts`
