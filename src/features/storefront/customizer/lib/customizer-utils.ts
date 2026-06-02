import type { LayerType } from '../types/customizer.types'

/** Element types that represent fixed garment structure (not destructible). */
const BASE_ELEMENT_TYPES: LayerType[] = ['base', 'vivos', 'buttons']

export function isBaseElement(type: LayerType): boolean {
  return BASE_ELEMENT_TYPES.includes(type)
}

export function isEditableElement(type: LayerType): boolean {
  return !isBaseElement(type)
}

export function getLayerLabel(type: LayerType): string {
  switch (type) {
    case 'logo':
      return 'Logo'
    case 'text':
      return 'Texto'
    case 'patch':
      return 'Bordado'
    case 'vivos':
      return 'Vivos'
    case 'buttons':
      return 'Botones'
    case 'base':
      return 'Base'
    default:
      return 'Elemento'
  }
}

export function getLayerDescription(type: LayerType): string {
  switch (type) {
    case 'logo':
      return 'Frente · pecho izquierdo'
    case 'text':
      return 'Frente · pecho izquierdo'
    case 'patch':
      return 'Bordado premium'
    case 'vivos':
      return 'Cuello y puños'
    case 'buttons':
      return 'Frontales'
    case 'base':
      return 'Prenda base'
    default:
      return ''
  }
}

export function formatPriceMxn(cents: number): string {
  return `$${(cents / 100).toLocaleString('es-MX', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  })} MXN`
}
