export const PRODUCT_DELETE_DIALOG_TITLE = 'Eliminar producto'

export const PRODUCT_DELETE_DIALOG_DESCRIPTION =
  'El producto se ocultará de la tienda y ya no podrá comprarse. El historial de órdenes se conservará.'

export const PRODUCT_DELETE_DIALOG_CONFIRM_LABEL = 'Eliminar producto'

export const PRODUCT_DELETE_DIALOG_CANCEL_LABEL = 'Cancelar'

export const PRODUCT_DELETE_DIALOG_NAME_PROMPT = 'Escribe el nombre del producto para confirmar:'

/**
 * GitHub-style confirmation: typed text must match the product name exactly.
 */
export function isProductDeleteConfirmationValid(
  confirmationText: string,
  productName: string,
): boolean {
  return confirmationText === productName
}
