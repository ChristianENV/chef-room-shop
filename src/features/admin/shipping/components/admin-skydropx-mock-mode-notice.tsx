'use client'

import { Info } from 'lucide-react'

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'

type AdminSkydropxMockModeNoticeProps = {
  visible: boolean
}

/**
 * Small admin-only notice when Skydropx runs in mock mode (local/np).
 */
export function AdminSkydropxMockModeNotice({ visible }: AdminSkydropxMockModeNoticeProps) {
  if (!visible) return null

  return (
    <Alert
      className="border-amber-500/40 bg-amber-500/5 text-foreground"
      data-testid="admin-skydropx-mock-mode-notice"
    >
      <Info className="text-amber-700 dark:text-amber-400" aria-hidden />
      <AlertTitle className="font-sans text-xs font-semibold uppercase tracking-wide text-amber-800 dark:text-amber-300">
        Modo simulación Skydropx
      </AlertTitle>
      <AlertDescription className="font-serif text-xs text-muted-foreground">
        Las guías y eventos de tracking son datos mock para pruebas. No se consume saldo real.
      </AlertDescription>
    </Alert>
  )
}
