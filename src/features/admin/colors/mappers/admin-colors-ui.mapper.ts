import type { AdminColorTableRow, ColorFormValues } from '../types/admin-colors-ui.types'
import type { AdminColor, CreateAdminColorInput, UpdateAdminColorInput } from '../types'

export function mapAdminColorToTableRow(color: AdminColor): AdminColorTableRow {
  const scopes: string[] = []
  if (color.isFabricColor) scopes.push('Tela')
  if (color.isProductColor) scopes.push('Variante')
  if (color.isGeneralColor) scopes.push('General')

  return {
    id: color.id,
    slug: color.slug,
    name: color.name,
    hexCode: color.hexCode,
    scopes,
    isActive: color.isActive,
    sortOrder: color.sortOrder,
    statusLabel: color.isActive ? 'Activo' : 'Inactivo',
  }
}

export function mapAdminColorToFormValues(color: AdminColor | null): ColorFormValues {
  if (!color) {
    return {
      slug: '',
      name: '',
      hex: '#000000',
      isFabricColor: false,
      isProductColor: true,
      isGeneralColor: false,
      isActive: true,
      sortOrder: 0,
    }
  }

  return {
    slug: color.slug,
    name: color.name,
    hex: color.hexCode,
    isFabricColor: color.isFabricColor,
    isProductColor: color.isProductColor,
    isGeneralColor: color.isGeneralColor,
    isActive: color.isActive,
    sortOrder: color.sortOrder,
  }
}

export function mapColorFormValuesToCreateInput(values: ColorFormValues): CreateAdminColorInput {
  return {
    slug: values.slug.trim(),
    name: values.name.trim(),
    hex: values.hex.trim(),
    isFabricColor: values.isFabricColor,
    isProductColor: values.isProductColor,
    isGeneralColor: values.isGeneralColor,
    isActive: values.isActive,
    sortOrder: values.sortOrder,
  }
}

export function mapColorFormValuesToUpdateInput(values: ColorFormValues): UpdateAdminColorInput {
  return mapColorFormValuesToCreateInput(values)
}

export function validateColorFormValues(values: ColorFormValues): string | null {
  if (!values.name.trim()) return 'El nombre es obligatorio.'
  if (!values.slug.trim()) return 'El slug es obligatorio.'
  if (!/^#[0-9A-Fa-f]{6}$/.test(values.hex.trim())) {
    return 'El hex debe ser un color válido (#RRGGBB).'
  }
  if (!values.isFabricColor && !values.isProductColor && !values.isGeneralColor) {
    return 'Selecciona al menos un alcance: tela, variante o general.'
  }
  return null
}

export function mapAdminColorMutationError(error: unknown): string {
  if (error instanceof Error) {
    if (error.message.includes('slug')) return 'Ya existe un color con ese slug.'
    if (error.message.includes('hex')) return 'El hex debe ser un color válido (#RRGGBB).'
    if (error.message.includes('alcance')) return error.message
    if (error.message.includes('variantes activas')) return error.message
    return error.message
  }
  return 'No pudimos guardar el color. Intenta de nuevo.'
}
