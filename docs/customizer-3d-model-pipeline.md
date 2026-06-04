# Customizer 3D — Pipeline de modelos

Este documento describe el proceso completo para recibir, validar, optimizar, alojar
y configurar un modelo 3D en el customizador de Chef Room.

---

## 1. Recepción del modelo fuente

El modelador entrega **dos archivos**:

| Archivo | Uso |
|---------|-----|
| `.blend` (o `.max`) | Fuente editable; **nunca se sube al repo** |
| `.glb` | Export web; solo se versiona si pesa < 20 MB tras optimizar |

### Convenciones de exportación

- Texturas PBR embebidas en el `.glb` (base color, metalness, roughness, normal, AO).
- Un solo set de UVs (sin UDIM; hornear/atlasar antes de exportar).
- Ejes Y-up, Z-forward (coordenadas glTF).
- Geometría limpia: sin duplicados, sin caras sueltas, sin huesos si no hay skinning.

---

## 2. Validación previa

Antes de optimizar o subir, abre el GLB en:

- **[gltf.report](https://gltf.report)** — inspección interactiva, lista de materiales/nodos/texturas.
- **[three.js editor](https://threejs.org/editor/)** — verificar carga y materiales PBR.
- Script local de debug (ver §6).

Checklist:

- [ ] Peso bruto del GLB (objetivo < 15 MB tras optimizar).
- [ ] Nombres de meshes y materiales documentados (necesarios para `model-registry.ts`).
- [ ] Anchors de zonas calibrados (para decals de texto/logo).
- [ ] Materiales PBR correctos (baseColor + metalRough + normal mínimo).
- [ ] Sin errores en consola al cargar en `threejs.org/editor`.

---

## 3. Optimización

### Herramienta integrada

```bash
pnpm glb:optimize input.glb output.glb
```

Equivale a:

```bash
pnpm tsx scripts/optimize-glb.ts input.glb output.glb
```

Pipeline aplicado:

| Paso | Función | Efecto |
|------|---------|--------|
| 1 | `dedup` | Elimina buffers/texturas/accessors duplicados |
| 2 | `prune` | Elimina nodos/materiales no referenciados |
| 3 | `weld` | Fusiona vértices duplicados |
| 4 | `reorder` | Optimiza caché de vértices (meshopt) |
| 5 | `quantize` | Comprime atributos de vértice |
| + | `EXTMeshoptCompression` | Compresión meshopt en el buffer (requiere decoder en THREE.js) |

### Alternativa rápida (CLI oficial)

Si el script no está disponible o se prefiere un pipeline diferente:

```bash
# Instalar CLI global
npm install -g @gltf-transform/cli

# Optimización básica + compresión meshopt
npx @gltf-transform/cli optimize input.glb output.glb --compress meshopt

# Compresión Draco (mayor compresión, requiere decoder Draco en el cliente)
npx @gltf-transform/cli optimize input.glb output.glb --compress draco
```

> **Nota sobre Draco vs Meshopt:**
> - **Meshopt** — mejor compatibilidad con React Three Fiber sin configuración extra.
>   `@react-three/drei` incluye el decoder automáticamente.
> - **Draco** — mayor compresión (~10–20% menos que meshopt), pero requiere
>   `<DRACOLoader>` o la prop `dracoDecoderPath` en `useGLTF`.
>
> Preferir **meshopt** para este proyecto.

---

## 4. Hosting en Cloudflare R2

### Subir el GLB optimizado

1. Crear (o reutilizar) el bucket R2, por ejemplo `chef-room-models`.
2. Subir el archivo:

```bash
# Con aws-cli apuntando a Cloudflare R2:
aws s3 cp output.glb s3://chef-room-models/customizer-models/mock-dress-combi/mock-dress-combi.glb \
  --endpoint-url https://<ACCOUNT_ID>.r2.cloudflarestorage.com \
  --content-type "model/gltf-binary"
```

3. Habilitar acceso público al bucket (R2 → Settings → Public Access → Allow).
4. Anotar la URL pública (`R2_PUBLIC_BASE_URL`).

### CORS — requerido para useGLTF desde origen distinto

R2 debe aceptar peticiones `GET`/`HEAD` desde el dominio de la app.
Configura la regla CORS en **R2 → Bucket → CORS Policy**:

```json
[
  {
    "AllowedOrigins": [
      "http://localhost:3000",
      "https://tu-dominio.vercel.app",
      "https://chefroom.mx"
    ],
    "AllowedMethods": ["GET", "HEAD"],
    "AllowedHeaders": ["*"],
    "ExposeHeaders": ["Content-Length", "Content-Type"],
    "MaxAgeSeconds": 86400
  }
]
```

**Content-Type recomendados al subir:**

| Extensión | Content-Type |
|-----------|-------------|
| `.glb` | `model/gltf-binary` |
| `.gltf` | `model/gltf+json` |
| `.bin` | `application/octet-stream` |
| `.png` | `image/png` |
| `.jpg` | `image/jpeg` |
| `.webp` | `image/webp` |

> Si `useGLTF` falla por CORS (`Cross-Origin Request Blocked`) el customizador
> cae automáticamente al **modelo procedural de fallback** y muestra un warning
> en consola de desarrollo. Ningún error llega al usuario final.

---

## 5. Configuración en .env.local

Editar `.env.local` (nunca crear `.env.example`):

```bash
# Opción A — URL exacta del mock GLB
NEXT_PUBLIC_CUSTOMIZER_MOCK_GLB_URL=https://pub-xxxx.r2.dev/customizer-models/mock-dress-combi/mock-dress-combi.glb

# Opción B — Base URL; el registry construye rutas relativas automáticamente
NEXT_PUBLIC_CUSTOMIZER_MODEL_BASE_URL=https://pub-xxxx.r2.dev/customizer-models

# Ambas opciones activan el GLB; A tiene prioridad sobre B.
# Si ambas están vacías, se usa la ruta local /public/models/...
```

Prioridad de resolución (implementada en `model-registry.ts`):

1. `NEXT_PUBLIC_CUSTOMIZER_MOCK_GLB_URL` (URL exacta)
2. `NEXT_PUBLIC_CUSTOMIZER_MODEL_BASE_URL` + ruta relativa del registry
3. `/models/customizer/chef-jacket/chef-jacket.gltf` (local)

---

## 6. Inspección de materiales

Activa el debug para ver nodos/materiales/texturas en consola:

```bash
NEXT_PUBLIC_CUSTOMIZER_DEBUG_3D=true
```

Logs en `inspect-gltf.ts` — solo se emiten **una vez por modelo** para no saturar.

Úsalo para calibrar `materialHints` y `meshHints` en `model-registry.ts` después
de recibir un nuevo modelo.

---

## 7. Registro del modelo final en model-registry.ts

Cuando llegue el modelo final de filipina, agregar una entrada al registry:

```ts
// src/features/storefront/customizer/3d/model-registry.ts
filipinaExecutiva: {
  id: 'filipina-ejecutiva',
  label: 'Filipina ejecutiva',
  modelUrl: resolveModelUrl('filipina-ejecutiva/filipina-ejecutiva.glb'),
  productTypes: ['chef-jacket'],
  isMock: false,
  scale: 1,
  position: [0, 0, 0],
  rotation: [0, 0, 0],
  materialHints: {
    body: ['body', 'jacket', 'fabric'],
    detail: ['collar', 'cuff', 'trim'],
    buttons: ['button', 'snap'],
  },
  meshHints: {
    body: ['body', 'jacket'],
  },
  anchors: {
    frontLeftChest: { position: [-0.18, 0.55, 0.18] },
    backCenter: { position: [0, 0.35, -0.18] },
  },
},
```

> Los `anchors` calibrados permiten que los decals de texto/logo se proyecten
> exactamente en las zonas correctas de la prenda.

---

## 8. QA tras integrar un modelo nuevo

- [ ] `/customize` carga sin errores de consola.
- [ ] Spinner "Cargando modelo 3D…" aparece mientras descarga el GLB remoto.
- [ ] El modelo se muestra correctamente (escala, orientación, cámara).
- [ ] Cambiar color principal afecta los materiales body.
- [ ] Cambiar color de detalle afecta collar/puños/botones.
- [ ] Agregar texto → `TextDecal` aparece en la zona correcta.
- [ ] Girar modelo → el texto gira con él.
- [ ] Subir logo → `LogoDecal` aparece en la zona correcta.
- [ ] Guardar diseño → preview frontal y trasera capturan los decals.
- [ ] Sin CORS (R2 mal configurado) → fallback procedural sin crash.

---

## Qué NO se versiona

```gitignore
# En .gitignore
/public/models/customizer/mock-dress-combi/*.glb
/public/models/customizer/mock-dress-combi/*.glb.log
/public/models/customizer/mock-dress-combi/*.max
```

El GLB optimizado para producción se aloja en R2. El repo solo contiene código y docs.

---

## 9. Modelo local filipina (`chef-jacket`)

Desarrollo usa el glTF en `public/models/customizer/chef-jacket/`:

| Material | Mapeo |
|----------|--------|
| `FABRIC 1_2333` | body → `baseColor` |
| `Default Button_2335` | buttons → `detailColor` |

Mesh principal: `Cloth_mesh`. Decals usan zonas en `customizer-zones.ts` (aprox.).
Detalle en [`docs/customizer-3d-mock.md`](./customizer-3d-mock.md).

---

## 10. Admin upload — flujo desde la interfaz

El proceso descrito en las secciones anteriores también se puede ejecutar directamente
desde Admin Products, sin scripts locales:

1. **Admin → Editar Producto → General → "Modelo 3D del producto".**
2. Seleccionar `.glb` (máximo 120 MB original).
3. El navegador optimiza (dedup, prune, weld, reorder, quantize) y muestra comparación.
4. Si el archivo optimizado supera 25 MB → error; usar `pnpm glb:optimize` offline.
5. Clic "Subir modelo optimizado" → presigned PUT a R2 → `confirmAdminProductModelUpload`.
6. El `ProductModelAsset` queda `ACTIVE` en DB y el customizador lo usa automáticamente.

Ver checklist detallado de QA manual en `docs/admin-products-ui.md`.

---

## 11. E2E smoke del upload admin

Spec: `tests/e2e/smoke/admin-product-model-upload.spec.ts`

Cubre login admin → abrir formulario → subir fixture GLB → estado success, todo
con mocks de GraphQL y R2 (sin credenciales reales).

```bash
PLAYWRIGHT_SKIP_WEBSERVER=true PLAYWRIGHT_BASE_URL=http://localhost:3000 \
  pnpm exec playwright test tests/e2e/smoke/admin-product-model-upload.spec.ts
```

Ver `docs/qa-e2e.md` para variables de entorno y detalles completos.
