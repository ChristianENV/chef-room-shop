'use client'

import Image from 'next/image'
import { Building2, Globe, Mail, Package, Palette } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'

import {
  formatPackageDimensions,
  mapEmailProviderToLabel,
  mapSkydropxEnvToLabel,
} from '../mappers/admin-settings-ui.mapper'
import { AdminSettingsField, AdminSettingsSection } from './admin-settings-section'
import type { AdminSettingsOverview } from '../types'

type AdminSettingsOverviewPanelProps = {
  settings?: AdminSettingsOverview
  loading?: boolean
}

function ColorSwatch({ color, label }: { color: string; label: string }) {
  return (
    <div className="flex items-center gap-3">
      <span
        className="size-10 shrink-0 rounded-md border border-border shadow-sm"
        style={{ backgroundColor: color }}
        aria-hidden
      />
      <div>
        <p className="font-sans text-sm font-medium text-foreground">{label}</p>
        <p className="font-mono text-xs text-muted-foreground">{color}</p>
      </div>
    </div>
  )
}

function SettingsSkeleton() {
  return (
    <div className="space-y-6" data-testid="admin-settings-loading">
      {Array.from({ length: 5 }).map((_, index) => (
        <CardSkeleton key={index} />
      ))}
    </div>
  )
}

function CardSkeleton() {
  return (
    <div className="rounded-lg border border-border p-6 space-y-4">
      <Skeleton className="h-5 w-40" />
      <Skeleton className="h-4 w-full max-w-md" />
      <Skeleton className="h-4 w-full max-w-sm" />
      <Skeleton className="h-4 w-2/3" />
    </div>
  )
}

