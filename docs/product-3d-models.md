# Product 3D models (customizer)

The storefront customizer loads **one `.glb` per product** from Cloudflare R2 via `product.model3d.url` (active `ProductModelAsset` in the database).

Do **not** commit real garment models under `public/images/models/customizer/`. Use the admin UI or the upload script below.

## Resolution order (customizer)

1. **`product.model3d.url`** — active `.glb` on R2 (production path).
2. **Dev local fallback** — `/images/models/customizer/...` only when `NODE_ENV=development` and no DB model exists.
3. **`NEXT_PUBLIC_CUSTOMIZER_MOCK_GLB_URL`** — debug/staging override when mock pipeline is enabled.
4. **Procedural fallback** — simple placeholder mesh when no model is available.

Transforms (scale/position) are keyed by **`productTypeSlug`** (`filipina`, `chef-jacket`), not by model URL.

## Admin upload (preferred)

1. Admin → Products → edit product → **Modelo 3D**.
2. Upload a **`.glb`** file (`model/gltf-binary`).
3. Confirm upload; the asset is stored at:

```txt
products/{productId}/models/{modelAssetId}/model.glb
```

4. Open `/customize/{product-slug}` and enable **3D debug** (admin) to confirm:
   - `modelSource: r2`
   - `hasProductModel3d: true`
   - `modelUrl` starts with `/r2/` (same-origin proxy)

## CLI: convert glTF → single GLB

If you still have a local `.gltf` bundle (not committed):

```bash
pnpm gltf:to-glb path/to/model.gltf .tmp/models/chef-jacket.glb
```

Output under `.tmp/` is gitignored — do not commit.

## CLI: upload GLB to R2 + activate in DB

```bash
PRODUCT_SLUG=demo-filipina-executive-blanca \
MODEL_FILE=.tmp/models/chef-jacket.glb \
pnpm r2:product-model:upload
```

Prints `publicUrl` only (no secrets).

## Verify remote URL

```bash
pnpm customizer:verify-model-url -- "https://<r2-domain>/products/.../model.glb"
# or
MODEL_URL=/r2/products/.../model.glb pnpm customizer:verify-model-url
```

For browser loading, R2 HTTPS URLs are rewritten to `/r2/...` in the app (see `resolveCustomizerModelUrl`).

## Demo product slug

E2E and seed demo use:

```txt
demo-filipina-executive-blanca
```

Product type slug: `chef-jacket` (display name Filipina).

## R2 CORS (required for WebGL)

Configure the R2 bucket CORS policy so the browser can `GET`/`HEAD` model files.

**Allowed origins**

- `http://localhost:3000`
- `https://<preview-vercel-app>.vercel.app`
- Production domain (when live)

**Allowed methods:** `GET`, `HEAD`, `OPTIONS`

**Allowed headers:** `*`

**Expose headers:** `ETag`, `Content-Length`, `Content-Type`

If CORS is wrong, `GLTFLoader` fails in the canvas even when the URL opens in a new tab.

The app also proxies R2 objects through `/r2/:path*` to avoid CORS for same-origin WebGL loads when `NEXT_PUBLIC_R2_PUBLIC_BASE_URL` is set.

## Object metadata

| Field | Value |
|-------|--------|
| Content-Type | `model/gltf-binary` |
| Cache-Control | `public, max-age=31536000, immutable` |
