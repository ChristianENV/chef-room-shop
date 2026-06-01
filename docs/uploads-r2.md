# Image uploads — Cloudflare R2

## Avatar — flujo completo

```
Browser                          Next.js BFF                     Cloudflare R2
  |                                   |                                |
  |-- createAvatarUpload(sizes) ------>|                                |
  |<-- uploadId + presigned URLs ------|                                |
  |                                   |                                |
  |-- [canvas] crop + resize (256px) --|                                |
  |-- PUT avatar.webp ---------------------------------->               |
  |-- PUT avatar.jpg ----------------------------------->               |
  |                                   |                                |
  |-- confirmAvatarUpload(uploadId) -->|                                |
  |                             User.image = CDN WebP URL              |
  |<-- { image: "<cdn url>" } ---------|                                |
```

### Formato de salida avatar

| Archivo | Tamaño | Formato | Calidad |
|---------|--------|---------|---------|
| `avatar.webp` | 256×256 | WebP | 0.82 |
| `avatar.jpg` | 256×256 | JPEG | 0.86 |

El círculo se muestra por CSS (`border-radius: 9999px`); el archivo almacenado es cuadrado.

### Procesamiento en el browser

1. El usuario selecciona imagen (JPG/PNG/WebP, máx. 16 MB).
2. `react-easy-crop` provee el área de recorte en píxeles + rotación.
3. `getCroppedCanvas` (`image-processing.ts`) dibuja la región en un canvas 256×256.
4. `canvasToBlob` exporta a WebP (0.82) y JPEG (0.86).
5. Los object URLs temporales se revocan al cerrar el dialog.

## Product images — admin uploader

```
Admin UI                         Next.js BFF                     Cloudflare R2
  |                                   |                                |
  |-- createProductImageUpload ------>|                                |
  |<-- uploadId + presigned URLs -----|                                |
  |-- [canvas] crop (max 1600px) -----|                                |
  |-- PUT image.webp / image.jpg / thumb.webp ------------------------>|
  |-- confirmProductImageUpload ----->| ProductImage row               |
  |-- reorderAdminProductImages ----->| sortOrder + isPrimary          |
```

| Archivo | Max lado | Formato | Calidad |
|---------|----------|---------|---------|
| `image.webp` | 1600px | WebP | 0.82 |
| `image.jpg` | 1600px | JPEG | 0.86 (fondo blanco si PNG) |
| `thumb.webp` | 400px | WebP | 0.78 |

- Máximo **10** imágenes por producto.
- Sin cámara en admin productos.
- Reorden: `reorderAdminProductImages(productId, imageIds)` — primera = principal.
- Pendiente: borrado físico R2 al eliminar; EXIF explícito; CORS bucket para re-editar.

---

Reusable foundation for uploading images (user avatars and product images) to
Cloudflare R2 using **presigned PUT URLs**. The browser uploads bytes directly
to R2; Next.js never proxies the file. R2 credentials stay server-only.

## Architecture

```
Browser                         Next.js BFF (GraphQL Yoga)            Cloudflare R2
   │                                     │                                  │
   │ 1. createAvatarUpload(sizes) ─────▶ │  auth + validate + sign          │
   │ ◀───── presigned PUT URLs ───────── │  (server-only credentials)       │
   │                                     │                                  │
   │ 2. PUT webp/jpg/thumb ───────────────────────────────────────────────▶ │
   │ ◀────────────────────────────── 200 OK ──────────────────────────────  │
   │                                     │                                  │
   │ 3. confirm*Upload(uploadId) ──────▶ │  HEAD object → persist URL        │
   │ ◀──────── user / ProductImage ───── │  (User.image / ProductImage row) │
```

Layers:

| Path | Role |
|------|------|
| `src/server/storage/r2/*` | Server-only R2 client, config, keys, presigning, errors |
| `src/server/graphql/modules/uploads/*` | GraphQL upload module (auth, validation, service, mappers, token) |
| `src/server/graphql/resolvers/uploads.resolver.ts` | Mutation resolvers |
| `src/features/uploads/*` | Frontend API + React Query hooks (PUT to R2 + confirm) |

## Why presigned URLs

- **No large buffers through Next.js.** The file goes browser → R2 directly, so
  serverless function memory/time stays flat regardless of file size.
