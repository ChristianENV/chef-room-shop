'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Loader2, Mail, AlertCircle } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { cn } from '@/lib/utils'
import { login, routes } from '@/src/config/routes'
import { requestPasswordReset } from '@/src/lib/auth/auth-client'
import {
  FORGOT_PASSWORD_GENERIC_ERROR,
  FORGOT_PASSWORD_SUCCESS_MESSAGE,
  forgotPasswordSchema,
  getPasswordResetRedirectTo,
} from '@/src/lib/auth/password-reset'

type ForgotPasswordFormProps = {
  className?: string
}

export function ForgotPasswordForm({ className }: ForgotPasswordFormProps) {
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    const parsed = forgotPasswordSchema.safeParse({ email })
    if (!parsed.success) {
      setError(parsed.error.errors[0]?.message ?? 'Datos inválidos')
      return
    }

    setIsLoading(true)

    try {
      await requestPasswordReset({
        email: parsed.data.email.trim().toLowerCase(),
        redirectTo: getPasswordResetRedirectTo(),
      })
      setSuccess(true)
    } catch {
      setError(FORGOT_PASSWORD_GENERIC_ERROR)
    } finally {
      setIsLoading(false)
    }
  }

  if (success) {
    return (
      <div className={cn('space-y-6', className)}>
        <div className="space-y-2 text-center">
          <h1 className="font-sans text-2xl font-bold text-foreground">Revisa tu correo</h1>
          <p className="font-serif text-muted-foreground">{FORGOT_PASSWORD_SUCCESS_MESSAGE}</p>
        </div>
        <Button asChild className="w-full font-sans">
          <Link href={routes.login}>Volver a iniciar sesión</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className={cn('space-y-6', className)}>
      <div className="space-y-2 text-center">
        <h1 className="font-sans text-2xl font-bold text-foreground">Recuperar contraseña</h1>
        <p className="font-serif text-muted-foreground">
          Ingresa tu correo y te enviaremos un enlace para restablecer tu contraseña.
        </p>
      </div>

      {error && (
        <Alert variant="destructive" className="border-destructive/50 bg-destructive/10">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="font-serif">{error}</AlertDescription>
        </Alert>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email" className="font-sans text-sm font-medium">
            Correo electrónico
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
              disabled={isLoading}
              autoComplete="email"
            />
          </div>
        </div>

        <Button type="submit" className="w-full font-sans" disabled={isLoading}>
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Enviando…
            </>
          ) : (
            'Enviar enlace'
          )}
        </Button>
      </form>

      <p className="text-center font-serif text-sm text-muted-foreground">
        <Link href={login()} className="font-sans font-medium text-primary hover:underline">
          Volver a iniciar sesión
        </Link>
      </p>
    </div>
  )
}
