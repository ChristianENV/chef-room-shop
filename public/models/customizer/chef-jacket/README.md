# Filipina 3D local — `chef-jacket`

Modelo temporal de filipina (CLO → glTF) para validar el customizador antes del asset final en R2.

## Archivos

| Archivo | Uso |
|---------|-----|
| `chef-jacket.gltf` | Entrada del loader (rutas relativas al `.bin` y texturas) |
| `chef-jacket.bin` | Geometría binaria |
| `chef-jacket-diffuse.png` | Base color |
| `chef-jacket-normal.png` | Normal map |
| `chef-jacket-metallicroughness.png` | Metallic + roughness |
| `chef-jacket-displacement.png` | No referenciado en el glTF actual (reserva) |

URL pública: `/models/customizer/chef-jacket/chef-jacket.gltf`

## Materiales detectados (inspección glTF)

| Material | Rol en customizador |
|----------|---------------------|
| `FABRIC 1_2333` | **body** — `baseColor` |
| `Default Button_2335` | **buttons** — `detailColor` |

No hay material separado de vivos/cuello/puños en este export; `detailColor` no tinta tela extra.

## Meshes

| Mesh | Material |
|------|----------|
| `Cloth_mesh` | FABRIC 1_2333 |
| `Button_*` (×10) | Default Button_2335 |

## Pendientes para el modelador final

- Anchors de decals calibrados en Blender/CLO y guardados en `ProductModelAsset.anchorsJson`.
- Material de vivos/cuello separado si deben tintarse con `detailColor`.
- Export web optimizado (GLB + Meshopt) y hosting en R2.
