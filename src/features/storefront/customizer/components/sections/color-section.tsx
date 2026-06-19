'use client'

import { useCustomizerStore } from '../../store/customizer.store'
import { FabricColorsSection } from '../fabric-colors-section'
import { DETAIL_FABRIC_COLORS } from '../../constants/fabric-colors'

export function ColorSection({ embedded = false }: { embedded?: boolean }) {
  const { product, baseColor, detailColor, setBaseColor, setDetailColor } = useCustomizerStore()

  if (!product) {
    return (
      <div className="p-4 text-xs text-muted-foreground" data-testid="customizer-base-colors">
        Cargando colores del producto…
      </div>
    )
  }

  const requiresVariant = product.variants.length > 0
  const fromBff = product.colors.map((color) => ({
    id: color.id,
    name: color.name,
    hex: color.hex,
  }))
  const usingFallback = fromBff.length === 0 && !requiresVariant

  return (
    <div className={embedded ? 'space-y-4 px-1 pb-2' : 'space-y-4 p-4'}>
      <section data-testid="customizer-base-colors">
        <FabricColorsSection
          catalogColors={fromBff.length > 0 ? fromBff : undefined}
          detailColors={DETAIL_FABRIC_COLORS}
          baseColor={baseColor}
          detailColor={detailColor}
          onSelectBase={setBaseColor}
          onSelectDetail={setDetailColor}
          showDetail
        />
      </section>

      {usingFallback ? (
        <p className="text-[11px] text-muted-foreground/70">
          Paleta Chef Room sugerida. Esta prenda no requiere variante de color en catálogo.
        </p>
      ) : null}
      {requiresVariant && fromBff.length === 0 ? (
        <p className="text-[11px] text-destructive/80">
          Este producto no tiene colores configurados en catálogo. Contacta a ventas para completar
          el catálogo.
        </p>
      ) : null}
    </div>
  )
}
