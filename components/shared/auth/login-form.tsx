'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { Eye, EyeOff, Mail, Lock, Loader2, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { cn } from '@/lib/utils'
import { routes } from '@/src/config/routes'
import { authClient, signIn, signOut } from '@/src/lib/auth/auth-client'
import { getAuthErrorMessage } from '@/src/lib/auth/auth-errors'
import { loginSchema } from '@/src/lib/auth/auth-schemas'
import { runPostAuthGuestMerge } from '@/src/lib/auth/post-auth-guest-merge'
import {
  assertAdminAccessAction,
  ensureCustomerRoleAction,
  getPostLoginRedirectAction,
} from '@/src/server/auth/actions'

type LoginFormVariant = 'storefront' | 'admin'

interface LoginFormProps {
  className?: string
  variant?: LoginFormVariant
  googleEnabled?: boolean
}

export function LoginForm({
  className,
  variant = 'storefront',
  googleEnabled = false,
}: LoginFormProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const callbackFromQuery = searchParams.get('callbackUrl')
  const errorFromQuery = searchParams.get('error')

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [rememberMe, setRememberMe] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isGoogleLoading, setIsGoogleLoading] = useState(false)
  const [error, setError] = useState<string | null>(() => {
    if (errorFromQuery === 'forbidden' || errorFromQuery === 'admin_forbidden') {
      return 'No tienes permisos para acceder al dashboard.'
    }
    return null
  })
  const [forgotMessage, setForgotMessage] = useState<string | null>(null)

  const isAdminVariant = variant === 'admin'
  const oauthCallbackURL = isAdminVariant
    ? routes.adminDashboard
    : routes.home

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setForgotMessage(null)
    setIsLoading(true)

    const parsed = loginSchema.safeParse({ email, password })
    if (!parsed.success) {
      setError(parsed.error.errors[0]?.message ?? 'Datos inv?lidos')
      setIsLoading(false)
      return
    }

    const result = await signIn.email({
      email: parsed.data.email.trim().toLowerCase(),
      password: parsed.data.password,
      callbackURL: oauthCallbackURL,
      rememberMe,
    })

    if (result.error) {
      setError(
        getAuthErrorMessage(
          result.error,
          'Correo o contrase?a incorrectos.',
        ),
      )
      setIsLoading(false)
      return
    }

    if (isAdminVariant) {
      const adminCheck = await assertAdminAccessAction()
      if (!adminCheck.ok) {
        await signOut()
        setError(adminCheck.message)
        setIsLoading(false)
        return
      }
    } else {
      await ensureCustomerRoleAction()
      await runPostAuthGuestMerge()
    }

    const redirectTo = await getPostLoginRedirectAction({
      source: isAdminVariant ? 'admin-login' : 'storefront-login',
      callbackUrl: callbackFromQuery,
    })

    setIsLoading(false)
    router.push(redirectTo)
    router.refresh()
  }

  const handleGoogleLogin = async () => {
    if (!googleEnabled) {
      setError(
        'Google no est? configurado. Agrega GOOGLE_CLIENT_ID y GOOGLE_CLIENT_SECRET en el entorno.',
      )
      return
    }

    setError(null)
    setForgotMessage(null)
    setIsGoogleLoading(true)

    try {
      await authClient.signIn.social({
        provider: 'google',
        callbackURL: oauthCallbackURL,
      })
    } catch (err) {
      setError(
        getAuthErrorMessage(err, 'No se pudo iniciar sesi?n con Google.'),
      )
      setIsGoogleLoading(false)
    }
  }

  const handleForgotPassword = (e: React.MouseEvent) => {
    e.preventDefault()
    setForgotMessage(
      'La recuperaci?n de contrase?a estar? disponible pronto.',
    )
  }

  const busy = isLoading || isGoogleLoading

  return (
    <div className={cn('space-y-6', className)}>
      <div className="space-y-2 text-center">
        <h1 className="font-sans text-2xl font-bold text-foreground">
          {isAdminVariant ? 'Panel de administraci?n' : 'Bienvenido de vuelta'}
        </h1>
        <p className="font-serif text-muted-foreground">
          {isAdminVariant
            ? 'Inicia sesi?n con tu cuenta de administrador'
            : 'Inicia sesi?n para acceder a tu cuenta'}
        </p>
      </div>

      {error && (
        <Alert
          variant="destructive"
          className="border-destructive/50 bg-destructive/10"
        >
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="font-serif">{error}</AlertDescription>
        </Alert>
      )}

      {forgotMessage && (
        <Alert className="border-border bg-muted/50">
          <AlertDescription className="font-serif">
            {forgotMessage}
          </AlertDescription>
        </Alert>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email" className="font-sans text-sm font-medium">
            Correo electr?nico
          </Label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="email"
              type="email"
              placeholder="tu@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="pl-10 font-serif"
              disabled={busy}
              autoComplete="email"
            />
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="password" className="font-sans text-sm font-medium">
              Contrase?a
            </Label>
            <button
              type="button"
              onClick={handleForgotPassword}
              className="font-serif text-xs text-accent hover:underline"
            >
              ?Olvidaste tu contrase?a?
            </button>
          </div>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="password"
              type={showPassword ? 'text' : 'password'}
              placeholder="????????"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="pl-10 pr-10 font-serif"
              disabled={busy}
              autoComplete="current-password"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              tabIndex={-1}
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <Checkbox
            id="remember"
            checked={rememberMe}
            onCheckedChange={(checked) => setRememberMe(checked === true)}
            disabled={busy}
          />
          <Label
            htmlFor="remember"
            className="cursor-pointer font-serif text-sm text-muted-foreground"
          >
            Mantener sesi?n iniciada
          </Label>
        </div>

        <Button
          type="submit"
          className="w-full font-sans font-semibold"
          disabled={busy}
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Iniciando sesi?n...
            </>
          ) : (
            'Iniciar sesi?n'
          )}
        </Button>
      </form>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t border-border" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-2 font-serif text-muted-foreground">
            O contin?a con
          </span>
        </div>
      </div>

      <Button
        type="button"
        variant="outline"
        className="w-full font-sans"
        onClick={handleGoogleLogin}
        disabled={busy || !googleEnabled}
        title={
          !googleEnabled
            ? 'Google no est? configurado. Agrega GOOGLE_CLIENT_ID y GOOGLE_CLIENT_SECRET.'
            : undefined
        }
      >
        <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24" aria-hidden>
          <path
            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            fill="#4285F4"
          />
          <path
            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            fill="#34A853"
          />
          <path
            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            fill="#FBBC05"
          />
          <path
            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            fill="#EA4335"
          />
        </svg>
        {isGoogleLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Conectando...
          </>
        ) : (
          'Iniciar sesi?n con Google'
        )}
      </Button>

      {!isAdminVariant && (
        <p className="text-center font-serif text-sm text-muted-foreground">
          ?No tienes cuenta?{' '}
          <Link
            href={routes.register}
            className="font-sans font-medium text-accent hover:underline"
          >
            Crear cuenta
          </Link>
        </p>
      )}
    </div>
  )
}
