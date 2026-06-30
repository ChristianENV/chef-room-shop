import type { NextRequest } from 'next/server'

import { handleRequest as yogaHandleRequest } from '@/src/server/graphql/yoga'

export const runtime = 'nodejs'

async function handler(request: NextRequest): Promise<Response> {
  return yogaHandleRequest(request, {} as Parameters<typeof yogaHandleRequest>[1])
}

export { handler as GET, handler as POST }
