// Chef Room by Bedolla - Brand constants (re-exported from src/config/vars.ts)

import { BRAND_VARS, BUSINESS_VARS } from '@/src/config/vars'

export const BRAND_NAME = BUSINESS_VARS.legalName
export const BRAND_SHORT = BUSINESS_VARS.name
export const BRAND_TAGLINE = BRAND_VARS.tagline

export const BRAND_COLORS = BRAND_VARS.colors

// Color usage recommendations
export const COLOR_USAGE = {
  primary: 'Botones principales, enlaces, elementos de marca',
  warmGray: 'Fondos de página, secciones, superficies',
  white: 'Tarjetas, contenido principal, áreas limpias',
  softBlack: 'Texto principal, títulos, encabezados',
  deepNavy: 'Overlays premium, footer, secciones destacadas',
  muted: 'Texto secundario, descripciones, placeholders',
  border: 'Bordes sutiles, separadores, líneas',
  success: 'Confirmaciones, estados exitosos, disponibilidad',
  warning: 'Alertas, promociones, estados de atención',
  error: 'Errores, validaciones, estados críticos',
} as const

// Product Categories
export const PRODUCT_CATEGORIES = [
  { id: 'filipinas', name: 'Filipinas', slug: 'filipinas' },
  { id: 'mandiles', name: 'Mandiles', slug: 'mandiles' },
  { id: 'pantalones', name: 'Pantalones', slug: 'pantalones' },
  { id: 'accesorios', name: 'Accesorios', slug: 'accesorios' },
] as const

// Customization Options
export const CUSTOMIZATION_OPTIONS = {
  sizes: ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
  embroideryTypes: ['Nombre', 'Logo', 'Iniciales', 'Diseño personalizado'],
  embroideryPositions: ['Pecho izquierdo', 'Pecho derecho', 'Espalda', 'Manga'],
} as const

// Typography System
export const TYPOGRAPHY = {
  fonts: {
    heading: 'Outfit',
    body: 'Roboto',
  },
  weights: {
    light: 300,
    regular: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
  },
} as const
