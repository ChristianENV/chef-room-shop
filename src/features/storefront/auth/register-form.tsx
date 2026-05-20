'use client'
import { routes } from '@/src/config/routes'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { Eye, EyeOff, Mail, Lock, User, Phone, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { PasswordStrength } from './password-strength'
import { cn } from '@/lib/utils'
import { authClient, signUp } from '@/src/lib/auth/auth-client'
import { getAuthErrorMessage } from '@/src/lib/auth/auth-errors'
import { registerSchema } from '@/src/lib/auth/auth-schemas'
import {
  ensureCustomerRoleAction,
  getPostLoginRedirectAction,
} from '@/src/server/auth/actions'
import { runPostAuthGuestMerge } from '@/src/lib/auth/post-auth-guest-merge'

interface RegisterFormData {
  firstName: string
  lastName: string
  email: string
  phone: string
  password: string
  confirmPassword: string
  acceptTerms: boolean
  acceptMarketing: boolean
}

interface RegisterFormProps {
  className?: string
  onSuccess?: () => void
  googleEnabled?: boolean
}

export function RegisterForm({
  className,
  onSuccess,
  googleEnabled = false,
}: RegisterFormProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const callbackFromQuery = searchParams.get('callbackUrl')
  const [formData, setFormData] = useState<RegisterFormData>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    acceptTerms: false,
    acceptMarketing: false,
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isGoogleLoading, setIsGoogleLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const oauthCallbackURL = routes.home

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setIsLoading(true)

    const parsed = registerSchema.safeParse({
      firstName: formData.firstName,
      lastName: formData.lastName,
      email: formData.email,
      phone: formData.phone || undefined,
      password: formData.password,
      confirmPassword: formData.confirmPassword,
      acceptTerms: formData.acceptTerms,
      acceptMarketing: formData.acceptMarketing,
    })

    if (!parsed.success) {
      setError(parsed.error.errors[0]?.message ?? 'Datos inválidos')
      setIsLoading(false)
      return
    }

    const name = `${parsed.data.firstName} ${parsed.data.lastName}`.trim()

    const result = await signUp.email({
      email: parsed.data.email.trim().toLowerCase(),
      password: parsed.data.password,
      name,
      firstName: parsed.data.firstName,
      lastName: parsed.data.lastName,
      phone: parsed.data.phone,
      marketingOptIn: parsed.data.acceptMarketing ?? false,
      callbackURL: oauthCallbackURL,
    })

    if (result.error) {
      setError(
        getAuthErrorMessage(
          result.error,
          'No se pudo crear la cuenta. Verifica los datos.',
        ),
      )
      setIsLoading(false)
      return
    }

    await ensureCustomerRoleAction()
    await runPostAuthGuestMerge()

    const session = await authClient.getSession()
    const emailVerified = session.data?.user?.emailVerified ?? false

    setIsLoading(false)
    setSuccess(true)

    setTimeout(() => {
      onSuccess?.()

      if (!emailVerified) {
        const verifyParams = new URLSearchParams()
        if (callbackFromQuery?.startsWith('/')) {
          verifyParams.set('callbackUrl', callbackFromQuery)
        }
        const verifyPath = verifyParams.toString()
          ? `${routes.verifyEmail}?${verifyParams.toString()}`
          : routes.verifyEmail
        router.push(verifyPath)
        router.refresh()
        return
      }

      void getPostLoginRedirectAction({
        source: 'storefront-register',
        callbackUrl: callbackFromQuery,
      }).then((redirectTo) => {
        router.push(redirectTo)
        router.refresh()
      })
    }, 1200)
  }

  const handleGoogleRegister = async () => {
    if (!googleEnabled) {
      setError(
        'Google no está configurado. Agrega GOOGLE_CLIENT_ID y GOOGLE_CLIENT_SECRET en el entorno.',
      )
      return
    }

    setError(null)
    setIsGoogleLoading(true)

    try {
      await authClient.signIn.social({
        provider: 'google',
        callbackURL: oauthCallbackURL,
      })
    } catch (err) {
      setError(
        getAuthErrorMessage(err, 'No se pudo registrarse con Google.'),
      )
      setIsGoogleLoading(false)
    }
  }

  const updateField = (field: keyof RegisterFormData, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  // Success State
  if (success) {
    return (
      <div className={cn('space-y-6 text-center', className)}>
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-success/10">
          <CheckCircle2 className="h-8 w-8 text-success" />
        </div>
        <div className="space-y-2">
          <h2 className="font-sans text-xl font-bold text-foreground">
            Cuenta creada exitosamente
          </h2>
          <p className="font-serif text-muted-foreground">
            Bienvenido a Chef Room! Redirigiendo a tu cuenta...
          </p>
        </div>
        <div className="flex justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      </div>
    )
  }

  return (
    <div className={cn('space-y-6', className)}>
      {/* Header */}
      <div className="space-y-2 text-center">
        <h1 className="font-sans text-2xl font-bold text-foreground">
          Crea tu cuenta
        </h1>
        <p className="font-serif text-muted-foreground">
          Únete a Chef Room y diseña tus uniformes
        </p>
      </div>

      {/* Error Alert */}
      {error && (
        <Alert variant="destructive" className="border-destructive/50 bg-destructive/10">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="font-serif">{error}</AlertDescription>
        </Alert>
      )}

      {/* Register Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Name Fields */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="firstName" className="font-sans text-sm font-medium">
              Nombre <span className="text-destructive">*</span>
            </Label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="firstName"
                type="text"
                placeholder="Juan"
                value={formData.firstName}
                onChange={(e) => updateField('firstName', e.target.value)}
                className="pl-10 font-serif"
                disabled={isLoading || isGoogleLoading}
                autoComplete="given-name"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="lastName" className="font-sans text-sm font-medium">
              Apellido <span className="text-destructive">*</span>
            </Label>
            <Input
              id="lastName"
              type="text"
              placeholder="Perez"
              value={formData.lastName}
              onChange={(e) => updateField('lastName', e.target.value)}
              className="font-serif"
              disabled={isLoading || isGoogleLoading}
              autoComplete="family-name"
            />
          </div>
        </div>

        {/* Email */}
        <div className="space-y-2">
          <Label htmlFor="email" className="font-sans text-sm font-medium">
            Correo electrónico <span className="text-destructive">*</span>
          </Label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="email"
              type="email"
              placeholder="tu@email.com"
              value={formData.email}
              onChange={(e) => updateField('email', e.target.value)}
              className="pl-10 font-serif"
              disabled={isLoading || isGoogleLoading}
              autoComplete="email"
            />
          </div>
        </div>

        {/* Phone */}
        <div className="space-y-2">
          <Label htmlFor="phone" className="font-sans text-sm font-medium">
            Telefono
          </Label>
          <div className="relative">
            <Phone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="phone"
              type="tel"
              placeholder="+52 55 1234 5678"
              value={formData.phone}
              onChange={(e) => updateField('phone', e.target.value)}
              className="pl-10 font-serif"
              disabled={isLoading || isGoogleLoading}
              autoComplete="tel"
            />
          </div>
        </div>

        {/* Password */}
        <div className="space-y-2">
          <Label htmlFor="password" className="font-sans text-sm font-medium">
            Contraseña <span className="text-destructive">*</span>
          </Label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="password"
              type={showPassword ? 'text' : 'password'}
              placeholder="Minimo 8 caracteres"
              value={formData.password}
              onChange={(e) => updateField('password', e.target.value)}
              className="pl-10 pr-10 font-serif"
              disabled={isLoading || isGoogleLoading}
              autoComplete="new-password"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              tabIndex={-1}
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          <PasswordStrength password={formData.password} />
        </div>

        {/* Confirm Password */}
        <div className="space-y-2">
          <Label htmlFor="confirmPassword" className="font-sans text-sm font-medium">
            Confirmar contraseña <span className="text-destructive">*</span>
          </Label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="confirmPassword"
              type={showConfirmPassword ? 'text' : 'password'}
              placeholder="Repite tu contraseña"
              value={formData.confirmPassword}
              onChange={(e) => updateField('confirmPassword', e.target.value)}
              className={cn(
                'pl-10 pr-10 font-serif',
                formData.confirmPassword && formData.password !== formData.confirmPassword && 'border-destructive'
              )}
              disabled={isLoading || isGoogleLoading}
              autoComplete="new-password"
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              tabIndex={-1}
            >
              {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          {formData.confirmPassword && formData.password !== formData.confirmPassword && (
            <p className="font-serif text-xs text-destructive">Las contraseñas no coinciden</p>
          )}
        </div>

        {/* Terms Checkbox */}
        <div className="flex items-start space-x-2">
          <Checkbox
            id="terms"
            checked={formData.acceptTerms}
            onCheckedChange={(checked) => updateField('acceptTerms', checked as boolean)}
            disabled={isLoading || isGoogleLoading}
            className="mt-0.5"
          />
          <Label 
            htmlFor="terms" 
            className="font-serif text-sm text-muted-foreground cursor-pointer leading-snug"
          >
            Acepto los{' '}
            <Link href={routes.terms} className="text-accent hover:underline">
              Términos de Servicio
            </Link>{' '}
            y la{' '}
            <Link href={routes.privacy} className="text-accent hover:underline">
              Política de Privacidad
            </Link>{' '}
            <span className="text-destructive">*</span>
          </Label>
        </div>

        {/* Marketing Checkbox */}
        <div className="flex items-start space-x-2">
          <Checkbox
            id="marketing"
            checked={formData.acceptMarketing}
            onCheckedChange={(checked) => updateField('acceptMarketing', checked as boolean)}
            disabled={isLoading || isGoogleLoading}
            className="mt-0.5"
          />
          <Label 
            htmlFor="marketing" 
            className="font-serif text-sm text-muted-foreground cursor-pointer leading-snug"
          >
            Quiero recibir ofertas exclusivas y novedades por correo
          </Label>
        </div>

        {/* Submit Button */}
        <Button 
          type="submit" 
          className="w-full font-sans font-semibold"
          disabled={isLoading || isGoogleLoading}
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Creando cuenta...
            </>
          ) : (
            'Crear Cuenta'
          )}
        </Button>
      </form>

      {/* Divider */}
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t border-border" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-2 font-serif text-muted-foreground">
            O registrate con
          </span>
        </div>
      </div>

      {/* Google Register */}
      <Button
        type="button"
        variant="outline"
        className="w-full font-sans"
        onClick={handleGoogleRegister}
        disabled={isLoading || isGoogleLoading || !googleEnabled}
        title={
          !googleEnabled
            ? 'Configura GOOGLE_CLIENT_ID y GOOGLE_CLIENT_SECRET'
            : undefined
        }
      >
        {isGoogleLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Conectando...
          </>
        ) : (
          <>
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
            Registrarse con Google
          </>
        )}
      </Button>

      {/* Login Link */}
      <p className="text-center font-serif text-sm text-muted-foreground">
        Ya tienes cuenta?{' '}
        <Link href={routes.login} className="font-sans font-medium text-accent hover:underline">
          Iniciar sesión
        </Link>
      </p>
    </div>
  )
}
