export type CollarStyle = 'mao' | 'granjero' | 'clasico'
export type SleeveStyle = 'corta' | '3/4' | 'larga'
export type ButtonStyle = 'tradicional' | 'ocultos' | 'automaticos'
export type Size = 'XS' | 'S' | 'M' | 'L' | 'XL' | 'XXL'
export type ViewMode = '2D' | '3D'
export type ViewAngle = 'front' | 'back'

export type LayerType = 'logo' | 'text' | 'patch' | 'vivos' | 'buttons' | 'base'

export type Layer = {
  id: string
  name: string
  type: LayerType
  visible: boolean
  locked: boolean
  position: { x: number; y: number }
  size: { width: number; height: number }
  rotation: number
  opacity: number
}

export type CustomizerMockProduct = {
  garmentType: 'chef-jacket'
  name: string
  priceLabel: string
}
