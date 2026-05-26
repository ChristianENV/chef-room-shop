import { Prisma, PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

const MAX_QUERY_ATTEMPTS = 3

/**
 * Neon pooler URLs on Windows often break with `channel_binding=require`.
 * Adds timeouts so cold-start / idle compute wake does not drop the pool.
 */
export function normalizeDatabaseUrl(url: string | undefined): string | undefined {
  if (!url) {
    return url
  }

  try {
    const parsed = new URL(url)
    parsed.searchParams.delete('channel_binding')

    const isNeon =
      parsed.hostname.includes('neon.tech') || parsed.hostname.includes('pooler')

    if (isNeon) {
      if (!parsed.searchParams.has('connect_timeout')) {
        parsed.searchParams.set('connect_timeout', '15')
      }
      if (!parsed.searchParams.has('pool_timeout')) {
        parsed.searchParams.set('pool_timeout', '15')
      }
    }

    return parsed.toString()
  } catch {
    return url
      .replace(/([?&])channel_binding=require(&?)/g, '$1')
      .replace(/[?&]$/, '')
  }
}

function isReconnectableError(error: unknown): boolean {
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    return error.code === 'P1001' || error.code === 'P1002' || error.code === 'P1017'
  }

  const message = error instanceof Error ? error.message : String(error)
  return /closed|connection|ECONNRESET|ECONNREFUSED|terminated/i.test(message)
}

function clientOptions(): ConstructorParameters<typeof PrismaClient>[0] {
  const url = normalizeDatabaseUrl(process.env.DATABASE_URL)

  return {
    ...(url ? { datasources: { db: { url } } } : {}),
    log:
      process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
  }
}

function withReconnectRetry(client: PrismaClient): PrismaClient {
  const extended = client.$extends({
    query: {
      $allModels: {
        async $allOperations({ args, query }) {
          let lastError: unknown

          for (let attempt = 1; attempt <= MAX_QUERY_ATTEMPTS; attempt++) {
            try {
              return await query(args)
            } catch (error) {
              lastError = error
              if (attempt >= MAX_QUERY_ATTEMPTS || !isReconnectableError(error)) {
                throw error
              }
              await client.$disconnect()
              await client.$connect()
            }
          }

          throw lastError
        },
      },
    },
  })

  return extended as unknown as PrismaClient
}

/**
 * Creates or returns the shared Prisma client (safe for scripts and server).
 */
export function createPrismaClient(): PrismaClient {
  if (globalForPrisma.prisma) {
    return globalForPrisma.prisma
  }

  const base = new PrismaClient(clientOptions())
  const client = withReconnectRetry(base)

  if (process.env.NODE_ENV !== 'production') {
    globalForPrisma.prisma = client
    void base.$connect().catch(() => {
      /* Neon cold start — first real query will retry */
    })
  }

  return client
}
