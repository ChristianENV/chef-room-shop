import { ProductStatus } from '@prisma/client'

import {
  APPAREL_SIZE_SLUGS,
  GARMENT_COLOR_SLUGS,
  MANDIL_COLOR_SLUGS,
  PANT_COLOR_SLUGS,
  SHOE_COLOR_SLUGS,
  SHOE_SIZE_SLUGS,
} from './seed-catalog-reference'
import { assertUniqueVariantMatrix, buildVariantMatrix } from './seed-canonical-variants'
import { buildSticoDescription } from './seed-stico-product'

export type CanonicalProductImageSeed = {
  url: string
  publicId: string | null
  alt: string | null
  sortOrder: number
  isPrimary: boolean
}

export type CanonicalProductVariantSeed = {
  sku: string
  stockQty: number
  priceCents: number
  colorSlug: string
  sizeSlug: string
}

export type CanonicalCustomizationRuleSeed = {
  areaSlug: string
  optionSlug: string
  isEnabled: boolean
  configJson: Record<string, unknown>
}

export type CanonicalProductSeed = {
  slug: string
  name: string
  typeSlug: 'chef-jacket' | 'apron' | 'pants' | 'shoes'
  shortDescription: string
  description: string
  basePriceCents: number
  customizable: boolean
  status: ProductStatus
  seoTitle: string | null
  seoDescription: string | null
  images: CanonicalProductImageSeed[]
  variants: CanonicalProductVariantSeed[]
  customizationRules: CanonicalCustomizationRuleSeed[]
}

export const STANDARD_CUSTOMIZATION_RULES: CanonicalCustomizationRuleSeed[] = [
  {
    areaSlug: 'chest',
    optionSlug: 'logo',
    isEnabled: true,
    configJson: {
      priceCents: 24900,
      maxDimensionsCm: { width: 8, height: 8 },
      allowedFileTypes: ['png', 'jpg', 'svg'],
    },
  },
  {
    areaSlug: 'chest',
    optionSlug: 'text',
    isEnabled: true,
    configJson: {
      priceCents: 14900,
      maxDimensionsCm: { width: 8, height: 8 },
      allowedFileTypes: ['png', 'jpg', 'svg'],
    },
  },
  {
    areaSlug: 'back',
    optionSlug: 'logo',
    isEnabled: true,
    configJson: {
      priceCents: 34900,
      maxDimensionsCm: { width: 20, height: 20 },
      allowedFileTypes: ['png', 'jpg', 'svg'],
    },
  },
  {
    areaSlug: 'left-sleeve',
    optionSlug: 'embroidery',
    isEnabled: true,
    configJson: {
      priceCents: 19900,
      maxDimensionsCm: { width: 6, height: 6 },
      allowedFileTypes: ['png', 'jpg', 'svg'],
    },
  },
  {
    areaSlug: 'right-sleeve',
    optionSlug: 'embroidery',
    isEnabled: true,
    configJson: {
      priceCents: 19900,
      maxDimensionsCm: { width: 6, height: 6 },
      allowedFileTypes: ['png', 'jpg', 'svg'],
    },
  },
  {
    areaSlug: 'pocket',
    optionSlug: 'patch',
    isEnabled: true,
    configJson: {
      priceCents: 17900,
      maxDimensionsCm: { width: 7, height: 7 },
      allowedFileTypes: ['png', 'jpg', 'svg'],
    },
  },
]

