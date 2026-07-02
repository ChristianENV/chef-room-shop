'use client'

import { Suspense, useCallback, useEffect, useMemo, useRef } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { AlertCircle, Loader2, LogOut, Mail } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { CheckoutLayout } from '@/src/features/storefront/layout/checkout-layout'
import { VerifyEmailResend } from '@/src/features/storefront/auth/verify-email-resend'
import {
  AcceptInviteSignupForm,
  useAcceptUserInvitationMutation,
  useUserInvitationPreviewQuery,
} from '@/src/features/storefront/invitations'
import { acceptInvite, login, routes, verifyEmail } from '@/src/config/routes'
import { signOut, useSession } from '@/src/lib/auth/auth-client'

function AcceptInviteContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams.get('token')?.trim() ?? ''
  const { data: session, isPending: sessionPending } = useSession()
  const previewQuery = useUserInvitationPreviewQuery({ token })
  const acceptMutation = useAcceptUserInvitationMutation()
  const acceptStartedRef = useRef(false)

  const callbackUrl = useMemo(
    () => (token ? acceptInvite({ token }) : routes.acceptInvite),
    [token],
  )

  const loginHref = login({ callbackUrl })
  const isAuthenticated = Boolean(session?.user)
  const emailVerified = session?.user?.emailVerified ?? false
  const needsEmailVerification = isAuthenticated && !emailVerified

  const runAccept = useCallback(() => {
    if (!token || acceptStartedRef.current) return
    acceptStartedRef.current = true

    void acceptMutation.mutateAsync(token).then((result) => {
      if (result.success && result.redirectTo) {
        router.replace(result.redirectTo)
        return
      }

      if (!result.success) {
        acceptStartedRef.current = false
      }
    })
  }, [token, acceptMutation, router])

  useEffect(() => {
    if (!token || !isAuthenticated || sessionPending || previewQuery.isLoading) return
    if (!previewQuery.data?.valid) return
    if (!emailVerified) return
    if (acceptStartedRef.current) return

    const sessionEmail = session?.user?.email?.trim().toLowerCase()
    const inviteEmail = previewQuery.data.email?.trim().toLowerCase()
    if (!sessionEmail || !inviteEmail || sessionEmail !== inviteEmail) return

    runAccept()
  }, [
    token,
    isAuthenticated,
    sessionPending,
    previewQuery.isLoading,
    previewQuery.data,
    emailVerified,
    session?.user?.email,
    runAccept,
  ])

  if (!token) {
    return (
      <AcceptInviteShell>
        <AcceptInviteErrorState
          title="Enlace no válido"
          description="Falta el token de invitación. Revisa el enlace del correo."
        />
      </AcceptInviteShell>
    )
  }

  if (previewQuery.isLoading || sessionPending) {
    return (
      <AcceptInviteShell>
        <div className="flex flex-col items-center py-16" data-testid="accept-invite-loading">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="mt-4 font-serif text-muted-foreground">Verificando invitación...</p>
        </div>
      </AcceptInviteShell>
    )
  }

  if (previewQuery.isError || !previewQuery.data) {
    return (
      <AcceptInviteShell>
        <AcceptInviteErrorState
          title="No pudimos verificar la invitación"
          description="Intenta de nuevo en unos momentos o contacta soporte."
        />
      </AcceptInviteShell>
    )
  }

  const preview = previewQuery.data

  if (!preview.valid) {
    return (
      <AcceptInviteShell>
        <AcceptInviteErrorState
          title="Invitación no disponible"
          description={
            preview.message ?? 'Este enlace de invitación no es válido o ya no está disponible.'
          }
        />
      </AcceptInviteShell>
    )
  }

  if (needsEmailVerification) {
    return (
      <AcceptInviteShell>
        <div
          data-testid="accept-invite-verify-email"
          className="rounded-lg border border-border bg-card p-6 md:p-8"
        >
          <h1 className="font-sans text-xl font-bold text-foreground">
            Verifica tu correo para aceptar la invitación
          </h1>
          <p className="mt-3 font-serif text-muted-foreground">
            Invitación para <strong>{preview.targetRoleLabel}</strong> · correo:{' '}
            <strong>{preview.maskedEmail}</strong>
          </p>
          <div className="mt-6 space-y-3">
            <VerifyEmailResend callbackURL={callbackUrl} email={session?.user?.email} />
            <Button asChild variant="outline" className="font-sans">
              <Link href={verifyEmail({ callbackUrl })}>Ir a verificación de correo</Link>
            </Button>
          </div>
        </div>
      </AcceptInviteShell>
    )
  }

  if (!isAuthenticated) {
    const isExistingUser = preview.existingUserHint === 'existing'

    return (
      <AcceptInviteShell>
        <div
          data-testid="accept-invite-auth-required"
          className="rounded-lg border border-border bg-card p-6 md:p-8"
        >
          <div className="mb-6 space-y-2">
            <div className="flex items-center gap-2 text-primary">
              <Mail className="h-5 w-5" aria-hidden />
              <span className="font-sans text-sm font-medium">Invitación a Chef Room</span>
            </div>
            <h1 className="font-sans text-xl font-bold text-foreground">
              {isExistingUser ? 'Inicia sesión para aceptar' : 'Crea tu cuenta para aceptar'}
            </h1>
            <p className="font-serif text-sm text-muted-foreground">
              Te invitaron como <strong>{preview.targetRoleLabel}</strong>. Correo:{' '}
              <strong>{preview.maskedEmail}</strong>
            </p>
            {preview.expiresAt ? (
              <p className="font-serif text-xs text-muted-foreground">
                Válida hasta {new Date(preview.expiresAt).toLocaleDateString('es-MX')}
              </p>
            ) : null}
          </div>

          {isExistingUser ? (
            <div className="space-y-4">
              <p className="font-serif text-sm text-muted-foreground">
                Ya existe una cuenta con este correo. Inicia sesión para completar la invitación.
              </p>
              <Button asChild className="font-sans">
                <Link href={loginHref}>Iniciar sesión</Link>
              </Button>
            </div>
          ) : (
            <AcceptInviteSignupForm
              email={preview.email ?? ''}
              callbackUrl={callbackUrl}
              onSignupComplete={runAccept}
              onNeedsEmailVerification={() => {
                router.replace(verifyEmail({ callbackUrl }))
                router.refresh()
              }}
            />
          )}

          {!isExistingUser ? (
            <p className="mt-6 text-center font-serif text-sm text-muted-foreground">
              ¿Ya tienes cuenta?{' '}
              <Link href={loginHref} className="text-primary underline-offset-4 hover:underline">
                Inicia sesión
              </Link>
            </p>
          ) : null}
        </div>
      </AcceptInviteShell>
    )
  }

  if (acceptMutation.isPending) {
    return (
      <AcceptInviteShell>
        <div className="flex flex-col items-center py-16" data-testid="accept-invite-accepting">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="mt-4 font-serif text-muted-foreground">Aceptando invitación...</p>
        </div>
      </AcceptInviteShell>
    )
  }

  const acceptResult = acceptMutation.data
  if (acceptResult && !acceptResult.success) {
    const emailMismatch = acceptResult.message?.includes('correo al que se envió')

    return (
      <AcceptInviteShell>
        <Alert variant="destructive" className="mb-4" data-testid="accept-invite-error">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="font-serif">
            {emailMismatch
              ? 'Iniciaste sesión con un correo diferente al de la invitación.'
              : (acceptResult.message ?? 'No pudimos aceptar la invitación.')}
          </AlertDescription>
        </Alert>
        <p className="font-serif text-sm text-muted-foreground">
          Invitación para {preview.targetRoleLabel} · correo: {preview.maskedEmail}
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
      </AcceptInviteShell>
    )
  }

  if (acceptMutation.isError) {
    return (
      <AcceptInviteShell>
        <AcceptInviteErrorState
          title="No pudimos aceptar la invitación"
          description="Intenta de nuevo en unos momentos o contacta soporte."
        />
      </AcceptInviteShell>
    )
  }

  return (
    <AcceptInviteShell>
      <div className="flex flex-col items-center py-16" data-testid="accept-invite-redirecting">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="mt-4 font-serif text-muted-foreground">Redirigiendo...</p>
      </div>
    </AcceptInviteShell>
  )
}

function AcceptInviteShell({ children }: { children: React.ReactNode }) {
  return (
    <CheckoutLayout>
      <div className="mx-auto max-w-lg py-8">{children}</div>
    </CheckoutLayout>
  )
}

function AcceptInviteErrorState({ title, description }: { title: string; description: string }) {
  return (
    <div
      data-testid="accept-invite-invalid"
      className="rounded-lg border border-border bg-card p-6 text-center"
    >
      <AlertCircle className="mx-auto h-10 w-10 text-muted-foreground" aria-hidden />
      <h1 className="mt-4 font-sans text-xl font-bold text-foreground">{title}</h1>
      <p className="mt-2 font-serif text-muted-foreground">{description}</p>
      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
        <Button asChild variant="outline" className="font-sans">
          <Link href={routes.contact}>Contactar</Link>
        </Button>
        <Button asChild className="font-sans">
          <Link href={routes.home}>Ir al inicio</Link>
        </Button>
      </div>
    </div>
  )
}

export default function AcceptInvitePage() {
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
      <AcceptInviteContent />
    </Suspense>
  )
}
