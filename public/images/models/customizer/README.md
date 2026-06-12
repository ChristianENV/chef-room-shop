# Customizer 3D models

**Do not commit** `.glb`, `.gltf`, `.bin`, or texture files here.

Production models are stored in **Cloudflare R2** and linked per product via `ProductModelAsset` (`product.model3d.url` in the catalog API).

## Layout

```txt
public/images/models/customizer/chef-jacket/
  chef-jacket.gltf   (dev fallback only)
  chef-jacket.bin
  *.png
```

App URL: `/images/models/customizer/chef-jacket/...`

## Upload

- **Admin UI:** Products → Modelo 3D → upload `.glb`
- **CLI:** see [docs/product-3d-models.md](../../../../docs/product-3d-models.md)

## Local dev fallback

In development only, you may place the chef-jacket bundle under `chef-jacket/`. Files are gitignored and are **not** used when the product has an active R2 model.

## Tests

Minimal fixtures (if needed) belong in `tests/fixtures/models/`, not here.
