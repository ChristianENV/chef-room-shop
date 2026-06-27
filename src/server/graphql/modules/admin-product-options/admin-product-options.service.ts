import { GraphQLError } from 'graphql'
import type { PrismaClient } from '@prisma/client'

import type {
  AdminProductOptionGroupGql,
  AdminProductOptionGroupPayloadGql,
  AdminProductOptionGroupsPayloadGql,
  AdminProductOptionValueGql,
  AdminProductOptionValuePayloadGql,
  ArchiveAdminProductOptionGroupInput,
  ArchiveAdminProductOptionGroupPayloadGql,
  ArchiveAdminProductOptionValueInput,
  ArchiveAdminProductOptionValuePayloadGql,
  CreateAdminProductOptionGroupInput,
  CreateAdminProductOptionValueInput,
  GetAdminProductOptionGroupInput,
  GetAdminProductOptionGroupsInput,
  UpdateAdminProductOptionGroupInput,
  UpdateAdminProductOptionValueInput,
} from './admin-product-options.types'

// ────────────────────────────────────────────────────────────────────────────
// Mappers
// ────────────────────────────────────────────────────────────────────────────

function mapOptionValueToGql(
  value: {
    id: string
    optionGroupId: string
    slug: string
    label: string
    description: string | null
    priceDeltaCents: number
    isDefault: boolean
    isActive: boolean
    sortOrder: number
    configJson: any
    createdAt: Date
    updatedAt: Date
  },
): AdminProductOptionValueGql {
  return {
    id: value.id,
    optionGroupId: value.optionGroupId,
    slug: value.slug,
    label: value.label,
    description: value.description,
    priceDeltaCents: value.priceDeltaCents,
    isDefault: value.isDefault,
    isActive: value.isActive,
    sortOrder: value.sortOrder,
    configJson: value.configJson ?? null,
    createdAt: value.createdAt.toISOString(),
    updatedAt: value.updatedAt.toISOString(),
  }
}

function mapOptionGroupToGql(
  group: {
    id: string
    productId: string | null
    productTypeId: string | null
    slug: string
    name: string
    description: string | null
    inputType: 'SINGLE_SELECT' | 'BOOLEAN'
    isRequired: boolean
    isActive: boolean
    sortOrder: number
    configJson: any
    createdAt: Date
    updatedAt: Date
    values: Array<{
      id: string
      optionGroupId: string
      slug: string
      label: string
      description: string | null
      priceDeltaCents: number
      isDefault: boolean
      isActive: boolean
      sortOrder: number
      configJson: any
      createdAt: Date
      updatedAt: Date
    }>
  },
): AdminProductOptionGroupGql {
  return {
    id: group.id,
    productId: group.productId,
    productTypeId: group.productTypeId,
    slug: group.slug,
    name: group.name,
    description: group.description,
    inputType: group.inputType,
    isRequired: group.isRequired,
    isActive: group.isActive,
    sortOrder: group.sortOrder,
    configJson: group.configJson ?? null,
    values: group.values.map(mapOptionValueToGql),
    createdAt: group.createdAt.toISOString(),
    updatedAt: group.updatedAt.toISOString(),
  }
}

// ────────────────────────────────────────────────────────────────────────────
// Service functions
// ────────────────────────────────────────────────────────────────────────────

export async function getAdminProductOptionGroups(
  prisma: PrismaClient,
  input: GetAdminProductOptionGroupsInput,
): Promise<AdminProductOptionGroupsPayloadGql> {
  const where: any = {}

  if (input.productId) {
    where.productId = input.productId
  }

  if (input.productTypeId) {
    where.productTypeId = input.productTypeId
  }

  if (!input.includeInactive) {
    where.isActive = true
  }

  const [groups, total] = await Promise.all([
    prisma.productOptionGroup.findMany({
      where,
      include: {
        values: {
          where: input.includeInactive ? {} : { isActive: true },
          orderBy: { sortOrder: 'asc' },
        },
      },
      orderBy: { sortOrder: 'asc' },
    }),
    prisma.productOptionGroup.count({ where }),
  ])

  return {
    groups: groups.map(mapOptionGroupToGql),
    total,
  }
}

export async function getAdminProductOptionGroupById(
  prisma: PrismaClient,
  input: GetAdminProductOptionGroupInput,
): Promise<AdminProductOptionGroupPayloadGql> {
  const group = await prisma.productOptionGroup.findUnique({
    where: { id: input.id },
    include: {
      values: {
        orderBy: { sortOrder: 'asc' },
      },
    },
  })

  if (!group) {
    throw new GraphQLError('Product option group not found', {
      extensions: { code: 'NOT_FOUND' },
    })
  }

  return {
    group: mapOptionGroupToGql(group),
  }
}

