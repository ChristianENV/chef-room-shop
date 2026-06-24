'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { Eye, EyeOff, Lock, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { cn } from '@/lib/utils'
import { login, routes } from '@/src/config/routes'
import { resetPassword } from '@/src/lib/auth/auth-client'
import { getAuthErrorMessage } from '@/src/lib/auth/auth-errors'
import {
  RESET_PASSWORD_GENERIC_ERROR,
  RESET_PASSWORD_MISSING_TOKEN_MESSAGE,
  parseResetPasswordToken,
  resetPasswordSchema,
} from '@/src/lib/auth/password-reset'
import { PasswordStrength } from './password-strength'

type ResetPasswordFormProps = {
  className?: string
}

export function ResetPasswordForm({ className }: ResetPasswordFormProps) {
  const searchParams = useSearchParams()
  const token = useMemo(() => parseResetPasswordToken(searchParams.get('token')), [searchParams])

  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  if (!token) {
    return (
      <div className={cn('space-y-6', className)}>
        <div className="space-y-2 text-center">
          <h1 className="font-sans text-2xl font-bold text-foreground">Enlace no válido</h1>
          <p className="font-serif text-muted-foreground">{RESET_PASSWORD_MISSING_TOKEN_MESSAGE}</p>
        </div>
        <Button asChild className="w-full font-sans">
          <Link href={routes.forgotPassword}>Solicitar nuevo enlace</Link>
        </Button>
        <p className="text-center font-serif text-sm text-muted-foreground">
          <Link href={login()} className="font-sans font-medium text-primary hover:underline">
            Volver a iniciar sesión
          </Link>
        </p>
      </div>
    )
  }

  if (success) {
    return (
      <div className={cn('space-y-6', className)}>
        <div className="flex justify-center">
          <CheckCircle2 className="h-12 w-12 text-primary" aria-hidden />
        </div>
        <div className="space-y-2 text-center">
          <h1 className="font-sans text-2xl font-bold text-foreground">Contraseña actualizada</h1>
          <p className="font-serif text-muted-foreground">
            Tu contraseña se guardó correctamente. Ya puedes iniciar sesión con tu nueva contraseña.
          </p>
        </div>
        <Button asChild className="w-full font-sans">
          <Link href={routes.login}>Iniciar sesión</Link>
        </Button>
      </div>
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    const parsed = resetPasswordSchema.safeParse({ password, confirmPassword })
    if (!parsed.success) {
      setError(parsed.error.errors[0]?.message ?? 'Datos inválidos')
      return
    }

    setIsLoading(true)

    try {
      const result = await resetPassword({
        newPassword: parsed.data.password,
        token,
      })

      if (result.error) {
        setError(getAuthErrorMessage(result.error, RESET_PASSWORD_GENERIC_ERROR))
        setIsLoading(false)
        return
      }

      setSuccess(true)
    } catch (err) {
      setError(getAuthErrorMessage(err, RESET_PASSWORD_GENERIC_ERROR))
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className={cn('space-y-6', className)}>
      <div className="space-y-2 text-center">
        <h1 className="font-sans text-2xl font-bold text-foreground">Nueva contraseña</h1>
        <p className="font-serif text-muted-foreground">
          Elige una contraseña segura para tu cuenta.
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
          <Label htmlFor="password" className="font-sans text-sm font-medium">
            Nueva contraseña
          </Label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="password"
              type={showPassword ? 'text' : 'password'}
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="pl-10 pr-10 font-serif"
              disabled={isLoading}
              autoComplete="new-password"
            />
            <button
              type="button"
              onClick={() => setShowPassword((value) => !value)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          <PasswordStrength password={password} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="confirmPassword" className="font-sans text-sm font-medium">
            Confirmar contraseña
          </Label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="confirmPassword"
              type={showConfirmPassword ? 'text' : 'password'}
              placeholder="••••••••"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="pl-10 pr-10 font-serif"
              disabled={isLoading}
              autoComplete="new-password"
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword((value) => !value)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              aria-label={showConfirmPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
            >
              {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </div>

        <Button type="submit" className="w-full font-sans" disabled={isLoading}>
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Guardando…
            </>
          ) : (
            'Guardar nueva contraseña'
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
