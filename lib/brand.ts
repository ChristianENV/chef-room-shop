// Chef Room by Bedolla - Brand Constants
// These constants define the official brand identity

export const BRAND_NAME = 'Chef Room by Bedolla'
export const BRAND_SHORT = 'Chef Room'
export const BRAND_TAGLINE = 'Tu cocina te define, tu uniforme te distingue.'

// Brand Colors - Official Palette
export const BRAND_COLORS = {
  primary: '#2B3280',      // Primary Blue - Main brand identity
  warmGray: '#E2E0DB',     // Warm Gray - Backgrounds, surfaces
  white: '#FFFFFF',        // White - Cards, clean surfaces
  softBlack: '#111111',    // Soft Black - Primary text
  deepNavy: '#0B1026',     // Deep Navy - Premium overlays
  muted: '#6B7280',        // Muted Text - Secondary text
  border: '#D8D6D0',       // Border Neutral - Subtle borders
  success: '#16A34A',      // Success - Positive states
  warning: '#F59E0B',      // Warning - Attention states
  error: '#DC2626',        // Error - Error states
} as const

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
