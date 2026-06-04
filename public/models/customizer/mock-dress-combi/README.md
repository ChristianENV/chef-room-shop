# Mock técnico 3D — `mock-dress-combi`

Este directorio aloja el modelo 3D **temporal** usado para validar el pipeline del
customizador (carga GLB, materiales PBR, cámara, preview front/back y decals) antes
de contratar el modelo final de la filipina.

> ⚠️ Este modelo NO es la prenda final. Es un mock técnico (un vestido) para pruebas.

## Qué archivo colocar aquí

```
public/models/customizer/mock-dress-combi/mock-dress-combi.glb
```

El runtime web **solo** carga `.glb`. El registry apunta a:

```
/models/customizer/mock-dress-combi/mock-dress-combi.glb
```

## Reglas de versionado

- **No subir el `.max`** (`Dress Womens Combi Short.max`) al repo: es pesado y no se
  usa en runtime.
- **No subir el `.glb` pesado** (este mock pesa ~105 MB): está en `.gitignore`.
  Cada quien lo coloca localmente tras convertir desde 3ds Max.
- Sí se versiona este `README.md`.

Por eso, en producción (Vercel) el GLB no existe y el customizador usa el
**modelo procedural de fallback** automáticamente. Para validar el GLB hay que
ejecutar en local con el archivo colocado.

## Conversión `.max` -> `.glb`

El `.max` requiere 3ds Max. Flujo recomendado:

1. Abrir `Dress Womens Combi Short.max` en 3ds Max.
2. Exportar a glTF/GLB (Babylon/Autodesk glTF exporter o ATF/Forge).
3. Asegurar que las texturas PBR queden **embebidas** en el `.glb`:
   - `*_bcolor.png` (baseColor / albedo)
   - `*_metal.png` (metalness)
   - `*_norm.png` (normal)
   - `*_rough.png` (roughness)
   - tiles UDIM `1001` / `1002` deben quedar resueltos (glTF no soporta UDIM nativo;
     hornear/atlasar a un solo set de UVs antes de exportar).
4. Renombrar el resultado a `mock-dress-combi.glb` y colocarlo en esta carpeta.

## Activar el mock

Ver `docs/customizer-3d-mock.md`. En resumen:

```
NEXT_PUBLIC_CUSTOMIZER_USE_MOCK_GLB=true
```

Sin la variable, el mock se usa solo en `NODE_ENV=development`.
