import { CHEF_ROOM_LOGO_SRC } from '@/lib/brand'
import { BRAND_VARS, BUSINESS_VARS } from '@/src/config/vars'
import {
  getEmailConfig,
  resolveActiveEmailProvider,
} from '@/src/server/email/email.config'
import { getAppBaseUrl } from '@/src/server/payments/app-url'
import { getDefaultPackageConfig } from '@/src/server/shipping/shipping.config'
import {
  getSkydropxConfig,
  isSkydropxConfigured,
} from '@/src/server/shipping/skydropx/skydropx.config'

import {
  resolveAdminDeploymentLabel,
  resolveAdminEnvironmentLabel,
} from './admin-settings.env'
import type { AdminSettingsOverviewGql } from './admin-settings.types'

function hasBusinessAddress(): boolean {
  const { address } = BUSINESS_VARS
  return Boolean(
    address.formatted?.trim() ||
      address.street?.trim() ||
      address.postalCode?.trim(),
  )
}

function emailCredentialsConfigured(
  configuredProvider: string,
  config: ReturnType<typeof getEmailConfig>,
): boolean {
  if (configuredProvider === 'resend') return config.resendApiKey.length > 0
  if (configuredProvider === 'mailtrap') return config.mailtrapToken.length > 0
  return true
}

/**
 * Builds the read-only admin settings overview from code constants and safe env flags.
 */
export function buildAdminSettingsOverview(): AdminSettingsOverviewGql {
  const emailConfig = getEmailConfig()
  const configuredProvider = emailConfig.provider
  let activeProvider = configuredProvider
  try {
    activeProvider = resolveActiveEmailProvider(emailConfig)
  } catch {
    activeProvider = 'console'
  }
  const packageDefaults = getDefaultPackageConfig()
  const skydropx = getSkydropxConfig()

  const addressFormatted = BUSINESS_VARS.address.formatted?.trim() || null

  return {
    readOnly: true,
    store: {
      storeName: BUSINESS_VARS.name,
      legalName: BUSINESS_VARS.legalName,
      supportEmail: BUSINESS_VARS.support.email,
      phone: BUSINESS_VARS.support.phone,
      addressFormatted,
      addressAvailable: hasBusinessAddress(),
    },
    brand: {
      primaryColor: BRAND_VARS.primaryColor,
      warmGray: BRAND_VARS.warmNeutral,
      logoUrl: CHEF_ROOM_LOGO_SRC,
    },
    notifications: {
      configuredProvider,
      activeProvider,
      fromAddress: emailConfig.from,
      credentialsConfigured: emailCredentialsConfigured(configuredProvider, emailConfig),
    },
    shipping: {
      lengthCm: packageDefaults.lengthCm,
      widthCm: packageDefaults.widthCm,
      heightCm: packageDefaults.heightCm,
      weightKg: packageDefaults.weightKg,
      skydropxEnv: skydropx.env,
      skydropxConfigured: isSkydropxConfigured(),
    },
    environment: {
      appUrl: getAppBaseUrl(),
      nodeEnv: process.env.NODE_ENV?.trim() || 'development',
      environmentLabel: resolveAdminEnvironmentLabel(),
      deploymentLabel: resolveAdminDeploymentLabel(),
    },
  }
}
