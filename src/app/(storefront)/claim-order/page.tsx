'use client'

import { Suspense, useEffect, useMemo, useRef } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { AlertCircle, Loader2, LogOut, Package } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { CheckoutLayout } from '@/src/features/storefront/layout/checkout-layout'
import {
  useClaimOrderMutation,
  useOrderClaimPreviewQuery,
} from '@/src/features/storefront/order-claim'
import { routes } from '@/src/config/routes'
import { signOut, useSession } from '@/src/lib/auth/auth-client'

function buildClaimCallbackUrl(token: string): string {
  const params = new URLSearchParams({ token })
  return `${routes.claimOrder}?${params.toString()}`
}

function ClaimOrderContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams.get('token') ?? ''
  const { data: session, isPending: sessionPending } = useSession()
  const previewQuery = useOrderClaimPreviewQuery({ token })
  const claimMutation = useClaimOrderMutation()
  const claimStartedRef = useRef(false)

  const callbackUrl = useMemo(
    () => (token ? buildClaimCallbackUrl(token) : routes.claimOrder),
    [token],
  )

  const loginHref = `${routes.login}?callbackUrl=${encodeURIComponent(callbackUrl)}`
  const registerHref = `${routes.register}?callbackUrl=${encodeURIComponent(callbackUrl)}`

  const isAuthenticated = Boolean(session?.user)

  useEffect(() => {
    if (!token || !isAuthenticated || sessionPending || previewQuery.isLoading) return
    if (!previewQuery.data || claimStartedRef.current) return
    if (previewQuery.data.alreadyClaimed) return

    claimStartedRef.current = true

    void claimMutation.mutateAsync(token).then((result) => {
      if (result.success && result.redirectTo) {
        router.replace(result.redirectTo)
      }
    })
  }, [
    token,
    isAuthenticated,
    sessionPending,
    previewQuery.isLoading,
    previewQuery.data,
    claimMutation,
    router,
  ])

  if (!token) {
    return (
      <ClaimOrderShell>
        <ClaimErrorState
          title="Enlace no válido"
          description="Este enlace ya no es válido."
        />
      </ClaimOrderShell>
    )
  }

  if (previewQuery.isLoading || sessionPending) {
    return (
      <ClaimOrderShell>
        <div className="flex flex-col items-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="mt-4 font-serif text-muted-foreground">Verificando enlace...</p>
        </div>
      </ClaimOrderShell>
    )
  }

  if (!previewQuery.data) {
    return (
      <ClaimOrderShell>
        <ClaimErrorState
          title="Enlace expirado o inválido"
          description="Este enlace ya no es válido. Si necesitas ayuda, contáctanos o visita la tienda."
        />
      </ClaimOrderShell>
    )
  }

  const preview = previewQuery.data

  if (preview.alreadyClaimed && isAuthenticated) {
    return (
      <ClaimOrderShell>
        <div className="rounded-lg border border-border bg-card p-6 md:p-8 text-center">
          <Package className="mx-auto h-10 w-10 text-primary" />
          <h1 className="mt-4 font-sans text-xl font-bold text-foreground">
            Pedido ya vinculado
          </h1>
          <p className="mt-2 font-serif text-muted-foreground">
            El pedido <strong>{preview.orderNumber}</strong> ya está asociado a una cuenta.
          </p>
          <Button asChild className="mt-6 font-sans">
            <Link href={routes.accountOrderDetail(preview.orderNumber)}>Ver mi pedido</Link>
          </Button>
        </div>
      </ClaimOrderShell>
    )
  }

  if (!isAuthenticated) {
    return (
      <ClaimOrderShell>
        <div className="rounded-lg border border-border bg-card p-6 md:p-8">
          <h1 className="font-sans text-xl font-bold text-foreground">
            Crea una cuenta o inicia sesión para ver tu pedido
          </h1>
          <p className="mt-3 font-serif text-muted-foreground">
            Pedido <strong>{preview.orderNumber}</strong> · correo asociado:{' '}
            <strong>{preview.maskedEmail}</strong>
          </p>
          <p className="mt-2 font-serif text-sm text-muted-foreground">
            Por seguridad, solo el correo asociado al pedido podrá reclamarlo.
          </p>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <Button asChild className="font-sans">
              <Link href={registerHref}>Crear cuenta</Link>
            </Button>
            <Button asChild variant="outline" className="font-sans">
              <Link href={loginHref}>Iniciar sesión</Link>
            </Button>
          </div>
        </div>
      </ClaimOrderShell>
    )
  }

  if (claimMutation.isPending) {
    return (
      <ClaimOrderShell>
        <div className="flex flex-col items-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="mt-4 font-serif text-muted-foreground">Vinculando tu pedido...</p>
        </div>
      </ClaimOrderShell>
    )
  }

  const claimResult = claimMutation.data
  if (claimResult && !claimResult.success) {
    const emailMismatch = claimResult.message?.includes('otro correo')

    return (
      <ClaimOrderShell>
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="font-serif">
            {emailMismatch
              ? 'Iniciaste sesión con un correo diferente al del pedido.'
              : claimResult.message ?? 'No pudimos vincular tu pedido.'}
          </AlertDescription>
        </Alert>
        <p className="font-serif text-sm text-muted-foreground">
          Pedido {preview.orderNumber} · correo del pedido: {preview.maskedEmail}
        </p>
        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <Button
            variant="outline"
            className="font-sans"
            onClick={() => {
              void signOut().then(() => {
                router.push(loginHref)
                router.refresh()
              })
            }}
          >
            <LogOut className="mr-2 h-4 w-4" />
            Cerrar sesión e iniciar con otro correo
          </Button>
          <Button asChild variant="ghost" className="font-sans">
            <Link href={routes.contact}>Contactar soporte</Link>
          </Button>
        </div>
      </ClaimOrderShell>
    )
  }

  if (claimMutation.isError) {
    return (
      <ClaimOrderShell>
        <ClaimErrorState
          title="No pudimos vincular tu pedido"
          description="Intenta de nuevo en unos momentos o contacta soporte."
        />
      </ClaimOrderShell>
    )
  }

  return (
    <ClaimOrderShell>
      <div className="flex flex-col items-center py-16">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="mt-4 font-serif text-muted-foreground">Redirigiendo a tu pedido...</p>
      </div>
    </ClaimOrderShell>
  )
}

function ClaimOrderShell({ children }: { children: React.ReactNode }) {
  return (
    <CheckoutLayout>
      <div className="mx-auto max-w-lg py-8">{children}</div>
    </CheckoutLayout>
  )
}

function ClaimErrorState({
  title,
  description,
}: {
  title: string
  description: string
}) {
  return (
    <div className="rounded-lg border border-border bg-card p-6 text-center">
      <AlertCircle className="mx-auto h-10 w-10 text-muted-foreground" />
      <h1 className="mt-4 font-sans text-xl font-bold text-foreground">{title}</h1>
      <p className="mt-2 font-serif text-muted-foreground">{description}</p>
      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
        <Button asChild variant="outline" className="font-sans">
          <Link href={routes.contact}>Contactar</Link>
        </Button>
        <Button asChild className="font-sans">
          <Link href={routes.shop}>Ir a la tienda</Link>
        </Button>
      </div>
    </div>
  )
}

export default function ClaimOrderPage() {
  return (
    <Suspense
      fallback={
        <CheckoutLayout>
          <div className="mx-auto max-w-lg py-16 text-center font-serif text-muted-foreground">
            Cargando...
          </div>
        </CheckoutLayout>
      }
    >
      <ClaimOrderContent />
    </Suspense>
  )
}
