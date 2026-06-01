'use client'

import { useState } from 'react'
import type { ReactNode } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Palette, ChevronDown, ChevronLeft, Check } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useCustomizerStore } from '../store/customizer.store'
import type { ButtonStyle, CollarStyle, Size, SleeveStyle } from '../types/customizer.types'

function ColorSwatch({
  color,
  selected,
  onClick,
}: {
  color: string
  selected: boolean
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      data-testid="customizer-color-option"
      className={cn(
        'relative size-8 rounded-full border-2',
        selected ? 'border-primary ring-2 ring-primary/30' : 'border-transparent'
      )}
      style={{ backgroundColor: color }}
    >
      {selected ? <Check className="absolute inset-0 m-auto size-4 text-white" /> : null}
    </button>
  )
}

function Section({
  title,
  children,
  defaultOpen = true,
}: {
  title: string
  children: ReactNode
  defaultOpen?: boolean
}) {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <div className="border-b border-border/30">
      <button
        type="button"
        onClick={() => setOpen((s) => !s)}
        className="flex w-full items-center justify-between px-4 py-3 text-sm font-medium"
      >
        {title}
        <ChevronDown className={cn('size-4 transition-transform', open && 'rotate-180')} />
      </button>
      <AnimatePresence>
        {open ? (
          <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }}>
            <div className="px-4 pb-4">{children}</div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  )
}

function SizeButton({ size, selected, onClick }: { size: Size; selected: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      data-testid="customizer-size-option"
      className={cn(
        'flex size-9 items-center justify-center rounded-md text-xs',
        selected ? 'bg-primary text-primary-foreground' : 'bg-secondary text-muted-foreground'
      )}
    >
      {size}
    </button>
  )
}

function OptionRow<T extends string>({
  label,
  value,
  current,
  onSelect,
}: {
  label: string
  value: T
  current: T
  onSelect: (v: T) => void
}) {
  return (
    <button
      type="button"
      onClick={() => onSelect(value)}
      className={cn(
        'rounded-md border px-2 py-1 text-xs',
        current === value ? 'border-primary bg-primary/10' : 'border-border'
      )}
    >
      {label}
    </button>
  )
}

export function LeftSidebar() {
  const [collapsed, setCollapsed] = useState(false)
  const {
    baseColor,
    detailColor,
    sleeveStyle,
    collarStyle,
    buttonStyle,
    size,
    setBaseColor,
    setDetailColor,
    setSleeveStyle,
    setCollarStyle,
    setButtonStyle,
    setSize,
    sleeveOption,
    setSleeveOption,
    product,
    customizationRuleAvailability,
  } = useCustomizerStore()

  const colorOptions =
    product?.colors.map((color) => ({ id: color.id, hex: color.hex, label: color.name })) ?? []
  const sizeOptions = product?.sizes ?? []

  const isRuleEnabled = (areaSlug: string, optionSlug: string) =>
    customizationRuleAvailability[`${areaSlug}:${optionSlug}`] ?? false

  return (
    <div className="flex h-full">
      <div className="flex w-14 flex-col items-center border-r border-border/30 bg-card/50 py-4">
        <Palette className="size-5 text-primary" />
        <button type="button" className="mt-auto" onClick={() => setCollapsed((v) => !v)}>
          <ChevronLeft className={cn('size-5 text-muted-foreground', collapsed && 'rotate-180')} />
        </button>
      </div>
      {!collapsed ? (
        <div className="w-72 overflow-y-auto border-r border-border/30 bg-card/30">
          <div className="border-b border-border/30 px-4 py-3 text-sm font-semibold">
            {product?.name ?? 'Producto'}
          </div>
          <Section title="Colores principales">
            <div className="flex flex-wrap gap-2">
              {colorOptions.map((color) => (
                <ColorSwatch
                  key={color.id}
                  color={color.hex}
                  selected={baseColor === color.hex}
                  onClick={() => setBaseColor(color.hex)}
                />
              ))}
            </div>
          </Section>
          <Section title="Colores de detalle">
            <div className="flex flex-wrap gap-2">
              {colorOptions.map((color) => (
                <ColorSwatch
                  key={`detail-${color.id}`}
                  color={color.hex}
                  selected={detailColor === color.hex}
                  onClick={() => setDetailColor(color.hex)}
                />
              ))}
            </div>
          </Section>
          <Section title="Talla">
            <div className="flex flex-wrap gap-2">
              {sizeOptions.map((item) => (
                <SizeButton
                  key={item.id}
                  size={item.name as Size}
                  selected={size === item.name}
                  onClick={() => setSize(item.name as Size)}
                />
              ))}
            </div>
          </Section>
          <Section title="Manga">
            <div className="flex flex-wrap gap-2">
              {(['corta', '3/4', 'larga'] as SleeveStyle[]).map((item) => (
                <OptionRow key={item} label={item} value={item} current={sleeveStyle} onSelect={setSleeveStyle} />
              ))}
            </div>
          </Section>
          <Section title="Cuello">
            <div className="flex flex-wrap gap-2">
              {(['mao', 'granjero', 'clasico'] as CollarStyle[]).map((item) => (
                <OptionRow key={item} label={item} value={item} current={collarStyle} onSelect={setCollarStyle} />
              ))}
            </div>
          </Section>
          <Section title="Botones">
            <div className="flex flex-wrap gap-2">
              {(['tradicional', 'ocultos', 'automaticos'] as ButtonStyle[]).map((item) => (
                <OptionRow key={item} label={item} value={item} current={buttonStyle} onSelect={setButtonStyle} />
              ))}
            </div>
          </Section>

          {product?.customizationAreas.length ? (
            <Section title="Opciones de personalizacion">
              <div className="space-y-3">
                {product.customizationAreas.map((area) => {
                  const options = product.rules.filter((rule) => rule.area.slug === area.slug)
                  return (
                    <div key={area.slug}>
                      <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        {area.name}
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {options.map((rule) => {
                          const key = `${rule.area.slug}:${rule.option.slug}`
                          const enabled = isRuleEnabled(rule.area.slug, rule.option.slug)
                          return (
                            <button
                              key={key}
                              type="button"
                              disabled={!enabled}
                              onClick={() => setSleeveOption(rule.option.slug)}
                              className={cn(
                                'rounded-md border px-2 py-1 text-xs',
                                sleeveOption === rule.option.slug &&
                                  'border-primary bg-primary/10 text-foreground',
                                !enabled && 'cursor-not-allowed opacity-40',
                              )}
                            >
                              {rule.option.name}
                            </button>
                          )
                        })}
                      </div>
                    </div>
                  )
                })}
              </div>
            </Section>
          ) : null}
        </div>
      ) : null}
    </div>
  )
}
