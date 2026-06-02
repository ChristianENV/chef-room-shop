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

## Flujo correcto del customizador

- `/customize` abre directamente el customizador con una filipina (chef-jacket) por defecto.
- `/customize/[productSlug]` abre el customizador con el producto especifico del slug.
- Los CTAs globales (`routes.customize`) entran al customizador en un solo click.
- Los CTAs de producto (`routes.customizeProduct(slug)`) abren el customizador con esa prenda.
- No hay pantalla intermedia que pida ir al detalle del producto.
- El selector interno (`customizer-product-selector`) permite cambiar entre filipinas, mandiles y pantalones.
- Al cambiar de prenda con diseño sucio, se muestra confirmacion antes de reiniciar.

Archivos clave del flujo:

- `src/features/storefront/customizer/components/customizer-experience.tsx`
- `src/features/storefront/customizer/components/customizer-product-selector.tsx`
- `src/app/(storefront)/customize/page.tsx`
- `src/app/(storefront)/customize/[productSlug]/page.tsx`

## Reconstrucción de UX (editor premium)

Se reconstruyó la UI del customizador para acercarla al diseño original tipo
editor visual (Figma/Canva), manteniendo la identidad Chef Room
(`#2B3280` primario, `#E2E0DB`/neutrales). No se usa el oro del prototipo.

### Layout restaurado

- **Rail izquierdo** (`customizer-left-rail.tsx`): categorías verticales
  Producto, Colores, Texto, Logotipos, Nombres, Extras, Mis diseños.
- **Panel izquierdo** (`left-sidebar.tsx`): contenido contextual según la
  categoría activa del rail.
- **Centro** (`viewport-3d.tsx` + `toolbar.tsx`): visor 3D, toggle 2D/3D,
  toggle Frente/Espalda, hint de rotación/zoom.
- **Panel derecho** (`right-sidebar.tsx`): "Elementos del diseño" (antes
  "Capas"), herramientas y propiedades contextuales.
- **Bottom bar** (`toolbar.tsx`): producto, talla, precio MXN, cantidad y
  "Agregar al carrito".

### Secciones nuevas / restauradas

- `sections/color-section.tsx`: swatches grandes circulares para color
  principal y color de detalle ("Vivos, cuello y puños").
- `sections/size-section.tsx`: tallas tipo card, deshabilita sin stock y
  "Guía de tallas" en diálogo.
- `sections/garment-style-section.tsx`: Manga / Cuello / Botones como cards
  con glifo + label + estado seleccionado.
- `sections/personalization-section.tsx`: personalización por zona (Pecho,
  Espalda, Manga izquierda, Manga derecha) con descripción, costo y CTA.
- `sections/element-add-section.tsx`: agregar Texto / Logo / Nombre.
- `sections/saved-designs-section.tsx`: "Mis diseños" con empty state.

### Datos: BFF vs fallback

| Dato | Fuente principal (BFF) | Fallback |
| --- | --- | --- |
| Colores | `product.colors` (variantes de catálogo) | `FALLBACK_COLORS` (Blanco, Negro, Gris, Azul `#2B3280`, Rojo, Verde, Naranja) |
| Tallas | `product.sizes` + stock por variante | `FALLBACK_SIZES` (XS–XXL) |
| Personalización | `customizationRulesByProduct` (zonas, opciones, precio, disponibilidad) | `FALLBACK_PERSONALIZATION_ZONES` (marcado TODO BFF) |
| Manga/Cuello/Botones | — (estilo local del store) | constantes locales |
| Precio | `product.basePriceCents` (siempre MXN) | — |

### Elementos del diseño y propiedades

- Elementos base (Base, Vivos, Botones) no muestran acciones destructivas
  (solo bloqueados); editables (Logo, Texto, Bordado) muestran visibilidad,
  duplicar y eliminar.
- Propiedades son contextuales: empty state si no hay selección; sliders de
  posición X/Y, tamaño, rotación, opacidad y alineación solo con un elemento
  editable seleccionado.
- Herramientas (Seleccionar, Mover, Escalar, Rotar) filtran qué control de
  propiedades se enfoca; se deshabilitan sin elemento editable.

### Estado / store

- `quantity` + `setQuantity` para la bottom bar.
- Historial `undo` / `redo` (snapshots del diseño) para la toolbar.
- `addElement(type, name)` para crear logos/textos/nombres/bordados editables.

### data-testid

`customizer-root`, `customizer-left-rail`, `customizer-product-selector`,
`customizer-base-colors`, `customizer-detail-colors`, `customizer-size-options`,
`customizer-personalization-options`, `customizer-design-elements`,
`customizer-properties-panel`, `customizer-save-button`,
`customizer-add-to-cart-button`, `customizer-front-back-toggle`,
`customizer-color-option`, `customizer-size-option`.

### Responsive

- Desktop (`xl`): editor completo de tres columnas.
- Tablet (`md`): rail + panel izquierdo (panel colapsable); panel derecho en
  sheet.
- Mobile: visor + bottom bar; paneles "Diseño" y "Elementos" se abren como
  sheets. Pulido mobile completo queda pendiente.

### Pendientes

- Render real de logos/textos/bordados en el visor 3D/2D (hoy editan estado,
  no se pintan sobre el modelo).
- ~~Captura/exportación de preview frontal y trasero a R2~~ (implementado: `createDesignPreviewUpload` + captura canvas WebGL).
- Carga de archivos de logo (input file → R2).
- Vista 2D detallada.
- Pulido de la experiencia mobile (bottom sheets/tabs dedicados).
- Reglas de personalización reales por prenda en catálogo (hoy fallback).
