export type ColorScopeFields = {
  isFabricColor: boolean
  isProductColor: boolean
  isGeneralColor: boolean
  isActive?: boolean
}

export function isFabricColor(color: Pick<ColorScopeFields, 'isFabricColor'>): boolean {
  return color.isFabricColor
}

export function isProductColor(color: Pick<ColorScopeFields, 'isProductColor'>): boolean {
  return color.isProductColor
}

export function isGeneralColor(color: Pick<ColorScopeFields, 'isGeneralColor'>): boolean {
  return color.isGeneralColor
}

export function isActiveColor(color: Pick<ColorScopeFields, 'isActive'>): boolean {
  return color.isActive !== false
}

export function filterActiveFabricColors<T extends ColorScopeFields>(colors: readonly T[]): T[] {
  return colors.filter((color) => isActiveColor(color) && isFabricColor(color))
}

export function filterActiveProductColors<T extends ColorScopeFields>(colors: readonly T[]): T[] {
  return colors.filter((color) => isActiveColor(color) && isProductColor(color))
}

export function filterActiveGeneralColors<T extends ColorScopeFields>(colors: readonly T[]): T[] {
  return colors.filter((color) => isActiveColor(color) && isGeneralColor(color))
}

export function hasAtLeastOneColorScope(
  input: Pick<ColorScopeFields, 'isFabricColor' | 'isProductColor' | 'isGeneralColor'>,
): boolean {
  return input.isFabricColor || input.isProductColor || input.isGeneralColor
}
