# QA / E2E Critical Flows (v1)

Primera suite Playwright para flujos MVP de Chef Room. No reemplaza pruebas unitarias exhaustivas ni regresión visual.

## Requisitos

- Node 20+
- `.env.local` con `DATABASE_URL`, `BETTER_AUTH_SECRET`, y variables de app
- Demo seed (recomendado):

```bash
npm run db:seed
ALLOW_DEMO_SEED=true npm run db:seed:demo
```

- Navegadores Playwright (una vez):

```bash
npx playwright install chromium
```

## Credenciales demo

Password para todos: **`12345678`**

| Rol | Email (seed) |
|-----|----------------|
| Customer | `cliente.demo+1@chefroom.test` |
| Admin | `cnoriegava+2@gmail.com` |

Override con `E2E_CUSTOMER_EMAIL`, `E2E_ADMIN_EMAIL`, etc.

## Scripts

| Comando | Descripción |
|---------|-------------|
| `npm run test` | Alias de `test:e2e` |
| `npm run test:e2e` | Playwright headless |
| `npm run test:e2e:ui` | Playwright UI mode |
| `npm run test:e2e:headed` | Navegador visible |
| `npm run test:unit` | Placeholder (sin Vitest/Jest aún) |
| `npm run test:qa` | E2E + webhook smoke (requiere args) |

## Variables E2E

| Variable | Default | Uso |
|----------|---------|-----|
| `PLAYWRIGHT_BASE_URL` | `http://localhost:3000` | Base URL |
| `E2E_ALLOW_NO_SHIPPING` | `false` | Si `true`, checkout sin cotizar Skydropx |
| `E2E_PRODUCT_SLUG` | `filipina-azul-chef-room` | Producto para carrito |
| `E2E_RUN_ADMIN_MUTATIONS` | `false` | Habilita notas/mutations en admin |
| `E2E_*_EMAIL` / `PASSWORD` | demo seed | Login helpers |

Recomendado en local sin Skydropx:

```env
E2E_ALLOW_NO_SHIPPING=true
```

Esto activa `ALLOW_CHECKOUT_WITHOUT_SHIPPING` y `NEXT_PUBLIC_ALLOW_CHECKOUT_WITHOUT_SHIPPING` vía `playwright.config.ts` webServer.

## Estructura

```
e2e/
  helpers/
    auth.ts
    checkout.ts
    admin.ts
    graphql.ts
  specs/
    storefront-cart-checkout.spec.ts
    auth-guards.spec.ts
    account-order-detail.spec.ts
    admin-orders.spec.ts
    graphql-health.spec.ts
playwright.config.ts
```

## Specs incluidos

1. **storefront-cart-checkout** — producto → carrito → checkout → success (sin pago Conekta hosted).
2. **auth-guards** — customer vs admin, account requiere login.
3. **account-order-detail** — lista y detalle de pedido (customer demo).
4. **admin-orders** — tabla, búsqueda, drawer; mutations opcionales.
5. **graphql-health** — `{ health }` → `ok`.

## Webhook smoke (Skydropx)

No es Playwright; script HTTP + DB opcional:

```bash
npx tsx scripts/qa-skydropx-webhook-smoke.ts <providerShipmentId> <trackingNumber>
```

Requiere orden con guía y `SKYDROPX_WEBHOOK_SECRET` si está configurado.

También existe `scripts/skydropx-webhook-smoke.ts` (payload mínimo).

## Cómo correr local

Terminal 1 (opcional si no usas webServer automático):

```bash
npm run dev
```

Terminal 2:

```bash
# Con shipping opcional (más estable sin sandbox)
set E2E_ALLOW_NO_SHIPPING=true
npm run test:e2e
```

Con UI:

```bash
npm run test:e2e:ui
```

## `data-testid` añadidos (mínimos)

- `add-to-cart-button`
- `cart-link`
- `checkout-submit`
- `shipping-rate-card`
- `admin-orders-table`
- `admin-orders-search`

## Limitaciones v1

- No automatiza checkout hosted Conekta (OXXO/SPEI/card redirect).
- Skydropx quote en E2E depende de credenciales o `E2E_ALLOW_NO_SHIPPING`.
- Sin regresión visual ni load tests.
- Sin CI matrix completo (configurar en pipeline cuando aplique).
- Claim-order flow no cubierto aún (solo account detail con sesión).

## Troubleshooting

| Problema | Acción |
|----------|--------|
| Login falla | Re-seed demo; verificar `BETTER_AUTH_SECRET` |
| Checkout sin rates | `E2E_ALLOW_NO_SHIPPING=true` |
| Admin 401 | Usar email admin del seed (`cnoriegava+2@…`) |
| Playwright timeout | Aumentar `timeout` en config o correr `--headed` |