export async function createAdminProductOptionGroup(
  prisma: PrismaClient,
  input: CreateAdminProductOptionGroupInput,
): Promise<AdminProductOptionGroupPayloadGql> {
  // Validate that at least one of productId or productTypeId is provided
  if (!input.productId && !input.productTypeId) {
    throw new GraphQLError('Either productId or productTypeId must be provided', {
      extensions: { code: 'BAD_USER_INPUT' },
    })
  }

  // Validate slug format (kebab-case)
  if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(input.slug)) {
    throw new GraphQLError('Slug must be in kebab-case format', {
      extensions: { code: 'BAD_USER_INPUT' },
    })
  }

  // Check for duplicate slug within the same product or productType
  const existingGroup = await prisma.productOptionGroup.findFirst({
    where: {
      slug: input.slug,
      ...(input.productId
        ? { productId: input.productId }
        : { productTypeId: input.productTypeId }),
    },
  })

  if (existingGroup) {
    throw new GraphQLError(
      'An option group with this slug already exists for this product or product type',
      {
        extensions: { code: 'CONFLICT' },
      },
    )
  }

  const group = await prisma.productOptionGroup.create({
    data: {
      productId: input.productId,
      productTypeId: input.productTypeId,
      slug: input.slug,
      name: input.name,
      description: input.description,
      inputType: input.inputType,
      isRequired: input.isRequired,
      isActive: input.isActive,
      sortOrder: input.sortOrder,
      configJson: input.configJson,
    },
    include: {
      values: {
        orderBy: { sortOrder: 'asc' },
      },
    },
  })

  return {
    group: mapOptionGroupToGql(group),
  }
}

export async function updateAdminProductOptionGroup(
  prisma: PrismaClient,
  input: UpdateAdminProductOptionGroupInput,
): Promise<AdminProductOptionGroupPayloadGql> {
  // Validate slug format if provided
  if (input.slug && !/^[a-z0-9]+(-[a-z0-9]+)*$/.test(input.slug)) {
    throw new GraphQLError('Slug must be in kebab-case format', {
      extensions: { code: 'BAD_USER_INPUT' },
    })
  }

  const existingGroup = await prisma.productOptionGroup.findUnique({
    where: { id: input.id },
  })

  if (!existingGroup) {
    throw new GraphQLError('Product option group not found', {
      extensions: { code: 'NOT_FOUND' },
    })
  }

  // Check for slug conflicts if slug is being changed
  if (input.slug && input.slug !== existingGroup.slug) {
    const conflictGroup = await prisma.productOptionGroup.findFirst({
      where: {
        slug: input.slug,
        id: { not: input.id },
        ...(existingGroup.productId
          ? { productId: existingGroup.productId }
          : { productTypeId: existingGroup.productTypeId }),
      },
    })

    if (conflictGroup) {
      throw new GraphQLError(
        'An option group with this slug already exists for this product or product type',
        {
          extensions: { code: 'CONFLICT' },
        },
      )
    }
  }

  const updateData: any = {}
  if (input.slug !== undefined) updateData.slug = input.slug
  if (input.name !== undefined) updateData.name = input.name
  if (input.description !== undefined) updateData.description = input.description
  if (input.inputType !== undefined) updateData.inputType = input.inputType
  if (input.isRequired !== undefined) updateData.isRequired = input.isRequired
  if (input.isActive !== undefined) updateData.isActive = input.isActive
  if (input.sortOrder !== undefined) updateData.sortOrder = input.sortOrder
  if (input.configJson !== undefined) updateData.configJson = input.configJson

  const group = await prisma.productOptionGroup.update({
    where: { id: input.id },
    data: updateData,
    include: {
      values: {
        orderBy: { sortOrder: 'asc' },
      },
    },
  })

  return {
    group: mapOptionGroupToGql(group),
  }
}

export async function archiveAdminProductOptionGroup(
  prisma: PrismaClient,
  input: ArchiveAdminProductOptionGroupInput,
): Promise<ArchiveAdminProductOptionGroupPayloadGql> {
  const group = await prisma.productOptionGroup.findUnique({
    where: { id: input.id },
  })

  if (!group) {
    throw new GraphQLError('Product option group not found', {
      extensions: { code: 'NOT_FOUND' },
    })
  }

  await prisma.productOptionGroup.update({
    where: { id: input.id },
    data: { isActive: false },
  })

  return {
    success: true,
    message: 'Product option group archived successfully',
  }
}

