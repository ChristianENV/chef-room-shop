import { Prisma } from '@prisma/client'
import { GraphQLError } from 'graphql'

import type { GraphQLContext } from '../../context'

import { requireAdminGraphQL } from '../admin-products/admin-products.auth'
import { assertCanArchiveColor } from './admin-colors.guards'
import { mapAdminColorToGql } from './admin-colors.mappers'
import type {
  AdminColorGql,
  AdminColorsListInputGql,
  CreateAdminColorInputGql,
  UpdateAdminColorInputGql,
} from './admin-colors.types'
import {
  colorIdSchema,
  createAdminColorInputSchema,
  parseAdminColorsListInput,
  updateAdminColorInputSchema,
} from './admin-colors.validation'

function notFoundError(): GraphQLError {
  return new GraphQLError('Color no encontrado.', {
    extensions: { code: 'NOT_FOUND' },
  })
}

function conflictError(message: string): GraphQLError {
  return new GraphQLError(message, {
    extensions: { code: 'CONFLICT' },
  })
}

function isUniqueConstraintError(error: unknown): boolean {
  return error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002'
}

async function assertUniqueColorSlug(
  context: GraphQLContext,
  slug: string,
  excludeId?: string,
): Promise<void> {
  const existing = await context.prisma.color.findFirst({
    where: {
      slug,
      ...(excludeId ? { id: { not: excludeId } } : {}),
    },
    select: { id: true },
  })

  if (existing) {
    throw conflictError('Ya existe un color con ese slug.')
  }
}

export async function getAdminColors(
  context: GraphQLContext,
  args: AdminColorsListInputGql,
): Promise<AdminColorGql[]> {
  requireAdminGraphQL(context)
  const { includeInactive } = parseAdminColorsListInput(args)

  const rows = await context.prisma.color.findMany({
    where: includeInactive ? undefined : { isActive: true },
    orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
  })

  return rows.map(mapAdminColorToGql)
}

export async function getAdminColorById(
  context: GraphQLContext,
  id: string,
): Promise<AdminColorGql | null> {
  requireAdminGraphQL(context)
  const parsedId = colorIdSchema.parse(id)

  const row = await context.prisma.color.findUnique({ where: { id: parsedId } })
  return row ? mapAdminColorToGql(row) : null
}

export async function createAdminColor(
  context: GraphQLContext,
  input: CreateAdminColorInputGql,
): Promise<AdminColorGql> {
  requireAdminGraphQL(context)
  const parsed = createAdminColorInputSchema.parse(input)

  await assertUniqueColorSlug(context, parsed.slug)

  try {
    const created = await context.prisma.color.create({
      data: parsed,
    })
    return mapAdminColorToGql(created)
  } catch (error) {
    if (isUniqueConstraintError(error)) {
      throw conflictError('Ya existe un color con ese slug.')
    }
    throw error
  }
}

export async function updateAdminColor(
  context: GraphQLContext,
  id: string,
  input: UpdateAdminColorInputGql,
): Promise<AdminColorGql> {
  requireAdminGraphQL(context)
  const parsedId = colorIdSchema.parse(id)
  const parsed = updateAdminColorInputSchema.parse(input)

  const existing = await context.prisma.color.findUnique({ where: { id: parsedId } })
  if (!existing) throw notFoundError()

  if (parsed.slug) {
    await assertUniqueColorSlug(context, parsed.slug, parsedId)
  }

  const nextScopes = {
    isFabricColor: parsed.isFabricColor ?? existing.isFabricColor,
    isProductColor: parsed.isProductColor ?? existing.isProductColor,
    isGeneralColor: parsed.isGeneralColor ?? existing.isGeneralColor,
  }

  if (!nextScopes.isFabricColor && !nextScopes.isProductColor && !nextScopes.isGeneralColor) {
    throw new GraphQLError('Selecciona al menos un alcance: tela, variante o general.', {
      extensions: { code: 'BAD_USER_INPUT' },
    })
  }

  try {
    const updated = await context.prisma.color.update({
      where: { id: parsedId },
      data: {
        slug: parsed.slug,
        name: parsed.name,
        hex: parsed.hex?.toUpperCase(),
        isFabricColor: parsed.isFabricColor ?? undefined,
        isProductColor: parsed.isProductColor ?? undefined,
        isGeneralColor: parsed.isGeneralColor ?? undefined,
        isActive: parsed.isActive ?? undefined,
        sortOrder: parsed.sortOrder ?? undefined,
      },
    })
    return mapAdminColorToGql(updated)
  } catch (error) {
    if (isUniqueConstraintError(error)) {
      throw conflictError('Ya existe un color con ese slug.')
    }
    throw error
  }
}

export async function archiveAdminColor(
  context: GraphQLContext,
  id: string,
): Promise<AdminColorGql> {
  requireAdminGraphQL(context)
  const parsedId = colorIdSchema.parse(id)

  const existing = await context.prisma.color.findUnique({ where: { id: parsedId } })
  if (!existing) throw notFoundError()

  await assertCanArchiveColor(context, parsedId)

  const updated = await context.prisma.color.update({
    where: { id: parsedId },
    data: { isActive: false },
  })

  return mapAdminColorToGql(updated)
}