const FILIPINA_EXECUTIVE_PRESERVED_VARIANTS = [
  {
    sku: 'DEMO-FIL-CHEFBLUE-L',
    stockQty: 25,
    priceCents: 174900,
    colorSlug: 'chef-blue',
    sizeSlug: 'l',
  },
  {
    sku: 'DEMO-FIL-CHEFBLUE-M',
    stockQty: 25,
    priceCents: 169900,
    colorSlug: 'chef-blue',
    sizeSlug: 'm',
  },
  {
    sku: 'DEMO-FIL-CHEFBLUE-S',
    stockQty: 25,
    priceCents: 167900,
    colorSlug: 'chef-blue',
    sizeSlug: 's',
  },
  {
    sku: 'DEMO-FIL-WHITE-L',
    stockQty: 25,
    priceCents: 174900,
    colorSlug: 'white',
    sizeSlug: 'l',
  },
  {
    sku: 'DEMO-FIL-WHITE-M',
    stockQty: 25,
    priceCents: 169900,
    colorSlug: 'white',
    sizeSlug: 'm',
  },
  {
    sku: 'DEMO-FIL-WHITE-S',
    stockQty: 25,
    priceCents: 167900,
    colorSlug: 'white',
    sizeSlug: 's',
  },
] as const satisfies readonly CanonicalProductVariantSeed[]

/** Only black/white mandil rows preserved; chef-blue demo rows are excluded from canonical matrix. */
const MANDIL_PRESERVED_VARIANTS = [
  {
    sku: 'DEMO-MAN-WHITE-L',
    stockQty: 25,
    priceCents: 64900,
    colorSlug: 'white',
    sizeSlug: 'l',
  },
  {
    sku: 'DEMO-MAN-WHITE-XL',
    stockQty: 0,
    priceCents: 89900,
    colorSlug: 'white',
    sizeSlug: 'xl',
  },
] as const satisfies readonly CanonicalProductVariantSeed[]

const PANTALON_PRESERVED_VARIANTS = [
  {
    sku: 'DEMO-PAN-BLACK-L',
    stockQty: 25,
    priceCents: 74900,
    colorSlug: 'black',
    sizeSlug: 'l',
  },
  {
    sku: 'DEMO-PAN-BLACK-M',
    stockQty: 25,
    priceCents: 69900,
    colorSlug: 'black',
    sizeSlug: 'm',
  },
  {
    sku: 'DEMO-PAN-BLACK-S',
    stockQty: 25,
    priceCents: 67900,
    colorSlug: 'black',
    sizeSlug: 's',
  },
  {
    sku: 'DEMO-PAN-BLACK-XL',
    stockQty: 25,
    priceCents: 99900,
    colorSlug: 'black',
    sizeSlug: 'xl',
  },
  {
    sku: 'DEMO-PAN-BLACK-XS',
    stockQty: 25,
    priceCents: 99900,
    colorSlug: 'black',
    sizeSlug: 'xs',
  },
] as const satisfies readonly CanonicalProductVariantSeed[]

const STICO_PRESERVED_VARIANTS = [
  {
    sku: 'CR-ZAPATOSTICOREALSAFETY-BLACK-22',
    stockQty: 10,
    priceCents: 99900,
    colorSlug: 'black',
    sizeSlug: '22',
  },
  {
    sku: 'CR-ZAPATOSTICOREALSAFETY-BLACK-23',
    stockQty: 10,
    priceCents: 99900,
    colorSlug: 'black',
    sizeSlug: '23',
  },
  {
    sku: 'CR-ZAPATOSTICOREALSAFETY-BLACK-24',
    stockQty: 10,
    priceCents: 99900,
    colorSlug: 'black',
    sizeSlug: '24',
  },
  {
    sku: 'CR-ZAPATOSTICOREALSAFETY-BLACK-25',
    stockQty: 10,
    priceCents: 99900,
    colorSlug: 'black',
    sizeSlug: '25',
  },
  {
    sku: 'CR-ZAPATOSTICOREALSAFETY-BLACK-26',
    stockQty: 10,
    priceCents: 99900,
    colorSlug: 'black',
    sizeSlug: '26',
  },
  {
    sku: 'CR-ZAPATOSTICOREALSAFETY-BLACK-27',
    stockQty: 10,
    priceCents: 99900,
    colorSlug: 'black',
    sizeSlug: '27',
  },
  {
    sku: 'CR-ZAPATOSTICOREALSAFETY-BLACK-28',
    stockQty: 10,
    priceCents: 99900,
    colorSlug: 'black',
    sizeSlug: '28',
  },
  {
    sku: 'CR-ZAPATOSTICOREALSAFETY-BLACK-29',
    stockQty: 10,
    priceCents: 99900,
    colorSlug: 'black',
    sizeSlug: '29',
  },
  {
    sku: 'CR-ZAPATOSTICOREALSAFETY-BLACK-30',
    stockQty: 10,
    priceCents: 99900,
    colorSlug: 'black',
    sizeSlug: '30',
  },
] as const satisfies readonly CanonicalProductVariantSeed[]

