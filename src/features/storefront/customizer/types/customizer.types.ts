export type CollarStyle = 'mao' | 'granjero' | 'clasico'
export type SleeveStyle = 'corta' | '3/4' | 'larga'
export type ButtonStyle = 'tradicional' | 'ocultos' | 'automaticos'
export type Size = 'XS' | 'S' | 'M' | 'L' | 'XL' | 'XXL'
export type ViewMode = '2D' | '3D'
export type ViewAngle = 'front' | 'back'
export type SaveStatus = 'idle' | 'saving' | 'saved' | 'error'

/** Granular UI phases while saving design + previews. */
export type SavePhase =
  | 'idle'
  | 'saving_config'
  | 'capturing_front'
  | 'capturing_back'
  | 'uploading_previews'
  | 'confirming_previews'
  | 'saved'
  | 'preview_failed'
  | 'error'

export type LayerType = 'logo' | 'text' | 'patch' | 'vivos' | 'buttons' | 'base'

export type TextAlign = 'left' | 'center' | 'right'

export type DesignZone = 'pecho' | 'espalda' | 'manga-izquierda' | 'manga-derecha' | 'general'

export type DesignTool = 'select' | 'move' | 'scale' | 'rotate'

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
  /** Contenido visible para texto / nombre / etiqueta de logo. */
  text?: string
  fontSize?: number
  textColor?: string
  fontFamily?: string
  textAlign?: TextAlign
  zone?: DesignZone
}

export type TextElementInput = {
  text?: string
  name?: string
  zone?: DesignZone
  position?: { x: number; y: number }
}

export type LayerPatch = Partial<
  Pick<
    Layer,
    | 'name'
    | 'text'
    | 'fontSize'
    | 'textColor'
    | 'fontFamily'
    | 'textAlign'
    | 'zone'
    | 'position'
    | 'size'
    | 'rotation'
    | 'opacity'
    | 'visible'
  >
>
