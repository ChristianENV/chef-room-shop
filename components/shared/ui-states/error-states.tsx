'use client'
import { routes } from '@/src/config/routes'

import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { 
  AlertCircle, 
  RefreshCw, 
  WifiOff, 
  CreditCard, 
  FileQuestion, 
  Lock,
  AlertTriangle,
} from 'lucide-react'
import Link from 'next/link'

// Generic Error State
interface GenericErrorStateProps {
  title?: string
  message?: string
  retry?: () => void
  showHomeLink?: boolean
  className?: string
}

export function GenericErrorState({ 
  title = 'Algo salio mal',
  message = 'Ocurrio un error inesperado. Por favor intenta de nuevo.',
  retry,
  showHomeLink = false,
  className 
}: GenericErrorStateProps) {
  return (
    <div className={cn(
      'flex flex-col items-center justify-center py-16 text-center',
      className
    )}>
      <div className="mb-4 rounded-full bg-destructive/10 p-4">
        <AlertCircle className="h-8 w-8 text-destructive" />
      </div>
      <h3 className="font-sans text-lg font-semibold text-foreground">
        {title}
      </h3>
      <p className="mt-2 max-w-md font-serif text-muted-foreground">
        {message}
      </p>
      <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
        {retry && (
          <Button onClick={retry} variant="outline">
            <RefreshCw className="mr-2 h-4 w-4" />
            Intentar de nuevo
          </Button>
        )}
        {showHomeLink && (
          <Button asChild>
            <Link href={routes.home}>Ir al inicio</Link>
          </Button>
        )}
      </div>
    </div>
  )
}

// Network Error State
interface NetworkErrorStateProps {
  retry?: () => void
  className?: string
}

export function NetworkErrorState({ 
  retry,
  className 
}: NetworkErrorStateProps) {
  return (
    <div className={cn(
      'flex flex-col items-center justify-center py-16 text-center',
      className
    )}>
      <div className="mb-4 rounded-full bg-warning/10 p-4">
        <WifiOff className="h-8 w-8 text-warning" />
      </div>
      <h3 className="font-sans text-lg font-semibold text-foreground">
        Sin conexion
      </h3>
      <p className="mt-2 max-w-md font-serif text-muted-foreground">
        Parece que no tienes conexion a internet. Verifica tu conexion e intenta de nuevo.
      </p>
      {retry && (
        <Button onClick={retry} variant="outline" className="mt-6">
          <RefreshCw className="mr-2 h-4 w-4" />
          Reintentar
        </Button>
      )}
    </div>
  )
}

// Payment Error State
interface PaymentErrorStateProps {
  errorCode?: string
  message?: string
  retry?: () => void
  onContactSupport?: () => void
  className?: string
}

export function PaymentErrorState({ 
  errorCode,
  message = 'No pudimos procesar tu pago. Por favor verifica los datos de tu tarjeta o intenta con otro metodo de pago.',
  retry,
  onContactSupport,
  className 
}: PaymentErrorStateProps) {
  return (
    <Card className={cn('border-destructive/30 bg-card', className)}>
      <CardContent className="py-8">
        <div className="flex flex-col items-center text-center">
          <div className="mb-4 rounded-full bg-destructive/10 p-4">
            <CreditCard className="h-8 w-8 text-destructive" />
          </div>
          <h3 className="font-sans text-lg font-semibold text-foreground">
            Error en el pago
          </h3>
          <p className="mt-2 max-w-md font-serif text-muted-foreground">
            {message}
          </p>
          {errorCode && (
            <p className="mt-2 font-mono text-xs text-muted-foreground">
              Codigo: {errorCode}
            </p>
          )}
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            {retry && (
              <Button onClick={retry}>
                Intentar de nuevo
              </Button>
            )}
            {onContactSupport && (
              <Button variant="outline" onClick={onContactSupport}>
                Contactar soporte
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// Product Not Found State
interface ProductNotFoundStateProps {
  productId?: string
  className?: string
}

export function ProductNotFoundState({ 
  productId,
  className 
}: ProductNotFoundStateProps) {
  return (
    <div className={cn(
      'flex flex-col items-center justify-center py-16 text-center',
      className
    )}>
      <div className="mb-4 rounded-full bg-secondary p-4">
        <FileQuestion className="h-8 w-8 text-muted-foreground" />
      </div>
      <h3 className="font-sans text-lg font-semibold text-foreground">
        Producto no encontrado
      </h3>
      <p className="mt-2 max-w-md font-serif text-muted-foreground">
        El producto que buscas no existe o ya no esta disponible.
        {productId && (
          <span className="block mt-1 font-mono text-xs">
            ID: {productId}
          </span>
        )}
      </p>
      <Button asChild className="mt-6">
        <Link href={routes.shop}>Ver catálogo</Link>
      </Button>
    </div>
  )
}

// Unauthorized State
interface UnauthorizedStateProps {
  message?: string
  showLoginButton?: boolean
  className?: string
}

export function UnauthorizedState({ 
  message = 'No tienes permiso para acceder a esta pagina.',
  showLoginButton = true,
  className 
}: UnauthorizedStateProps) {
  return (
    <div className={cn(
      'flex flex-col items-center justify-center py-16 text-center',
      className
    )}>
      <div className="mb-4 rounded-full bg-warning/10 p-4">
        <Lock className="h-8 w-8 text-warning" />
      </div>
      <h3 className="font-sans text-lg font-semibold text-foreground">
        Acceso restringido
      </h3>
      <p className="mt-2 max-w-md font-serif text-muted-foreground">
        {message}
      </p>
      <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
        {showLoginButton && (
          <Button asChild>
            <Link href={routes.login}>Iniciar sesion</Link>
          </Button>
        )}
        <Button variant="outline" asChild>
          <Link href={routes.home}>Ir al inicio</Link>
        </Button>
      </div>
    </div>
  )
}

// Customizer Validation Error State
interface CustomizerValidationErrorStateProps {
  errors: string[]
  onDismiss?: () => void
  className?: string
}

export function CustomizerValidationErrorState({ 
  errors,
  onDismiss,
  className 
}: CustomizerValidationErrorStateProps) {
  return (
    <Alert variant="destructive" className={cn('border-destructive/30', className)}>
      <AlertTriangle className="h-4 w-4" />
      <AlertTitle className="font-sans">Error de validacion</AlertTitle>
      <AlertDescription className="font-serif">
        <ul className="mt-2 list-disc pl-4 space-y-1">
          {errors.map((error, index) => (
            <li key={index}>{error}</li>
          ))}
        </ul>
        {onDismiss && (
          <Button 
            variant="outline" 
            size="sm" 
            onClick={onDismiss}
            className="mt-3"
          >
            Entendido
          </Button>
        )}
      </AlertDescription>
    </Alert>
  )
}

// Inline Error Alert
interface InlineErrorAlertProps {
  title?: string
  message: string
  retry?: () => void
  className?: string
}

export function InlineErrorAlert({ 
  title = 'Error',
  message,
  retry,
  className 
}: InlineErrorAlertProps) {
  return (
    <Alert variant="destructive" className={cn('border-destructive/30', className)}>
      <AlertCircle className="h-4 w-4" />
      <AlertTitle className="font-sans">{title}</AlertTitle>
      <AlertDescription className="font-serif">
        {message}
        {retry && (
          <Button 
            variant="outline" 
            size="sm" 
            onClick={retry}
            className="mt-3 block"
          >
            <RefreshCw className="mr-2 h-3 w-3" />
            Reintentar
          </Button>
        )}
      </AlertDescription>
    </Alert>
  )
}