- **Credentials never leave the server.** The browser only receives a
  short-lived URL (default TTL 10 min) scoped to one key and one content type.
- **Tamper-resistant.** The URL is signed with a fixed `Content-Type`; R2
  rejects a PUT whose header does not match.

## Environment variables

See [`docs/configuration.md`](./configuration.md) and `.env.example`.

| Var | Notes |
|-----|-------|
| `R2_ACCOUNT_ID` | Cloudflare account id; builds the S3 endpoint |
| `R2_ACCESS_KEY_ID` | R2 token key — **secret** |
| `R2_SECRET_ACCESS_KEY` | R2 token secret — **secret** |
| `R2_BUCKET_NAME` | Target bucket |
| `R2_PUBLIC_BASE_URL` | Public CDN base (r2.dev or custom domain), no trailing slash |
| `R2_REGION` | Always `auto` for R2 |

When any var is missing, `isR2Configured()` is false and upload mutations throw
a GraphQL error with `extensions.reason = "R2_NOT_CONFIGURED"`.

## Object key conventions

Keys are always generated **server-side**. The client filename is never used as
the key (only kept as optional metadata for validation).

```
Avatars (deterministic, overwrite on re-upload):
  users/{userId}/avatar/avatar.webp
  users/{userId}/avatar/avatar.jpg

Products ({imageId} is a server UUID, reused as ProductImage.id):
  products/{productId}/images/{imageId}/image.webp
  products/{productId}/images/{imageId}/image.jpg
  products/{productId}/images/{imageId}/thumb.webp
```

Avatar keys are stable, so cache busting uses a `?v=<timestamp>` query param on
the stored public URL instead of changing the key.

## GraphQL API

```graphql
createAvatarUpload(input: CreateAvatarUploadInput!): AvatarUploadPayload!
confirmAvatarUpload(input: ConfirmAvatarUploadInput!): UserAvatarPayload!
createProductImageUpload(input: CreateProductImageUploadInput!): ProductImageUploadPayload!
confirmProductImageUpload(input: ConfirmProductImageUploadInput!): ProductImage!
```

`uploadId` is a stateless base64url token encoding only the identity needed to
confirm (avatar → `userId`; product → `productId` + `imageId`). It carries **no
secrets and no presigned URLs**, and confirm re-runs full authorization, so a
tampered token cannot target another user's object.

## Upload flow (frontend)

The UI converts the source image to WebP (+ optional JPG fallback, + thumbnail
for products) and passes the blobs to the hooks:

```ts
const { mutateAsync } = useAvatarUploadMutation()
await mutateAsync({
  files: { webp: webpBlob, jpg: jpgBlob, originalContentType: 'image/png' },
  onProgress: ({ slot, progress }) => setProgress(slot, progress),
})
```

Each hook: `create*Upload` → `PUT` every blob to R2 (XHR, with per-file
progress) → `confirm*Upload`. Product uploads also invalidate the admin product
queries on success.

## Security

| Concern | Mitigation |
|---------|------------|
| Avatar ownership | Session `userId` is the only source; users can only touch their own avatar (admins included, no cross-user edits in v1) |
| Product access | Requires `ADMIN` / `SUPERADMIN`; product must exist and not be soft-deleted |
| Per-product cap | Max **10** images per product (v1) |
| Content types | Original input limited to `image/jpeg`, `image/png`, `image/webp`; stored as webp/jpg |
| Size limits | Avatar ≤ **8 MB**, product ≤ **15 MB** per file (declared size validated before signing) |
| Confirm integrity | `HEAD` object before persisting; missing object → `R2_OBJECT_NOT_FOUND` |
| Secrets | R2 keys server-only; DB never stores secrets or presigned URLs |

## Limits & formats

- Formats stored: **WebP** (primary), **JPG** (fallback), **WebP thumb** (products).
- Max sizes: avatar 8 MB, product 15 MB per file.
- Presigned PUT TTL: 600 s.
- Max product images: 10.

## Pending (not in this foundation)

- UI: avatar picker/cropper, product image manager, drag-and-drop sorting.
- Client-side image processing pipeline (resize/encode to webp/jpg/thumb).
- Orphan cleanup job and full delete/replace mutations wired to `r2DeleteObject`.
- Optional custom CDN domain config and signed read URLs (bucket is public-read in v1).
