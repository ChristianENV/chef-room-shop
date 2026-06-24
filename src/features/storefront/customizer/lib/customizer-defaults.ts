import type { Layer, Size } from '../types/customizer.types'

export type NamedColor = {
  id: string
  name: string
  hex: string
}

import { fabricColorsAsNamedColors } from '../constants/fabric-colors'

/**
 * Fallback colors used when the product BFF has no color variants.
 * Sourced from {@link DEFAULT_FABRIC_COLORS} — do not duplicate hex values here.
 */
export const FALLBACK_COLORS: NamedColor[] = fabricColorsAsNamedColors()

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
      {
        slug: 'logo',
        name: 'Logo',
        kind: 'logo',
        description: 'Logo grande centrado en la espalda.',
      },
      {
        slug: 'texto',
        name: 'Texto',
        kind: 'texto',
        description: 'Texto del restaurante o marca.',
      },
    ],
  },
  {
    slug: 'manga-izquierda',
    name: 'Manga izquierda',
    options: [
      {
        slug: 'bordado',
        name: 'Bordado',
        kind: 'bordado',
        description: 'Bordado premium en la manga.',
      },
      { slug: 'logo', name: 'Logo', kind: 'logo', description: 'Logo pequeño en la manga.' },
    ],
  },
  {
    slug: 'manga-derecha',
    name: 'Manga derecha',
    options: [
      {
        slug: 'bordado',
        name: 'Bordado',
        kind: 'bordado',
        description: 'Bordado premium en la manga.',
      },
      { slug: 'logo', name: 'Logo', kind: 'logo', description: 'Logo pequeño en la manga.' },
    ],
  },
]

/** Capas estructurales de la prenda (no editables ni eliminables). */
export const STRUCTURAL_LAYERS: Layer[] = [
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

/** @deprecated Use STRUCTURAL_LAYERS */
export const DEFAULT_LAYERS = STRUCTURAL_LAYERS
