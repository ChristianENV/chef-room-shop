import { AuditAction, Prisma } from '@prisma/client'
import { GraphQLError } from 'graphql'

import type { GraphQLContext } from '../../context'
import type { CurrentUser } from '@/src/server/auth/types'

import { requireAdminGraphQL } from './admin-customization.auth'
import {
  buildRuleConfigJson,
  mapAdminCustomizationAreaToGql,
  mapAdminCustomizationOptionToGql,
  mapAdminCustomizationProductToGql,
  mapAdminCustomizationRuleToGql,
  parseRuleConfig,
} from './admin-customization.mappers'
import { calculateCustomizationPricingPreview } from './admin-customization.pricing'
import type {
  AdminCustomizationAreaGql,
  AdminCustomizationOptionGql,
  AdminCustomizationPricingPreviewGql,
  AdminCustomizationPricingPreviewInput,
  AdminCustomizationProductGql,
  AdminCustomizationRuleGql,
  AdminCustomizationRuleInput,
  AdminCustomizationRulesListInput,
  AdminCustomizationRulesPayloadGql,
  AdminCustomizationProductsInput,
  DuplicateCustomizationRulesInput,
} from './admin-customization.types'
import {
  adminCustomizationPricingPreviewInputSchema,
  adminCustomizationProductsInputSchema,
  adminCustomizationRuleInputSchema,
  duplicateCustomizationRulesInputSchema,
  parseAdminCustomizationRulesListInput,
  productIdSchema,
  ruleIdSchema,
} from './admin-customization.validation'

const ruleInclude = {
  product: { include: { productType: true } },
  area: true,
  option: true,
} satisfies Prisma.ProductCustomizationRuleInclude

function notFoundError(entity = 'Recurso'): GraphQLError {
  return new GraphQLError(`${entity} no encontrado.`, {
    extensions: { code: 'NOT_FOUND' },
  })
}

function conflictError(message: string): GraphQLError {
  return new GraphQLError(message, {
    extensions: { code: 'CONFLICT' },
  })
}

async function createRuleAuditLog(
  tx: Prisma.TransactionClient,
  user: CurrentUser,
  action: AuditAction,
  ruleId: string,
  metadata?: Record<string, unknown>,
): Promise<void> {
  await tx.auditLog.create({
    data: {
      userId: user.id,
      action,
      entityType: 'ProductCustomizationRule',
      entityId: ruleId,
      metadataJson: metadata ? (metadata as Prisma.InputJsonValue) : undefined,
    },
  })
}

function buildRulesWhere(
  filter: AdminCustomizationRulesListInput['filter'],
): Prisma.ProductCustomizationRuleWhereInput {
  const where: Prisma.ProductCustomizationRuleWhereInput = {}

  if (filter?.productId) {
    where.productId = filter.productId
  }

  if (filter?.productSlug) {
    where.product = { slug: filter.productSlug, deletedAt: null }
  }

  if (filter?.areaSlug) {
    where.area = { slug: filter.areaSlug }
  }

  if (filter?.optionSlug) {
    where.option = { slug: filter.optionSlug }
  }

  if (filter?.enabled != null) {
    where.isEnabled = filter.enabled
  }

  if (filter?.search?.trim()) {
    const term = filter.search.trim()
    where.OR = [
      { product: { name: { contains: term, mode: 'insensitive' } } },
      { area: { nameEs: { contains: term, mode: 'insensitive' } } },
      { option: { nameEs: { contains: term, mode: 'insensitive' } } },
    ]
  }

  return where
}

async function assertProductExists(
  prisma: GraphQLContext['prisma'],
  productId: string,
): Promise<void> {
  const product = await prisma.product.findFirst({
    where: { id: productId, deletedAt: null },
    select: { id: true },
  })
  if (!product) {
    throw notFoundError('Producto')
  }
}

async function assertAreaExists(prisma: GraphQLContext['prisma'], areaId: string): Promise<void> {
  const area = await prisma.customizationArea.findUnique({
    where: { id: areaId },
    select: { id: true },
  })
  if (!area) {
    throw notFoundError('Área de personalización')
  }
}

async function loadRuleById(
  prisma: GraphQLContext['prisma'],
  id: string,
): Promise<Prisma.ProductCustomizationRuleGetPayload<{ include: typeof ruleInclude }>> {
  const rule = await prisma.productCustomizationRule.findUnique({
    where: { id },
    include: ruleInclude,
  })
  if (!rule) {
    throw notFoundError('Regla de personalización')
  }
  return rule
}

