'use client'

import { cn } from '@/lib/utils'
import { formatCurrencyMXN, centsToPesos } from '@/src/lib/formatters'

import type {
  CommercialOptionSelections,
  ProductOptionGroup,
} from '../lib/product-commercial-options'

type ProductOptionSelectorsProps = {
  optionGroups: ProductOptionGroup[]
  selections: CommercialOptionSelections
  onChange: (groupId: string, valueId: string) => void
  className?: string
}

function formatOptionPriceDelta(priceDeltaCents: number): string {
  if (priceDeltaCents <= 0) return 'Incluido'
  return `+ ${formatCurrencyMXN(centsToPesos(priceDeltaCents))}`
}

export function ProductOptionSelectors({
  optionGroups,
  selections,
  onChange,
  className,
}: ProductOptionSelectorsProps) {
  if (optionGroups.length === 0) return null

  const sortedGroups = [...optionGroups].sort((a, b) => a.sortOrder - b.sortOrder)

  return (
    <div className={cn('space-y-6', className)}>
      {sortedGroups.map((group) => {
        const sortedValues = [...group.values].sort((a, b) => a.sortOrder - b.sortOrder)
        const selectedValueId = selections[group.id]
        const groupNameId = `commercial-option-group-${group.id}`

        return (
          <section key={group.id} aria-labelledby={groupNameId} className="space-y-3">
            <div className="space-y-1">
              <h3 id={groupNameId} className="font-sans text-sm font-medium text-foreground">
                {group.name}
                {group.isRequired ? <span className="text-destructive"> *</span> : null}
              </h3>
              {group.description ? (
                <p className="font-serif text-sm text-muted-foreground">{group.description}</p>
              ) : null}
            </div>

            <div
              className="grid gap-2 sm:grid-cols-2"
              role={group.inputType === 'BOOLEAN' ? 'radiogroup' : 'radiogroup'}
              aria-label={group.name}
            >
              {sortedValues.map((value) => {
                const isSelected = selectedValueId === value.id
                const inputId = `commercial-option-${group.id}-${value.id}`

                return (
                  <label
                    key={value.id}
                    htmlFor={inputId}
                    className={cn(
                      'flex cursor-pointer items-start gap-3 rounded-lg border p-3 transition-colors',
                      isSelected
                        ? 'border-primary bg-primary/5 ring-1 ring-primary/30'
                        : 'border-border bg-card hover:border-muted-foreground/50',
                    )}
                  >
                    <input
                      id={inputId}
                      type="radio"
                      name={`commercial-option-${group.id}`}
                      value={value.id}
                      checked={isSelected}
                      onChange={() => onChange(group.id, value.id)}
                      className="mt-1 h-4 w-4 shrink-0 accent-primary"
                    />
                    <span className="min-w-0 flex-1">
                      <span className="block font-sans text-sm font-medium text-foreground">
                        {value.label}
                      </span>
                      {value.description ? (
                        <span className="mt-0.5 block font-serif text-xs text-muted-foreground">
                          {value.description}
                        </span>
                      ) : null}
                      <span
                        className={cn(
                          'mt-1 block font-sans text-xs',
                          value.priceDeltaCents > 0 ? 'text-primary' : 'text-muted-foreground',
                        )}
                      >
                        {formatOptionPriceDelta(value.priceDeltaCents)}
                      </span>
                    </span>
                  </label>
                )
              })}
            </div>
          </section>
        )
      })}
    </div>
  )
}
