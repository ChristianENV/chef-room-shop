export type AdminStoreIdentitySettingsGql = {
  storeName: string
  legalName: string
  supportEmail: string
  phone: string
  addressFormatted: string | null
  addressAvailable: boolean
}

export type AdminBrandSettingsGql = {
  primaryColor: string
  warmGray: string
  logoUrl: string
}

export type AdminNotificationSettingsGql = {
  configuredProvider: string
  activeProvider: string
  fromAddress: string
  credentialsConfigured: boolean
}

export type AdminShippingDefaultsSettingsGql = {
  lengthCm: number
  widthCm: number
  heightCm: number
  weightKg: number
  skydropxEnv: string
  skydropxConfigured: boolean
}

export type AdminEnvironmentSettingsGql = {
  appUrl: string
  nodeEnv: string
  environmentLabel: string
  deploymentLabel: string | null
}

export type AdminSettingsOverviewGql = {
  store: AdminStoreIdentitySettingsGql
  brand: AdminBrandSettingsGql
  notifications: AdminNotificationSettingsGql
  shipping: AdminShippingDefaultsSettingsGql
  environment: AdminEnvironmentSettingsGql
  readOnly: boolean
}
