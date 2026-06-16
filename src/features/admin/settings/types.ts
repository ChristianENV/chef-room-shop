export type AdminStoreIdentitySettings = {
  storeName: string
  legalName: string
  supportEmail: string
  phone: string
  addressFormatted: string | null
  addressAvailable: boolean
}

export type AdminBrandSettings = {
  primaryColor: string
  warmGray: string
  logoUrl: string
}

export type AdminNotificationSettings = {
  configuredProvider: string
  activeProvider: string
  fromAddress: string
  credentialsConfigured: boolean
}

export type AdminShippingDefaultsSettings = {
  lengthCm: number
  widthCm: number
  heightCm: number
  weightKg: number
  skydropxEnv: string
  skydropxConfigured: boolean
}

export type AdminEnvironmentSettings = {
  appUrl: string
  nodeEnv: string
  environmentLabel: string
  deploymentLabel: string | null
}

export type AdminSettingsOverview = {
  readOnly: boolean
  store: AdminStoreIdentitySettings
  brand: AdminBrandSettings
  notifications: AdminNotificationSettings
  shipping: AdminShippingDefaultsSettings
  environment: AdminEnvironmentSettings
}