export async function createAdminProductOptionValue(
  prisma: PrismaClient,
  input: CreateAdminProductOptionValueInput,
): Promise<AdminProductOptionValuePayloadGql> {
  // Validate slug format (kebab-case)
  if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(input.slug)) {
    throw new GraphQLError('Slug must be in kebab-case format', {
      extensions: { code: 'BAD_USER_INPUT' },
    })
  }

  // Validate priceDeltaCents is non-negative
  if (input.priceDeltaCents < 0) {
    throw new GraphQLError('Price delta must be non-negative', {
      extensions: { code: 'BAD_USER_INPUT' },
    })
  }

  // Check that option group exists
  const group = await prisma.productOptionGroup.findUnique({
    where: { id: input.optionGroupId },
    include: { values: true },
  })

  if (!group) {
    throw new GraphQLError('Product option group not found', {
      extensions: { code: 'NOT_FOUND' },
    })
  }

  // Check for duplicate slug within the same group
  const existingValue = group.values.find((v) => v.slug === input.slug)
  if (existingValue) {
    throw new GraphQLError('An option value with this slug already exists in this group', {
      extensions: { code: 'CONFLICT' },
    })
  }

  // If this value is set as default, unset other defaults
  if (input.isDefault) {
    await prisma.productOptionValue.updateMany({
      where: { optionGroupId: input.optionGroupId, isDefault: true },
      data: { isDefault: false },
    })
  }

  const value = await prisma.productOptionValue.create({
    data: {
      optionGroupId: input.optionGroupId,
      slug: input.slug,
      label: input.label,
      description: input.description,
      priceDeltaCents: input.priceDeltaCents,
      isDefault: input.isDefault,
      isActive: input.isActive,
      sortOrder: input.sortOrder,
      configJson: input.configJson,
    },
  })

  return {
    value: mapOptionValueToGql(value),
  }
}

export async function updateAdminProductOptionValue(
  prisma: PrismaClient,
  input: UpdateAdminProductOptionValueInput,
): Promise<AdminProductOptionValuePayloadGql> {
  // Validate slug format if provided
  if (input.slug && !/^[a-z0-9]+(-[a-z0-9]+)*$/.test(input.slug)) {
    throw new GraphQLError('Slug must be in kebab-case format', {
      extensions: { code: 'BAD_USER_INPUT' },
    })
  }

  // Validate priceDeltaCents is non-negative if provided
  if (input.priceDeltaCents !== undefined && input.priceDeltaCents < 0) {
    throw new GraphQLError('Price delta must be non-negative', {
      extensions: { code: 'BAD_USER_INPUT' },
    })
  }

  const existingValue = await prisma.productOptionValue.findUnique({
    where: { id: input.id },
  })

  if (!existingValue) {
    throw new GraphQLError('Product option value not found', {
      extensions: { code: 'NOT_FOUND' },
    })
  }

  // Check for slug conflicts if slug is being changed
  if (input.slug && input.slug !== existingValue.slug) {
    const conflictValue = await prisma.productOptionValue.findFirst({
      where: {
        slug: input.slug,
        optionGroupId: existingValue.optionGroupId,
        id: { not: input.id },
      },
    })

    if (conflictValue) {
      throw new GraphQLError('An option value with this slug already exists in this group', {
        extensions: { code: 'CONFLICT' },
      })
    }
  }

  // If this value is being set as default, unset other defaults
  if (input.isDefault) {
    await prisma.productOptionValue.updateMany({
      where: {
        optionGroupId: existingValue.optionGroupId,
        id: { not: input.id },
        isDefault: true,
      },
      data: { isDefault: false },
    })
  }

  const updateData: any = {}
  if (input.slug !== undefined) updateData.slug = input.slug
  if (input.label !== undefined) updateData.label = input.label
  if (input.description !== undefined) updateData.description = input.description
  if (input.priceDeltaCents !== undefined) updateData.priceDeltaCents = input.priceDeltaCents
  if (input.isDefault !== undefined) updateData.isDefault = input.isDefault
  if (input.isActive !== undefined) updateData.isActive = input.isActive
  if (input.sortOrder !== undefined) updateData.sortOrder = input.sortOrder
  if (input.configJson !== undefined) updateData.configJson = input.configJson

  const value = await prisma.productOptionValue.update({
    where: { id: input.id },
    data: updateData,
  })

  return {
    value: mapOptionValueToGql(value),
  }
}

export async function archiveAdminProductOptionValue(
  prisma: PrismaClient,
  input: ArchiveAdminProductOptionValueInput,
): Promise<ArchiveAdminProductOptionValuePayloadGql> {
  const value = await prisma.productOptionValue.findUnique({
    where: { id: input.id },
  })

  if (!value) {
    throw new GraphQLError('Product option value not found', {
      extensions: { code: 'NOT_FOUND' },
    })
  }

  await prisma.productOptionValue.update({
    where: { id: input.id },
    data: { isActive: false },
  })

  return {
    success: true,
    message: 'Product option value archived successfully',
  }
}
