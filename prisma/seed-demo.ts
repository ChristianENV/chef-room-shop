/**
 * Chef Room advanced demo seed (DEV / Neon only).
 *
 * Requires: npm run db:seed (base) first, ALLOW_DEMO_SEED=true, BETTER_AUTH_SECRET.
 */
import { config } from 'dotenv'

config({ path: '.env.local' })
config({ path: '.env' })

import { buildAuth } from '../src/server/auth/build-auth'
import { createPrismaClient } from '../src/server/db/create-prisma'
import { assertDemoSeedEnvironment } from './seed-demo/assert-env'
import { seedDemoCatalog } from './seed-demo/catalog'
import { seedDemoCommerce } from './seed-demo/commerce'
import { seedDemoNotifications } from './seed-demo/notifications'
import { resetDemoData } from './seed-demo/reset'
import { seedDemoUsers } from './seed-demo/users'

const prisma = createPrismaClient()

async function main() {
  assertDemoSeedEnvironment()

  console.log('Starting Chef Room demo seed...')

  await resetDemoData(prisma)

  const auth = buildAuth(prisma)
  const users = await seedDemoUsers(prisma, auth)
  const catalog = await seedDemoCatalog(prisma)

  const customerEmails = Array.from(
    { length: 20 },
    (_, i) => `cliente.demo+${i + 1}@chefroom.test`,
  )

  const commerce = await seedDemoCommerce({
    prisma,
    customerIds: users.customerIds,
    customerEmails,
    superAdminId: users.superAdminId,
    catalog,
  })

  const notifications = await seedDemoNotifications({
    prisma,
    customerIds: users.customerIds,
    adminIds: users.adminIds,
  })

  const userCount = await prisma.user.count({
    where: {
      OR: [
        { email: { equals: 'cnoriegava@gmail.com', mode: 'insensitive' } },
        { email: { contains: 'cnoriegava+', mode: 'insensitive' } },
        { email: { endsWith: '@chefroom.test', mode: 'insensitive' } },
      ],
    },
  })

  console.log('\n=== Demo seed summary ===')
  console.log('Users (demo):', userCount)
  console.log('  Admins:', users.adminIds.length)
  console.log('  Customers:', users.customerIds.length)
  console.log('  Accounts:', users.accounts)
  console.log('Products:', catalog.products)
  console.log('Variants:', catalog.variants)
  console.log('Customization rules:', catalog.rules)
  console.log('Addresses:', commerce.addresses)
  console.log('Designs:', commerce.designs)
  console.log('Design assets:', commerce.designAssets)
  console.log('Design events:', commerce.designEvents)
  console.log('Carts:', commerce.carts)
  console.log('Cart items:', commerce.cartItems)
  console.log('Orders:', commerce.orders)
  console.log('Order items:', commerce.orderItems)
  console.log('Order events:', commerce.orderEvents)
  console.log('Payments:', commerce.payments)
  console.log('Payment attempts:', commerce.paymentAttempts)
  console.log('Conekta webhooks:', commerce.webhooks)
  console.log('Shipments:', commerce.shipments)
  console.log('Shipment events:', commerce.shipmentEvents)
  console.log('Emails:', commerce.emails)
  console.log('Notifications:', notifications.notifications)
  console.log('Audit logs:', commerce.auditLogs)
  console.log('\nDemo credentials: see docs/demo-seed.md')
  console.log('Demo seed completed.')
}

main()
  .catch((error) => {
    console.error('Demo seed failed:', error)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