/** Production-safe canonical catalog (exported from NP DB 2026-06-25). */
export const CANONICAL_PRODUCTS: CanonicalProductSeed[] = [
  {
    slug: 'demo-filipina-chef-room',
    name: 'Filipina Clásica',
    typeSlug: 'chef-jacket',
    shortDescription: 'Filipina insignia Chef Room.',
    description: 'Filipina con branding Chef Room, ideal para equipos de cocina profesional.',
    basePriceCents: 129900,
    customizable: true,
    status: ProductStatus.ACTIVE,
    seoTitle: 'Filipina Azul Chef Room',
    seoDescription: 'Filipina azul corporativa personalizable.',
    images: [
      {
        url: 'https://pub-4aca0106e69a495ba9342302f65b5413.r2.dev/products/e7888089-b428-46e0-af9f-e2be701fb060/images/a3a23f22-7a69-4c2f-bf4d-e94a071a67cb/image.webp',
        publicId:
          'products/e7888089-b428-46e0-af9f-e2be701fb060/images/a3a23f22-7a69-4c2f-bf4d-e94a071a67cb/image.webp',
        alt: null,
        sortOrder: 0,
        isPrimary: true,
      },
      {
        url: 'https://pub-4aca0106e69a495ba9342302f65b5413.r2.dev/products/e7888089-b428-46e0-af9f-e2be701fb060/images/2f25a9fd-3953-4e5b-b92d-2b95dec574f5/image.webp',
        publicId:
          'products/e7888089-b428-46e0-af9f-e2be701fb060/images/2f25a9fd-3953-4e5b-b92d-2b95dec574f5/image.webp',
        alt: null,
        sortOrder: 1,
        isPrimary: false,
      },
      {
        url: 'https://pub-4aca0106e69a495ba9342302f65b5413.r2.dev/products/e7888089-b428-46e0-af9f-e2be701fb060/images/648241e9-aecf-4985-bd67-4d9e251b49d1/image.webp',
        publicId:
          'products/e7888089-b428-46e0-af9f-e2be701fb060/images/648241e9-aecf-4985-bd67-4d9e251b49d1/image.webp',
        alt: null,
        sortOrder: 2,
        isPrimary: false,
      },
      {
        url: 'https://pub-4aca0106e69a495ba9342302f65b5413.r2.dev/products/e7888089-b428-46e0-af9f-e2be701fb060/images/a7292b8d-ab0b-4ad4-812f-ea4c7726c554/image.webp',
        publicId:
          'products/e7888089-b428-46e0-af9f-e2be701fb060/images/a7292b8d-ab0b-4ad4-812f-ea4c7726c554/image.webp',
        alt: null,
        sortOrder: 3,
        isPrimary: false,
      },
      {
        url: 'https://pub-4aca0106e69a495ba9342302f65b5413.r2.dev/products/e7888089-b428-46e0-af9f-e2be701fb060/images/9ef768e3-68d7-419b-b25d-20a327f8d587/image.webp',
        publicId:
          'products/e7888089-b428-46e0-af9f-e2be701fb060/images/9ef768e3-68d7-419b-b25d-20a327f8d587/image.webp',
        alt: null,
        sortOrder: 4,
        isPrimary: false,
      },
      {
        url: 'https://pub-4aca0106e69a495ba9342302f65b5413.r2.dev/products/e7888089-b428-46e0-af9f-e2be701fb060/images/4078aea0-9168-4567-8622-5641da0ddd9d/image.webp',
        publicId:
          'products/e7888089-b428-46e0-af9f-e2be701fb060/images/4078aea0-9168-4567-8622-5641da0ddd9d/image.webp',
        alt: null,
        sortOrder: 5,
        isPrimary: false,
      },
    ],
    variants: buildVariantMatrix({
      productCode: 'FILIPINACLASICA',
      basePriceCents: 129900,
      colorSlugs: GARMENT_COLOR_SLUGS,
      sizeSlugs: APPAREL_SIZE_SLUGS,
    }),
    customizationRules: STANDARD_CUSTOMIZATION_RULES,
  },
  {
    slug: 'demo-filipina-executive',
    name: 'Filipina Executive',
    typeSlug: 'chef-jacket',
    shortDescription: 'Filipina premium en algodón con acabado ejecutivo.',
    description:
      'Filipina de alta calidad para chef ejecutivo. Corte clásico, botones reforzados y tela transpirable.',
    basePriceCents: 149900,
    customizable: true,
    status: ProductStatus.ACTIVE,
    seoTitle: 'Filipina Executive Blanca | Chef Room',
    seoDescription: 'Uniforme de chef premium color blanco.',
    images: [
      {
        url: 'https://pub-4aca0106e69a495ba9342302f65b5413.r2.dev/products/caff2155-4d15-44de-a0a5-855c861dc6d1/images/8a7239f2-869d-42e4-976e-8e882f53a893/image.webp',
        publicId:
          'products/caff2155-4d15-44de-a0a5-855c861dc6d1/images/8a7239f2-869d-42e4-976e-8e882f53a893/image.webp',
        alt: null,
        sortOrder: 0,
        isPrimary: true,
      },
      {
        url: 'https://pub-4aca0106e69a495ba9342302f65b5413.r2.dev/products/caff2155-4d15-44de-a0a5-855c861dc6d1/images/604faf16-fd46-4b7d-8091-86b0e6f6ce3c/image.webp',
        publicId:
          'products/caff2155-4d15-44de-a0a5-855c861dc6d1/images/604faf16-fd46-4b7d-8091-86b0e6f6ce3c/image.webp',
        alt: null,
        sortOrder: 1,
        isPrimary: false,
      },
      {
        url: 'https://pub-4aca0106e69a495ba9342302f65b5413.r2.dev/products/caff2155-4d15-44de-a0a5-855c861dc6d1/images/ac338e66-0402-4d1d-9d81-b3702aeee0b8/image.webp',
        publicId:
          'products/caff2155-4d15-44de-a0a5-855c861dc6d1/images/ac338e66-0402-4d1d-9d81-b3702aeee0b8/image.webp',
        alt: null,
        sortOrder: 2,
        isPrimary: false,
      },
      {
        url: 'https://pub-4aca0106e69a495ba9342302f65b5413.r2.dev/products/caff2155-4d15-44de-a0a5-855c861dc6d1/images/19f63f1e-2108-4679-af2d-83125d7780f8/image.webp',
        publicId:
          'products/caff2155-4d15-44de-a0a5-855c861dc6d1/images/19f63f1e-2108-4679-af2d-83125d7780f8/image.webp',
        alt: null,
        sortOrder: 3,
        isPrimary: false,
      },
      {
        url: 'https://pub-4aca0106e69a495ba9342302f65b5413.r2.dev/products/caff2155-4d15-44de-a0a5-855c861dc6d1/images/c8b9604d-d151-4c3a-a99f-bd50085cc8cb/image.webp',
        publicId:
          'products/caff2155-4d15-44de-a0a5-855c861dc6d1/images/c8b9604d-d151-4c3a-a99f-bd50085cc8cb/image.webp',
        alt: null,
        sortOrder: 4,
        isPrimary: false,
      },
      {
        url: 'https://pub-4aca0106e69a495ba9342302f65b5413.r2.dev/products/caff2155-4d15-44de-a0a5-855c861dc6d1/images/0e2e5d07-7a54-4414-90e2-f9d7fdedd002/image.webp',
        publicId:
          'products/caff2155-4d15-44de-a0a5-855c861dc6d1/images/0e2e5d07-7a54-4414-90e2-f9d7fdedd002/image.webp',
        alt: null,
        sortOrder: 5,
        isPrimary: false,
      },
      {
        url: 'https://pub-4aca0106e69a495ba9342302f65b5413.r2.dev/products/caff2155-4d15-44de-a0a5-855c861dc6d1/images/90d743ae-0bff-4db2-9e96-fa7a122f957b/image.webp',
        publicId:
          'products/caff2155-4d15-44de-a0a5-855c861dc6d1/images/90d743ae-0bff-4db2-9e96-fa7a122f957b/image.webp',
        alt: null,
        sortOrder: 6,
        isPrimary: false,
      },
      {
        url: 'https://pub-4aca0106e69a495ba9342302f65b5413.r2.dev/products/caff2155-4d15-44de-a0a5-855c861dc6d1/images/7b574bd7-889f-4fc7-9426-77ed74bb1668/image.webp',
        publicId:
          'products/caff2155-4d15-44de-a0a5-855c861dc6d1/images/7b574bd7-889f-4fc7-9426-77ed74bb1668/image.webp',
        alt: null,
        sortOrder: 7,
        isPrimary: false,
      },
    ],
    variants: buildVariantMatrix({
      productCode: 'FILIPINAEXECUTIVE',
      basePriceCents: 149900,
      colorSlugs: GARMENT_COLOR_SLUGS,
      sizeSlugs: APPAREL_SIZE_SLUGS,
      preserved: FILIPINA_EXECUTIVE_PRESERVED_VARIANTS,
    }),
    customizationRules: STANDARD_CUSTOMIZATION_RULES,
  },
  {
    slug: 'demo-mandil-profesional-chef',
    name: 'Mandil Profesional Chef',
    typeSlug: 'apron',
    shortDescription: 'Mandil resistente con bolsillos funcionales.',
    description: 'Mandil profesional para uso diario en cocina caliente.',
    basePriceCents: 89900,
    customizable: true,
    status: ProductStatus.ACTIVE,
    seoTitle: 'Mandil Profesional Chef',
    seoDescription: 'Mandil de chef personalizable.',
    images: [
      {
        url: 'https://pub-4aca0106e69a495ba9342302f65b5413.r2.dev/products/d76098a1-ea4a-47cd-b8e1-385c2700a097/images/b8e274a6-1028-41f2-be27-fa5032d08e24/image.webp',
        publicId:
          'products/d76098a1-ea4a-47cd-b8e1-385c2700a097/images/b8e274a6-1028-41f2-be27-fa5032d08e24/image.webp',
        alt: null,
        sortOrder: 0,
        isPrimary: true,
      },
      {
        url: 'https://pub-4aca0106e69a495ba9342302f65b5413.r2.dev/products/d76098a1-ea4a-47cd-b8e1-385c2700a097/images/bb673c33-9474-4e83-bff1-ff7dab6a5f89/image.webp',
        publicId:
          'products/d76098a1-ea4a-47cd-b8e1-385c2700a097/images/bb673c33-9474-4e83-bff1-ff7dab6a5f89/image.webp',
        alt: null,
        sortOrder: 1,
        isPrimary: false,
      },
      {
        url: 'https://pub-4aca0106e69a495ba9342302f65b5413.r2.dev/products/d76098a1-ea4a-47cd-b8e1-385c2700a097/images/9e16aca6-4844-407b-ba70-70ec666291d9/image.webp',
        publicId:
          'products/d76098a1-ea4a-47cd-b8e1-385c2700a097/images/9e16aca6-4844-407b-ba70-70ec666291d9/image.webp',
        alt: null,
        sortOrder: 2,
        isPrimary: false,
      },
      {
        url: 'https://pub-4aca0106e69a495ba9342302f65b5413.r2.dev/products/d76098a1-ea4a-47cd-b8e1-385c2700a097/images/fe77e36f-6164-46a4-ba8e-488b6059752f/image.webp',
        publicId:
          'products/d76098a1-ea4a-47cd-b8e1-385c2700a097/images/fe77e36f-6164-46a4-ba8e-488b6059752f/image.webp',
        alt: null,
        sortOrder: 3,
        isPrimary: false,
      },
    ],
    variants: buildVariantMatrix({
      productCode: 'MANDILPROFESIONALCHEF',
      basePriceCents: 89900,
      colorSlugs: MANDIL_COLOR_SLUGS,
      sizeSlugs: APPAREL_SIZE_SLUGS,
      preserved: MANDIL_PRESERVED_VARIANTS,
    }),
    customizationRules: STANDARD_CUSTOMIZATION_RULES,
  },
  {
    slug: 'demo-pantalon-chef-comfort',
    name: 'Pantalón Chef Comfort',
    typeSlug: 'pants',
    shortDescription: 'Pantalón cómodo con stretch para jornadas largas.',
    description: 'Corte comfort, tela stretch y cintura ajustable.',
    basePriceCents: 99900,
    customizable: false,
    status: ProductStatus.ACTIVE,
    seoTitle: 'Pantalón Chef Comfort Negro',
    seoDescription: 'Pantalón de chef negro comfort.',
    images: [
      {
        url: 'https://pub-4aca0106e69a495ba9342302f65b5413.r2.dev/products/6bf26c22-9d8d-4d5f-b317-a0f4253f7889/images/7ca11958-2794-4be4-a365-82ceab195bc7/image.webp',
        publicId:
          'products/6bf26c22-9d8d-4d5f-b317-a0f4253f7889/images/7ca11958-2794-4be4-a365-82ceab195bc7/image.webp',
        alt: null,
        sortOrder: 0,
        isPrimary: true,
      },
      {
        url: 'https://pub-4aca0106e69a495ba9342302f65b5413.r2.dev/products/6bf26c22-9d8d-4d5f-b317-a0f4253f7889/images/67379bb9-6dad-4168-88be-7cd64b4801b3/image.webp',
        publicId:
          'products/6bf26c22-9d8d-4d5f-b317-a0f4253f7889/images/67379bb9-6dad-4168-88be-7cd64b4801b3/image.webp',
        alt: null,
        sortOrder: 1,
        isPrimary: false,
      },
      {
        url: 'https://pub-4aca0106e69a495ba9342302f65b5413.r2.dev/products/6bf26c22-9d8d-4d5f-b317-a0f4253f7889/images/6305c6cb-5b57-4359-a44c-523d283a8ed4/image.webp',
        publicId:
          'products/6bf26c22-9d8d-4d5f-b317-a0f4253f7889/images/6305c6cb-5b57-4359-a44c-523d283a8ed4/image.webp',
        alt: null,
        sortOrder: 2,
        isPrimary: false,
      },
      {
        url: 'https://pub-4aca0106e69a495ba9342302f65b5413.r2.dev/products/6bf26c22-9d8d-4d5f-b317-a0f4253f7889/images/515ee987-8f1d-446f-91dd-678ac816a193/image.webp',
        publicId:
          'products/6bf26c22-9d8d-4d5f-b317-a0f4253f7889/images/515ee987-8f1d-446f-91dd-678ac816a193/image.webp',
        alt: null,
        sortOrder: 3,
        isPrimary: false,
      },
    ],
    variants: buildVariantMatrix({
      productCode: 'PANTALONCHEFCOMFORT',
      basePriceCents: 99900,
      colorSlugs: PANT_COLOR_SLUGS,
      sizeSlugs: APPAREL_SIZE_SLUGS,
      preserved: PANTALON_PRESERVED_VARIANTS,
    }),
    customizationRules: [],
  },
  {
    slug: 'zapato-stico-real-safety',
    name: 'Zapato STICO Real Safety',
    typeSlug: 'shoes',
    shortDescription:
      'Zapato profesional cerrado de talón con suela de caucho Nanotech + cerámica para máximo agarre. Diseñado para entornos de cocina y trabajo donde se requiere resistencia, comodidad y seguridad.',
    description: buildSticoDescription(),
    basePriceCents: 99900,
    customizable: false,
    status: ProductStatus.ACTIVE,
    seoTitle: 'Zapato STICO Real Safety | Chef Room',
    seoDescription:
      'Zapato profesional cerrado de talón con suela de caucho Nanotech + cerámica para máximo agarre. Diseñado para entornos de cocina y trabajo donde se requiere resistencia, comodidad y seguridad.',
    images: [
      {
        url: 'https://pub-4aca0106e69a495ba9342302f65b5413.r2.dev/products/dfdbae11-625c-49b3-9c37-ab39a659e35a/images/3ce66cc0-1863-4cd5-a045-61f67ac06878/image.webp',
        publicId:
          'products/dfdbae11-625c-49b3-9c37-ab39a659e35a/images/3ce66cc0-1863-4cd5-a045-61f67ac06878/image.webp',
        alt: null,
        sortOrder: 0,
        isPrimary: true,
      },
      {
        url: 'https://pub-4aca0106e69a495ba9342302f65b5413.r2.dev/products/dfdbae11-625c-49b3-9c37-ab39a659e35a/images/c11ea799-8dd6-4935-b230-2e891893b9b3/image.webp',
        publicId:
          'products/dfdbae11-625c-49b3-9c37-ab39a659e35a/images/c11ea799-8dd6-4935-b230-2e891893b9b3/image.webp',
        alt: null,
        sortOrder: 1,
        isPrimary: false,
      },
      {
        url: 'https://pub-4aca0106e69a495ba9342302f65b5413.r2.dev/products/dfdbae11-625c-49b3-9c37-ab39a659e35a/images/1dfea3f3-6fce-4f66-95fa-575c1a204be7/image.webp',
        publicId:
          'products/dfdbae11-625c-49b3-9c37-ab39a659e35a/images/1dfea3f3-6fce-4f66-95fa-575c1a204be7/image.webp',
        alt: null,
        sortOrder: 2,
        isPrimary: false,
      },
      {
        url: 'https://pub-4aca0106e69a495ba9342302f65b5413.r2.dev/products/dfdbae11-625c-49b3-9c37-ab39a659e35a/images/ca3b0804-0df1-4a88-b320-73a9827ae613/image.webp',
        publicId:
          'products/dfdbae11-625c-49b3-9c37-ab39a659e35a/images/ca3b0804-0df1-4a88-b320-73a9827ae613/image.webp',
        alt: null,
        sortOrder: 3,
        isPrimary: false,
      },
    ],
    variants: buildVariantMatrix({
      productCode: 'ZAPATOSTICOREALSAFETY',
      basePriceCents: 99900,
      colorSlugs: SHOE_COLOR_SLUGS,
      sizeSlugs: SHOE_SIZE_SLUGS,
      preserved: STICO_PRESERVED_VARIANTS,
    }),
    customizationRules: [],
  },
]

for (const product of CANONICAL_PRODUCTS) {
  assertUniqueVariantMatrix(product.variants)
}

export const CANONICAL_PRODUCT_SLUGS = CANONICAL_PRODUCTS.map((product) => product.slug)

/** Active storefront-ready products in the canonical seed (excludes DRAFT rows). */
export const CANONICAL_ACTIVE_PRODUCT_SLUGS = CANONICAL_PRODUCTS.filter(
  (product) => product.status === ProductStatus.ACTIVE,
).map((product) => product.slug)