/**
 * Lists customization areas for admin forms (seed catalog).
 */
export async function getAdminCustomizationAreas(
  context: GraphQLContext,
): Promise<AdminCustomizationAreaGql[]> {
  requireAdminGraphQL(context)

  const rows = await context.prisma.customizationArea.findMany({
    orderBy: [{ sortOrder: 'asc' }, { nameEs: 'asc' }],
  })

  return rows.map(mapAdminCustomizationAreaToGql)
}

/**
 * Lists customization options for admin forms (seed catalog).
 */
export async function getAdminCustomizationOptions(
  context: GraphQLContext,
): Promise<AdminCustomizationOptionGql[]> {
  requireAdminGraphQL(context)

  const rows = await context.prisma.customizationOption.findMany({
    orderBy: { nameEs: 'asc' },
  })

  return rows.map(mapAdminCustomizationOptionToGql)
}

/**
 * Lists products available for customization rule management.
 */
export async function getAdminCustomizationProducts(
  context: GraphQLContext,
  raw?: AdminCustomizationProductsInput,
): Promise<AdminCustomizationProductGql[]> {
  requireAdminGraphQL(context)
  const input = adminCustomizationProductsInputSchema.parse(raw ?? {})

  const where: Prisma.ProductWhereInput = { deletedAt: null }

  if (input.customizable != null) {
    where.customizable = input.customizable
  }

  if (input.search?.trim()) {
    const term = input.search.trim()
    where.OR = [
      { name: { contains: term, mode: 'insensitive' } },
      { slug: { contains: term, mode: 'insensitive' } },
    ]
  }

  const rows = await context.prisma.product.findMany({
    where,
    include: { productType: true },
    orderBy: { name: 'asc' },
    take: 200,
  })

  return rows.map(mapAdminCustomizationProductToGql)
}

/**
 * Paginated list of customization rules with filters.
 */
export async function getAdminCustomizationRules(
  context: GraphQLContext,
  raw: AdminCustomizationRulesListInput,
): Promise<AdminCustomizationRulesPayloadGql> {
  requireAdminGraphQL(context)
  const input = parseAdminCustomizationRulesListInput(raw)
  const limit = input.limit ?? 50
  const offset = input.offset ?? 0
  const where = buildRulesWhere(input.filter)

  const [total, rows] = await Promise.all([
    context.prisma.productCustomizationRule.count({ where }),
    context.prisma.productCustomizationRule.findMany({
      where,
      include: ruleInclude,
      orderBy: [
        { product: { name: 'asc' } },
        { area: { sortOrder: 'asc' } },
        { option: { nameEs: 'asc' } },
      ],
      take: limit,
      skip: offset,
    }),
  ])

  return {
    items: rows.map(mapAdminCustomizationRuleToGql),
    total,
  }
}

/**
 * Returns all customization rules for a single product.
 */
export async function getAdminCustomizationRulesByProduct(
  context: GraphQLContext,
  productId: string,
): Promise<AdminCustomizationRuleGql[]> {
  requireAdminGraphQL(context)
  const id = productIdSchema.parse(productId)
  await assertProductExists(context.prisma, id)

  const rows = await context.prisma.productCustomizationRule.findMany({
    where: { productId: id },
    include: ruleInclude,
    orderBy: [{ area: { sortOrder: 'asc' } }, { option: { nameEs: 'asc' } }],
  })

  return rows.map(mapAdminCustomizationRuleToGql)
}

/**
 * Returns a single customization rule by id.
 */
export async function getAdminCustomizationRuleById(
  context: GraphQLContext,
  id: string,
): Promise<AdminCustomizationRuleGql | null> {
  requireAdminGraphQL(context)
  const ruleId = ruleIdSchema.parse(id)

  const rule = await context.prisma.productCustomizationRule.findUnique({
    where: { id: ruleId },
    include: ruleInclude,
  })

  return rule ? mapAdminCustomizationRuleToGql(rule) : null
}

/**
 * Pricing preview for a product/area/option rule (v1 formula).
 */
