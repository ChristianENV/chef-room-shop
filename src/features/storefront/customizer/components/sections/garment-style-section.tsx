'use client'

import type { ReactNode } from 'react'
import { CircleDot, EyeOff, Zap } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useCustomizerStore } from '../../store/customizer.store'
import type { ButtonStyle, CollarStyle, SleeveStyle } from '../../types/customizer.types'

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

function CollarGlyph({ style }: { style: CollarStyle }) {
  if (style === 'mao') {
    return <span className="h-4 w-7 rounded-t-md border-2 border-current/60" />
  }
  if (style === 'granjero') {
    return <span className="h-4 w-7 rotate-45 rounded-sm border-2 border-current/60" />
  }
  return (
    <span className="relative h-4 w-7">
      <span className="absolute left-0 top-0 h-4 w-3 -skew-x-12 border-l-2 border-t-2 border-current/60" />
      <span className="absolute right-0 top-0 h-4 w-3 skew-x-12 border-r-2 border-t-2 border-current/60" />
    </span>
  )
}

const SLEEVES: { value: SleeveStyle; label: string }[] = [
  { value: 'corta', label: 'Corta' },
  { value: '3/4', label: '3/4' },
  { value: 'larga', label: 'Larga' },
]

const COLLARS: { value: CollarStyle; label: string }[] = [
  { value: 'mao', label: 'Mao' },
  { value: 'granjero', label: 'Granjero' },
  { value: 'clasico', label: 'Clásico' },
]

const BUTTONS: { value: ButtonStyle; label: string; icon: ReactNode }[] = [
  { value: 'tradicional', label: 'Tradicional', icon: <CircleDot className="size-5" /> },
  { value: 'ocultos', label: 'Ocultos', icon: <EyeOff className="size-5" /> },
  { value: 'automaticos', label: 'Automáticos', icon: <Zap className="size-5" /> },
]

export function GarmentStyleSection() {
  const {
    sleeveStyle,
    collarStyle,
    buttonStyle,
    setSleeveStyle,
    setCollarStyle,
    setButtonStyle,
  } = useCustomizerStore()

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
        <h3 className="text-sm font-semibold text-foreground">Cuello</h3>
        <div className="grid grid-cols-3 gap-2">
          {COLLARS.map((item) => (
            <OptionCard
              key={item.value}
              label={item.label}
              selected={collarStyle === item.value}
              onSelect={() => setCollarStyle(item.value)}
              indicator={<CollarGlyph style={item.value} />}
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
