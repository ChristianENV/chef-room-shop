/**
 * Dev script: creates a guest session + sample data, then simulates merge.
 *
 * Usage:
 *   npx tsx scripts/test-guest-merge.ts
 *   npx tsx scripts/test-guest-merge.ts --merge <userId>
 */
import { createPrismaClient } from '../src/server/db/create-prisma'
import {
  generateGuestSessionToken,
  hashGuestSessionToken,
} from '../src/server/guest/guest-session.crypto'
import { mergeGuestSessionIntoUser } from '../src/server/guest/merge-guest-session'
import { GUEST_SESSION_COOKIE_NAME } from '../src/server/guest/guest-session.constants'

const prisma = createPrismaClient()

async function seedGuestFixture() {
  const token = generateGuestSessionToken()
  const tokenHash = hashGuestSessionToken(token)
  const expiresAt = new Date()
  expiresAt.setDate(expiresAt.getDate() + 30)

  const guestSession = await prisma.guestSession.create({
    data: { tokenHash, expiresAt },
  })

  const design = await prisma.design.create({
    data: {
      guestSessionId: guestSession.id,
      configJson: { test: true },
      status: 'DRAFT',
    },
  })

  const address = await prisma.address.create({
    data: {
      guestSessionId: guestSession.id,
      fullName: 'Guest Tester',
      line1: 'Calle 1',
      city: 'CDMX',
      state: 'CDMX',
      postalCode: '01000',
    },
  })

  const productType = await prisma.productType.findFirst()
  const product = productType
    ? await prisma.product.findFirst({ where: { productTypeId: productType.id } })
    : null

  let cartItems = 0
  if (product) {
    const cart = await prisma.cart.create({
      data: {
        guestSessionId: guestSession.id,
        status: 'ACTIVE',
      },
    })
    await prisma.cartItem.create({
      data: {
        cartId: cart.id,
        productId: product.id,
        quantity: 1,
        unitPriceCents: product.basePriceCents,
      },
    })
    cartItems = 1
  }

  console.log('\n--- Guest merge fixture ---')
  console.log('guestSessionId:', guestSession.id)
  console.log(`Set cookie ${GUEST_SESSION_COOKIE_NAME}=`)
  console.log(token)
  console.log('\nCreated:', {
    designId: design.id,
    addressId: address.id,
    cartItems,
  })

  return { guestSessionId: guestSession.id, token }
}

async function main() {
  const mergeUserId = process.argv.includes('--merge')
    ? process.argv[process.argv.indexOf('--merge') + 1]
    : undefined

  const { guestSessionId } = await seedGuestFixture()

  if (mergeUserId) {
    const result = await mergeGuestSessionIntoUser({
      userId: mergeUserId,
      guestSessionId,
    })
    console.log('\nMerge result:', result)
  } else {
    console.log(
      '\nTo merge in DB without browser, run:',
      `npx tsx scripts/test-guest-merge.ts --merge <userId>`,
    )
  }
}

main()
  .catch((err) => {
    console.error(err)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
