/**
 * Landing media slots — assets in `public/images/landing/`.
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

const LANDING_IMAGE_BASE = '/images/landing'
const LANDING_AVATARS_BASE = `${LANDING_IMAGE_BASE}/avatars`

export const LANDING_CHEF_AVATARS = [
  `${LANDING_AVATARS_BASE}/chef-avatar-01.png`,
  `${LANDING_AVATARS_BASE}/chef-avatar-02.png`,
  `${LANDING_AVATARS_BASE}/chef-avatar-03.png`,
  `${LANDING_AVATARS_BASE}/chef-avatar-04.png`,
  `${LANDING_AVATARS_BASE}/chef-avatar-05.png`,
] as const

export const LANDING_CATEGORIES = [
  {
    id: 'filipinas',
    title: 'Filipinas',
    mediaKey: 'categoryFilipinas' as const,
    image: `${LANDING_IMAGE_BASE}/landing-category-filipina.png`,
    alt: 'Filipina blanca premium Chef Room',
  },
  {
    id: 'mandiles',
    title: 'Mandiles',
    mediaKey: 'categoryMandiles' as const,
    image: `${LANDING_IMAGE_BASE}/landing-category-mandil.png`,
    alt: 'Mandil azul premium Chef Room',
  },
  {
    id: 'pantalones',
    title: 'Pantalones',
    mediaKey: 'categoryPantalones' as const,
    image: `${LANDING_IMAGE_BASE}/landing-category-pantalon.png`,
    alt: 'Pantalón profesional para chef Chef Room',
  },
] as const

export const LANDING_MEDIA = {
  hero: {
    slot: 'hero',
    kind: 'image',
    src: `${LANDING_IMAGE_BASE}/landing-hero-customizer.png`,
    alt: 'Configurador premium de uniforme Chef Room',
    aspectClass: 'aspect-[4/5]',
    label: 'Personalizador',
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
    src: LANDING_CATEGORIES[0].image,
    alt: LANDING_CATEGORIES[0].alt,
    aspectClass: 'aspect-[4/5]',
    label: 'Filipinas',
  },
  categoryMandiles: {
    slot: 'categoryMandiles',
    kind: 'image',
    src: LANDING_CATEGORIES[1].image,
    alt: LANDING_CATEGORIES[1].alt,
    aspectClass: 'aspect-[4/5]',
    label: 'Mandiles',
  },
  categoryPantalones: {
    slot: 'categoryPantalones',
    kind: 'image',
    src: LANDING_CATEGORIES[2].image,
    alt: LANDING_CATEGORIES[2].alt,
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
    src: `${LANDING_IMAGE_BASE}/customizer-ss.png`,
    alt: 'Captura real del personalizador de uniformes Chef Room',
    aspectClass: 'aspect-[16/10]',
    label: 'Personalizador',
  },
  story: {
    slot: 'story',
    kind: 'image',
    src: `${LANDING_IMAGE_BASE}/landing-brand-story-atelier.png`,
    alt: 'Taller de diseño y confección Chef Room',
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
