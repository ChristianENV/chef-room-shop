'use client'

import { Plus, Tag, Type as TypeIcon, Sticker, Sparkles } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { useCustomizerStore } from '../../store/customizer.store'
import type { Layer } from '../../types/customizer.types'
import {
  FALLBACK_PERSONALIZATION_ZONES,
  type PersonalizationOptionKind,
} from '../../lib/customizer-defaults'
import { zoneFromAreaSlug } from '../../lib/customizer-utils'
import { getEstimatedElementPrice } from '../../pricing/get-estimated-element-price'

type ZoneOption = {
  key: string
  name: string
  kind: PersonalizationOptionKind
  description: string
  priceLabel: string
  available: boolean
}

type Zone = {
  slug: string
  name: string
  options: ZoneOption[]
}

const KIND_META: Record<
  PersonalizationOptionKind,
  { icon: LucideIcon; cta: string; element: 'logo' | 'text' | 'patch'; elementName: string }
> = {
  logo: { icon: Sticker, cta: 'Agregar logo', element: 'logo', elementName: 'Logo' },
  texto: { icon: TypeIcon, cta: 'Agregar texto', element: 'text', elementName: 'Texto' },
  nombre: { icon: Tag, cta: 'Agregar nombre', element: 'text', elementName: 'Nombre' },
  bordado: { icon: Sparkles, cta: 'Agregar bordado', element: 'patch', elementName: 'Bordado' },
}

function inferKind(text: string): PersonalizationOptionKind {
  const value = text.toLowerCase()
  if (value.includes('bordado')) return 'bordado'
  if (value.includes('nombre')) return 'nombre'
  if (value.includes('texto') || value.includes('frase')) return 'texto'
  return 'logo'
}

function resolveOptionPriceLabel(
  kind: PersonalizationOptionKind,
  zoneSlug: string,
  layers: Layer[],
  fallback: string,
): string {
  if (kind === 'logo' || kind === 'texto' || kind === 'nombre' || kind === 'bordado') {
    const zone = zoneFromAreaSlug(zoneSlug)
    const type = kind === 'logo' ? 'logo' : 'text'
    return getEstimatedElementPrice({ type, zone, layers }).formatted
  }
  return fallback
}

export function PersonalizationSection({ embedded = false }: { embedded?: boolean }) {
  const { product, layers, customizationRuleAvailability, addElement, addTextElement, addNameElement } =
    useCustomizerStore()

  const bffZones: Zone[] = (product?.customizationAreas ?? []).map((area) => {
    const options = (product?.rules ?? [])
      .filter((rule) => rule.area.slug === area.slug)
      .map<ZoneOption>((rule) => {
        const enabled =
          customizationRuleAvailability[`${rule.area.slug}:${rule.option.slug}`] ?? rule.enabled
        return {
          key: `${rule.area.slug}:${rule.option.slug}`,
          name: rule.option.name,
          kind: inferKind(`${rule.option.slug} ${rule.option.name}`),
          description: rule.validationMessage ?? area.name,
          priceLabel: resolveOptionPriceLabel(
            inferKind(`${rule.option.slug} ${rule.option.name}`),
            rule.area.slug,
            layers,
            rule.basePriceCents > 0 ? `+${rule.basePriceCents / 100}` : 'Incluido',
          ),
          available: enabled,
        }
      })
    return { slug: area.slug, name: area.name, options }
  })

  const usingFallback = bffZones.length === 0 || bffZones.every((zone) => zone.options.length === 0)

  const zones: Zone[] = usingFallback
    ? FALLBACK_PERSONALIZATION_ZONES.map((zone) => ({
        slug: zone.slug,
        name: zone.name,
        options: zone.options.map((option) => ({
          key: `${zone.slug}:${option.slug}`,
          name: option.name,
          kind: option.kind,
          description: option.description,
          priceLabel: resolveOptionPriceLabel(option.kind, zone.slug, layers, 'Cotizar'),
          available: true,
        })),
      }))
    : bffZones

  const handleAdd = (zoneSlug: string, option: ZoneOption) => {
    const zone = zoneFromAreaSlug(zoneSlug)
    const meta = KIND_META[option.kind]
    if (option.kind === 'nombre') {
      addNameElement({ zone })
      return
    }
    if (option.kind === 'texto') {
      addTextElement({ name: meta.elementName, zone })
      return
    }
    addElement(meta.element, meta.elementName)
  }

  return (
    <div
      className={embedded ? 'space-y-5 px-1 pb-2' : 'space-y-5 p-4'}
      data-testid="customizer-personalization-options"
    >
      {!embedded ? (
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="flex size-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Sparkles className="size-4" />
            </span>
            <h3 className="text-sm font-semibold text-foreground">Bordados por zona</h3>
          </div>
          <p className="text-xs text-muted-foreground">
            Toda la personalización es bordada. Elige una zona y agrega logo, texto o nombre. Si
            repites el mismo logo del pecho en la espalda, obtienes precio especial.
          </p>
        </div>
      ) : (
        <p className="text-xs text-muted-foreground">
          Toda la personalización es bordada. Elige una zona y agrega logo, texto o nombre.
        </p>
      )}

      {zones.map((zone) => (
        <section key={zone.slug} className="space-y-2">
          <div className="flex items-center gap-2">
            <p className="text-xs font-semibold uppercase tracking-wider text-foreground">
              {zone.name}
            </p>
            <span className="h-px flex-1 bg-border/50" />
          </div>
          <div className="space-y-2">
            {zone.options.map((option) => {
              const meta = KIND_META[option.kind]
              const Icon = meta.icon
              const addTestId =
                option.kind === 'nombre'
                  ? 'customizer-add-name-button'
                  : option.kind === 'texto'
                  ? 'customizer-add-text-button'
                  : undefined
              const canAddFromZone = option.available && option.kind !== 'logo'
              const disabledReason =
                option.kind === 'logo'
                  ? 'Sube tu logotipo desde la sección Logotipos.'
                  : 'No disponible para esta prenda'
              return (
                <div
                  key={option.key}
                  className="flex items-center gap-3 rounded-lg border border-border/60 bg-card p-3"
                >
                  <span className="flex size-9 shrink-0 items-center justify-center rounded-md bg-secondary text-primary">
                    <Icon className="size-4" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <span className="truncate text-sm font-medium text-foreground">
                        {option.name}
                      </span>
                      <span className="shrink-0 text-[11px] font-medium text-primary">
                        {option.priceLabel}
                      </span>
                    </div>
                    <p className="truncate text-xs text-muted-foreground">{option.description}</p>
                  </div>
                  <button
                    type="button"
                    disabled={!canAddFromZone}
                    onClick={() => handleAdd(zone.slug, option)}
                    data-testid={addTestId}
                    title={canAddFromZone ? meta.cta : disabledReason}
                    aria-label={meta.cta}
                    className="inline-flex shrink-0 items-center gap-1 rounded-md border border-primary/40 px-2 py-1 text-xs font-medium text-primary transition hover:bg-primary/10 disabled:cursor-not-allowed disabled:border-border/40 disabled:text-muted-foreground/50 disabled:hover:bg-transparent"
                  >
                    <Plus className="size-3.5" />
                    Agregar
                  </button>
                </div>
              )
            })}
          </div>
        </section>
      ))}

      {usingFallback ? (
        <p className="text-[11px] text-muted-foreground/70">
          Mostrando zonas sugeridas para esta prenda.
        </p>
      ) : null}
    </div>
  )
}
