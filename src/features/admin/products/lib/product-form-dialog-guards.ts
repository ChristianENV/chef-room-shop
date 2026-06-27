export const PRODUCT_FORM_SAVE_STATUS_MESSAGE = 'Guardando producto y sincronizando variantes…'

export const PRODUCT_FORM_CLOSE_BLOCKED_MESSAGE =
  'Espera a que termine el guardado antes de cerrar.'

export const PRODUCT_FORM_SAVING_TITLE = 'Guardando producto'

export const PRODUCT_FORM_SAVING_DESCRIPTION =
  'Estamos sincronizando la información del producto. No cierres esta ventana.'

export type ProductFormSaveStage = 'general' | 'variants' | 'images' | 'model' | 'finalizing' | null

export const PRODUCT_FORM_SAVE_STAGE_MESSAGES: Record<
  Exclude<ProductFormSaveStage, null>,
  string
> = {
  general: 'Guardando datos generales...',
  variants: 'Sincronizando variantes...',
  images: 'Actualizando imágenes...',
  model: 'Guardando modelo 3D...',
  finalizing: 'Finalizando...',
}

export function shouldBlockProductFormDialogClose(
  isPending: boolean,
  requestedOpen: boolean,
): boolean {
  return !requestedOpen && isPending
}

/**
 * Single derived busy flag covering every background save/upload operation.
 */
export function resolveProductFormPendingState(input: {
  isSaving: boolean
  isSavingVariantsBatch?: boolean
  isImageUploadBusy: boolean
  isModel3dBusy: boolean
}): boolean {
  return (
    input.isSaving ||
    Boolean(input.isSavingVariantsBatch) ||
    input.isImageUploadBusy ||
    input.isModel3dBusy
  )
}
