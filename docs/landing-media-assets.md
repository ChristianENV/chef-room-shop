# Landing — Assets visuales

Slots definidos en `src/features/storefront/landing/lib/landing-media.ts`.

## Checklist de assets definitivos

| Slot | Uso | Relación | Formato sugerido | Estado |
|------|-----|----------|------------------|--------|
| `hero` | Hero principal | 3:4 o 4:5 | WebP 1600×2000 | Placeholder SVG |
| `heroPoster` | Video hero (opcional) | 16:9 | MP4 + poster WebP | Pendiente |
| `categoryFilipinas` | Card categoría destacada | 4:5 | WebP 1200×1500 | Placeholder SVG |
| `categoryMandiles` | Card categoría | 4:5 | WebP 800×1000 | Placeholder SVG |
| `categoryPantalones` | Card categoría | 4:5 | WebP 800×1000 | Placeholder SVG |
| `categoryAccesorios` | *(no usado en landing)* | 4:5 | — | Reservado / opcional |
| `customizer` | Bloque personalización | 16:10 | WebP 1400×875 o captura UI | Placeholder SVG |
| `story` | Historia de marca | 4:5 | WebP 1200×1500 editorial | Placeholder SVG |
| `finalCta` | Fondo CTA (opcional) | 21:9 | WebP ancho | Placeholder SVG |

## Cómo reemplazar

1. Exportar imágenes optimizadas a `public/images/landing/`.
2. Actualizar `src` en `LANDING_MEDIA` (misma ruta o nuevo nombre).
3. Verificar `alt` en español para accesibilidad.
4. Ejecutar `pnpm exec next build` y revisar LCP en hero.

## Productos destacados

Las cards usan imágenes del catálogo (`ProductImageDisplay` + datos BFF/mock). No requieren slots en `LANDING_MEDIA`.
