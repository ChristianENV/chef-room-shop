# Customizer 3D — Modelo local filipina (`chef-jacket`)

Modelo 3D temporal de **filipina** (export CLO → glTF) para validar carga, materiales PBR,
decals WebGL, previews y tintado antes del asset final en R2.

## Archivos y ruta

```
public/models/customizer/chef-jacket/
  chef-jacket.gltf
  chef-jacket.bin
  chef-jacket-diffuse.png
  chef-jacket-normal.png
  chef-jacket-metallicroughness.png
```

URL pública del loader:

```
/models/customizer/chef-jacket/chef-jacket.gltf
```

Los nombres originales con espacios (`MV2_Chef Jacket_…`) se renombraron a **kebab-case**
para evitar fallos de URL en el navegador; las URIs dentro del `.gltf` apuntan a los archivos nuevos.

## Cómo activar

Variables en `.env.local`:

```bash
# Forzar modelo local/remoto para chef-jacket
NEXT_PUBLIC_CUSTOMIZER_USE_MOCK_GLB=true

# URL remota opcional (R2/CDN) — sustituye la ruta local
NEXT_PUBLIC_CUSTOMIZER_MOCK_GLB_URL=https://pub-xxxx.r2.dev/models/chef-jacket.gltf

# Base URL alternativa
NEXT_PUBLIC_CUSTOMIZER_MODEL_BASE_URL=https://pub-xxxx.r2.dev/customizer-models
```

Prioridad de `getCustomizerModelForProduct`:

1. `product.model3d.url` (DB/R2) — siempre gana.
2. Mock env URL / base URL (si mock activo).
3. `/models/customizer/chef-jacket/chef-jacket.gltf` (local).
4. Fallback procedural.

## Material names detectados (`chef-jacket.gltf`)

Inspección del glTF (CLO Standalone 2024):

| Material              | Rol customizador | Store         |
| --------------------- | ---------------- | ------------- |
| `FABRIC 1_2333`       | **body**         | `baseColor`   |
| `Default Button_2335` | **buttons**      | `detailColor` |

No hay material separado de vivos/cuello/puños en este export → `detailColor` no tinta tela extra.

**Meshes**

| Mesh                       | Material            |
| -------------------------- | ------------------- |
| `Cloth_mesh`               | FABRIC 1_2333       |
| `Button_*` (10 instancias) | Default Button_2335 |

**Mapas PBR** (en ambos materiales): `map`, `normalMap`, `metallicRoughnessTexture`

**Hints en registry** (`model-registry.ts`):

| Grupo   | Hints                                                  |
| ------- | ------------------------------------------------------ |
| body    | `fabric`, `cloth`, `jacket`, `chef`, `thick`, `2333`   |
| detail  | `collar`, `cuff`, `trim`, … (sin match en este export) |
| buttons | `button`, `default button`, `2335`                     |

Precedencia: **buttons > detail > body**. El tinte solo muta `material.color`; mapas PBR se preservan.

## Transform en viewport

El export CLO usa coordenadas ~cm (altura ~71 unidades). En el registry:

- `scale: 0.02`
- `position: [0, -2.55, 0]` — centra la prenda en la cámara del customizador

## Zonas de decals (aproximadas)

Calibradas en `customizer-zones.ts` para `Cloth_mesh` (pendiente anchors finales en DB):

| Zona            | Posición local (aprox.) |
| --------------- | ----------------------- |
| pecho izquierdo | `(-6, 142, 11)`         |
| pecho derecho   | `(14, 142, 11)`         |
| espalda         | `(7, 132, -1)`          |
| manga izquierda | `(-18, 118, 3)`         |
| manga derecha   | `(25, 118, 3)`          |

Con GLB activo, texto/logo se proyectan en WebGL (`TextDecal` / `LogoDecal`) y el overlay DOM se oculta.

## Cómo inspeccionar materiales

```bash
NEXT_PUBLIC_CUSTOMIZER_DEBUG_3D=true
```

En consola (una vez por modelo): hijos de escena, materiales únicos, tabla mesh/material/maps.

## Pendientes para el modelo final

- Anchors precisos en `ProductModelAsset.anchorsJson`.
- Material de vivos/cuello separado si debe usar `detailColor`.
- GLB optimizado en R2 (ver `docs/customizer-3d-model-pipeline.md`).
- `sleeveStyle` no deforma este glTF (geometría fija).

## Modelo anterior (`mock-dress-combi`)

El vestido mock técnico quedó deprecado. La carpeta `mock-dress-combi/` puede conservarse
solo como referencia; el registry ya no la usa.

## Arquitectura (sin cambios)

- `3d/model-registry.ts` — catálogo + prioridad producto/mock/local.
- `3d/material-resolver.ts` — tintado PBR.
- `3d/garment-model.tsx` — loader glTF/GLB + decals.
- `3d/customizer-zones.ts` — posiciones fallback de decals.
- `components/viewport-3d.tsx` — GLB vs procedural + overlay DOM condicional.
