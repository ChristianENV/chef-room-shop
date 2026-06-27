/** Spanish copy for the Admin product variant matrix editor. */

export const VARIANT_MATRIX_TITLE = 'Matriz de variantes'

export const VARIANT_MATRIX_EMPTY_PRODUCT_TYPE =
  'Selecciona una categoría para ver colores y tallas disponibles.'

export const VARIANT_MATRIX_EMPTY_SIZES = 'No hay tallas disponibles para generar variantes.'

export const VARIANT_MATRIX_EMPTY_COLORS =
  'No hay colores de variante configurados para esta categoría.'

export const VARIANT_MATRIX_GENERATE_MISSING = 'Generar variantes faltantes'

export const VARIANT_MATRIX_APPLY_BASE_PRICE = 'Aplicar precio base'

export const VARIANT_MATRIX_INITIAL_STOCK = 'Stock inicial'

export const VARIANT_MATRIX_LABEL_COLOR = 'Color'

export const VARIANT_MATRIX_LABEL_SIZE = 'Talla'

export const VARIANT_MATRIX_LABEL_PRICE = 'Precio'

export const VARIANT_MATRIX_LABEL_STOCK = 'Stock'

export const VARIANT_MATRIX_LABEL_SKU = 'SKU'

export const VARIANT_MATRIX_LABEL_ACTIVE = 'Activa'

export const VARIANT_MATRIX_STATE_MISSING = 'Faltante'

export const VARIANT_MATRIX_STATE_INACTIVE = 'Inactiva'

export const VARIANT_MATRIX_STATE_INVALID = 'Inválida'

export const VARIANT_MATRIX_ACTION_CREATE = 'Crear'

export const VARIANT_MATRIX_ACTION_EDIT = 'Editar'

export const VARIANT_MATRIX_ACTION_DEACTIVATE = 'Desactivar'

export const VARIANT_MATRIX_ACTION_REACTIVATE = 'Reactivar'

export const VARIANT_MATRIX_SELECT_COLORS = 'Seleccionar colores'

export const VARIANT_MATRIX_COLOR_ADD = 'Agregar color'

export const VARIANT_MATRIX_COLOR_REMOVE = 'Quitar color'

export const VARIANT_MATRIX_COLOR_AVAILABLE = 'Colores disponibles'

export const VARIANT_MATRIX_COLOR_SELECTED = 'Colores seleccionados'

export const VARIANT_MATRIX_COLOR_SELECTION_HELPER =
  'Selecciona los colores que venderá este producto. Después crea las variantes por talla.'

export const VARIANT_MATRIX_COLOR_PICKER_TITLE = 'Selecciona colores para este producto'

export const VARIANT_MATRIX_COLOR_PICKER_DESCRIPTION =
  'Elige los colores que venderá este producto. Después crea las variantes por talla.'

export const VARIANT_MATRIX_COLOR_PICKER_SEARCH = 'Buscar color...'

export const VARIANT_MATRIX_COLOR_PICKER_EMPTY = 'No hay colores disponibles para esta categoría.'

export const VARIANT_MATRIX_COLOR_PICKER_SELECTED = 'Seleccionado'

export const VARIANT_MATRIX_COLOR_PICKER_LOCKED =
  'Este color ya tiene variantes y no puede quitarse desde aquí.'

export const VARIANT_MATRIX_COLOR_PICKER_CANCEL = 'Cancelar'

export const VARIANT_MATRIX_COLOR_PICKER_APPLY = 'Aplicar colores'

export const VARIANT_MATRIX_COLOR_PICKER_MORE = (count: number) => `+ ${count} colores`

export const VARIANT_MATRIX_HELPER =
  'Usa Crear para agregar una variante faltante o Editar para ajustar SKU, precio y stock.'

// --- Bulk stock / price tools ---

export const VARIANT_BULK_STOCK_TITLE = 'Stock masivo'

export const VARIANT_BULK_QUANTITY_LABEL = 'Cantidad'

export const VARIANT_BULK_APPLY_TO_LABEL = 'Aplicar a'

export const VARIANT_BULK_SCOPE_ALL_VISIBLE = 'Todas las variantes visibles'

export const VARIANT_BULK_SCOPE_ACTIVE_ONLY = 'Solo variantes activas'

export const VARIANT_BULK_SCOPE_COLOR = 'Color seleccionado'

export const VARIANT_BULK_SCOPE_SIZE = 'Talla seleccionada'

export const VARIANT_BULK_SCOPE_CELLS = 'Celdas seleccionadas'

export const VARIANT_BULK_COLOR_LABEL = 'Color'

export const VARIANT_BULK_SIZE_LABEL = 'Talla'

export const VARIANT_BULK_APPLY_STOCK = 'Aplicar stock'

export const VARIANT_BULK_CREATE_MISSING = 'Crear variantes faltantes al aplicar stock'

export const VARIANT_BULK_PRICE_TITLE = 'Precio masivo'

export const VARIANT_BULK_APPLY_BASE_PRICE = 'Aplicar precio base'

export const VARIANT_BULK_APPLY_CUSTOM_PRICE = 'Aplicar precio personalizado'

export const VARIANT_BULK_INVALID_STOCK = 'Ingresa un stock entero no negativo.'

export const VARIANT_BULK_INVALID_PRICE = 'Ingresa un precio no negativo.'

export const VARIANT_BULK_SELECT_COLOR = 'Selecciona un color para aplicar.'

export const VARIANT_BULK_SELECT_SIZE = 'Selecciona una talla para aplicar.'

export const VARIANT_BULK_NO_CELLS_SELECTED = 'Selecciona al menos una celda.'

export const VARIANT_BULK_CELLS_SELECTED = (count: number) =>
  count === 1 ? '1 celda seleccionada' : `${count} celdas seleccionadas`

export const VARIANT_BULK_CLEAR_SELECTION = 'Limpiar selección'

export const VARIANT_BULK_SELECT_CELL = 'Seleccionar celda'

export const VARIANT_MATRIX_EDIT_CELL = 'Editar variante'

export const VARIANT_MATRIX_ENABLE_CELL = 'Activar variante'

export const VARIANT_MATRIX_DISABLE_CELL = 'Desactivar variante'

export const VARIANT_MATRIX_REMOVE_CELL = 'Quitar variante'
