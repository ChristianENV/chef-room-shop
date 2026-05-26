# Copywriting en español (Chef Room)

## Encoding

Todo el copy visible en español debe guardarse en archivos fuente **UTF-8** con acentos y ñ correctos.

Si en pantalla aparece `sesi?n`, `direcci?n` o `env?o`, el problema es el **string en el código** (encoding corrupto al guardar o editar), no la fuente tipográfica.

## Qué corregir

- Textos de UI: labels, botones, descripciones, mensajes de error visibles al usuario
- Plantillas de email (`src/server/email/email.templates.ts`)
- Copy en seeds que alimenta UI demo (si aplica)

## Qué no cambiar

- Rutas y slugs (`/admin/orders`, `chef-jackets`)
- Enums y valores BFF (`PENDING_PAYMENT`, `READY_TO_SHIP`)
- Nombres de campos GraphQL, keys de objetos, `data-testid`
- Variables de entorno y secrets
- URLs con query string (`?callbackUrl=`, `?order=`)

## Auditoría automática

Antes de merge, ejecutar:

```bash
pnpm audit:copy
```

El script `scripts/audit-spanish-copy.ts` busca:

- `?` dentro de palabras (p. ej. `sesi?n`)
- Fragmentos corruptos frecuentes
- Carácter de reemplazo ``

Sale con código **1** si encuentra coincidencias.

## Ejemplos correctos

| Incorrecto | Correcto |
|------------|----------|
| Inicia sesi?n | Inicia sesión |
| Correo electr?nico | Correo electrónico |
| Direcciones de env?o | Direcciones de envío |
| Datos inv?lidos | Datos inválidos |
| ?No tienes cuenta? | ¿No tienes cuenta? |
