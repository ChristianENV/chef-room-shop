export const ADMIN_SETTINGS_OVERVIEW_QUERY = /* GraphQL */ `
  query AdminSettingsOverview {
    adminSettingsOverview {
      readOnly
      store {
        storeName
        legalName
        supportEmail
        phone
        addressFormatted
        addressAvailable
      }
      brand {
        primaryColor
        warmGray
        logoUrl
      }
      notifications {
        configuredProvider
        activeProvider
        fromAddress
        credentialsConfigured
      }
      shipping {
        lengthCm
        widthCm
        heightCm
        weightKg
        skydropxEnv
        skydropxConfigured
      }
      environment {
        appUrl
        nodeEnv
        environmentLabel
        deploymentLabel
      }
    }
  }
`
