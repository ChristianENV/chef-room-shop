# QA E2E Smoke

## Ubicación oficial

Los smoke E2E viven en:

- `tests/e2e/smoke/`

`playwright.config.ts` usa `testDir: './tests/e2e/smoke'`.

## Customizer -> Cart smoke

Spec:

- `tests/e2e/smoke/customizer-add-to-cart.spec.ts`

Flujo cubierto:

1. Abre `/customize/[slug]`.
2. Selecciona color y talla.
3. Agrega texto (`Chef Carlos`).
4. Agrega al carrito.
5. Navega a `/cart`.
6. Verifica badge de personalizado y resumen.

## Customizer -> Checkout smoke

Spec:

- `tests/e2e/smoke/customizer-cart.smoke.spec.ts`

Flujo cubierto:

1. Valida que `/shop` carga.
2. Abre `/customize/[slug]` con variantes demo válidas.
3. Guarda diseño con previews (mock por defecto).
4. Agrega al carrito y navega a `/checkout` (sin pagos externos).

**Slug por defecto:** `demo-filipina-executive-blanca` (`E2E_CUSTOMIZER_SLUG`).

## Cómo correr

Con servidor ya levantado (`pnpm dev` en puerto 3000):

```bash
PLAYWRIGHT_SKIP_WEBSERVER=true PLAYWRIGHT_BASE_URL=http://localhost:3000 E2E_MOCK_CUSTOMIZER_PREVIEWS=true pnpm exec playwright test tests/e2e/smoke/customizer-add-to-cart.spec.ts
```

En PowerShell:

```powershell
$env:PLAYWRIGHT_SKIP_WEBSERVER='true'
$env:PLAYWRIGHT_BASE_URL='http://localhost:3000'
$env:E2E_MOCK_CUSTOMIZER_PREVIEWS='true'
pnpm exec playwright test tests/e2e/smoke/customizer-add-to-cart.spec.ts
```

Suite completa de smoke (Playwright levanta su propio servidor en puerto 3100; mocks de preview activos por defecto):

```bash
pnpm run test:e2e:smoke
```

## Variables útiles

- `E2E_CUSTOMIZER_SLUG`  
  Slug de producto personalizable para la prueba (por defecto `demo-filipina-executive-blanca`).

- `E2E_MOCK_CUSTOMIZER_PREVIEWS=true`  
  Mockea `createDesignPreviewUpload` y `confirmDesignPreviewUpload` para no depender de R2.
  **Por defecto está activo** (`playwright.config.ts` lo habilita salvo `E2E_MOCK_CUSTOMIZER_PREVIEWS=false`).

- `E2E_MOCK_CUSTOMIZER_PREVIEWS=false`  
  Desactiva mocks y usa R2 real (requiere bucket y CORS configurados).

- `PLAYWRIGHT_SKIP_WEBSERVER=true`  
  No levanta `next dev` desde Playwright; usa un servidor ya corriendo.

- `PLAYWRIGHT_BASE_URL`  
  URL base del servidor (por ejemplo `http://localhost:3000`).

## R2 real vs mock

- **Por defecto (`pnpm run test:e2e:smoke`)**: mocks activos; no requiere R2.
- **Local con R2 real**: `E2E_MOCK_CUSTOMIZER_PREVIEWS=false pnpm run test:e2e:smoke`

## Notas

- Este smoke no toca checkout externo ni pagos (Conekta) ni envíos (Skydropx).
- Valida flujo crítico de personalización y render en carrito.
