# Admin Customization UI (`/admin/customization`)

Panel administrativo para reglas de personalización por producto. Conectado al **Admin Customization Rules BFF v1**. Copy en español; precios en pesos en formularios, centavos en GraphQL.

## Flujo operativo

1. **Seleccionar producto** — solo personalizables (`customizable: true`).
2. **Mapa de zonas** — SVG administrativo (no es el customizador de tienda); click filtra cards por área.
3. **Cards por zona** — una card por `CustomizationArea`; dentro, una fila por regla `(área + técnica)`.
4. **Crear / editar** — drawer con área, técnica, dimensiones, archivos, precios, notas.
5. **Activar / desactivar** — switch por regla (`toggleAdminCustomizationRule`).
6. **Eliminar** — diálogo de confirmación (`deleteAdminCustomizationRule`).
7. **Duplicar** — copiar todas las reglas del producto actual a otro (`duplicateCustomizationRulesToProduct`).
8. **Pricing preview** — sidebar (desktop) o tab Precio (mobile); query `adminCustomizationPricingPreview`.

## Archivos clave

| Área     | Ruta                                                                        |
| -------- | --------------------------------------------------------------------------- |
| Página   | `src/app/(admin)/admin/(protected)/customization/page.tsx`                  |
| Mapper   | `src/features/admin/customization/mappers/admin-customization-ui.mapper.ts` |
| Tipos UI | `src/features/admin/customization/types/admin-customization-ui.types.ts`    |

## Mapeo BFF ↔ UI

- Área slug `chest` → zona mapa / label **Pecho**
- `embroidery` → **Bordado**, `logo` → **Logo**, etc.
- `enabled` → badge **Activa** / **Inactiva**
- `configJson` → dimensiones, precios, `allowedFileTypes` en cards y formulario

## Layout responsive

- **Desktop:** grid 2+1 (mapa + reglas | pricing preview sticky).
- **Mobile:** tabs Zonas · Reglas · Precio; drawer fullscreen-friendly.

## Limitaciones (v1)

- Sin canvas / Fabric / Three.js (mapa es placeholder SVG).
- Sin upload Cloudinary.
- Sin motor de precios avanzado (cantidad, matrices).
- Sin validación real de archivos en upload.
- Sin CRUD de áreas u opciones base (solo seed).
- Sin barra “guardar cambios” global — cada acción persiste al BFF al instante.

## Seguridad

Layout admin + RBAC; CUSTOMER no accede. GraphQL admin sin rol → `FORBIDDEN`.

## Storefront

El catálogo/PDP sigue usando `customizationRules` del catalog BFF; esta UI no modifica el customizador visual de tienda.
