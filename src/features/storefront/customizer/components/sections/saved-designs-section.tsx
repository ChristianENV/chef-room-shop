'use client'

import { useMemo } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Bookmark, LogIn } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { customizeEditDesign, login, routes } from '@/src/config/routes'
import { useSession } from '@/src/lib/auth/auth-client'
import { useMyDesignsQuery } from '@/src/features/storefront/account/api/use-my-designs-query'
import { DesignPreviewImage } from '@/src/features/storefront/account/components/design-preview-image'
import { mapAccountDesignToUi } from '@/src/features/storefront/account/mappers/account-ui.mapper'
import { listGuestDesigns } from '../../lib/guest-design-cache'
import { useCustomizerStore } from '../../store/customizer.store'

export function SavedDesignsSection() {
  const router = useRouter()
  const { data: session } = useSession()
  const isAuthenticated = Boolean(session?.user)
  const { designId, lastSavedAt } = useCustomizerStore()

  const { data: remoteDesigns = [], isLoading } = useMyDesignsQuery(
    { limit: 3 },
    { enabled: isAuthenticated },
  )

  const recentDesigns = useMemo(
    () => remoteDesigns.map(mapAccountDesignToUi),
    [remoteDesigns],
  )

  const guestDesigns = useMemo(() => {
    if (isAuthenticated) return []
    return listGuestDesigns()
      .slice(0, 3)
      .map((design) => mapAccountDesignToUi({ ...design, configJson: design.configJson ?? {} }))
  }, [isAuthenticated])

  const handleLoadDesign = (id: string, productSlug?: string | null) => {
    router.push(customizeEditDesign(id, productSlug))
  }

  return (
    <div className="space-y-4 p-4" data-testid="customizer-recent-designs-section">
      <div>
        <h3 className="text-sm font-semibold text-foreground">Mis diseños</h3>
        <p className="text-xs text-muted-foreground">
          {isAuthenticated
            ? 'Tus 3 diseños más recientes.'
            : 'Borrador local o inicia sesión para guardar diseños.'}
        </p>
      </div>

      {designId && !isAuthenticated ? (
        <div className="rounded-lg border border-border/60 bg-card p-3">
          <div className="flex items-center gap-2 text-sm font-medium text-foreground">
            <Bookmark className="size-4 text-primary" />
            Diseño actual
          </div>
          <p className="mt-1 text-xs text-muted-foreground">
            {lastSavedAt
              ? `Guardado ${new Date(lastSavedAt).toLocaleString('es-MX')}`
              : 'Borrador en progreso'}
          </p>
        </div>
      ) : null}

      {isAuthenticated ? (
        isLoading ? (
          <div className="space-y-2">
            {[1, 2, 3].map((item) => (
              <div key={item} className="h-16 animate-pulse rounded-lg bg-secondary" />
            ))}
          </div>
        ) : recentDesigns.length > 0 ? (
          <div className="space-y-2">
            {recentDesigns.map((design) => (
              <div
                key={design.id}
                className="flex items-center gap-3 rounded-lg border border-border/60 bg-card p-2"
                data-testid="customizer-recent-design-card"
              >
                <div className="size-14 shrink-0 overflow-hidden rounded-md border border-border/40">
                  <DesignPreviewImage
                    previewUrl={design.previewImage}
                    fallbackHex={design.customization.color}
                    productName={design.productName}
                    alt={design.name}
                    className="size-14"
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-foreground">{design.name}</p>
                  <p className="truncate text-xs text-muted-foreground">{design.productName}</p>
                  <p className="text-[11px] text-muted-foreground">
                    {new Date(design.lastEdited).toLocaleDateString('es-MX')}
                  </p>
                </div>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  data-testid="customizer-load-design-button"
                  onClick={() => handleLoadDesign(design.id, design.productSlug)}
                >
                  Cargar
                </Button>
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-lg border border-dashed border-border/60 bg-card/40 p-4 text-center">
            <Bookmark className="mx-auto size-5 text-muted-foreground/60" />
            <p className="mt-2 text-sm text-muted-foreground">
              Aún no tienes diseños guardados en tu cuenta.
            </p>
          </div>
        )
      ) : guestDesigns.length > 0 ? (
        <div className="space-y-2">
          {guestDesigns.map((design) => (
            <div
              key={design.id}
              className="flex items-center gap-3 rounded-lg border border-border/60 bg-card p-2"
              data-testid="customizer-recent-design-card"
            >
              <div className="size-14 shrink-0 overflow-hidden rounded-md border border-border/40">
                <DesignPreviewImage
                  previewUrl={design.previewImage}
                  fallbackHex={design.customization.color}
                  productName={design.productName}
                  alt={design.name}
                  className="size-14"
                />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-foreground">{design.name}</p>
                <p className="truncate text-xs text-muted-foreground">Borrador local</p>
              </div>
              <Button
                type="button"
                size="sm"
                variant="outline"
                data-testid="customizer-load-design-button"
                onClick={() => handleLoadDesign(design.id, design.productSlug)}
              >
                Cargar
              </Button>
            </div>
          ))}
        </div>
      ) : (
        <div className="rounded-lg border border-dashed border-border/60 bg-card/40 p-4 text-center">
          <Bookmark className="mx-auto size-5 text-muted-foreground/60" />
          <p className="mt-2 text-sm text-muted-foreground">
            Guarda un diseño para verlo aquí como borrador local.
          </p>
        </div>
      )}

      {isAuthenticated ? (
        <Button
          variant="outline"
          size="sm"
          className="w-full"
          data-testid="customizer-view-all-designs-button"
          asChild
        >
          <Link href={routes.accountDesigns}>Ver todos mis diseños</Link>
        </Button>
      ) : (
        <Button variant="outline" size="sm" className="w-full" asChild>
          <Link href={login({ callbackUrl: routes.customize })}>
            <LogIn className="mr-2 size-4" />
            Iniciar sesión para guardar diseños
          </Link>
        </Button>
      )}
    </div>
  )
}
