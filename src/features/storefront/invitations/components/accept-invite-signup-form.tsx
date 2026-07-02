'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  AlertCircle,
  CheckCircle2,
  Eye,
  EyeOff,
  Loader2,
  Lock,
  Mail,
  Phone,
  User,
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { PasswordStrength } from '@/src/features/storefront/auth/password-strength'
import { routes } from '@/src/config/routes'
import { authClient, signUp } from '@/src/lib/auth/auth-client'
import { getAuthErrorMessage } from '@/src/lib/auth/auth-errors'
import { registerSchema } from '@/src/lib/auth/auth-schemas'
import { ensureCustomerRoleAction } from '@/src/server/auth/actions'
import { runPostAuthGuestMerge } from '@/src/lib/auth/post-auth-guest-merge'
import { cn } from '@/lib/utils'

type AcceptInviteSignupFormProps = {
  email: string
  callbackUrl: string
  className?: string
  onSignupComplete: () => void
  onNeedsEmailVerification: () => void
}

type FormData = {
  firstName: string
  lastName: string
  phone: string
  password: string
  confirmPassword: string
  acceptTerms: boolean
  acceptMarketing: boolean
}

export function AcceptInviteSignupForm({
  email,
  callbackUrl,
  className,
  onSignupComplete,
  onNeedsEmailVerification,
}: AcceptInviteSignupFormProps) {
  const [formData, setFormData] = useState<FormData>({
    firstName: '',
    lastName: '',
    phone: '',
    password: '',
    confirmPassword: '',
    acceptTerms: false,
    acceptMarketing: false,
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const updateField = (field: keyof FormData, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setIsLoading(true)

    const parsed = registerSchema.safeParse({
      firstName: formData.firstName,
      lastName: formData.lastName,
      email,
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
      callbackURL: callbackUrl,
    })

    if (result.error) {
      setError(getAuthErrorMessage(result.error, 'No se pudo crear la cuenta. Verifica los datos.'))
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
      if (!emailVerified) {
        onNeedsEmailVerification()
        return
      }

      onSignupComplete()
    }, 800)
  }

  if (success) {
    return (
      <div
        data-testid="accept-invite-signup-success"
        className={cn('space-y-4 text-center', className)}
      >
        <CheckCircle2 className="mx-auto h-10 w-10 text-success" aria-hidden />
        <p className="font-serif text-sm text-muted-foreground">Cuenta creada. Continuando...</p>
        <Loader2 className="mx-auto h-6 w-6 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div data-testid="accept-invite-signup-form" className={cn('space-y-4', className)}>
      <div className="space-y-1">
        <h2 className="font-sans text-lg font-semibold text-foreground">Crea tu cuenta</h2>
        <p className="font-serif text-sm text-muted-foreground">
          Completa tu registro para aceptar la invitación.
        </p>
      </div>

      {error ? (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="font-serif">{error}</AlertDescription>
        </Alert>
      ) : null}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="accept-invite-firstName" className="font-sans text-sm font-medium">
              Nombre <span className="text-destructive">*</span>
            </Label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="accept-invite-firstName"
                type="text"
                value={formData.firstName}
                onChange={(e) => updateField('firstName', e.target.value)}
                className="pl-10 font-serif"
                disabled={isLoading}
                autoComplete="given-name"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="accept-invite-lastName" className="font-sans text-sm font-medium">
              Apellido <span className="text-destructive">*</span>
            </Label>
            <Input
              id="accept-invite-lastName"
              type="text"
              value={formData.lastName}
              onChange={(e) => updateField('lastName', e.target.value)}
              className="font-serif"
              disabled={isLoading}
              autoComplete="family-name"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="accept-invite-email" className="font-sans text-sm font-medium">
            Correo electrónico
          </Label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="accept-invite-email"
              type="email"
              value={email}
              readOnly
              disabled
              className="pl-10 font-serif bg-muted/40"
              autoComplete="email"
            />
            <Lock
              className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
              aria-hidden
            />
          </div>
          <p className="font-serif text-xs text-muted-foreground">
            Este correo está vinculado a tu invitación y no puede cambiarse.
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="accept-invite-phone" className="font-sans text-sm font-medium">
            Teléfono
          </Label>
          <div className="relative">
            <Phone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="accept-invite-phone"
              type="tel"
              value={formData.phone}
              onChange={(e) => updateField('phone', e.target.value)}
              className="pl-10 font-serif"
              disabled={isLoading}
              autoComplete="tel"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="accept-invite-password" className="font-sans text-sm font-medium">
            Contraseña <span className="text-destructive">*</span>
          </Label>
          <div className="relative">
            <Input
              id="accept-invite-password"
              type={showPassword ? 'text' : 'password'}
              value={formData.password}
              onChange={(e) => updateField('password', e.target.value)}
              className="pr-10 font-serif"
              disabled={isLoading}
              autoComplete="new-password"
            />
            <button
              type="button"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
              onClick={() => setShowPassword((v) => !v)}
              aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          <PasswordStrength password={formData.password} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="accept-invite-confirmPassword" className="font-sans text-sm font-medium">
            Confirmar contraseña <span className="text-destructive">*</span>
          </Label>
          <div className="relative">
            <Input
              id="accept-invite-confirmPassword"
              type={showConfirmPassword ? 'text' : 'password'}
              value={formData.confirmPassword}
              onChange={(e) => updateField('confirmPassword', e.target.value)}
              className="pr-10 font-serif"
              disabled={isLoading}
              autoComplete="new-password"
            />
            <button
              type="button"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
              onClick={() => setShowConfirmPassword((v) => !v)}
              aria-label={showConfirmPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
            >
              {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-start gap-2">
            <Checkbox
              id="accept-invite-terms"
              checked={formData.acceptTerms}
              onCheckedChange={(checked) => updateField('acceptTerms', checked === true)}
              disabled={isLoading}
            />
            <Label htmlFor="accept-invite-terms" className="font-serif text-sm leading-snug">
              Acepto los{' '}
              <Link href={routes.terms} className="text-primary underline-offset-4 hover:underline">
                términos y condiciones
              </Link>{' '}
              y la{' '}
              <Link
                href={routes.privacy}
                className="text-primary underline-offset-4 hover:underline"
              >
                política de privacidad
              </Link>
            </Label>
          </div>
          <div className="flex items-start gap-2">
            <Checkbox
              id="accept-invite-marketing"
              checked={formData.acceptMarketing}
              onCheckedChange={(checked) => updateField('acceptMarketing', checked === true)}
              disabled={isLoading}
            />
            <Label htmlFor="accept-invite-marketing" className="font-serif text-sm leading-snug">
              Quiero recibir novedades y promociones por correo
            </Label>
          </div>
        </div>

        <Button type="submit" className="w-full font-sans" disabled={isLoading}>
          {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
          Crear cuenta y continuar
        </Button>
      </form>
    </div>
  )
}
