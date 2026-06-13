'use client'

import type { ReactNode } from 'react'
import { CircleDot, EyeOff, Zap } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useCustomizerStore } from '../../store/customizer.store'
import type { ButtonStyle, SleeveStyle } from '../../types/customizer.types'

function OptionCard({
  label,
  selected,
  onSelect,
  indicator,
}: {
  label: string
  selected: boolean
  onSelect: () => void
  indicator: ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={selected}
      className={cn(
        'flex flex-col items-center gap-2 rounded-xl border px-2 py-3 text-xs font-medium transition',
        selected
          ? 'border-primary bg-primary/10 text-foreground'
          : 'border-border bg-card text-muted-foreground hover:border-primary/40 hover:text-foreground',
      )}
    >
      <span
        className={cn(
          'flex h-9 w-full items-center justify-center rounded-md',
          selected ? 'text-primary' : 'text-muted-foreground',
        )}
      >
        {indicator}
      </span>
      {label}
    </button>
  )
}

function SleeveGlyph({ length }: { length: 'corta' | '3/4' | 'larga' }) {
  const width = length === 'corta' ? 'w-3' : length === '3/4' ? 'w-5' : 'w-7'
  return (
    <span className="flex items-center gap-1">
      <span className="size-4 rounded-sm bg-current/70" />
      <span className={cn('h-2.5 rounded-full bg-current/40', width)} />
    </span>
  )
}

const SLEEVES: { value: SleeveStyle; label: string }[] = [
  { value: 'corta', label: 'Corta' },
  { value: '3/4', label: '3/4' },
  { value: 'larga', label: 'Larga' },
]

const BUTTONS: { value: ButtonStyle; label: string; icon: ReactNode }[] = [
  { value: 'tradicional', label: 'Tradicional', icon: <CircleDot className="size-5" /> },
  { value: 'ocultos', label: 'Ocultos', icon: <EyeOff className="size-5" /> },
  { value: 'automaticos', label: 'Automáticos', icon: <Zap className="size-5" /> },
]

export function GarmentStyleSection() {
  const { sleeveStyle, buttonStyle, setSleeveStyle, setButtonStyle } = useCustomizerStore()

  return (
    <div className="space-y-6 p-4">
      <section className="space-y-2">
        <h3 className="text-sm font-semibold text-foreground">Manga</h3>
        <div className="grid grid-cols-3 gap-2">
          {SLEEVES.map((item) => (
            <OptionCard
              key={item.value}
              label={item.label}
              selected={sleeveStyle === item.value}
              onSelect={() => setSleeveStyle(item.value)}
              indicator={<SleeveGlyph length={item.value} />}
            />
          ))}
        </div>
      </section>

      <section className="space-y-2">
        <h3 className="text-sm font-semibold text-foreground">Botones</h3>
        <div className="grid grid-cols-3 gap-2">
          {BUTTONS.map((item) => (
            <OptionCard
              key={item.value}
              label={item.label}
              selected={buttonStyle === item.value}
              onSelect={() => setButtonStyle(item.value)}
              indicator={item.icon}
            />
          ))}
        </div>
      </section>
    </div>
  )
}
