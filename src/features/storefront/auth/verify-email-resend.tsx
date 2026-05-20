'use client'

import { useState } from 'react'
import { Loader2, Mail } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { resendVerificationEmailAction } from '@/src/server/auth/actions'

type VerifyEmailResendProps = {
  callbackURL?: string
  email?: string
  className?: string
}

/**
 * Triggers Better Auth verification resend with a generic success message.
 */
export function VerifyEmailResend({ callbackURL, email, className }: VerifyEmailResendProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [feedback, setFeedback] = useState<string | null>(null)

  const handleResend = async () => {
    setIsLoading(true)
    setFeedback(null)

    try {
      const result = await resendVerificationEmailAction({
        email: email ?? null,
        callbackURL: callbackURL ?? null,
      })
      setFeedback(result.message)
    } catch {
      setFeedback('Si el correo existe, enviaremos un enlace de verificación.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className={className}>
      <Button
        type="button"
        className="font-sans"
        disabled={isLoading}
        onClick={() => void handleResend()}
      >
        {isLoading ? (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        ) : (
          <Mail className="mr-2 h-4 w-4" />
        )}
        Reenviar correo de verificación
      </Button>
      {feedback && (
        <Alert className="mt-4">
          <AlertDescription className="font-serif text-sm">{feedback}</AlertDescription>
        </Alert>
      )}
    </div>
  )
}
