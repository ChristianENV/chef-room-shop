# Importacion del customizador

## Archivos importados

- `src/features/storefront/customizer/components/designer-layout.tsx`
- `src/features/storefront/customizer/components/left-sidebar.tsx`
- `src/features/storefront/customizer/components/right-sidebar.tsx`
- `src/features/storefront/customizer/components/toolbar.tsx`
- `src/features/storefront/customizer/components/viewport-3d.tsx`
- `src/features/storefront/customizer/components/customizer-shell.tsx`
- `src/features/storefront/customizer/store/customizer.store.ts`
- `src/features/storefront/customizer/types/customizer.types.ts`
- `src/features/storefront/customizer/lib/customizer-defaults.ts`
- `src/features/storefront/customizer/lib/customizer-utils.ts`
- `src/features/storefront/customizer/customizer.css`
- `src/features/storefront/customizer/index.ts`
- `src/app/(storefront)/customize/page.tsx`

## Archivos NO importados

- `app/layout.tsx` (ya existe layout App Router principal)
- `app/globals.css` / `styles/globals.css` (evitar colisiones globales)
- `components/ui/*` (ya existe shadcn/ui en el repo)
- `theme-provider` (ya existe provider global)
- `package.json` y lockfiles del repo fuente (integracion controlada)

## Dependencias agregadas

- `three`
- `@react-three/fiber`
- `@react-three/drei`
- `zustand`
- `framer-motion`
- `@types/three` (dev)

## Riesgos

- Peso adicional en bundle de `/customize` por motor 3D.
- Diferencias de rendimiento en dispositivos sin aceleracion WebGL.
- Vista 2D aun en placeholder.

## Pendientes de fase siguiente

- Product BFF
- Design BFF
- Add to cart
- R2 upload logos
- Preview render persistente
- E2E

## Fase 2: conexion a catalogo real

Se agrego la ruta dinamica `src/app/(storefront)/customize/[productSlug]/page.tsx` para cargar:

- `productBySlug` via `useProductQuery`
- `customizationRulesByProduct` via `useCustomizationRulesByProductQuery`

Nuevos archivos de adaptacion:

- `src/features/storefront/customizer/types/customizer-product.types.ts`
- `src/features/storefront/customizer/mappers/product-to-customizer.mapper.ts`

Store actualizado:

- `initFromProduct(product)`
- `resetCustomizer()`
- `setSelectedVariant(variantId)`
- `setBaseColor(color)` (sincroniza variante)
- `setSize(size)` (sincroniza variante)
- `setSleeveOption(option)`
- `setCustomizationRuleAvailability(key, enabled)`

Navegacion actualizada:

- `routes.customizeProduct(slug)` en `src/config/routes.ts`
- CTA de PDP ahora dirige a `/customize/[productSlug]`
