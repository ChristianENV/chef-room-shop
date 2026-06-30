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
import { loadCustomizerLocalDraft } from '../../lib/customizer-local-draft'
import { useCustomizerStore } from '../../store/customizer.store'

export function SavedDesignsSection({ embedded = false }: { embedded?: boolean }) {
  const router = useRouter()
  const { data: session } = useSession()
  const isAuthenticated = Boolean(session?.user)
  const { hasLocalDraft, lastSavedAt, product } = useCustomizerStore()

  const { data: remoteDesigns = [], isLoading } = useMyDesignsQuery(
    { limit: 3 },
    { enabled: isAuthenticated },
  )

  const recentDesigns = useMemo(() => remoteDesigns.map(mapAccountDesignToUi), [remoteDesigns])

  const localDraftSummary = useMemo(() => {
    if (isAuthenticated || !hasLocalDraft) return null
    const draft = loadCustomizerLocalDraft(product?.slug)
    if (!draft) return null
    void lastSavedAt
    return draft
  }, [isAuthenticated, hasLocalDraft, product?.slug, lastSavedAt])

  const handleLoadDesign = (id: string, productSlug?: string | null) => {
    router.push(customizeEditDesign(id, productSlug))
  }

  return (
    <div
      className={embedded ? 'space-y-4 px-1 pb-2' : 'space-y-4 p-4'}
      data-testid="customizer-recent-designs-section"
    >
      {!embedded ? (
        <div>
          <h3 className="text-sm font-semibold text-foreground">Mis diseños</h3>
          <p className="text-xs text-muted-foreground">
            {isAuthenticated
              ? 'Tus 3 diseños más recientes.'
              : 'Borrador local o inicia sesión para guardar diseños.'}
          </p>
        </div>
      ) : (
        <p className="text-xs text-muted-foreground">
          {isAuthenticated
            ? 'Tus 3 diseños más recientes.'
            : 'Borrador local o inicia sesión para guardar diseños.'}
        </p>
      )}

      {!isAuthenticated && localDraftSummary ? (
        <div
          className="rounded-lg border border-border/60 bg-card p-3"
          data-testid="customizer-local-draft-card"
        >
          <div className="flex items-center gap-2 text-sm font-medium text-foreground">
            <Bookmark className="size-4 text-primary" />
            Borrador local
          </div>
          <p className="mt-1 text-xs text-muted-foreground">
            {lastSavedAt
              ? `Guardado ${new Date(lastSavedAt).toLocaleString('es-MX')}`
              : 'En progreso en este dispositivo'}
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
      ) : !localDraftSummary ? (
        <div className="rounded-lg border border-dashed border-border/60 bg-card/40 p-4 text-center">
          <Bookmark className="mx-auto size-5 text-muted-foreground/60" />
          <p className="mt-2 text-sm text-muted-foreground">
            Personaliza y guarda un borrador local en este dispositivo.
          </p>
        </div>
      ) : null}

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