export function AdminSettingsOverviewPanel({
  settings,
  loading,
}: AdminSettingsOverviewPanelProps) {
  if (loading || !settings) {
    return <SettingsSkeleton />
  }

  const notifications = settings.notifications
  const providerMismatch =
    notifications.configuredProvider.toLowerCase() !==
    notifications.activeProvider.toLowerCase()

  return (
    <div className="space-y-6" data-testid="admin-settings-overview">
      <div className="rounded-lg border border-border/80 bg-muted/30 px-4 py-3">
        <p className="font-sans text-sm text-foreground">
          Vista de solo lectura. Los valores provienen de{' '}
          <span className="font-medium">configuración del código</span> y variables de entorno
          seguras — sin secretos ni persistencia en base de datos.
        </p>
      </div>

      <AdminSettingsSection
        title="Identidad de la tienda"
        description="Datos públicos de contacto y marca operativa."
        icon={<Building2 className="size-4 text-muted-foreground" />}
        testId="admin-settings-store-section"
      >
        <dl className="space-y-3">
          <AdminSettingsField label="Nombre comercial" value={settings.store.storeName} />
          <AdminSettingsField label="Razón social" value={settings.store.legalName} />
          <AdminSettingsField
            label="Correo de soporte"
            value={
              <a
                href={`mailto:${settings.store.supportEmail}`}
                className="text-primary hover:underline"
              >
                {settings.store.supportEmail}
              </a>
            }
          />
          <AdminSettingsField label="Teléfono" value={settings.store.phone} />
          <AdminSettingsField
            label="Dirección"
            value={
              settings.store.addressAvailable && settings.store.addressFormatted
                ? settings.store.addressFormatted
                : 'No configurada en vars de negocio'
            }
          />
        </dl>
      </AdminSettingsSection>

      <AdminSettingsSection
        title="Marca"
        description="Colores y logo usados en la experiencia Chef Room."
        icon={<Palette className="size-4 text-muted-foreground" />}
        testId="admin-settings-brand-section"
      >
        <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
          <div className="space-y-4">
            <ColorSwatch color={settings.brand.primaryColor} label="Primario" />
            <ColorSwatch color={settings.brand.warmGray} label="Gris cálido" />
          </div>
          <div className="space-y-2">
            <p className="font-serif text-sm text-muted-foreground">Logo</p>
            <div className="flex h-24 w-48 items-center justify-center rounded-lg border border-border bg-[#0B1026] p-4">
              <Image
                src={settings.brand.logoUrl}
                alt="Chef Room logo"
                width={160}
                height={40}
                className="h-auto max-h-14 w-auto max-w-full object-contain"
              />
            </div>
            <p className="font-mono text-xs text-muted-foreground">{settings.brand.logoUrl}</p>
          </div>
        </div>
      </AdminSettingsSection>

      <AdminSettingsSection
        title="Notificaciones"
        description="Estado del proveedor de correo transaccional (sin credenciales)."
        icon={<Mail className="size-4 text-muted-foreground" />}
        testId="admin-settings-notifications-section"
      >
        <dl className="space-y-3">
          <AdminSettingsField
            label="Proveedor configurado"
            value={
              <Badge variant="outline" className="font-sans">
                {mapEmailProviderToLabel(notifications.configuredProvider)}
              </Badge>
            }
          />
          <AdminSettingsField
            label="Proveedor activo"
            value={
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="secondary" className="font-sans">
                  {mapEmailProviderToLabel(notifications.activeProvider)}
                </Badge>
                {providerMismatch ? (
                  <span className="font-serif text-xs text-warning">
                    Fallback por credenciales faltantes
                  </span>
                ) : null}
              </div>
            }
          />
          <AdminSettingsField label="Remitente" value={notifications.fromAddress} mono />
          <AdminSettingsField
            label="Credenciales"
            value={
              notifications.credentialsConfigured ? (
                <Badge variant="outline" className="border-success/30 bg-success/10 text-success">
                  Configuradas
                </Badge>
              ) : (
                <Badge variant="outline" className="border-warning/30 bg-warning/10 text-warning">
                  No configuradas
                </Badge>
              )
            }
          />
        </dl>
      </AdminSettingsSection>

      <AdminSettingsSection
        title="Envíos por defecto"
        description="Dimensiones base del paquete y estado de Skydropx."
        icon={<Package className="size-4 text-muted-foreground" />}
        testId="admin-settings-shipping-section"
      >
        <dl className="space-y-3">
          <AdminSettingsField
            label="Paquete predeterminado"
            value={formatPackageDimensions(settings.shipping)}
          />
          <AdminSettingsField
            label="Skydropx entorno"
            value={mapSkydropxEnvToLabel(settings.shipping.skydropxEnv)}
          />
          <AdminSettingsField
            label="Skydropx credenciales"
            value={
              settings.shipping.skydropxConfigured ? (
                <Badge variant="outline" className="border-success/30 bg-success/10 text-success">
                  Configuradas
                </Badge>
              ) : (
                <Badge variant="outline" className="border-warning/30 bg-warning/10 text-warning">
                  No configuradas
                </Badge>
              )
            }
          />
        </dl>
      </AdminSettingsSection>

      <AdminSettingsSection
        title="Entorno"
        description="URL pública y etiquetas seguras del despliegue."
        icon={<Globe className="size-4 text-muted-foreground" />}
        testId="admin-settings-environment-section"
      >
        <dl className="space-y-3">
          <AdminSettingsField
            label="URL de la app"
            value={
              <a
                href={settings.environment.appUrl}
                target="_blank"
                rel="noreferrer"
                className="text-primary hover:underline"
              >
                {settings.environment.appUrl}
              </a>
            }
            mono
          />
          <AdminSettingsField
            label="Entorno"
            value={
              <Badge variant="outline" className="font-sans">
                {settings.environment.environmentLabel}
              </Badge>
            }
          />
          <AdminSettingsField
            label="NODE_ENV"
            value={<span className="font-mono text-xs">{settings.environment.nodeEnv}</span>}
          />
          {settings.environment.deploymentLabel ? (
            <AdminSettingsField
              label="Despliegue"
              value={settings.environment.deploymentLabel}
            />
          ) : null}
        </dl>
      </AdminSettingsSection>
    </div>
  )
}
