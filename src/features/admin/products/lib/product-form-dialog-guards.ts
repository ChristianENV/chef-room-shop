export const PRODUCT_FORM_SAVE_STATUS_MESSAGE = 'Guardando producto y sincronizando variantes…'

export const PRODUCT_FORM_CLOSE_BLOCKED_MESSAGE =
  'Espera a que termine el guardado antes de cerrar.'

export function shouldBlockProductFormDialogClose(
  isPending: boolean,
  requestedOpen: boolean,
): boolean {
  return !requestedOpen && isPending
}

export function resolveProductFormPendingState(input: {
  isSaving: boolean
  isImageUploadBusy: boolean
  isModel3dBusy: boolean
}): boolean {
  return input.isSaving || input.isImageUploadBusy || input.isModel3dBusy
}
