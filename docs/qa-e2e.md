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

---

## Admin Product 3D Model Upload smoke

Spec:

- `tests/e2e/smoke/admin-product-model-upload.spec.ts`

Flujo cubierto:

1. Login como admin (`cnoriegava+1@gmail.com` por defecto).
2. Abre `/admin/products`.
3. Abre el formulario de edición del producto demo.
4. Selecciona el fixture GLB (`tests/fixtures/models/minimal-valid.glb`, 48 bytes).
5. Observa estados `validating` / `optimizing`.
6. Recibe respuesta mock de `createAdminProductModelUpload` (presigned URL falsa).
7. El PUT a R2 es interceptado y devuelve 200.
8. Recibe respuesta mock de `confirmAdminProductModelUpload`.
9. Verifica el estado `success`: nombre de archivo, URL pública, botón eliminar.

También cubre el caso negativo: subir un archivo `.txt` muestra error de validación.

### Cómo correr (con servidor ya activo)

```bash
PLAYWRIGHT_SKIP_WEBSERVER=true PLAYWRIGHT_BASE_URL=http://localhost:3000 \
  pnpm exec playwright test tests/e2e/smoke/admin-product-model-upload.spec.ts
```

PowerShell:

```powershell
$env:PLAYWRIGHT_SKIP_WEBSERVER='true'
$env:PLAYWRIGHT_BASE_URL='http://localhost:3000'
pnpm exec playwright test tests/e2e/smoke/admin-product-model-upload.spec.ts
```

### Variables útiles (modelo 3D)

| Variable | Defecto | Descripción |
|---|---|---|
| `E2E_ADMIN_EMAIL` | `cnoriegava+1@gmail.com` | Email del usuario admin para login |
| `E2E_ADMIN_PASSWORD` | `12345678` | Contraseña del admin |
| `E2E_PRODUCT_SLUG` | `demo-filipina-executive-blanca` | Slug del producto demo a editar |

### Fixture GLB

- **Path**: `tests/fixtures/models/minimal-valid.glb` (48 bytes, commiteado)
- **Regenerar**: `node tests/fixtures/models/generate-minimal-glb.mjs`
- El fixture es un GLB 2.0 válido sin geometría (solo `{"asset":{"version":"2.0"}}`).

### Mocks de red

El helper `tests/e2e/helpers/mock-product-model-upload.ts` intercepta:

| URL / operación | Mock |
|---|---|
| `POST /api/graphql` con `createAdminProductModelUpload` | Devuelve `uploadId`, `presignedUrl` falsa |
| `PUT https://mock-r2.example.com/**` | Devuelve 200 OK |
| `POST /api/graphql` con `confirmAdminProductModelUpload` | Devuelve asset con `status: ACTIVE` |

No se requiere R2 real ni credenciales para correr este smoke.

### QA manual del upload GLB (sin E2E)

Ver checklist completo en `docs/admin-products-ui.md` → sección "QA manual — Modelo 3D".

### GraphQL smoke queries

Para validar manualmente que el BFF expone `model3d`:

**Storefront**

```graphql
query ProductModelSmoke {
  productBySlug(slug: "demo-filipina-executive-blanca") {
    id
    name
    model3d {
      id
      url
      sizeBytes
      compressionRatio
    }
  }
}
```

**Admin**

```graphql
query AdminProductModelSmoke {
  adminProductBySlug(slug: "demo-filipina-executive-blanca") {
    id
    model3d {
      id
      url
      originalSizeBytes
      sizeBytes
      compressionRatio
    }
  }
}
```

Endpoints: `http://localhost:3000/api/graphql` (storefront) y `http://localhost:3000/api/admin/graphql` (admin, requiere sesión ADMIN).
