/**
 * Non-secret static constants for Chef Room (safe to version).
 * Secrets, API keys, and environment-specific values belong in `.env` only.
 */

export const BUSINESS_VARS = {
  name: 'Chef Room',
  legalName: 'Chef Room by Bedolla',
  email: 'hola@chefroom.mx',
  phone: '+52 33 1234 5678',
  phoneTelHref: '+523312345678',
  whatsapp: '',
  address: {
    street: '',
    extNumber: '',
    intNumber: '',
    neighborhood: '',
    city: 'Puebla',
    state: 'Puebla',
    country: 'MX',
    postalCode: '',
    formatted: 'Puebla, Puebla, México',
  },
  support: {
    email: 'hola@chefroom.mx',
    phone: '+52 33 1234 5678',
    phoneTelHref: '+523312345678',
    whatsapp: '',
  },
  social: {
    instagram: 'https://instagram.com',
    facebook: '',
    tiktok: '',
    website: '',
  },
  hours: {
    label: '',
  },
} as const

export const BRAND_VARS = {
  name: 'Chef Room',
  legalName: 'Chef Room by Bedolla',
  tagline: 'Tu cocina te define, tu uniforme te distingue.',
  primaryColor: '#2B3280',
  primaryColorDark: '#5A6FDD',
  warmNeutral: '#E2E0DB',
  colors: {
    primary: '#2B3280',
    warmGray: '#E2E0DB',
    white: '#FFFFFF',
    softBlack: '#111111',
    deepNavy: '#0B1026',
    muted: '#6B7280',
    border: '#D8D6D0',
    success: '#16A34A',
    warning: '#F59E0B',
    error: '#DC2626',
  },
} as const

export const SHIPPING_VARS = {
  countryCode: 'MX',
  currencyCode: 'MXN',
  origin: {
    name: 'Chef Room',
    company: 'Chef Room by Bedolla',
    phone: '',
    email: '',
    street: '',
    extNumber: '',
    intNumber: '',
    neighborhood: '',
    city: 'Puebla',
    state: 'Puebla',
    country: 'MX',
    postalCode: '72000',
  },
  defaultPackage: {
    lengthCm: 30,
    widthCm: 20,
    heightCm: 5,
    weightKg: 0.5,
  },
  packageTiers: [
    {
      minItems: 1,
      maxItems: 1,
      lengthCm: 30,
      widthCm: 20,
      heightCm: 5,
      weightKg: 0.5,
    },
    {
      minItems: 2,
      maxItems: 3,
      lengthCm: 35,
      widthCm: 25,
      heightCm: 8,
      weightKg: 0.9,
    },
    {
      minItems: 4,
      maxItems: 6,
      lengthCm: 40,
      widthCm: 30,
      heightCm: 12,
      weightKg: 1.5,
    },
  ],
  extraItemWeightKg: 0.15,
} as const

export const APP_LIMITS = {
  cart: {
    maxQuantityPerItem: 10,
  },
  shipping: {
    quoteReuseMinutes: 30,
    rateExpirationHours: 24,
  },
} as const

export const VARS = {
  business: BUSINESS_VARS,
  brand: BRAND_VARS,
  shipping: SHIPPING_VARS,
  limits: APP_LIMITS,
} as const