export async function getAdminCustomizationPricingPreview(
  context: GraphQLContext,
  raw: AdminCustomizationPricingPreviewInput,
): Promise<AdminCustomizationPricingPreviewGql> {
  requireAdminGraphQL(context)
  const input = adminCustomizationPricingPreviewInputSchema.parse(raw)

  const rule = await context.prisma.productCustomizationRule.findUnique({
    where: {
      productId_areaId_optionId: {
        productId: input.productId,
        areaId: input.areaId,
        optionId: input.optionId,
      },
    },
    include: { option: true },
  })

  if (!rule) {
    throw notFoundError('Regla de personalización')
  }

  const config = parseRuleConfig(rule.configJson)
  const basePriceCents = config.priceCents ?? rule.option.priceCents
  const pricePerCmCents = config.pricePerCmCents ?? 0

  return calculateCustomizationPricingPreview({
    basePriceCents,
    pricePerCmCents,
    widthCm: input.widthCm ?? 0,
    heightCm: input.heightCm ?? 0,
    extraProductionDays: config.extraProductionDays ?? 0,
  })
}

/**
 * Creates a product customization rule.
 */
export async function createAdminCustomizationRule(
  context: GraphQLContext,
  raw: AdminCustomizationRuleInput,
): Promise<AdminCustomizationRuleGql> {
  const admin = requireAdminGraphQL(context)
  const input = adminCustomizationRuleInputSchema.parse(raw)

  await assertProductExists(context.prisma, input.productId)
  await assertAreaExists(context.prisma, input.areaId)

  const option = await context.prisma.customizationOption.findUnique({
    where: { id: input.optionId },
  })
  if (!option) {
    throw notFoundError('Opción de personalización')
  }

  const existing = await context.prisma.productCustomizationRule.findUnique({
    where: {
      productId_areaId_optionId: {
        productId: input.productId,
        areaId: input.areaId,
        optionId: input.optionId,
      },
    },
  })
  if (existing) {
    throw conflictError('Ya existe una regla para esta combinación de producto, área y opción.')
  }

  const configJson = buildRuleConfigJson(input, option)
  const isEnabled = input.enabled ?? true

  const createdId = await context.prisma.$transaction(async (tx) => {
    const created = await tx.productCustomizationRule.create({
      data: {
        productId: input.productId,
        areaId: input.areaId,
        optionId: input.optionId,
        isEnabled,
        configJson,
      },
    })

    await createRuleAuditLog(tx, admin, AuditAction.CREATE, created.id, {
      productId: input.productId,
      areaId: input.areaId,
      optionId: input.optionId,
    })

    return created.id
  })

  return mapAdminCustomizationRuleToGql(await loadRuleById(context.prisma, createdId))
}

/**
 * Updates an existing customization rule.
 */
export async function updateAdminCustomizationRule(
  context: GraphQLContext,
  id: string,
  raw: AdminCustomizationRuleInput,
): Promise<AdminCustomizationRuleGql> {
  const admin = requireAdminGraphQL(context)
  const ruleId = ruleIdSchema.parse(id)
  const input = adminCustomizationRuleInputSchema.parse(raw)

  const existing = await context.prisma.productCustomizationRule.findUnique({
    where: { id: ruleId },
    include: { option: true },
  })
  if (!existing) {
    throw notFoundError('Regla de personalización')
  }

  await assertProductExists(context.prisma, input.productId)
  await assertAreaExists(context.prisma, input.areaId)

  const option = await context.prisma.customizationOption.findUnique({
    where: { id: input.optionId },
  })
  if (!option) {
    throw notFoundError('Opción de personalización')
  }

  const duplicate = await context.prisma.productCustomizationRule.findFirst({
    where: {
      productId: input.productId,
      areaId: input.areaId,
      optionId: input.optionId,
      NOT: { id: ruleId },
    },
  })
  if (duplicate) {
    throw conflictError('Ya existe una regla para esta combinación de producto, área y opción.')
  }

  const prevConfig = parseRuleConfig(existing.configJson)
  const configJson = buildRuleConfigJson(input, option, prevConfig)
  const isEnabled = input.enabled ?? existing.isEnabled

  await context.prisma.$transaction(async (tx) => {
    await tx.productCustomizationRule.update({
      where: { id: ruleId },
      data: {
        productId: input.productId,
        areaId: input.areaId,
        optionId: input.optionId,
        isEnabled,
        configJson,
      },
    })

    await createRuleAuditLog(tx, admin, AuditAction.UPDATE, ruleId, {
      productId: input.productId,
    })
  })

  return mapAdminCustomizationRuleToGql(await loadRuleById(context.prisma, ruleId))
}

