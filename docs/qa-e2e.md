# QA E2E Smoke

## Customizer -> Cart smoke

Spec principal:

- `e2e/specs/customizer-add-to-cart.spec.ts`

Flujo cubierto:

1. Abre `/customize/[slug]`.
2. Selecciona color y talla.
3. Agrega texto (`Chef Carlos`).
4. Agrega al carrito.
5. Navega a `/cart`.
6. Verifica badge de personalizado y resumen.

## Cómo correr

```bash
pnpm exec playwright test e2e/specs/customizer-add-to-cart.spec.ts
```

## Variables útiles

- `E2E_CUSTOMIZER_SLUG`  
  Slug de producto personalizable para la prueba (por defecto `demo-filipina-executive-blanca`).

- `E2E_MOCK_CUSTOMIZER_PREVIEWS=true`  
  Mockea `createDesignPreviewUpload` y `confirmDesignPreviewUpload` para no depender de R2.
  Útil en CI o entornos sin bucket/cors de previews.

## R2 real vs mock

- **Local con R2 real**: deja `E2E_MOCK_CUSTOMIZER_PREVIEWS` vacío/false.
- **CI o entorno sin R2**: usa `E2E_MOCK_CUSTOMIZER_PREVIEWS=true`.

## Notas

- Este smoke no toca checkout externo ni pagos (Conekta) ni envíos (Skydropx).
- Valida flujo crítico de personalización y render en carrito.
