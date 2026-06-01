import type { CustomizerMockProduct, Layer, Size } from '../types/customizer.types'

/**
 * TODO: reemplazar por Product BFF.
 */
export const MOCK_PRODUCT: CustomizerMockProduct = {
  garmentType: 'chef-jacket',
  name: 'Filipina Clasica',
  priceLabel: '$1,299 MXN',
}

export const BASE_COLORS = [
  '#FFFFFF',
  '#1a1a1a',
  '#E5E5E5',
  '#3B82F6',
  '#EF4444',
  '#22C55E',
  '#F97316',
  '#A3A3A3',
  '#D4A574',
  '#FFD700',
] as const

export const DETAIL_COLORS = ['#1a1a1a', '#FFFFFF', '#E5E5E5', '#3B82F6', '#EF4444'] as const

export const SIZES: Size[] = ['XS', 'S', 'M', 'L', 'XL', 'XXL']

/**
 * TODO: reemplazar por Design BFF.
 */
export const DEFAULT_LAYERS: Layer[] = [
  {
    id: 'logo',
    name: 'Logotipo',
    type: 'logo',
    visible: true,
    locked: false,
    position: { x: 12.5, y: 8.3 },
    size: { width: 8.6, height: 8.6 },
    rotation: 0,
    opacity: 100,
  },
  {
    id: 'name',
    name: 'Nombre',
    type: 'text',
    visible: true,
    locked: false,
    position: { x: 12.5, y: 18 },
    size: { width: 10, height: 2 },
    rotation: 0,
    opacity: 100,
  },
  {
    id: 'vivos',
    name: 'Vivos',
    type: 'vivos',
    visible: true,
    locked: false,
    position: { x: 0, y: 0 },
    size: { width: 100, height: 100 },
    rotation: 0,
    opacity: 100,
  },
  {
    id: 'buttons',
    name: 'Botones',
    type: 'buttons',
    visible: true,
    locked: false,
    position: { x: 50, y: 50 },
    size: { width: 5, height: 30 },
    rotation: 0,
    opacity: 100,
  },
  {
    id: 'base',
    name: 'Base',
    type: 'base',
    visible: true,
    locked: true,
    position: { x: 0, y: 0 },
    size: { width: 100, height: 100 },
    rotation: 0,
    opacity: 100,
  },
]