/**
 * Toggles enabled state on a customization rule.
 */
export async function toggleAdminCustomizationRule(
  context: GraphQLContext,
  id: string,
  enabled: boolean,
): Promise<AdminCustomizationRuleGql> {
  const admin = requireAdminGraphQL(context)
  const ruleId = ruleIdSchema.parse(id)

  const existing = await context.prisma.productCustomizationRule.findUnique({
    where: { id: ruleId },
  })
  if (!existing) {
    throw notFoundError('Regla de personalización')
  }

  await context.prisma.$transaction(async (tx) => {
    await tx.productCustomizationRule.update({
      where: { id: ruleId },
      data: { isEnabled: enabled },
    })

    await createRuleAuditLog(tx, admin, AuditAction.UPDATE, ruleId, { enabled })
  })

  return mapAdminCustomizationRuleToGql(await loadRuleById(context.prisma, ruleId))
}

/**
 * Deletes a customization rule (physical delete; no deletedAt on model).
 */
export async function deleteAdminCustomizationRule(
  context: GraphQLContext,
  id: string,
): Promise<boolean> {
  const admin = requireAdminGraphQL(context)
  const ruleId = ruleIdSchema.parse(id)

  const existing = await context.prisma.productCustomizationRule.findUnique({
    where: { id: ruleId },
  })
  if (!existing) {
    throw notFoundError('Regla de personalización')
  }

  await context.prisma.$transaction(async (tx) => {
    await tx.productCustomizationRule.delete({ where: { id: ruleId } })
    await createRuleAuditLog(tx, admin, AuditAction.DELETE, ruleId, {
      productId: existing.productId,
    })
  })

  return true
}

/**
 * Copies customization rules from one product to another.
 */
export async function duplicateCustomizationRulesToProduct(
  context: GraphQLContext,
  raw: DuplicateCustomizationRulesInput,
): Promise<AdminCustomizationRuleGql[]> {
  const admin = requireAdminGraphQL(context)
  const input = duplicateCustomizationRulesInputSchema.parse(raw)

  if (input.fromProductId === input.toProductId) {
    throw conflictError('El producto origen y destino deben ser distintos.')
  }

  await assertProductExists(context.prisma, input.fromProductId)
  await assertProductExists(context.prisma, input.toProductId)

  const sourceRules = await context.prisma.productCustomizationRule.findMany({
    where: { productId: input.fromProductId },
  })

  if (sourceRules.length === 0) {
    return []
  }

  const createdIds = await context.prisma.$transaction(async (tx) => {
    if (input.overwriteExisting) {
      await tx.productCustomizationRule.deleteMany({
        where: { productId: input.toProductId },
      })
    }

    const targetExisting = await tx.productCustomizationRule.findMany({
      where: { productId: input.toProductId },
      select: { areaId: true, optionId: true },
    })
    const existingKeys = new Set(targetExisting.map((r) => `${r.areaId}:${r.optionId}`))

    const ids: string[] = []

    for (const rule of sourceRules) {
      const key = `${rule.areaId}:${rule.optionId}`
      if (!input.overwriteExisting && existingKeys.has(key)) {
        continue
      }

      const created = await tx.productCustomizationRule.upsert({
        where: {
          productId_areaId_optionId: {
            productId: input.toProductId,
            areaId: rule.areaId,
            optionId: rule.optionId,
          },
        },
        create: {
          productId: input.toProductId,
          areaId: rule.areaId,
          optionId: rule.optionId,
          isEnabled: rule.isEnabled,
          configJson: rule.configJson ?? undefined,
        },
        update: {
          isEnabled: rule.isEnabled,
          configJson: rule.configJson ?? undefined,
        },
      })

      ids.push(created.id)
      existingKeys.add(key)
    }

    if (ids.length > 0) {
      await createRuleAuditLog(tx, admin, AuditAction.CREATE, ids[0]!, {
        duplicatedFromProductId: input.fromProductId,
        toProductId: input.toProductId,
        ruleCount: ids.length,
      })
    }

    return ids
  })

  if (createdIds.length === 0) {
    return []
  }

  const rows = await context.prisma.productCustomizationRule.findMany({
    where: { id: { in: createdIds } },
    include: ruleInclude,
    orderBy: [{ area: { sortOrder: 'asc' } }, { option: { nameEs: 'asc' } }],
  })

  return rows.map(mapAdminCustomizationRuleToGql)
}
