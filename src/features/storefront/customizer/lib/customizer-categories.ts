import { Bookmark, Palette, Shirt, SlidersHorizontal, Sticker, Tag, Type } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

export type CustomizerCategory =
  | 'producto'
  | 'colores'
  | 'texto'
  | 'logotipos'
  | 'nombres'
  | 'extras'
  | 'disenos'

export type CustomizerCategoryItem = {
  id: CustomizerCategory
  label: string
  icon: LucideIcon
}

export const CUSTOMIZER_CATEGORIES: CustomizerCategoryItem[] = [
  { id: 'producto', label: 'Producto', icon: Shirt },
  { id: 'colores', label: 'Colores', icon: Palette },
  { id: 'texto', label: 'Texto', icon: Type },
  { id: 'logotipos', label: 'Logotipos', icon: Sticker },
  { id: 'nombres', label: 'Nombres', icon: Tag },
  { id: 'extras', label: 'Extras', icon: SlidersHorizontal },
  { id: 'disenos', label: 'Mis diseños', icon: Bookmark },
]
