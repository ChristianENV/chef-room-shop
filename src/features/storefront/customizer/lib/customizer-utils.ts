import type { LayerType } from '../types/customizer.types'

export function getLayerIcon(type: LayerType): string {
  switch (type) {
    case 'logo':
      return '🏷️'
    case 'text':
      return '📝'
    case 'patch':
      return '🎨'
    case 'vivos':
      return '✨'
    case 'buttons':
      return '⚫'
    case 'base':
      return '👕'
    default:
      return '📄'
  }
}

export function getLayerDescription(type: LayerType): string {
  switch (type) {
    case 'logo':
      return 'Frente - pecho izquierdo'
    case 'text':
      return 'Frente - pecho izquierdo'
    case 'vivos':
      return 'Cuello y punos'
    case 'buttons':
      return 'Frontales'
    case 'base':
      return 'Filipina'
    default:
      return ''
  }
}
