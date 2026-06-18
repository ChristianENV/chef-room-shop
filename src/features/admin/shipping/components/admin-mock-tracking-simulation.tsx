'use client'

import { useState } from 'react'
import { FlaskConical } from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

import type { MockTrackingStatus } from '../types'
import { useAdminSimulateMockShipmentTrackingMutation } from '../api/use-admin-simulate-mock-tracking-mutation'
import { mapShippingMutationError } from '../lib/shipping-mutation-errors'

const MOCK_TRACKING_OPTIONS: Array<{ value: MockTrackingStatus; label: string }> = [
  { value: 'created', label: 'Creado' },
  { value: 'label_generated', label: 'Etiqueta generada' },
  { value: 'in_transit', label: 'En tránsito' },
  { value: 'delivered', label: 'Entregado' },
  { value: 'exception', label: 'Incidencia' },
]

type AdminMockTrackingSimulationProps = {
  orderNumber: string
  onSuccessMessage?: (message: string) => void
  onErrorMessage?: (message: string) => void
}

/**
 * Dev-only mock tracking controls for CRMOCK-* shipments.
 */
export function AdminMockTrackingSimulation({
  orderNumber,
  onSuccessMessage,
  onErrorMessage,
}: AdminMockTrackingSimulationProps) {
  const [status, setStatus] = useState<MockTrackingStatus>('in_transit')
  const simulate = useAdminSimulateMockShipmentTrackingMutation()

  const handleSimulate = async () => {
    try {
      await simulate.mutateAsync({ orderNumber, trackingStatus: status })
      onSuccessMessage?.(`Tracking mock: ${status}.`)
    } catch (error) {
      onErrorMessage?.(mapShippingMutationError(error))
    }
  }

  return (
    <div
      className="rounded-md border border-dashed border-amber-500/40 bg-amber-500/5 p-3"
      data-testid="admin-mock-tracking-simulation"
    >
      <p className="mb-2 flex items-center gap-2 font-sans text-xs font-semibold uppercase tracking-wide text-amber-700 dark:text-amber-400">
        <FlaskConical className="h-3.5 w-3.5" aria-hidden />
        Simulación mock
      </p>
      <p className="mb-3 font-serif text-xs text-muted-foreground">
        Solo para guías mock (CRMOCK-*). Requiere SKYDROPX_MODE=mock.
      </p>
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
        <Select value={status} onValueChange={(value) => setStatus(value as MockTrackingStatus)}>
          <SelectTrigger className="w-full sm:w-[220px]" aria-label="Estado mock">
            <SelectValue placeholder="Estado mock" />
          </SelectTrigger>
          <SelectContent>
            {MOCK_TRACKING_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button
          type="button"
          size="sm"
          variant="outline"
          disabled={simulate.isPending}
          data-testid="admin-mock-tracking-simulate-button"
          onClick={() => void handleSimulate()}
        >
          {simulate.isPending ? 'Simulando…' : 'Simular tracking'}
        </Button>
      </div>
    </div>
  )
}
