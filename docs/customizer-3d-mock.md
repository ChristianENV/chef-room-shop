# Customizer 3D — Modelo mock (GLB temporal)

Este documento explica cómo usar el **modelo 3D temporal** (`mock-dress-combi`) para
validar el pipeline del customizador (carga GLB, materiales PBR, cámara, preview
front/back y decals) antes de tener el modelo final de la filipina.

> El mock es un **vestido**, no la prenda final. Solo sirve como mock técnico.

## Qué archivo subir y dónde

Coloca el GLB convertido en:

```
public/models/customizer/mock-dress-combi/mock-dress-combi.glb
```

El registry (`src/features/storefront/customizer/3d/model-registry.ts`) apunta a la URL
pública:

```
/models/customizer/mock-dress-combi/mock-dress-combi.glb
```

## Por qué no usamos `.max` en runtime

- El `.max` es un formato propietario de 3ds Max; el navegador no lo carga.
- Es pesado y no apto para web.
- El runtime web solo consume `.glb` (glTF binario), que sí soporta Three.js / drei.

Por eso el `.max` **no se versiona** y **no se carga** en la app.

## Por qué el `.glb` tampoco se commitea (en este mock)

El GLB del mock pesa ~105 MB. Está en `.gitignore`:

```
/public/models/customizer/mock-dress-combi/*.glb
/public/models/customizer/mock-dress-combi/*.glb.log
/public/models/customizer/mock-dress-combi/*.max
```

Implicaciones:

- **Local:** coloca el archivo y el customizador lo carga.
- **Producción (Vercel):** el GLB no existe → el customizador usa el **modelo
  procedural de fallback** automáticamente (sin romper nada).

Para el modelo final, consulta el pipeline completo en
[`docs/customizer-3d-model-pipeline.md`](./customizer-3d-model-pipeline.md).

## Cómo convertir `.max` -> `.glb`

Requiere 3ds Max:

1. Abrir `Dress Womens Combi Short.max`.
2. Exportar a glTF/GLB (exportador Babylon/Autodesk glTF o ATF/Forge).
3. Embebir texturas PBR en el `.glb`:
   - `*_bcolor.png` → baseColor
   - `*_metal.png` → metalness
   - `*_norm.png` → normal
   - `*_rough.png` → roughness
4. Resolver UDIM (tiles `1001`/`1002`): glTF no soporta UDIM; hornear/atlasar a un
   solo set de UVs antes de exportar.
5. Renombrar a `mock-dress-combi.glb` y colocar en la carpeta indicada.

## Cómo activar el mock

Variables (editar en `.env.local` — no existe `.env.example`):

```bash
# Forzar GLB para chef-jacket
NEXT_PUBLIC_CUSTOMIZER_USE_MOCK_GLB=true

# URL remota (R2/CDN). Si está definida, useGLTF la usa en vez de la ruta local.
NEXT_PUBLIC_CUSTOMIZER_MOCK_GLB_URL=https://pub-xxxx.r2.dev/models/mock-dress-combi.glb

# Alternativa: base URL para todos los modelos
NEXT_PUBLIC_CUSTOMIZER_MODEL_BASE_URL=https://pub-xxxx.r2.dev/customizer-models
```

Reglas de `getCustomizerModelForProduct`:

- `NEXT_PUBLIC_CUSTOMIZER_USE_MOCK_GLB=true` → siempre intenta el GLB.
- `=false` → nunca (siempre fallback procedural).
- sin definir → solo en `NODE_ENV=development`.

Resolución de URL en `model-registry.ts` (prioridad):
1. `NEXT_PUBLIC_CUSTOMIZER_MOCK_GLB_URL` (URL exacta).
2. `NEXT_PUBLIC_CUSTOMIZER_MODEL_BASE_URL` + ruta relativa.
3. `/models/customizer/mock-dress-combi/mock-dress-combi.glb` (ruta local `/public/`).

