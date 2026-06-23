# Landing — Assets visuales

Slots definidos en `src/features/storefront/landing/lib/landing-media.ts`.

## Assets en producción (`public/images/landing/`)

| Archivo                                 | Sección                     | Alt                                                    |
| --------------------------------------- | --------------------------- | ------------------------------------------------------ |
| `landing-hero-customizer.png`           | Hero (visual principal)     | Configurador premium de uniforme Chef Room             |
| `customizer-ss.png`                     | Bloque “Diseña tu uniforme” | Captura real del personalizador de uniformes Chef Room |
| `avatars/chef-avatar-01.png` … `05.png` | Hero — stack “+500 chefs”   | Chef profesional usando uniforme Chef Room             |
| `landing-category-filipina.png`         | Categoría Filipinas         | Filipina blanca premium Chef Room                      |
| `landing-category-mandil.png`           | Categoría Mandiles          | Mandil azul premium Chef Room                          |
| `landing-category-pantalon.png`         | Categoría Pantalones        | Pantalón profesional para chef Chef Room               |
| `landing-brand-story-atelier.png`       | Historia de marca           | Taller de diseño y confección Chef Room                |

## Slots opcionales / pendientes

| Slot                 | Uso                     | Estado          |
| -------------------- | ----------------------- | --------------- |
| `heroPoster`         | Video hero (opcional)   | Pendiente       |
| `categoryAccesorios` | _(no usado en landing)_ | SVG reservado   |
| `finalCta`           | Fondo CTA (opcional)    | SVG placeholder |

## Cómo reemplazar

1. Exportar imágenes optimizadas a `public/images/landing/` (kebab-case, sin espacios).
2. Actualizar `src` y `alt` en `LANDING_MEDIA` / `LANDING_CATEGORIES`.
3. Ejecutar `pnpm r2:public-images:upload` para publicar en R2 (opcional; local sigue como fallback).
4. Ejecutar `pnpm exec next build` y revisar LCP en hero (`priority` solo en hero).

## Productos destacados

Las cards usan imágenes del catálogo (`ProductImageDisplay` + datos BFF/mock). No requieren slots en `LANDING_MEDIA`.
