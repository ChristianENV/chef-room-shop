import type { Layer, Size } from '../types/customizer.types'

export type NamedColor = {
  id: string
  name: string
  hex: string
}

/**
 * Fallback colors used when the product BFF has no color variants.
 * Chef Room azul (#2B3280) replaces the prototype gold accent.
 */
export const FALLBACK_COLORS: NamedColor[] = [
  { id: 'blanco', name: 'Blanco', hex: '#FFFFFF' },
  { id: 'negro', name: 'Negro', hex: '#1A1A1A' },
  { id: 'gris', name: 'Gris', hex: '#9CA3AF' },
  { id: 'azul', name: 'Azul', hex: '#2B3280' },
  { id: 'rojo', name: 'Rojo', hex: '#DC2626' },
  { id: 'verde', name: 'Verde', hex: '#16A34A' },
  { id: 'naranja', name: 'Naranja', hex: '#EA580C' },
]

export const FALLBACK_SIZES: Size[] = ['XS', 'S', 'M', 'L', 'XL', 'XXL']

export type PersonalizationOptionKind = 'logo' | 'texto' | 'nombre' | 'bordado'

export type FallbackPersonalizationOption = {
  slug: string
  name: string
  kind: PersonalizationOptionKind
  description: string
}

export type FallbackPersonalizationZone = {
  slug: string
  name: string
  options: FallbackPersonalizationOption[]
}

/**
 * Visual fallback for personalization zones when customizationRulesByProduct
 * has no data yet. TODO: replace fully with BFF rules per garment.
 */
export const FALLBACK_PERSONALIZATION_ZONES: FallbackPersonalizationZone[] = [
  {
    slug: 'pecho',
    name: 'Pecho',
    options: [
      { slug: 'logo', name: 'Logo', kind: 'logo', description: 'Aparece en el pecho izquierdo.' },
      { slug: 'texto', name: 'Texto', kind: 'texto', description: 'Frase corta sobre el pecho.' },
      { slug: 'nombre', name: 'Nombre', kind: 'nombre', description: 'Nombre del chef o equipo.' },
    ],
  },
  {
    slug: 'espalda',
    name: 'Espalda',
    options: [
      { slug: 'logo', name: 'Logo', kind: 'logo', description: 'Logo grande centrado en la espalda.' },
      { slug: 'texto', name: 'Texto', kind: 'texto', description: 'Texto del restaurante o marca.' },
    ],
  },
  {
    slug: 'manga-izquierda',
    name: 'Manga izquierda',
    options: [
      { slug: 'bordado', name: 'Bordado', kind: 'bordado', description: 'Bordado premium en la manga.' },
      { slug: 'logo', name: 'Logo', kind: 'logo', description: 'Logo pequeño en la manga.' },
    ],
  },
  {
    slug: 'manga-derecha',
    name: 'Manga derecha',
    options: [
      { slug: 'bordado', name: 'Bordado', kind: 'bordado', description: 'Bordado premium en la manga.' },
      { slug: 'logo', name: 'Logo', kind: 'logo', description: 'Logo pequeño en la manga.' },
    ],
  },
]

/**
 * TODO: reemplazar por Design BFF (elementos editables reales).
 */
export const DEFAULT_LAYERS: Layer[] = [
  {
    id: 'logo',
    name: 'Logo',
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
    locked: true,
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
    locked: true,
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