El registry mapea `productTypes: ["chef-jacket"]`, así que el mock aplica a filipinas.

## Material names detectados (mock-dress-combi.glb)

Inspección del chunk JSON del GLB:

**Meshes**
- `Dress_Womens_Combi_short_1001`
- `Obj_Dress_Womens_Combi_short_1002`

**Materiales** (ambos PBR: baseColor + metallicRoughness + normal)
- `Dress_Womens_Combi_short_1002` → **body** (color principal / `baseColor`)
- `Material__32` → **detail** (color de detalle / `detailColor`)

**Texturas / mapas**
- `Dress_Womens_Combi_short_1001_norm.png` (normal)
- `Dress_Womens_Combi_short_1002basecolortexture.png` (baseColor)
- `Dress_Womens_Combi_short_1002metallicroughnesstex.png` (metalRough)
- `Dress_Womens_Combi_short_1002_norm.png` (normal)
- `Material__32basecolortexture.png` (baseColor)
- `Material__32metallicroughnesstex.png` (metalRough)

**Mapeo en el registry** (`model-registry.ts`):

| Grupo   | Hints                                                       | Material |
|---------|-------------------------------------------------------------|----------|
| body    | `dress, body, garment, fabric, cloth`                       | `Dress_Womens_Combi_short_1002` |
| detail  | `material__32, material_, trim, detail, collar, cuff, ...`   | `Material__32` |
| buttons | `button, snap, zipper`                                      | (ninguno en el mock) |

Precedencia de clasificación: **buttons > detail > body** (por nombre de material y,
como fallback, nombre de mesh). El tinte muta solo `material.color`; los mapas PBR
(`map`, `normalMap`, `roughnessMap`, `metalnessMap`, `aoMap`) se preservan.

> Como no hay material de botones en el mock, `buttons` también recibe `detailColor`
> (no existe un `buttonColor` en el store). El modelo final definirá esto.

## Cómo inspeccionar materiales / nodos

Activa el debug:

```
NEXT_PUBLIC_CUSTOMIZER_DEBUG_3D=true
```

(o trabaja en desarrollo). En consola verás, **una sola vez por modelo**:

- hijos de la escena (`scene children`)
- tabla con `mesh`, `material` y `maps` (texturas PBR presentes)

Esto ayuda a calibrar los `materialHints` / `meshHints` del registry para que el
tinte de color (`baseColor` / `detailColor`) caiga en las mallas correctas.

## Arquitectura

- `3d/model-registry.ts` — catálogo de modelos + resolución por producto + flag.
- `3d/material-resolver.ts` — `findMaterialsByHints`, `cloneMaterialSafely`,
  `applyColorToMaterial` y `resolveTintableMaterialGroups` (clona materiales una
  sola vez preservando mapas PBR y los clasifica en body/detail/buttons).
- `3d/garment-model.tsx` — `GarmentModelLoader` (Suspense + error boundary) y el
  render del GLB; resuelve materiales una vez y tinta por mutación de color.
- `3d/inspect-gltf.ts` — debug de nodos/materiales/texturas.
- `components/viewport-3d.tsx` — `GarmentScene` decide GLB vs fallback procedural.

## Limitaciones del mock

- Es un vestido, no una filipina: proporciones y zonas no son las finales.
- `anchors.frontLeftChest` / `backCenter` están en `null` (sin calibrar); los decals
  de texto/logo siguen renderizándose como **overlay 2D** sobre el viewport, igual
  que antes. La proyección 3D de decals se hará con el modelo final.
- Detección de materiales por nombre (hints); si el GLB usa otros nombres, ajustar
  el registry tras inspeccionar en consola.
- El `sleeveStyle` no deforma el GLB mock (la manga procedural sí); el GLB es
  geometría fija.

## Qué NO cambia

- Guardado de diseño, previews front/back, add to cart, overlays 2D y captura
  compuesta siguen funcionando igual. El cambio es solo qué geometría se renderiza
  dentro del `<Canvas>`.
