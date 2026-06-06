# R2 — Public static images migration

Incremental migration of storefront static images from `/public` to Cloudflare R2 under the key prefix `public/images/`.

Local files are **not deleted** in this phase. The app uses `getPublicImageUrl()` with a generated manifest and falls back to local paths when an asset is not in R2 yet.

## Environment variables

Server upload script (never expose to the client):

| Variable | Purpose |
|----------|---------|
| `R2_ACCOUNT_ID` | Cloudflare account ID |
| `R2_ACCESS_KEY_ID` | R2 access key |
| `R2_SECRET_ACCESS_KEY` | R2 secret key |
| `R2_BUCKET_NAME` | Bucket name |
| `R2_PUBLIC_BASE_URL` | Public CDN base URL (no trailing slash) |
| `R2_REGION` | Optional, default `auto` |

Client / Next.js image config:

| Variable | Purpose |
|----------|---------|
| `NEXT_PUBLIC_R2_PUBLIC_BASE_URL` | Same public CDN base URL for `next/image` remotePatterns |

Set `NEXT_PUBLIC_R2_PUBLIC_BASE_URL` to the same value as `R2_PUBLIC_BASE_URL` in each environment.

The upload script loads `.env.local` automatically (same as `prisma db seed`).

## Commands

```bash
# Preview files, R2 keys, and exclusions (no network)
pnpm r2:public-images:dry-run

# Upload missing objects + regenerate manifest
pnpm r2:public-images:upload

# Replace existing objects
pnpm r2:public-images:upload -- --force
```

## What gets uploaded

| Local path | R2 object key |
|------------|---------------|
| `public/images/landing/landing-hero-customizer.png` | `public/images/landing/landing-hero-customizer.png` |
| `public/images/chefroom-logo-assets/chefroom-logo-horizontal-blue.png` | `public/images/chefroom-logo-assets/chefroom-logo-horizontal-blue.png` |
| `public/models/customizer/chef-jacket/chef-jacket-diffuse.png` | `public/images/models/customizer/chef-jacket/chef-jacket-diffuse.png` |

### Included (current audit)

- Landing hero, categories, avatars, brand story, customizer screenshot, optional SVG slots
- Chef Room logo assets (horizontal/symbol) **except** favicon-named files
- Customizer model **texture** PNGs under `public/models/customizer/**`

### Excluded (stay local)

- `favicon*`, `web-app-manifest*`, root `icon.svg` / `icon0.svg` / `icon1.png`
- `src/app/apple-icon.png` (outside `/public` scan)
- `chefroom-favicon-*.png`
- `.gltf`, `.glb`, `.bin` model bundles (local GLTF keeps relative texture paths)

## Manifest + helper

After upload, the script writes:

```txt
src/generated/r2-public-images.manifest.json
```

Example entry:

```json
{
  "/images/landing/landing-hero-customizer.png": "https://<public-r2-domain>/public/images/landing/landing-hero-customizer.png"
}
```

Use in code:

```ts
import { getPublicImageUrl } from '@/src/config/public-images'

getPublicImageUrl('/images/landing/landing-hero-customizer.png')
// → R2 URL when manifest entry exists, otherwise `/images/landing/...`
```

Landing references are wired through `src/features/storefront/landing/lib/landing-media.ts`.

## Customizer 3D model bundle

The local chef jacket GLTF references textures by relative filename:

```txt
chef-jacket-diffuse.png
chef-jacket-normal.png
chef-jacket-metallicroughness.png
```

**Do not** point the live GLTF loader at R2-only textures until the full model bundle strategy is migrated. Textures are uploaded to R2 as future-ready assets; the local `.gltf` + `.bin` + PNGs remain the runtime source of truth.

## CORS (R2 public bucket)

Public assets may need CORS for:

- Landing images loaded from R2 in the browser
- Canvas / html-to-image captures in the customizer
- Design preview compositing when remote assets are involved

Recommended allowed origins:

- `http://localhost:3000`
- `https://*.vercel.app` (preview deployments)
- `https://chefroom.mx` (production)

Example CORS rule (Cloudflare dashboard → R2 bucket → Settings → CORS):

```json
[
  {
    "AllowedOrigins": [
      "http://localhost:3000",
      "https://chefroom.mx",
      "https://*.vercel.app"
    ],
    "AllowedMethods": ["GET", "HEAD"],
    "AllowedHeaders": ["*"],
    "MaxAgeSeconds": 86400
  }
]
```

Do not put access keys in CORS config or docs.

## Cache headers

Uploaded objects use:

```txt
Cache-Control: public, max-age=31536000, immutable
```

## Idempotency

- Upload skips objects that already exist (HEAD check)
- Re-run safely after adding new files to `/public`
- Use `--force` only to replace content in R2

## Verification checklist

- [ ] `pnpm r2:public-images:dry-run` lists expected files
- [ ] `pnpm r2:public-images:upload` completes and updates manifest
- [ ] Home landing images load from R2 when manifest is populated
- [ ] Favicon / app icons still load locally
- [ ] Customizer opens with local GLTF bundle unchanged
- [ ] `pnpm run lint && pnpm run typecheck && pnpm exec next build`
