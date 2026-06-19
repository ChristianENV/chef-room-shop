import { PaymentStatus, Prisma } from '@prisma/client'

import type { GraphQLContext } from '../../context'
import { requireAdminGraphQL } from './admin-payments.auth'
import { mapPaymentToAdminGql } from './admin-payments.mappers'
import type { AdminPaymentsListInput, AdminPaymentsPayloadGql } from './admin-payments.types'
import { parseAdminPaymentsListInput } from './admin-payments.validation'

const paymentListInclude = {
  order: {
    select: {
      id: true,
      orderNumber: true,
      customerEmail: true,
      deletedAt: true,
      user: {
        select: {
          name: true,
          firstName: true,
          lastName: true,
          email: true,
        },
      },
    },
  },
} satisfies Prisma.PaymentInclude

function buildSearchWhere(search: string): Prisma.PaymentWhereInput {
  const term = search.trim()
  return {
    OR: [
      { order: { orderNumber: { contains: term, mode: 'insensitive' } } },
      { order: { customerEmail: { contains: term, mode: 'insensitive' } } },
      {
        order: {
          user: {
            OR: [
              { name: { contains: term, mode: 'insensitive' } },
              { firstName: { contains: term, mode: 'insensitive' } },
              { lastName: { contains: term, mode: 'insensitive' } },
              { email: { contains: term, mode: 'insensitive' } },
            ],
          },
        },
      },
    ],
  }
}

function buildListWhere(filter: AdminPaymentsListInput['filter']): Prisma.PaymentWhereInput {
  const and: Prisma.PaymentWhereInput[] = [{ order: { deletedAt: null } }]

  if (filter?.search?.trim()) {
    and.push(buildSearchWhere(filter.search))
  }

  if (filter?.status) {
    and.push({ status: filter.status as PaymentStatus })
  }

  return { AND: and }
}

/**
 * Read-only paginated payments list for admin panel.
 */
export async function getAdminPayments(
  context: GraphQLContext,
  input: AdminPaymentsListInput,
): Promise<AdminPaymentsPayloadGql> {
  requireAdminGraphQL(context)

  const { filter, limit, offset } = parseAdminPaymentsListInput(input)
  const where = buildListWhere(filter)

  const [payments, total] = await Promise.all([
    context.prisma.payment.findMany({
      where,
      include: paymentListInclude,
      orderBy: [{ paidAt: 'desc' }, { createdAt: 'desc' }],
      take: limit,
      skip: offset,
    }),
    context.prisma.payment.count({ where }),
  ])

  return {
    total,
    items: payments.map(mapPaymentToAdminGql),
  }
}
