# Customizador 2D (migración 3D → 2D)

Migración del customizador de una experiencia 3D-first hacia una experiencia
2D-first basada en ilustraciones SVG por capas. Documento vivo, organizado por
etapas.

## Estado por etapa

| Etapa   | Descripción                                            | Estado       |
| ------- | ------------------------------------------------------ | ------------ |
| Stage 1 | Arquitectura de renderers + renderer 2D SVG temporal   | ✅ Hecho     |
| Stage 2 | Contrato de asset SVG de Illustrator (front/side/back) | ⏳ Pendiente |
| Stage 3 | Zonas editables (colores por zona, máscaras/clip)      | ⏳ Pendiente |
| Stage 4 | Colocación de texto/logo con handles y restricciones   | ⏳ Pendiente |
| Stage 5 | Preview/snapshot desde 2D y default 2D                 | ⏳ Pendiente |

---

## Stage 1 — Arquitectura de renderers + SVG temporal

### Objetivo

Reemplazar el _placeholder_ 2D (imagen hero + overlay) por un renderer SVG real,
**sin** remover el 3D y **sin** cambiar precios, carrito, checkout, persistencia
ni el esquema de datos.

### Arquitectura de renderers

`DesignerLayout` ya no monta `Viewport3D` directamente. Ahora monta un host que
decide el renderer según `viewMode` del store de Zustand:

```
DesignerLayout
  └── CustomizerViewportHost            (decide por viewMode)
        ├── viewMode === '2D' → Svg2DRenderer      (SVG)
        └── viewMode === '3D' → Viewport3D         (Three.js, sin cambios)
```

- **Selección de renderer**: `lib/customizer-viewport.ts` → `resolveViewportRenderer(viewMode)`
  (función pura, testeable sin React/WebGL).
- **Ref de captura**: `viewportCaptureRef` se reenvía **solo** al renderer 3D. La
  captura de previews (y por lo tanto add-to-cart) sigue requiriendo 3D, igual
  que antes. El host no altera ese flujo.
- **Montaje/desmontaje**: al cambiar a 2D se desmonta el `<Canvas>` de Three.js y
  al volver a 3D se remonta. Esto es consistente con el comportamiento previo,
  donde entrar a 3D ya reseteaba `glbActive`/`modelReady` y recargaba el modelo.

### Renderer 2D SVG

`components/svg-2d-renderer.tsx` (`data-testid="customizer-svg-2d-renderer"`):

- Lee del store: `baseColor`, `detailColor`, `viewAngle`.
- Renderiza el garment SVG temporal como capa base.
- Reutiliza `ViewportElementOverlay` (los mismos chips de texto/logo del 2D
  actual) por encima del SVG. Los sliders del inspector derecho siguen operando
  igual (posición/tamaño/rotación en %).
- Soporta conmutación **frente / espalda** vía `viewAngle`.

### SVG temporal (no es el arte final)

`assets/svg/chef-jacket-wireframe.tsx` es un boceto de filipina. **No** es el
asset de Illustrator; existe solo para probar el _plumbing_:

- conmutación front/back,
- actualización de color por zona,
- posicionamiento del overlay,
- ajuste responsivo dentro del viewport.

Contrato de grupos/partes que respeta (y que Stage 2 formalizará):

- **Vistas** (`id`): `view-front`, `view-back`
- **Visuales** (`data-part`): `vis-outline`, `vis-seams`, `vis-buttons`
- **Zonas de color** (`data-part`): `zone-color-body`, `zone-color-collar`
- **Zonas de contenido** (`data-part` + `id`): `zone-logo-left-chest`,
  `zone-text-back-center`

Las _partes_ usan `data-part` (repetible entre vistas) y los contenedores de
vista usan `id` único. Los helpers puros viven en `lib/svg-garment-fixtures.ts`
(`resolveGarmentViewId`, `isGarmentViewActive`, `resolveColorZoneFill`,
`GARMENT_PART_IDS`, `SVG_2D_RENDERER_TEST_ID`).

### Copy de toolbar

Se removió “Vista 2D detallada disponible próximamente”. Ahora el modo 2D indica
que se muestra un boceto y que el arte final llegará con el asset vectorial.

### Intencionalmente NO implementado en Stage 1

- Sin clipping/masking del contenido dentro de zonas.
- Sin handles directos de drag/resize/rotate en el lienzo (se siguen usando los
  sliders del inspector derecho).
- Sin vista lateral (`side`); solo front/back por ahora.
- Sin captura de preview desde 2D (add-to-cart sigue usando 3D).
- 2D **no** es el modo por defecto; el default sigue siendo 3D.
- Sin cambios en pricing, carrito, checkout, Prisma, persistencia de diseño,
  reglas de personalización, auth, admin, invitaciones, Product Options,
  shipping ni payments.

---

## Stage 2 (siguiente) — Contrato de asset SVG de Illustrator

Definir cómo exportar SVGs por capas desde Illustrator para reemplazar el boceto
temporal sin cambiar el renderer:

- Convención de nombres de capas → `id` de vista (`view-front`/`view-side`/`view-back`).
- Convención de `id`/grupo para partes y zonas (usar `data-part`/`data-zone`
  estables en lugar de parsear nombres frágiles de Illustrator).
- Atributos de datos por zona: `data-zone`, `data-zone-type`
  (`colorZone|logoZone|textZone|patchZone`), `data-view`.
- Mapeo de zonas SVG → zonas de personalización de la app (`pecho`, `espalda`,
  `manga-izquierda`, `manga-derecha`).
- Cómo evitar parsing frágil (IDs/`data-*` estables, sin depender del orden de
  nodos ni de nombres autogenerados).
- Capas premium: sombras/altas luces/textura horneadas en el SVG.
