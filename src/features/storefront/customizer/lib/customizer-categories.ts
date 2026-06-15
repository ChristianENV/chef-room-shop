import {
  Bookmark,
  Box,
  Palette,
  Shirt,
  SlidersHorizontal,
  Sticker,
  Type,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

export type CustomizerCategory =
  | 'producto'
  | 'colores'
  | 'texto'
  | 'logotipos'
  | 'extras'
  | 'disenos'
  | 'debug3d'

export type CustomizerCategoryItem = {
  id: CustomizerCategory
  label: string
  icon: LucideIcon
}

export const CUSTOMIZER_CATEGORIES: CustomizerCategoryItem[] = [
  { id: 'producto', label: 'Producto', icon: Shirt },
  { id: 'colores', label: 'Colores', icon: Palette },
  { id: 'texto', label: 'Texto y nombres', icon: Type },
  { id: 'logotipos', label: 'Logotipos', icon: Sticker },
  { id: 'extras', label: 'Extras', icon: SlidersHorizontal },
  { id: 'disenos', label: 'Mis diseños', icon: Bookmark },
]

/** Shown in the left rail only for admin users. */
export const CUSTOMIZER_ADMIN_CATEGORY: CustomizerCategoryItem = {
  id: 'debug3d',
  label: '3D debug',
  icon: Box,
}
