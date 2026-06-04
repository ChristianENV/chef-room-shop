/**
 * Landing media slots — replace `src` with final assets when available.
 * @see docs/landing-media-assets.md
 */

export type LandingMediaSlot =
  | 'hero'
  | 'heroPoster'
  | 'categoryFilipinas'
  | 'categoryMandiles'
  | 'categoryPantalones'
  | 'categoryAccesorios'
  | 'customizer'
  | 'story'
  | 'finalCta'

export type LandingMediaKind = 'image' | 'video'

export type LandingMediaAsset = {
  slot: LandingMediaSlot
  kind: LandingMediaKind
  /** Empty string = show premium placeholder until asset is ready */
  src: string
  alt: string
  /** Tailwind aspect ratio class e.g. aspect-[3/4] */
  aspectClass: string
  label?: string
}

export const LANDING_MEDIA = {
  hero: {
    slot: 'hero',
    kind: 'image',
    src: '/images/landing/hero-chef.svg',
    alt: 'Chef profesional con filipina personalizada Chef Room',
    aspectClass: 'aspect-[4/5] md:aspect-[3/4]',
    label: 'Filipina Executive',
  },
  heroPoster: {
    slot: 'heroPoster',
    kind: 'video',
    src: '',
    alt: 'Video: proceso de personalización Chef Room',
    aspectClass: 'aspect-video',
    label: 'Video hero (próximamente)',
  },
  categoryFilipinas: {
    slot: 'categoryFilipinas',
    kind: 'image',
    src: '/images/landing/category-filipinas.svg',
    alt: 'Colección de filipinas de chef',
    aspectClass: 'aspect-[4/5]',
    label: 'Filipinas',
  },
  categoryMandiles: {
    slot: 'categoryMandiles',
    kind: 'image',
    src: '/images/landing/category-mandiles.svg',
    alt: 'Mandiles profesionales para cocina',
    aspectClass: 'aspect-[4/5]',
    label: 'Mandiles',
  },
  categoryPantalones: {
    slot: 'categoryPantalones',
    kind: 'image',
    src: '/images/landing/category-pantalones.svg',
    alt: 'Pantalones de chef',
    aspectClass: 'aspect-[4/5]',
    label: 'Pantalones',
  },
  categoryAccesorios: {
    slot: 'categoryAccesorios',
    kind: 'image',
    src: '/images/landing/category-accesorios.svg',
    alt: 'Accesorios para chef',
    aspectClass: 'aspect-[4/5]',
    label: 'Accesorios',
  },
  customizer: {
    slot: 'customizer',
    kind: 'image',
    src: '/images/landing/customizer-preview.svg',
    alt: 'Vista del personalizador de uniformes Chef Room',
    aspectClass: 'aspect-[16/10]',
    label: 'Personalizador',
  },
  story: {
    slot: 'story',
    kind: 'image',
    src: '/images/landing/story-editorial.svg',
    alt: 'Taller y confección de uniformes Chef Room',
    aspectClass: 'aspect-[4/5]',
    label: 'Nuestra historia',
  },
  finalCta: {
    slot: 'finalCta',
    kind: 'image',
    src: '/images/landing/cta-background.svg',
    alt: '',
    aspectClass: 'aspect-[21/9]',
    label: 'CTA',
  },
} as const satisfies Record<string, LandingMediaAsset>

export type LandingMediaKey = keyof typeof LANDING_MEDIA
