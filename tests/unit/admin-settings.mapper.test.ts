import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import {
  formatPackageDimensions,
  mapEmailProviderToLabel,
  mapSkydropxEnvToLabel,
} from '@/src/features/admin/settings/mappers/admin-settings-ui.mapper'
import {
  resolveAdminDeploymentLabel,
  resolveAdminEnvironmentLabel,
} from '@/src/server/graphql/modules/admin-settings/admin-settings.env'

describe('admin settings', () => {
  it('maps email provider labels', () => {
    assert.equal(mapEmailProviderToLabel('console'), 'Consola (desarrollo)')
    assert.equal(mapEmailProviderToLabel('resend'), 'Resend')
    assert.equal(mapEmailProviderToLabel('mailtrap'), 'Mailtrap')
  })

  it('formats default package dimensions', () => {
    assert.equal(
      formatPackageDimensions({
        lengthCm: 30,
        widthCm: 20,
        heightCm: 5,
        weightKg: 0.5,
      }),
      '30 × 20 × 5 cm · 0.5 kg',
    )
  })

  it('maps skydropx env labels', () => {
    assert.equal(mapSkydropxEnvToLabel('sandbox'), 'Sandbox')
    assert.equal(mapSkydropxEnvToLabel('production'), 'Producción')
  })

  it('resolves safe environment labels', () => {
    assert.match(resolveAdminEnvironmentLabel(), /Desarrollo|Producción|Previsualización|Pruebas/)
    const deployment = resolveAdminDeploymentLabel()
    if (deployment) {
      assert.match(deployment, /Vercel|Railway/)
    }
  })
})
